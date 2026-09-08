# Element Plus · 布局与骨架

后台管理框架级布局由 `src/core/layouts`（UI 无关）提供，Element Plus 这一套通过 `src/layouts/index.ts` 进行**薄封装与异步加载**。

---

## 1. 布局注册

`src/layouts/index.ts`

```ts
const BasicLayout = () => import('./basic.vue');
const AuthPageLayout = () => import('./auth.vue');
const IFrameView = () => import('#/core/layouts').then((m) => m.IFrameView);

export { AuthPageLayout, BasicLayout, IFrameView };
```

- `BasicLayout`：登录后的主框架（侧边菜单 + 顶栏 + Tab + 内容区）。
- `AuthPageLayout`：登录/注册等独立页面骨架。
- `IFrameView`：外链菜单以 iframe 内嵌。

> 布局的「菜单、Tab、面包屑、主题切换」逻辑在 `src/core/layouts`，与 UI 库解耦；Element Plus 仅提供少量样式占位。

---

## 2. 主框架结构（BasicLayout）

```text
BasicLayout
├── 侧边栏 (Sidebar)        # 菜单来自路由 meta + 后端返回权限树
├── 顶栏 (Header)
│   ├── 面包屑 (Breadcrumb)
│   ├── 全局搜索
│   ├── 全屏 / 主题切换 / 语言切换
│   └── 用户下拉（个人信息、退出）
├── 标签栏 (Tabs)           # 已打开页面缓存，可关可锁
└── 内容区 (<RouterView>)   # 业务页面（Page 容器）
```

---

## 3. 菜单如何渲染

菜单数据源为**路由树**（见 [`common/router.md`](../../common/router.md)），由 `PluginRouteScanner` 扫描 `views/**/index.vue` 的 `meta` 生成。

`meta` 关键字段：

```ts
{
  title: 'system.role.title',   // i18n key
  icon: 'ant-design:safety-outlined',
  authority: ['system:role:read'], // 所需权限码
  affix: false,                 // 是否固定标签
  hideInMenu: false,            // 是否在菜单隐藏
}
```

- 后端通过接口下发「当前用户可访问菜单」，前端做**交集**过滤。
- 菜单图标使用 `unplugin-icons` 的 `ant-design:*` 集（与 Element Plus 无关，可通用）。

---

## 4. 页面容器 Page

业务页统一用 `<Page>` 包裹：

```vue
<Page auto-content-height>
  <BasicCrud />
</Page>
```

`Page` 组件提供：
- `auto-content-height`：内容区自适应高度（表格可滚动区域自动计算）。
- 标题栏（取自路由 `meta.title`）。
- 面包屑联动。

---

## 5. 暗黑模式与主题

主题切换通过 `preferences`（用户偏好）写入 `localStorage`，由 `src/core` 切换 `dark` class 与 CSS 变量，Element Plus 的 `--el-color-primary` 等变量在同一套 CSS 变量体系下联动。详见 [主题定制](./theme.md)。
