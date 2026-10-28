#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
从 articles/ 目录生成站点文章清单（双份产物）。

用法：
    python scripts/build_articles.py

产物：
    articles/index.json   —— 供 http 环境下前端 fetch 加载
    articles/offline.js   —— 内联清单 + 正文，供 file:// 直接双击打开时兜底
                             （浏览器在 file:// 下会因 CORS 拒绝 fetch，此时用它）

文章统一维护在 articles/ 目录（Markdown 原文 + examples/ 等附属资源），
正文不复制，以 articles/<id>.md 为唯一来源。

新增文章：
  1. 把 xxx.md 放进 articles/；
  2. 在 ARTICLES 里加一条记录（id 与文件名一致）；
  3. 运行本脚本。
"""

import json
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
ARTICLES_DIR = ROOT / "articles"

# 文章元数据：id 必须等于 articles/<id>.md 的文件名
ARTICLES = [
    {
        "id": "llm-app-dev-guide",
        "title": "大模型应用开发实战：从意图识别到 GraphRAG 双路召回",
        "author": "启核 Nexcore",
        "category": "RAG",
        "date": "2026-08-20T10:00:00",
    },
    {
        "id": "skill-authoring-guide",
        "title": "从零写一个会「爆」的 Skill：AI 技能包创作指南",
        "author": "启核 Nexcore",
        "category": "Agent",
        "date": "2026-08-20T09:00:00",
    },
    {
        "id": "slow-hash-guide",
        "title": "迭代式慢哈希加盐（Password Hashing）技术指南",
        "author": "启核 Nexcore",
        "category": "安全",
        "date": "2026-08-20T08:00:00",
    },
    {
        "id": "deepseek-builtin-vision",
        "title": "DeepSeek 当主脑，内置视觉当眼睛：文本模型怎样真正看懂截图",
        "author": "启核 Nexcore",
        "category": "Agent",
        "date": "2026-10-27T13:00:00",
    },
    {
        "id": "completion-evidence",
        "title": "Agent 说“完成了”不算完成：怎样把交付变成可验证的证据链",
        "author": "启核 Nexcore",
        "category": "Agent",
        "date": "2026-10-27T12:00:00",
    },
    {
        "id": "context-budget-for-long-tasks",
        "title": "长任务为什么总断：NexcoreWork 的四区块上下文治理",
        "author": "启核 Nexcore",
        "category": "系统工程",
        "date": "2026-10-27T11:00:00",
    },
    {
        "id": "free-model-auto-routing",
        "title": "免费模型 Auto 不是随机抽卡：一次请求怎样选模型",
        "author": "启核 Nexcore",
        "category": "大模型",
        "date": "2026-10-27T10:00:00",
    },
    {
        "id": "screenshot-layout-debug",
        "title": "从一张用户截图修全局图片裁切：HTML height 属性和 CSS 的暗战",
        "author": "启核 Nexcore",
        "category": "前端",
        "date": "2026-10-27T09:00:00",
    },
    {
        "id": "workspace-and-memory",
        "title": "为什么本地优先智能体需要工作区和项目记忆",
        "author": "启核 Nexcore",
        "category": "Agent",
        "date": "2026-10-27T08:00:00",
    },
    {
        "id": "agent-execution-loop",
        "title": "Agent 执行闭包：为什么一次生成无法完成真实工作",
        "author": "启核 Nexcore",
        "category": "Agent",
        "date": "2026-10-28T11:00:00",
    },
    {
        "id": "local-storage-architecture",
        "title": "本地智能体怎样存数据：SQLite、工作区与可恢复状态",
        "author": "启核 Nexcore",
        "category": "系统工程",
        "date": "2026-10-28T10:00:00",
    },
    {
        "id": "tool-permission-boundary",
        "title": "工具权限不是弹窗：Agent 工作区的真实安全边界",
        "author": "启核 Nexcore",
        "category": "安全",
        "date": "2026-10-28T09:00:00",
    },
]


def main() -> None:
    manifest = []
    contents = {}

    for item in ARTICLES:
        md = ARTICLES_DIR / (item["id"] + ".md")
        if not md.exists():
            print(f"[warn] 缺少文章文件: {md.relative_to(ROOT)}，已跳过")
            continue
        filename = item["id"] + ".md"
        body = md.read_text(encoding="utf-8")
        manifest.append(
            {
                "id": item["id"],
                "title": item["title"],
                "author": item["author"],
                "category": item["category"],
                "date": item["date"],
                "file": filename,
            }
        )
        contents[filename] = body
        print(f"[ok] {md.relative_to(ROOT)}")

    manifest_path = ARTICLES_DIR / "index.json"
    manifest_path.write_text(
        json.dumps(manifest, ensure_ascii=False, indent=2) + "\n",
        encoding="utf-8",
        newline="\n",
    )
    print(f"[ok] 已生成 {manifest_path.relative_to(ROOT)}（{len(manifest)} 篇）")

    bundle = {
        "generated": "由 scripts/build_articles.py 生成，请勿手工编辑",
        "manifest": manifest,
        "contents": contents,
    }
    offline_path = ARTICLES_DIR / "offline.js"
    offline_path.write_text(
        "/* 离线兜底：file:// 下 fetch 会被 CORS 拒绝，前端改用这份内联数据。 */\n"
        "window.ARTICLES_BUNDLE = "
        + json.dumps(bundle, ensure_ascii=False, separators=(",", ":"))
        + ";\n",
        encoding="utf-8",
        newline="\n",
    )
    size_kb = offline_path.stat().st_size / 1024
    print(f"[ok] 已生成 {offline_path.relative_to(ROOT)}（{size_kb:.0f} KB）")


if __name__ == "__main__":
    main()
