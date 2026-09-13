/**
 * 投稿校验码配置 · 启核 Nexcore
 *
 * 说明：
 * - 明文校验码不落盘，仅保存 PBKDF2-HMAC-SHA256 慢哈希（迭代 + 随机盐）。
 * - 本文件在前端用于校验输入；正式部署多用户投稿时，请将此校验逻辑迁移到
 *   服务端执行（客户端校验仅能防误操作，不能防篡改）。
 *
 * 更换校验码：
 *   node -e "const c=require('crypto');const p='新校验码';const s=c.randomBytes(16);\
 *   console.log('SALT='+s.toString('base64'));\
 *   console.log('HASH='+c.pbkdf2Sync(p,s,310000,32,'sha256').toString('base64'))"
 * 然后同步替换下方 salt 与 hash。
 */
(function (global) {
    'use strict';
    global.ARTICLE_CONFIG = {
        iterations: 310000,                 // PBKDF2 迭代次数（OWASP 推荐量级）
        algorithm: 'SHA-256',
        salt: '99X+LTScpASEo6dQVhxz1w==',   // 16 字节随机盐（Base64）
        hash: 'tEPoNhuIkdMAGEKHtQO8oV6fK/rNc6BthTCgY1QzDUk=' // 派生密钥（Base64，32 字节）
    };

    // 技术文章可选分类（投稿表单与筛选共用）
    global.ARTICLE_CATEGORIES = [
        'Agent',
        'RAG',
        '大模型',
        '算法建模',
        '数值计算',
        '后端',
        '前端',
        '数据库',
        '系统工程',
        '性能优化',
        '安全',
        '工具链',
        '科研写作',
        '其他'
    ];
})(window);
