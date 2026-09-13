/**
 * 产品清单（官网唯一需要维护的产品数据）
 *
 * 新增产品时只需在此追加一个对象，页面上的产品索引、统计数字与页脚链接都会自动同步。
 *
 * 字段说明
 *   num       两位编号，用于版面索引
 *   name      中文名
 *   en        英文名（以大写小标签形式呈现）
 *   tag       一句话分类（如「桌面效率」）
 *   lead      一句话定位
 *   desc      展开说明
 *   features  功能要点
 *   meta      规格键值对（平台 / 技术栈 / 开源协议等）
 *   iconSvg   内联图标（可选，优先级高于 iconImg）
 *   iconImg   图标图片路径（可选）
 *   site      产品官网地址
 *   repo      源码仓库地址（可选）
 */
(function (global) {
    'use strict';

    global.PRODUCTS_DATA = [
        {
            num: '01',
            name: '天枢便签',
            en: 'PolarisNote',
            tag: '桌面效率',
            lead: '把笔记、看板与 AI 助手放进同一个桌面应用。',
            desc: '融合 AI 智能助手、看板式管理与富文本编辑的桌面笔记工具。类 Trello 的看板布局用来组织工作流，AI 负责生成便签、续写内容、分析文档与智能问答，数据全部保存在本机 SQLite。',
            features: ['21+ 核心功能', '看板式任务管理', 'AI 生成与续写', '文档智能分析', '本地 SQLite 存储'],
            meta: [
                { k: '平台', v: 'Windows / Linux' },
                { k: '技术栈', v: 'Qt 6 · C++ · SQLite' },
                { k: '开源', v: 'GitHub · MIT' }
            ],
            iconSvg: '<svg width="30" height="30" viewBox="0 0 28 28" fill="none"><rect x="2" y="4" width="18" height="22" rx="3" fill="#7e57c2" opacity="0.9"/><rect x="6" y="0" width="18" height="22" rx="3" fill="#9575cd"/><line x1="10" y1="6" x2="20" y2="6" stroke="white" stroke-width="1.5" stroke-linecap="round"/><line x1="10" y1="10" x2="18" y2="10" stroke="white" stroke-width="1.5" stroke-linecap="round"/><line x1="10" y1="14" x2="16" y2="14" stroke="white" stroke-width="1.5" stroke-linecap="round"/></svg>',
            iconImg: '',
            site: 'https://yan-stone-computer.github.io/polarisnote-web/',
            repo: 'https://github.com/yan-stone-computer/PolarisNote'
        },
        {
            num: '02',
            name: '枢游记',
            en: 'ShuYouJi',
            tag: '鸿蒙原生',
            lead: '为 HarmonyOS NEXT 原生开发的 AI 旅行助手。',
            desc: '图像修复、文化知识、行程规划与花费管理集成在同一个应用里。AI 客服采用意图识别加指令模式，用自然语言即可管理整趟旅行；手机与平板双端原生适配。',
            features: ['AI 图像修复（去雾 / 超分 / 锐化 / 色彩增强）', 'AI 智能客服', '图文旅行日记', '花费管理', '手机 / 平板双端'],
            meta: [
                { k: '平台', v: 'HarmonyOS NEXT' },
                { k: '设备', v: '手机 / 平板' },
                { k: '技术栈', v: 'ArkTS · ArkUI' }
            ],
            iconSvg: '',
            iconImg: 'assets/shuyouji-icon.png',
            site: 'https://yan-stone-computer.github.io/ShuYouJi-Web/',
            repo: ''
        },
        {
            num: '03',
            name: '陈汉升',
            en: 'ChenHanshen',
            tag: '角色对话',
            lead: '把《我真没想重生啊》里的陈汉升装进手机。',
            desc: '原生安卓 AI 角色扮演应用。角色话术与性格设定基于原著构建，支持人格对话、发图识图、AI 生图与剧情知识库检索；密钥与聊天记录只存本机。',
            features: ['人格对话', '发图识图', 'AI 生图', '1000+ 章剧情知识库', '会话记忆'],
            meta: [
                { k: '平台', v: 'Android 8.0+' },
                { k: '版本', v: 'v4.1.0 · 9 MB' },
                { k: '技术栈', v: 'Kotlin · Material 3' },
                { k: '开源', v: 'GitHub' }
            ],
            iconSvg: '',
            iconImg: 'assets/chenhansheng-cover.jpg',
            site: 'https://yan-stone-computer.github.io/awesome-chenhansheng-app/',
            repo: 'https://github.com/yan-stone-computer/awesome-chenhansheng-app'
        }
    ];
})(window);
