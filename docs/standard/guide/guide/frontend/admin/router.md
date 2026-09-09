# 3.1.4 路由与菜单

admin 端采用**混合路由**：本地静态路由 + 后端下发的动态菜单，二者最终合并为同一棵路由树。

## 一、路由分类

```
routes/
├── core.ts       核心路由    不鉴权，始终存在（根布局、登录、404）
├── modules/      动态路由    本地定义，需要权限校验，自动 glob 扫描
├── backend.ts    后端模式路由 component 为字符串，配合后端菜单使用
└── index.ts      聚合出口
```

`routes/index.ts` 的聚合逻辑：

```ts
const dynamicRouteFiles = import.meta.glob('./modules/**/*.ts', { eager: true });

/** 动态路由 */
const dynamicRoutes: RouteRecordRaw[] = mergeRouteModules(dynamicRouteFiles);

/** 后端模式路由，component 为字符串路径，由后端菜单系统动态加载 */
const backendModeRoutes: RouteRecordStringComponent[] = backendRoutes;

/** 路由列表，由基本路由、外部路由和 404 兜底路由组成，无需走权限验证 */
const routes: RouteRecordRaw[] = [
  ...coreRoutes,
  ...externalRoutes,
  fallbackNotFoundRoute,
];

/** 基本路由列表，这些路由不需要进入权限拦截 */
const coreRouteNames = traverseTreeValues(coreRoutes, (route) => route.name);

/** 有权限校验的路由列表 */
const accessRoutes = [...dynamicRoutes, ...staticRoutes, ...backendModeRoutes];
```

> **`modules/` 下新增 `.ts` 文件会被自动发现，无需手动 import。**

## 二、核心路由 `core.ts`

不参与权限校验，包含根布局与认证页：

```ts
const coreRoutes: RouteRecordRaw[] = [
  {
    component: BasicLayout,
    meta: { hideInBreadcrumb: true, title: 'Root' },
    name: 'Root',
    path: '/',
    redirect: preferences.app.defaultHomePath,
    children: [],
  },
  {
    component: AuthPageLayout,
    meta: { hideInTab: true, title: 'Authentication' },
    name: 'Authentication',
    path: '/auth',
    redirect: LOGIN_PATH,
    children: [
      { name: 'Login',          path: 'login',           component: () => import('#/views/_core/authentication/login.vue') },
      { name: 'CodeLogin',      path: 'code-login',      component: () => import('#/views/_core/authentication/code-login.vue') },
      { name: 'QrCodeLogin',    path: 'qrcode-login',    component: () => import('#/views/_core/authentication/qrcode-login.vue') },
      { name: 'ForgetPassword', path: 'forget-password', component: () => import('#/views/_core/authentication/forget-password.vue') },
      { name: 'Register',       path: 'register',        component: () => import('#/views/_core/authentication/register.vue') },
    ],
  },
];
```

内置五种认证页：账号登录、验证码登录、扫码登录、忘记密码、注册。

> 根路由 `Root` **必须存在且不应修改**，它承载 `BasicLayout`，所有业务页面作为其子路由挂载，因此业务路由无需重复配置布局。

## 三、本地静态路由 `modules/`

现有模块文件：`dashboard.ts`、`system.ts`、`member.ts`、`content.ts`、`app.ts`、`ops.ts`、`devtools.ts`、`web.ts`。

> 项目默认走**后端菜单模式**，因此这些文件多为空占位。需要本地定义路由时按下面格式写。

```ts
import type { RouteRecordRaw } from 'vue-router';

const routes: RouteRecordRaw[] = [
  {
    path: '/shop',
    name: 'Shop',
    meta: {
      icon: 'lucide:shopping-cart',
      title: '商城管理',
      order: 200,
    },
    children: [
      {
        path: 'goods',
        name: 'ShopGoods',
        component: () => import('#/views/shop/goods/index.vue'),
        meta: {
          title: '商品管理',
          authority: ['shop:goods:list'],
        },
      },
    ],
  },
];

export default routes;
```

### 常用 `meta` 字段

| 字段 | 类型 | 说明 |
| --- | --- | --- |
| `title` | `string` | 菜单/标签页标题，可用 `$t()` 国际化 |
| `icon` | `string` | 图标（Iconify 名称） |
| `order` | `number` | 排序，越小越靠前 |
| `authority` | `string[]` | 可访问的权限码/角色 |
| `hideInMenu` | `boolean` | 不在侧边菜单显示（仍可通过 URL 访问） |
| `hideInTab` | `boolean` | 不在多标签页显示 |
| `hideInBreadcrumb` | `boolean` | 不在面包屑显示 |
| `keepAlive` | `boolean` | 页面缓存 |
| `affixTab` | `boolean` | 固定标签页（不可关闭） |
| `iframeSrc` | `string` | 内嵌外链地址 |
| `link` | `string` | 外链跳转 |
| `module` | `string` | 所属业务模块标识 |

## 四、后端模式路由 `backend.ts`

用于"页面存在但不由后端菜单表管理"的场景，`component` 写**字符串路径**：

```ts
const backendRoutes: RouteRecordStringComponent[] = [
  {
    name: 'Profile',
    path: '/profile',
    component: '/_core/profile/index',
    meta: {
      hideInMenu: true,
      hideInBreadcrumb: false,
      title: '个人中心',
      module: 'system',
    },
  },
  {
    name: 'ConfigCommon',
    path: '/system/config-common',
    component: '/system/config/components/common',
    meta: {
      hideInMenu: true,
      title: '通用配置',
      module: 'system',
    },
  },
];
```

字符串路径相对于 `src/views/`，不带 `.vue` 后缀。

## 五、动态菜单生成 `access.ts`

这是整个路由体系的核心，负责把**后端菜单数据**转换为**真实路由**。

### 组件扫描

```ts
function buildPageMap(): ComponentRecordType {
  const viewsMap = import.meta.glob('../views/**/*.vue', { eager: false });
  const pluginsMap = import.meta.glob('../plugin/**/*.vue', { eager: false });

  const pageMap: ComponentRecordType = {
    ...(viewsMap as ComponentRecordType),
    ...(pluginsMap as ComponentRecordType),
  };

  logScannedTemplates(pageMap);
  return pageMap;
}
```

`src/views/` 与 `src/plugin/` 下的所有 `.vue` 都会被扫描进映射表，后端菜单的 `component` 字符串据此匹配到真实组件。

> 开发模式下控制台会打印扫描统计（`📦 Scanned N components`），可用来排查"组件找不到"的问题。

### 拉取并处理后端菜单

```ts
async function fetchBackendMenus(): Promise<any[]> {
  ElMessage({ duration: 1500, message: `${$t('common.loadingMenu')}...` });

  const backendMenus = await getAllMenusApi();

  // 后端菜单去重（按 name 和 path 去重）
  const dedup = (menus: any[]): any[] => {
    const seen = new Set<string>();
    return menus.filter((m) => {
      const key = `${m.name || ''}_${m.path || ''}`;
      if (seen.has(key)) return false;
      seen.add(key);
      if (m.children) m.children = dedup(m.children);
      return true;
    });
  };

  // 合并插件定义的后端格式路由
  return pluginRouter.mergeBackendMenus(dedup(backendMenus));
}
```

三件事：**拉取 → 递归去重 → 合并插件路由**。

### 生成可访问路由

```ts
async function generateAccess(
  options: GenerateMenuAndRoutesOptions,
): Promise<any> {
  const pageMap = buildPageMap();

  return await generateAccessible(preferences.app.accessMode, {
    ...options,
    fetchMenuListAsync: fetchBackendMenus,
    forbiddenComponent: FORBIDDEN_COMPONENT,
    layoutMap: { BasicLayout, IFrameView, RouteView },
    pageMap,
  });
}
```

| 参数 | 说明 |
| --- | --- |
| `preferences.app.accessMode` | `frontend`（前端控制）或 `backend`（后端控制） |
| `fetchMenuListAsync` | 后端模式下的菜单来源 |
| `forbiddenComponent` | 无权限时渲染 `views/_core/fallback/forbidden.vue` |
| `layoutMap` | 可用布局：`BasicLayout`、`IFrameView`、`RouteView` |
| `pageMap` | 组件映射表 |

其中 `RouteView` 是分组容器，仅渲染子路由：

```ts
const RouteView = () => import('vue-router').then((m) => m.RouterView);
```

## 六、路由实例与历史模式

```ts
const router = createRouter({
  history:
    import.meta.env.VITE_ROUTER_HISTORY === 'hash'
      ? createWebHashHistory(import.meta.env.VITE_BASE)
      : createWebHistory(import.meta.env.VITE_BASE),
  routes,
  scrollBehavior: (to, _from, savedPosition) => {
    if (savedPosition) return savedPosition;
    return to.hash ? { behavior: 'smooth', el: to.hash } : { left: 0, top: 0 };
  },
});

const resetRoutes = () => resetStaticRoutes(router, routes);

createRouterGuard(router);

export { resetRoutes, router };
```

- 历史模式由 `.env` 的 `VITE_ROUTER_HISTORY` 决定（`hash` / `history`），生产默认 `hash`，无需 Nginx 额外配置。
- `resetRoutes()` 用于退出登录时清空动态路由。

## 七、后端菜单配置要点

在"系统管理 → 菜单管理"中新增菜单时：

| 字段 | 填写要求 | 示例 |
| --- | --- | --- |
| 路由地址 | 浏览器 URL 路径 | `/shop/goods` |
| 组件路径 | 相对 `src/views` 的路径，不带后缀 | `/shop/goods/index` |
| 路由名称 | 唯一，建议 PascalCase | `ShopGoods` |
| 权限标识 | 与 schema 中 `permissions` 一致 | `shop:goods:list` |
| 菜单类型 | 目录 / 菜单 / 按钮 | 菜单 |

**组件路径必须能在 `pageMap` 中命中**，否则页面白屏。开发模式下可对照控制台的扫描日志核对。

## 八、常见问题

| 现象 | 原因 |
| --- | --- |
| 菜单出现但页面空白 | 组件路径与 `src/views` 实际文件不匹配 |
| 菜单不显示 | 权限码未分配，或 `hideInMenu: true` |
| 新增 `modules/*.ts` 无效 | 未 `export default`，或未重启 dev server |
| 刷新 404（history 模式） | Nginx 缺少 `try_files ... /index.html` |
| 菜单重复 | 后端菜单与本地静态路由定义了相同 `name`/`path`（已有去重，但建议避免） |

> 下一节：[3.1.5 权限控制](access.md)
