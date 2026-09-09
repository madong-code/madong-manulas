# AI-GUIDE · 给 AI / 贡献者

本仓库是 Madong 的**多手册文档站**。每个应用 / 插件是一册自包含目录 `docs/<id>/`，从门户首页 `docs/index.html` 进入。本文件指导「如何在不动既有内容的前提下，追加一册手册或追加一个板块」。

## 一、目录约定（必读）

```
docs/
├── index.html              # 门户首页（卡片索引，由 docs.json 驱动）
├── docs.json            # 手册注册表（单一事实源）
├── assets/                 # 站点级共享：libs/(运行时) css/ js/(gate/docs-boot/portal) img/
└── docs/
    ├── _template/          # 脚手架：复制即用
    ├── standard/           # 标准版手册（独立目录，互不影响）
    └── saas/               # 多租户版手册
```

**关键约束**：
- 移动 / 新增 `.md` 时保持相对目录关系；`guide/` 内的相对链接、以及 `../assets/img/...` 图片引用在整体搬迁后依然有效，**不要改写正文内的相对链接**。
- 图片统一放 `docs/<id>/assets/img/<板块>/`，删除手册即删除其图片。
- 正文内容（除新增外）**字节级不变**，不要重写 / 合并既有文章。

## 二、追加一册新应用 / 插件

1. 复制脚手架：
   ```
   cp -r docs/_template docs/<id>
   ```
2. 改 `docs/<id>/index.html` 里的 `window.__MANUAL__`：
   - `id` 与目录名一致
   - `name` 手册显示名
   - `access`：`public`（免密钥）或 `protected`（需站点密钥）
3. 改 `docs/<id>/meta.json`：填 `name / type(app|plugin) / desc / version / status / tags`
4. **在 `docs.json` 的 `docs` 数组里注册一行**（门户靠它渲染卡片，漏注册则不显示）
5. 在 `docs/<id>/_sidebar.md` 与 `_navbar.md` 登记本手册导航
6. 把正文放到 `docs/<id>/guide/`；首页 `README.md` 写本手册概述

> `status` 取值：`active`(在用) / `wip`(建设中) / `deprecated`(已废弃)，决定门户徽章与筛选。

## 三、给现有手册追加一个板块

1. 在 `docs/<id>/guide/<section>/` 下新建 `.md`（一节一文件）
2. 在本手册 `_sidebar.md` 加对应条目（缩进表示层级）
3. 如需在顶部导航出现，在 `_navbar.md` 加一项
4. 图片放 `docs/<id>/assets/img/<section>/`，正文用 `../assets/img/<section>/x.png` 引用
5. 若涉及跨手册引用（极少见），用相对路径指向目标手册：`../../<other-id>/guide/...`（会整页跳转）

## 四、密钥门禁（多手册 / 文档级）

门禁由 `docs/assets/js/gate.js` 控制，SHA-256(salt + 输入) 比对，通过后记 `localStorage`。现已支持**每册独立密钥**与**文档级规则**，不再整站一刀切。

### 4.1 三种粒度

1. **整册共享站点密钥（默认）**：手册 `index.html` 里 `access: 'protected'`（旧式字符串），或对象式里 `default:'protected', keyId:'default'`。与门户共用站点密钥，解锁一次全站通行。
2. **排除 / 限定某些文档**：在 `access.rules` 里写匹配规则，`access:'public'` 即免密公开，其余仍走密钥模式。
3. **单篇文档独立密钥**：`rules` 中某条 `access:'protected'` 且 `keyId` 指向在 `access.policies` 注册的独立策略。

### 4.2 对象式配置（写到手册 `index.html` 的 `window.__MANUAL__.access`）

```js
access: {
  default: 'protected',          // 该手册默认模式：'public'（全册免密）/ 'protected'（走密钥）
  keyId: 'default',              // 默认密钥策略 id：'default' = 站点级共享密钥
  rules: [                       // 文档级规则，按顺序命中首个；match 支持 * 单层、 ** 任意深度
    { match: 'guide/intro/**',        access: 'public' },                 // 排除：介绍整节免密
    { match: 'guide/secret/**',       access: 'protected', keyId: 'vip' } // 该目录用独立密钥 vip
  ],
  policies: {                    // 本手册独立密钥策略；未列则回落站点默认
    vip: { salt: 'madong-docs', hash: '<摘要>', ttlDays: 30, title: 'VIP 内参', tip: '请输入 VIP 密钥' }
  }
}
DocsifyGate.bind();              // 旧式 DocsifyGate.bind('protected') 仍可向后兼容
```

- `match` 路径**相对手册根目录**，已自动去掉 `.md`，例如 `guide/intro/index.md` 写作 `guide/intro/**` 或 `guide/intro/index`。
- 多个策略的 `unlock` 各自独立记 `localStorage`，互不干扰：用户切换手册 / 打开独立密钥文档时会按对应策略重新要密钥。

### 4.3 改 / 新增密钥

- 站点级：改 `gate.js` 顶部 `salt` / `hash`（见 `defaultAccess` 区块）。
- 手册独立策略：改对应 `access.policies[id].hash`。
- 计算摘要：浏览器控制台 `await DocsifyGate.compute('新密钥')`（默认盐），自定义盐用 `await DocsifyGate.compute('新密钥', '你的salt')`；或本地 PowerShell：
  ```powershell
  $s='madong-docs你的新密钥'; (Get-FileHash -Algorithm SHA256 -InputStream ([System.IO.MemoryStream]::new([System.Text.Encoding]::UTF8.GetBytes($s)))).Hash
  ```
- 密钥仅前端弱校验，请勿在公开站点放置敏感内容。

## 五、本地预览与校验

```bash
npx docsify-cli serve docs
# 浏览器 http://localhost:3000/
```

CI（见 `.github/workflows/pages.yml`）会做：死链检查、导航与 `docs.json` 一致性检查。新增手册后请确认 `docs.json` 与 `_sidebar.md` 条目一致。
