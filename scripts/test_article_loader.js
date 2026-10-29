/**
 * 文章加载兜底 —— 回归测试
 *
 * 背景：2026-09-13 线上出现「技术文章列表整个变空」。
 * 根因是 script.js 的降级条件写窄了：清单请求成功、但 articles/*.md 正文请求失败时
 * 逐篇 `continue` 跳过，最终 loaded = []，而且没抛异常，所以也不触发 fromBundle() 兜底。
 * 预览面板环境就是这样：articles/index.json → 200，articles/*.md → 404。
 *
 * 本测试在 Node 沙箱里跑**真实的 script.js**（不依赖浏览器），把那个失败模式搬到可控环境复现。
 * 最后一个用例是反向用例：把代码还原成修复前的写法，必须能复现出「0 篇 + 空状态」，
 * 否则说明这条测试已经抓不到 bug 了（防测试失效）。
 *
 * 运行：node scripts/test_article_loader.js
 * 退出码：0 全部符合预期；1 有用例不符；2 环境/替换失败
 */
'use strict';

const fs = require('fs');
const vm = require('vm');
const path = require('path');

const ROOT = path.join(__dirname, '..');
const read = (p) => fs.readFileSync(path.join(ROOT, p), 'utf8');

const CASES = [
    { mode: 'md404',      expect: 5, note: '预览环境：清单 200、正文 404，首屏仍渲染 5 篇' },
    { mode: 'md200',      expect: 5, note: '正常静态服务器：清单 200、正文 200，首屏渲染 5 篇' },
    { mode: 'noManifest', expect: 5, note: '清单也拿不到（file:// 直接打开），兜底首屏 5 篇' },
    { mode: 'legacy404',  expect: 0, legacy: true, note: '反向用例：退回修复前的窄降级逻辑' }
];

/* 把 script.js 还原成修复前的写法，用来验证测试本身有效 */
function toLegacy(code) {
    const out = code
        .replace('if (!content) content = bundleText(file);', 'if (!content) return null;')
        .replace('staticArticles = loaded.length ? loaded : fromBundle();', 'staticArticles = loaded;');
    const ok = out.includes('if (!content) return null;') && out.includes('staticArticles = loaded;');
    return ok ? out : null;
}

function runCase(c) {
    return new Promise((resolve) => {
        /* ── 最小 DOM 桩 ── */
        const elements = {};
        const mkEl = (id) => ({
            id: id || '', innerHTML: '', textContent: '', value: '', className: '',
            placeholder: '', hidden: true, disabled: false, files: null,
            dataset: {}, style: {},
            addEventListener() {}, appendChild() {}, remove() {}, insertBefore() {},
            setAttribute() {}, getAttribute() { return null; }, closest() { return null; },
            querySelector() { return null; }, querySelectorAll() { return []; },
            scrollIntoView() {}, reset() {},
            classList: { add() {}, remove() {}, toggle() { return false; } }
        });
        const getEl = (id) => (elements[id] || (elements[id] = mkEl(id)));

        /* ── fetch 桩：按用例决定正文是否 404 ── */
        let manifestHits = 0, mdHits = 0;
        const manifest = JSON.parse(read('articles/index.json'));
        const fakeFetch = async (url) => {
            const u = String(url);
            if (u.endsWith('articles/index.json')) {
                manifestHits++;
                if (c.mode === 'noManifest') return { ok: false, status: 404, json: async () => ({}) };
                return { ok: true, status: 200, json: async () => manifest };
            }
            if (/\.md$/i.test(u)) {
                mdHits++;
                if (c.mode === 'md200') {
                    return { ok: true, status: 200, text: async () => read('articles/' + u.replace(/^.*articles\//, '')) };
                }
                return { ok: false, status: 404, text: async () => 'not found' };
            }
            return { ok: false, status: 404, text: async () => '' };
        };

        /* ── 沙箱 ── */
        const sandbox = {};
        sandbox.window = sandbox;
        sandbox.console = console;
        sandbox.document = {
            getElementById: getEl,
            querySelector: () => null,
            querySelectorAll: () => [],
            createElement: mkEl,
            addEventListener() {},
            body: { style: {} },
            head: { appendChild() {} },
            documentElement: { scrollHeight: 8392, scrollWidth: 1425, style: {} }
        };
        sandbox.addEventListener = () => {};
        sandbox.innerWidth = 1440;
        sandbox.scrollY = 0;
        sandbox.localStorage = { getItem: () => null, setItem() {} };
        sandbox.performance = { now: () => Date.now() };
        sandbox.requestAnimationFrame = () => {};
        sandbox.IntersectionObserver = function () { this.observe = () => {}; this.unobserve = () => {}; };
        sandbox.fetch = fakeFetch;
        sandbox.TextEncoder = TextEncoder;
        sandbox.btoa = (s) => Buffer.from(s, 'binary').toString('base64');
        sandbox.atob = (s) => Buffer.from(s, 'base64').toString('binary');
        sandbox.crypto = {};

        const ctx = vm.createContext(sandbox);

        let code = read('script.js');
        if (c.legacy) {
            code = toLegacy(code);
            if (!code) return resolve({ ...c, error: '旧逻辑替换失败，反向用例无效' });
        }

        try {
            for (const f of ['articles/offline.js', 'directions-data.js', 'products-data.js']) {
                vm.runInContext(read(f), ctx, { filename: f });
            }
            vm.runInContext(code, ctx, { filename: 'script.js' });
        } catch (e) {
            return resolve({ ...c, error: '脚本执行异常: ' + e.message });
        }

        // 等 loadStaticArticles() 的 promise 链跑完
        setTimeout(() => {
            const html = elements.articleList ? elements.articleList.innerHTML : '';
            resolve({
                ...c,
                manifestHits,
                mdHits,
                rendered: (html.match(/class="article book-slot"/g) || []).length,
                countText: elements.articleCount ? elements.articleCount.textContent : '',
                hasEmptyState: /art-empty/.test(html)
            });
        }, 300);
    });
}

(async function main() {
    let failed = 0;
    const rows = [];

    for (const c of CASES) {
        const r = await runCase(c);
        if (r.error) {
            console.log('环境错误：' + r.error);
            process.exit(2);
        }
        const ok = r.rendered === r.expect && (r.expect === 0 ? r.hasEmptyState : !r.hasEmptyState);
        if (!ok) failed++;
        rows.push({
            用例: r.mode,
            清单请求: r.manifestHits,
            正文请求: r.mdHits,
            渲染文章数: r.rendered,
            期望: r.expect,
            articleCount: JSON.stringify(r.countText),
            空状态: r.hasEmptyState,
            结果: ok ? 'PASS' : 'FAIL',
            说明: r.note
        });
    }

    console.table(rows);
    if (failed) {
        console.log(`\n${failed} / ${CASES.length} 个用例未通过。`);
        process.exit(1);
    }
    console.log(`\n全部 ${CASES.length} 个用例通过：无论如何拿不到 .md 正文，文章列表都不会变空。`);
    process.exit(0);
})();
