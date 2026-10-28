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
            name: '启核工作台',
            en: 'NexcoreWork',
            tag: '本地智能体工作台',
            lead: '把模型、工具、文件、记忆与视觉证据收进同一条可核验执行链。',
            desc: '本地优先的开源智能体工作台。任务在用户选择的工作区中执行，免费模型 Auto、工具、上下文、项目记忆、SQLite 与视觉证据链协同工作；文件变化、命令回执和交付检查进入可追溯记录，Android 可通过加密局域网连接电脑工作区。',
            features: ['执行闭环与交付门禁', '项目记忆与本地 SQLite', '免费模型 Auto', '独立视觉证据链', 'Android 局域网控制'],
            meta: [
                { k: '平台', v: 'Windows 10 / 11 · Android' },
                { k: '版本', v: 'v2.0.0' },
                { k: '边界', v: '本地优先 · 可核验执行' }
            ],
            iconSvg: '',
            iconImg: 'assets/nexcorework-icon.svg',
            site: 'https://yan-stone-computer.github.io/nexcorework-site/?v=20261027-2',
            repo: 'https://github.com/yan-stone-computer/nexcorework-site'
        },
        {
            num: '02',
            name: '启核图策',
            en: 'NexcoreGraph',
            tag: '家庭资源智能管家',
            lead: '拍一张照片，把家里的物品变成可查询、可推理、可协作的资源库。',
            desc: '面向家庭场景的本地优先资源管理产品。通过拍照识别完成入库，再用 GraphRAG 把物品、位置、期限、菜谱与采购关系连成个人资源图谱；写操作先预览、再确认，并支持 HarmonyOS、Web 与微信小程序协同。',
            features: ['拍照识别入库', '可信 AI 问答', 'GraphRAG 资源图谱', '多端协同', '写操作确认与撤销'],
            meta: [
                { k: '平台', v: 'HarmonyOS / Web / 小程序' },
                { k: '技术栈', v: 'ArkTS · GraphRAG' },
                { k: '原则', v: '本地优先 · 先确认后写入' }
            ],
            iconSvg: '',
            iconImg: 'assets/nexcoregraph-icon.png',
            site: 'https://yan-stone-computer.github.io/NexcoreGraph-Official/',
            repo: 'https://github.com/yan-stone-computer/NexcoreGraph-Official'
        },
        {
            num: '03',
            name: '鼓令',
            en: 'Drum Tide',
            tag: '节庆彩墨竞技',
            lead: '在中国传统节庆舞台上，用彩墨夺灯、守住四时文化浓度。',
            desc: '一款以端午、中秋、元宵和春节为舞台的 4v4 彩墨竞技游戏。玩家与三名墨灵队友协作，涂彩夺取节令灯台，跟随每 30 秒一次的鼓声转场，并在 180 秒内争夺更高的文化浓度。',
            features: ['4v4 墨灵团队竞技', '四时节令地图', '涂彩与夺灯玩法', '12 主武器 / 15 副武器', '离线完整对局'],
            meta: [
                { k: '平台', v: 'Windows 10 / 11 · x64' },
                { k: '版本', v: 'v1.0.3' },
                { k: '对局', v: '4v4 · 180 秒' }
            ],
            iconSvg: '',
            iconImg: 'assets/guling-icon.webp',
            site: 'https://yan-stone-computer.github.io/guling-drum-tide/',
            repo: 'https://github.com/yan-stone-computer/guling-drum-tide'
        },
        {
            num: '04',
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
            num: '05',
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
            num: '06',
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
