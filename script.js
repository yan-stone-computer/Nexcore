/**
 * 启核 Nexcore 官网 - 交互脚本
 *
 * 结构
 *   1. 技术方向渲染（directions-data.js 驱动）
 *   2. 产品矩阵渲染（products-data.js 驱动）
 *   3. 技术文章系统（内置 Markdown、书架预览与架构图）
 *   4. 版面交互（报头、滚动进度、进场动效、数字计数）
 */
(function () {
    'use strict';

    function canUsePaperShader() {
        if (navigator.connection && navigator.connection.saveData) return false;
        if ((navigator.deviceMemory || 8) <= 2) return false;
        const probe = document.createElement('canvas');
        const gl = probe.getContext('webgl2', { failIfMajorPerformanceCaveat: true });
        gl?.getExtension('WEBGL_lose_context')?.loseContext();
        return Boolean(gl);
    }

    async function mountPaperSurface() {
        const host = document.getElementById('paperSurface');
        const library = window.PaperShaders;
        if (!host || !library || !canUsePaperShader()) return;
        try {
            const noiseTexture = library.getShaderNoiseTexture();
            if (noiseTexture && !noiseTexture.complete) await noiseTexture.decode();
            new library.ShaderMount(
                host,
                library.paperTextureFragmentShader,
                {
                    u_image: undefined,
                    u_isImage: false,
                    u_colorBack: library.getShaderColorFromString('#f6f4ee'),
                    u_colorPaper: library.getShaderColorFromString('#f6f4ee'),
                    u_colorShadow: library.getShaderColorFromString('#d9d3c6'),
                    u_blending: 0,
                    u_distortion: 0,
                    u_clip: false,
                    u_angle: 300,
                    u_seed: 42,
                    u_roughness: 0.16,
                    u_roughnessSize: 0.35,
                    u_roughnessRows: 0,
                    u_fiber: 0.12,
                    u_fiberSize: 0.6,
                    u_folds: 0,
                    u_foldSizeX: 1,
                    u_foldSizeY: 1,
                    u_foldOffsetX: 0,
                    u_foldOffsetY: 0,
                    u_wrinkles: 0,
                    u_wrinkleSize: 0,
                    u_crumples: 0,
                    u_crumpleCount: 6,
                    u_drops: 0,
                    u_noiseTexture: noiseTexture,
                    u_fit: library.ShaderFitOptions.cover,
                    u_scale: 1,
                    u_rotation: 0,
                    u_offsetX: 0,
                    u_offsetY: 0,
                    u_originX: 0.5,
                    u_originY: 0.5,
                    u_worldWidth: 0,
                    u_worldHeight: 0
                },
                { alpha: false, antialias: false, depth: false, stencil: false, powerPreference: 'low-power' },
                0,
                0,
                1,
                1400000
            );
            document.documentElement.dataset.paperShader = 'on';
            delete document.documentElement.dataset.paperShaderError;
        } catch (error) {
            document.documentElement.dataset.paperShader = 'off';
            document.documentElement.dataset.paperShaderError = String(error && error.message || error);
        }
    }

    void mountPaperSurface();

    const $ = (id) => document.getElementById(id);

    /* ═══════════════════════════════════════════════════════════
       1. 技术方向
       ═══════════════════════════════════════════════════════════ */
    const directions = window.DIRECTIONS_DATA || [];

    function renderDirections() {
        const list = $('dirList');
        if (list) {
            list.innerHTML = directions.map(d => `
                <li class="dir reveal">
                    <div class="dir-num">${esc(d.num)}</div>
                    <div class="dir-main">
                        <h3 class="dir-name">${esc(d.name)}</h3>
                        <span class="dir-en">${esc(d.en)}</span>
                        <p class="dir-lead">${esc(d.lead)}</p>
                        <p class="dir-desc">${esc(d.desc)}</p>
                    </div>
                    <div class="dir-side">
                        <h6>关键词</h6>
                        <ul class="dir-tags">
                            ${(d.tags || []).map(t => `<li>${esc(t)}</li>`).join('')}
                        </ul>
                        <p class="dir-out"><b>交付形态</b>${esc(d.output || '')}</p>
                    </div>
                </li>
            `).join('');
        }

        const footer = $('footerDirections');
        if (footer) {
            footer.innerHTML = directions.map(d => `
                <a href="#directions">${esc(d.name)}</a>
            `).join('');
        }

        setMetric($('techMetricDirections'), directions.length);

        const tagCount = document.querySelectorAll('#techTags li').length;
        setMetric($('techMetricTags'), tagCount);
    }

    /* ═══════════════════════════════════════════════════════════
       2. 产品矩阵
       ═══════════════════════════════════════════════════════════ */
    const products = window.PRODUCTS_DATA || [];

    function renderProducts() {
        const list = $('prodList');
        if (list) {
            list.innerHTML = products.map(p => `
                <li class="prod reveal">
                    <div class="prod-num">${esc(p.num)}</div>
                    <div class="prod-main">
                        <div class="prod-head">
                            ${p.iconSvg
                                ? `<span class="prod-mark">${p.iconSvg}</span>`
                                : (p.iconImg
                                    ? `<span class="prod-mark"><img src="${esc(p.iconImg)}" width="42" height="42" alt="" loading="lazy" decoding="async"></span>`
                                    : '')}
                            <h3 class="prod-name">${esc(p.name)}<span class="prod-en">${esc(p.en)}</span></h3>
                            <span class="prod-tag">${esc(p.tag || '')}</span>
                        </div>
                        <p class="prod-lead">${esc(p.lead)}</p>
                        <p class="prod-desc">${esc(p.desc)}</p>
                        <ul class="prod-feats">
                            ${(p.features || []).map(f => `<li>${esc(f)}</li>`).join('')}
                        </ul>
                    </div>
                    <div class="prod-side">
                        <h6>规格</h6>
                        <dl class="prod-meta">
                            ${(p.meta || []).map(m => `
                                <div class="prod-meta-row">
                                    <dt>${esc(m.k)}</dt>
                                    <dd>${esc(m.v)}</dd>
                                </div>`).join('')}
                        </dl>
                        <div class="prod-links">
                            ${p.site ? `<a href="${esc(p.site)}" target="_blank" rel="noopener">产品官网 <span>↗</span></a>` : ''}
                            ${p.repo ? `<a href="${esc(p.repo)}" target="_blank" rel="noopener">源码仓库 <span>↗</span></a>` : ''}
                        </div>
                    </div>
                </li>
            `).join('');
        }

        const footer = $('footerProducts');
        if (footer) {
            footer.innerHTML = products.map(p => p.site
                ? `<a href="${esc(p.site)}" target="_blank" rel="noopener">${esc(p.name)}</a>`
                : `<a href="#products">${esc(p.name)}</a>`
            ).join('');
        }

        setMetric($('techMetricProducts'), products.length);
    }

    function esc(str) {
        return String(str == null ? '' : str)
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/"/g, '&quot;')
            .replace(/'/g, '&#39;');
    }

    /* ═══════════════════════════════════════════════════════════
       3. 技术文章
       ═══════════════════════════════════════════════════════════ */
    const AUTHOR_FALLBACK = '启核 Nexcore';
    const ARTICLE_DIAGRAMS = {
        'llm-app-dev-guide': { src: 'assets/architecture/ai-app-architecture.svg', label: '分流、检索、上下文组装与模型生成的应用架构' },
        'skill-authoring-guide': { src: 'assets/architecture/skill-package-architecture.svg', label: 'SKILL.md、references 与 scripts 的渐进式加载结构' },
        'slow-hash-guide': { src: 'assets/architecture/password-hashing.svg', label: '随机盐、慢哈希派生与恒时校验流程' },
        'deepseek-builtin-vision': { src: 'assets/architecture/vision.svg', label: '视觉证据链：解析、融合与可读输出' },
        'completion-evidence': { src: 'assets/architecture/completion-evidence.svg', label: '工具回执、文件差异、渲染结果与交付门禁' },
        'context-budget-for-long-tasks': { src: 'assets/architecture/context.svg', label: '固定规则、项目注入、历史与输入四区预算' },
        'free-model-auto-routing': { src: 'assets/architecture/model-routing.svg', label: '任务识别、硬过滤、候选评分与安全回退' },
        'screenshot-layout-debug': { src: 'assets/architecture/screenshot-debug.svg', label: '截图复现、DOM 测量、共同根因与渲染验收' },
        'workspace-and-memory': { src: 'assets/architecture/memory.svg', label: '工作区、项目记忆与跨轮次召回' },
        'agent-execution-loop': { src: 'assets/architecture/agent-loop.svg', label: 'Agent 规划、执行、观察与交付闭环' },
        'local-storage-architecture': { src: 'assets/architecture/storage.svg', label: '应用数据库、工作区与本地文件边界' },
        'tool-permission-boundary': { src: 'assets/architecture/security.svg', label: '工具权限、审批与执行回执' }
    };
    const BOOK_PALETTE = [
        { bg: '#0b5d45', ink: '#f4fffa', edge: '#7fcbb1' },
        { bg: '#234b6b', ink: '#f2f8ff', edge: '#8db9de' },
        { bg: '#80442b', ink: '#fff8f1', edge: '#d8a184' },
        { bg: '#6f3448', ink: '#fff6f9', edge: '#d59aaf' },
        { bg: '#413a67', ink: '#f8f6ff', edge: '#a9a0df' },
        { bg: '#354438', ink: '#f5fff7', edge: '#95b49a' }
    ];

    let staticArticles = [];
    let staticArticlePromise = null;
    let searchKeyword = '';

    const articleList = $('articleList');
    const articleCount = $('articleCount');

    function loadStaticArticles() {
        if (staticArticlePromise) return staticArticlePromise;
        staticArticlePromise = (async () => {
        let loaded = [];
        try {
            const res = await fetch('articles/index.json', { cache: 'no-store' });
            if (!res.ok) throw new Error('manifest missing');
            const manifest = await res.json();
            if (!Array.isArray(manifest)) throw new Error('bad manifest');

            loaded = (await Promise.all(manifest.map(async (item) => {
                const file = String(item.file || '').replace(/^\/+/, '');
                if (!file) return null;

                let content = '';
                try {
                    const mdRes = await fetch('articles/' + file, { cache: 'no-store' });
                    if (mdRes.ok) content = await mdRes.text();
                } catch (e) { /* 单篇正文取不到不中断，下面用内联正文顶上 */ }
                if (!content) content = bundleText(file);
                if (!content) return null;

                return {
                    id: 'static-' + (item.id || file),
                    title: item.title || file.replace(/\.md$/i, ''),
                    author: item.author || AUTHOR_FALLBACK,
                    category: item.category || '其他',
                    date: item.date || new Date().toISOString(),
                    content,
                    static: true
                };
            }))).filter(Boolean);
        } catch (e) {
            loaded = [];   // 连清单都取不到 → 整体退回内联兜底包
        }

        // 关键：只要没有一篇真正加载成功，就整体改用内联兜底包。
        // 否则「清单成功、正文全失败」会让列表静默变空。
        staticArticles = loaded.length ? loaded : fromBundle();

        renderArticles();
        setMetric($('techMetricArticles'), staticArticles.length);
        return staticArticles;
        })();
        return staticArticlePromise;
    }

    // 从内联兜底包取单篇正文（file:// 下 fetch 被 CORS 拒绝，或静态服务器不返回 .md）
    function bundleText(file) {
        const bundle = window.ARTICLES_BUNDLE;
        if (!bundle || !bundle.contents) return '';
        const c = bundle.contents;
        const key = String(file || '').replace(/^\/+/, '');
        return c[key] || c[key.replace(/^.*\//, '')] || '';
    }

    // 离线兜底：读取 scripts/build_articles.py 生成的内联清单与正文
    function fromBundle() {
        const bundle = window.ARTICLES_BUNDLE;
        if (!bundle || !Array.isArray(bundle.manifest)) return [];
        return bundle.manifest
            .filter(item => item && item.file)
            .map(item => ({
                id: 'static-' + (item.id || item.file),
                title: item.title || String(item.file).replace(/\.md$/i, ''),
                author: item.author || AUTHOR_FALLBACK,
                category: item.category || '其他',
                date: item.date || new Date().toISOString(),
                content: bundleText(item.file),
                static: true
            }))
            .filter(a => a.content);
    }

    function formatDate(iso) {
        const d = new Date(iso);
        if (isNaN(d.getTime())) return '';
        const p = n => String(n).padStart(2, '0');
        return `${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())}`;
    }

    function makeExcerpt(md, limit) {
        const max = limit || 132;
        const plain = String(md || '')
            .replace(/```[\s\S]*?```/g, ' ')
            .replace(/`([^`]*)`/g, '$1')
            .replace(/!\[[^\]]*\]\([^)]*\)/g, '')
            .replace(/\[([^\]]*)\]\([^)]*\)/g, '$1')
            .replace(/^\s*#{1,6}\s+.*$/m, ' ')   // 去掉首个标题行，避免与列表标题重复
            .replace(/^#{1,6}\s*/gm, '')
            .replace(/^\s*\|.*$/gm, ' ')         // 去掉表格行与分隔线
            .replace(/^\s*[-*_]{3,}\s*$/gm, ' ')
            .replace(/^\s*[-*+]\s+/gm, '')
            .replace(/^\s*>\s?/gm, '')
            .replace(/[*_~]{1,2}([^*_~]+)[*_~]{1,2}/g, '$1')
            .replace(/\|/g, ' ')
            .replace(/\s+/g, ' ')
            .trim();
        return plain.length > max ? plain.slice(0, max) + '…' : plain;
    }

    function renderMarkdown(text) {
        const raw = String(text || '');
        if (window.marked && window.DOMPurify) {
            try {
                return window.DOMPurify.sanitize(
                    window.marked.parse(raw, { breaks: true, gfm: true }),
                    { ADD_ATTR: ['target', 'rel'] }
                );
            } catch (e) { /* 走兜底 */ }
        }
        return esc(raw).replace(/\n/g, '<br>');
    }

    function spineTitleMarkup(title) {
        const chars = Array.from(String(title || '未命名文章'));
        const visible = chars.length > 24 ? chars.slice(0, 24).join('') + '…' : chars.join('');
        if (visible.length <= 12) return `<span>${esc(visible)}</span>`;
        const split = Math.ceil(visible.length / 2);
        return `<span>${esc(visible.slice(0, split))}</span><span>${esc(visible.slice(split))}</span>`;
    }

    // 渲染后的正文再加工：去掉与弹窗标题重复的首个 H1、表格加滚动容器、外链新窗口打开
    function polishBody(container) {
        if (!container) return;
        const first = container.firstElementChild;
        if (first && first.tagName === 'H1') first.remove();
        container.querySelectorAll('table').forEach(t => {
            const box = document.createElement('div');
            box.className = 'tw';
            t.parentNode.insertBefore(box, t);
            box.appendChild(t);
        });
        container.querySelectorAll('a[href^="http"]').forEach(a => {
            a.target = '_blank';
            a.rel = 'noopener';
        });
    }

    function getFiltered() {
        const kw = searchKeyword.trim().toLowerCase();
        const list = staticArticles;
        if (!kw) return list;
        return list.filter(a =>
            (a.title || '').toLowerCase().includes(kw) ||
            (a.author || '').toLowerCase().includes(kw) ||
            (a.category || '').toLowerCase().includes(kw) ||
            (a.content || '').toLowerCase().includes(kw)
        );
    }

    function renderArticles() {
        if (!articleList) return;

        const filtered = getFiltered();
        const total = filtered.length;
        if (articleCount) articleCount.textContent = total ? `${total} 篇` : '';

        if (!filtered.length) {
            const kw = searchKeyword.trim();
            articleList.innerHTML = `
                <div class="art-empty">
                    <h4>${kw ? '没有匹配的文章' : '暂无文章'}</h4>
                    <p>${kw
                        ? `没有与「${esc(kw)}」相关的内容，换个关键词试试。`
                        : '文章暂时没有加载成功，请刷新页面后重试。'}</p>
                </div>`;
            return;
        }

        const perShelf = innerWidth <= 760 ? 3 : innerWidth <= 1180 ? 4 : 6;
        let bookIndex = 0;
        const rows = [];
        for (let start = 0; start < filtered.length; start += perShelf) {
            const shelf = filtered.slice(start, start + perShelf);
            const books = shelf.map((a) => {
                const index = bookIndex++;
                const book = BOOK_PALETTE[(a.category ? a.category.charCodeAt(0) + index : index) % BOOK_PALETTE.length];
                const date = formatDate(a.date);
                return `
                    <article class="article book-slot" data-id="${esc(a.id)}" style="--book-bg:${book.bg};--book-ink:${book.ink};--book-edge:${book.edge};--book-h:${[88, 74, 94, 80, 86][index % 5]}%;--book-i:${index}">
                        <button class="book-spine" type="button" data-act="select" aria-label="选择文章：${esc(a.title)}" title="${esc(a.title)}">
                            <span class="book-spine-category">${esc(a.category || '其他')}</span>
                            <span class="book-spine-title">${spineTitleMarkup(a.title)}</span>
                            <span class="book-spine-year">${esc(date.slice(0, 4))}</span>
                        </button>
                        <span class="book-bookmark" aria-hidden="true"></span>
                    </article>`;
            }).join('');
            rows.push(`<div class="bookshelf-row"><div class="bookshelf-books" style="--cols:${shelf.length}">${books}</div><span class="shelf-board" aria-hidden="true"></span></div>`);
        }
        articleList.innerHTML = rows.join('');
    }

    // 列表交互
    if (articleList) {
        articleList.addEventListener('click', (e) => {
            const btn = e.target.closest('[data-act]');
            if (!btn) return;
            const card = btn.closest('.article');
            if (!card) return;
            const id = card.dataset.id;
            const act = btn.dataset.act;
            if (act === 'select') openBookPreview(id, btn);
            else if (act === 'read') openArticle(id);
        });
    }

    const archTabs = Array.from(document.querySelectorAll('[data-arch]'));
    const archPanels = Array.from(document.querySelectorAll('.arch-panel'));

    function activateArchitecture(key, focus) {
        const activeTab = archTabs.find(tab => tab.dataset.arch === key);
        if (!activeTab) return;
        archTabs.forEach(tab => {
            const active = tab === activeTab;
            tab.classList.toggle('is-active', active);
            tab.setAttribute('aria-selected', active ? 'true' : 'false');
            tab.tabIndex = active ? 0 : -1;
        });
        archPanels.forEach(panel => {
            const active = panel.id === 'archPanel' + key.charAt(0).toUpperCase() + key.slice(1);
            panel.hidden = !active;
            panel.classList.remove('is-entering');
            if (active) requestAnimationFrame(() => panel.classList.add('is-entering'));
        });
        if (focus) activeTab.focus();
    }

    archTabs.forEach((tab, index) => {
        tab.addEventListener('click', () => activateArchitecture(tab.dataset.arch, false));
        tab.addEventListener('keydown', (event) => {
            if (!['ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown', 'Home', 'End'].includes(event.key)) return;
            event.preventDefault();
            let next = index;
            if (event.key === 'ArrowLeft' || event.key === 'ArrowUp') next = (index - 1 + archTabs.length) % archTabs.length;
            if (event.key === 'ArrowRight' || event.key === 'ArrowDown') next = (index + 1) % archTabs.length;
            if (event.key === 'Home') next = 0;
            if (event.key === 'End') next = archTabs.length - 1;
            activateArchitecture(archTabs[next].dataset.arch, true);
        });
    });

    document.querySelectorAll('[data-read-article]').forEach(button => {
        button.addEventListener('click', async () => {
            const id = 'static-' + button.dataset.readArticle;
            if (staticArticles.some(article => article.id === id)) {
                openArticle(id);
                return;
            }
            const label = button.innerHTML;
            button.disabled = true;
            button.setAttribute('aria-busy', 'true');
            button.textContent = '正在载入文章...';
            try {
                await loadStaticArticles();
                openArticle(id);
            } finally {
                button.disabled = false;
                button.removeAttribute('aria-busy');
                button.innerHTML = label;
            }
        });
    });

    const articleSearch = $('articleSearch');
    if (articleSearch) {
        articleSearch.addEventListener('input', () => {
            searchKeyword = articleSearch.value;
            renderArticles();
        });
    }

    let shelfResizeTimer = 0;
    window.addEventListener('resize', () => {
        clearTimeout(shelfResizeTimer);
        shelfResizeTimer = setTimeout(renderArticles, 140);
    }, { passive: true });

    // ── 阅读弹窗 ──
    const articleModal = $('articleModal');
    const amTitle = $('amTitle');
    const amAuthor = $('amAuthor');
    const amCat = $('amCat');
    const amDate = $('amDate');
    const amBody = $('amBody');
    const amDiagram = $('amDiagram');
    const amDiagramImage = amDiagram?.querySelector('img');
    const amDiagramCaption = amDiagram?.querySelector('figcaption');
    const bookOverlay = $('bookOverlay');
    const bookCoverObject = $('bookCoverObject');
    const bookPreviewCategory = $('bookPreviewCategory');
    const bookPreviewTitle = $('bookPreviewTitle');
    const bookPreviewCoverExcerpt = $('bookPreviewCoverExcerpt');
    const bookPreviewAuthor = $('bookPreviewAuthor');
    const bookPreviewYear = $('bookPreviewYear');
    const bookPreviewHeading = $('bookPreviewHeading');
    const bookPreviewExcerpt = $('bookPreviewExcerpt');
    const bookRead = $('bookRead');
    let previewBookId = null;
    let previewBookTrigger = null;

    function openBookPreview(id, trigger) {
        const article = staticArticles.find(item => item.id === id);
        if (!bookOverlay || !article) return;
        previewBookId = id;
        previewBookTrigger = trigger || null;
        const book = trigger?.closest('.article');
        const style = book ? getComputedStyle(book) : null;
        bookCoverObject.style.setProperty('--book-bg', style?.getPropertyValue('--book-bg').trim() || 'var(--accent)');
        bookCoverObject.style.setProperty('--book-ink', style?.getPropertyValue('--book-ink').trim() || 'var(--bg)');
        bookCoverObject.style.setProperty('--book-edge', style?.getPropertyValue('--book-edge').trim() || 'var(--line)');
        bookPreviewCategory.textContent = article.category || '其他';
        bookPreviewTitle.textContent = article.title;
        bookPreviewCoverExcerpt.textContent = makeExcerpt(article.content, 160);
        bookPreviewAuthor.textContent = article.author || AUTHOR_FALLBACK;
        bookPreviewYear.textContent = formatDate(article.date).slice(0, 4);
        bookPreviewHeading.textContent = '内容简介';
        bookPreviewExcerpt.textContent = makeExcerpt(article.content, 220);
        book?.classList.add('is-pulled');
        bookOverlay.hidden = false;
        document.body.style.overflow = 'hidden';
        requestAnimationFrame(() => requestAnimationFrame(() => bookOverlay.classList.add('is-open')));
        setTimeout(() => {
            if (!bookOverlay.hidden) bookRead?.focus();
        }, 260);
    }

    function closeBookPreview(restoreFocus) {
        if (!bookOverlay || bookOverlay.hidden) return;
        bookOverlay.classList.remove('is-open');
        const trigger = previewBookTrigger;
        setTimeout(() => {
            bookOverlay.hidden = true;
            if (!articleModal || articleModal.hidden) {
                document.body.style.overflow = '';
            }
            trigger?.closest('.article')?.classList.remove('is-pulled');
            if (restoreFocus !== false) trigger?.focus();
        }, 220);
        previewBookId = null;
        previewBookTrigger = null;
    }

    function openArticle(id) {
        const a = staticArticles.find(x => x.id === id);
        if (!articleModal || !a) return;
        amTitle.textContent = a.title;
        amAuthor.textContent = a.author;
        amCat.textContent = a.category || '其他';
        amDate.textContent = formatDate(a.date) + (a.updatedAt ? ' · 已编辑' : '');
        const articleKey = String(a.id || '').replace(/^static-/, '').replace(/\.md$/i, '');
        const hasInlineDiagram = /assets\/architecture\//.test(String(a.content || ''));
        const diagram = hasInlineDiagram ? null : ARTICLE_DIAGRAMS[articleKey];
        if (amDiagram && amDiagramImage && amDiagramCaption) {
            amDiagram.hidden = !diagram;
            amDiagramImage.src = diagram ? diagram.src : '';
            amDiagramImage.alt = diagram ? diagram.label : '';
            amDiagramCaption.textContent = diagram ? diagram.label : '';
        }
        amBody.innerHTML = renderMarkdown(a.content);
        polishBody(amBody);
        articleModal.hidden = false;
        document.body.style.overflow = 'hidden';
        const scroller = articleModal.querySelector('.ma-scroll');
        if (scroller) scroller.scrollTop = 0;
    }

    function closeArticle() {
        if (!articleModal) return;
        articleModal.hidden = true;
        document.body.style.overflow = '';
        if (amBody) amBody.innerHTML = '';
    }

    if (bookOverlay) {
        bookOverlay.addEventListener('click', (event) => {
            if (event.target.closest('[data-book-close]')) closeBookPreview();
        });
    }

    if (bookRead) {
        bookRead.addEventListener('click', () => {
            const id = previewBookId;
            closeBookPreview(false);
            if (id) setTimeout(() => openArticle(id), 190);
        });
    }

    if (articleModal) {
        articleModal.addEventListener('click', (e) => {
            if (e.target.closest('[data-close]')) closeArticle();
        });
    }

    // ── 投稿表单 ──
    const articleForm = $('articleForm');
    const artMsg = $('artMsg');
    const artSubmit = $('artSubmit');
    const artMd = $('artMd');
    const artMdName = $('artMdName');
    const auHeadTitle = document.querySelector('.au-head h3');
    const auPanel = document.querySelector('.au');

    let editingId = null;
    let cancelEditBtn = null;

    const artCategory = $('artCategory');
    if (artCategory && window.ARTICLE_CATEGORIES) {
        artCategory.innerHTML = window.ARTICLE_CATEGORIES
            .map(c => `<option value="${esc(c)}">${esc(c)}</option>`).join('');
    }

    function showMsg(text, ok) {
        if (!artMsg) return;
        artMsg.textContent = text;
        artMsg.className = 'au-msg' + (ok ? ' ok' : ' err');
    }

    if (artMd) {
        artMd.addEventListener('change', (e) => {
            const file = e.target.files && e.target.files[0];
            if (!file) return;
            if (!/\.(md|markdown)$/i.test(file.name)) {
                showMsg('请选择 .md 或 .markdown 文件。', false);
                artMd.value = '';
                return;
            }
            const reader = new FileReader();
            reader.onload = () => {
                const text = String(reader.result || '');
                $('artContent').value = text;
                const titleEl = $('artTitle');
                if (!titleEl.value.trim()) {
                    const m = text.match(/^\s*#\s+(.+?)\s*$/m);
                    titleEl.value = m ? m[1].trim() : file.name.replace(/\.(md|markdown)$/i, '');
                }
                if (artMdName) artMdName.textContent = `${file.name}（${text.length} 字符）`;
                showMsg('文件已载入，可直接发布或继续编辑。', true);
            };
            reader.onerror = () => showMsg('文件读取失败，请重试。', false);
            reader.readAsText(file, 'utf-8');
        });
    }

    function startEdit(id) {
        const a = loadLocal().find(x => x.id === id);
        if (!a) return;
        editingId = id;
        $('artTitle').value = a.title;
        $('artAuthor').value = a.author;
        $('artCategory').value = a.category || '其他';
        $('artContent').value = a.content;
        const codeInput = $('artCode');
        codeInput.value = '';
        codeInput.placeholder = '输入校验码以保存修改';
        if (auHeadTitle) auHeadTitle.textContent = '编辑文章';
        artSubmit.textContent = '保存修改';

        if (!cancelEditBtn && articleForm) {
            cancelEditBtn = document.createElement('button');
            cancelEditBtn.type = 'button';
            cancelEditBtn.className = 'btn au-cancel';
            cancelEditBtn.textContent = '取消编辑';
            cancelEditBtn.addEventListener('click', resetForm);
            articleForm.appendChild(cancelEditBtn);
        }
        if (auPanel) auPanel.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }

    function resetForm() {
        editingId = null;
        if (articleForm) articleForm.reset();
        const codeInput = $('artCode');
        if (codeInput) codeInput.placeholder = '用于发布与删除';
        if (auHeadTitle) auHeadTitle.textContent = '投稿';
        if (artSubmit) artSubmit.textContent = '发布文章';
        if (cancelEditBtn) { cancelEditBtn.remove(); cancelEditBtn = null; }
        if (artMd) artMd.value = '';
        if (artMdName) artMdName.textContent = '未选择文件';
    }

    if (articleForm) {
        articleForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            const title = $('artTitle').value.trim();
            const author = $('artAuthor').value.trim();
            const category = $('artCategory').value;
            const content = $('artContent').value.trim();
            const code = $('artCode').value;

            if (!title || !author || !content) { showMsg('请填写标题、作者和正文。', false); return; }
            if (!code) { showMsg(editingId ? '请输入校验码以保存修改。' : '请输入校验码。', false); return; }
            if (!window.crypto || !window.crypto.subtle) {
                showMsg('当前环境不支持安全校验，请通过 https 或本地服务器访问。', false);
                return;
            }

            artSubmit.disabled = true;
            artSubmit.textContent = '校验中…';
            try {
                if (!await verifyCode(code)) { showMsg('校验码错误。', false); return; }

                const list = loadLocal();
                if (editingId) {
                    const idx = list.findIndex(a => a.id === editingId);
                    if (idx >= 0) {
                        list[idx] = { ...list[idx], title, author, category, content, updatedAt: new Date().toISOString() };
                        saveLocal(list);
                        renderArticles();
                        resetForm();
                        showMsg('修改已保存。', true);
                        return;
                    }
                    editingId = null;
                }

                list.unshift({
                    id: 'a' + Date.now().toString(36) + Math.random().toString(36).slice(2, 6),
                    title, author, category, content,
                    date: new Date().toISOString()
                });
                saveLocal(list);
                currentPage = 1;
                renderArticles();
                resetForm();
                showMsg('发布成功，已加入列表。', true);
            } finally {
                artSubmit.disabled = false;
                artSubmit.textContent = editingId ? '保存修改' : '发布文章';
            }
        });
    }

    // ── 删除确认 ──
    const codeModal = $('codeModal');
    const codeModalInput = $('codeModalInput');
    const codeModalMsg = $('codeModalMsg');
    const codeModalOk = $('codeModalOk');
    let deleteId = null;

    function openDelete(id) {
        deleteId = id;
        if (codeModalInput) codeModalInput.value = '';
        if (codeModalMsg) codeModalMsg.textContent = '';
        if (codeModal) codeModal.hidden = false;
    }

    function closeDelete() {
        deleteId = null;
        if (codeModal) codeModal.hidden = true;
        if (codeModalInput) codeModalInput.value = '';
    }

    if (codeModal) {
        codeModal.addEventListener('click', (e) => {
            if (e.target.closest('[data-close]')) closeDelete();
        });
    }

    if (codeModalOk) {
        codeModalOk.addEventListener('click', async () => {
            const code = codeModalInput ? codeModalInput.value : '';
            if (!code) { if (codeModalMsg) codeModalMsg.textContent = '请输入校验码。'; return; }
            if (!window.crypto || !window.crypto.subtle) {
                if (codeModalMsg) codeModalMsg.textContent = '当前环境不支持安全校验。';
                return;
            }
            codeModalOk.disabled = true;
            codeModalOk.textContent = '校验中…';
            try {
                if (!await verifyCode(code)) {
                    if (codeModalMsg) codeModalMsg.textContent = '校验码错误。';
                    return;
                }
                saveLocal(loadLocal().filter(a => a.id !== deleteId));
                renderArticles();
                closeDelete();
            } finally {
                codeModalOk.disabled = false;
                codeModalOk.textContent = '删除';
            }
        });
    }

    if (articleModal || codeModal || bookOverlay) {
        document.addEventListener('keydown', (e) => {
            if (e.key !== 'Escape') return;
            if (bookOverlay && !bookOverlay.hidden) closeBookPreview();
            else if (codeModal && !codeModal.hidden) closeDelete();
            else if (articleModal && !articleModal.hidden) closeArticle();
        });
    }

    /* ═══════════════════════════════════════════════════════════
       4. 版面交互
       ═══════════════════════════════════════════════════════════ */
    const navbar = $('navbar');

    // 移动端导航
    const navBtn = $('navMobileBtn');
    const navLinks = $('navLinks');
    if (navBtn && navLinks) {
        navBtn.addEventListener('click', () => {
            const open = navLinks.classList.toggle('open');
            navBtn.classList.toggle('active', open);
            navBtn.setAttribute('aria-expanded', open ? 'true' : 'false');
        });
        navLinks.querySelectorAll('a').forEach(a => {
            a.addEventListener('click', () => {
                navLinks.classList.remove('open');
                navBtn.classList.remove('active');
                navBtn.setAttribute('aria-expanded', 'false');
            });
        });
    }

    // 锚点平滑滚动
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            const href = this.getAttribute('href');
            if (!href || href === '#') return;
            const target = document.querySelector(href);
            if (!target) return;
            e.preventDefault();
            const offset = (navbar ? navbar.offsetHeight : 66) + 18;
            const top = target.getBoundingClientRect().top + window.pageYOffset - offset;
            window.scrollTo({ top: top < 0 ? 0 : top, behavior: 'smooth' });
        });
    });

    // 进场淡入
    const revealObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('in');
                revealObserver.unobserve(entry.target);
            }
        });
    }, { rootMargin: '0px 0px -70px 0px', threshold: 0.08 });

    function observeReveals() {
        document.querySelectorAll('.reveal:not(.in)').forEach(el => revealObserver.observe(el));
    }

    // 数字滚动
    const countObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (!entry.isIntersecting) return;
            countObserver.unobserve(entry.target);
            animateNumber(entry.target);
        });
    }, { threshold: 0.4 });

    function observeCounters() {
        document.querySelectorAll('.metric-num').forEach(el => countObserver.observe(el));
    }

    function setMetric(el, value) {
        if (!el) return;
        el.dataset.target = String(value);
        if (el.dataset.counted === '1') el.textContent = String(value);
    }

    function animateNumber(el) {
        const target = parseInt(el.dataset.target, 10) || 0;
        if (!target) { el.dataset.counted = '1'; return; }
        const duration = 1100;
        const start = performance.now();
        (function step(now) {
            const p = Math.min((now - start) / duration, 1);
            const ease = 1 - Math.pow(1 - p, 3);
            el.textContent = String(Math.round(target * ease));
            if (p < 1) requestAnimationFrame(step);
            else el.dataset.counted = '1';
        })(start);
    }

    // 导航高亮当前章节
    const sectionObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (!entry.isIntersecting) return;
            const id = entry.target.id;
            document.querySelectorAll('.nav-link').forEach(link => {
                link.classList.toggle('active', link.getAttribute('href') === `#${id}`);
            });
        });
    }, { rootMargin: '-45% 0px -50% 0px', threshold: 0 });

    /* ═══════════════════════════════════════════════════════════
       启动
       ═══════════════════════════════════════════════════════════ */
    renderDirections();
    renderProducts();
    staticArticles = fromBundle();
    renderArticles();
    setMetric($('techMetricArticles'), staticArticles.length);
    observeReveals();
    observeCounters();
    document.querySelectorAll('section[id], header[id]').forEach(s => {
        if (s.id) sectionObserver.observe(s);
    });
    loadStaticArticles();

    document.body.style.opacity = '0';
    document.body.style.transition = 'opacity .45s ease';
    requestAnimationFrame(() => {
        requestAnimationFrame(() => { document.body.style.opacity = '1'; });
    });
})();
