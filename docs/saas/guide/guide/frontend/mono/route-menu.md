# Mono 路由与菜单（公共范式）

本文介绍 admin / platform 两个应用**共用的路由与菜单机制**。两个应用都使用 **后端菜单驱动模式**，仅 code 前缀、菜单数据文件、多租户能力不同。

## 路由模式

admin / platform 均使用 **后端菜单驱动模式**（`accessMode: 'backend'`），路由和菜单由后端动态返回。

在 `preferences.ts` 中开启：

```typescript
// apps/{app}/src/preferences.ts
import { defineOverridesPreferences } from '@vben/preferences';

export const overridesPreferences = defineOverridesPreferences({
  app: {
    name: import.meta.env.VITE_APP_TITLE,
    accessMode: 'backend',         // Backend menu mode
    enableRefreshToken: true,      // Enable refresh token
  },
});
```

## 路由文件结构

```
apps/{app}/src/router/
├── index.ts                     # Router instance creation
├── access.ts                    # Permission route generation (backend menu mode)
├── guard.ts                     # Route guards
├── routes/
│   ├── index.ts                 # Route aggregation
│   ├── core.ts                  # Core routes (Root/Auth/404)
│   ├── backend.ts               # Backend mode routes (Profile)
│   └── modules/                 # Business module routes
└── plugin/
    ├── index.ts                 # Plugin route manager
    └── scanner.ts               # Plugin route scanner
```

## 路由 name 命名规范

```
{App}{Module}{Action}
```

`{App}` 为应用标识：**Admin** 应用用 `Admin`，**Platform** 应用用 `Platform`。

示例：

| 路由 | code | 说明 |
|------|------|------|
| 系统菜单列表 | `AdminSystemMenuList` | Admin 系统菜单 |
| 会员用户列表 | `AdminMemberUserList` | Admin 会员用户 |
| 租户管理 | `PlatformTenantList` | Platform 租户管理 |
| 数据库管理 | `PlatformDatabaseList` | Platform 数据库 |

## 路由定义示例

### core.ts - 核心路由

```typescript
// apps/{app}/src/router/routes/core.ts
export const coreRoutes: RouteRecordRaw[] = [
  {
    path: '/',
    redirect: '/dashboard',
  },
  {
    path: '/auth',
    name: 'Auth',
    component: () => import('#/layouts/auth.vue'),
    children: [
      {
        path: 'login',
        name: 'Login',
        component: () => import('#/views/auth/login.vue'),
        meta: { title: '登录' },
      },
    ],
  },
  {
    path: '/:pathMatch(.*)*',
    name: 'NotFound',
    component: () => import('#/views/error/404.vue'),
  },
];
```

### modules/system.ts - 业务模块路由

```typescript
// apps/{app}/src/router/routes/modules/system.ts
export const systemRoutes: RouteRecordRaw[] = [
  {
    path: '/system',
    name: 'System',
    component: () => import('#/layouts/basic.vue'),
    redirect: '/system/menu',
    children: [
      {
        path: 'menu',
        name: 'AdminSystemMenuList',
        component: () => import('#/views/system/menu/index.vue'),
        meta: { title: '菜单管理' },
      },
    ],
  },
];
```

## 后端菜单数据

后端菜单数据按应用分文件存放：

| 应用 | 菜单数据文件 |
| --- | --- |
| Admin | `backend/resource/data/menu/admin.php` |
| Platform | `backend/resource/data/menu/platform.php` |

菜单数据中的 `routes` 字段对应前端路由 code：

```php
// backend/resource/data/menu/admin.php
return [
    [
        'name' => '系统管理',
        'routes' => [
            [
                'name' => '菜单管理',
                'code' => 'AdminSystemMenuList',
                'path' => '/system/menu',
            ],
        ],
    ],
];
```

## 插件路由

插件路由由 `router/plugin/` 下的管理器动态扫描注册：

```typescript
// apps/{app}/src/router/plugin/scanner.ts
export function scanPluginRoutes() {
  // Scan plugins/{plugin}/resources/assets/admin/routes/
  // Auto-register plugin routes
}
```

插件路由文件示例：

```typescript
// plugins/{plugin}/resources/assets/admin/routes/index.ts
export default {
  path: '/plugin/{plugin}',
  name: 'AdminPlugin{Name}List',
  component: () => import('./views/index.vue'),
};
```

## 路由守卫

`guard.ts` 中配置：

- **通用守卫**：Token 检查、页面标题
- **权限守卫**：从后端获取权限码后动态生成路由
- **路由模式**为 `backend`（后端菜单模式），路由由后端菜单数据驱动

```typescript
// apps/{app}/src/router/guard.ts
export function setupRouterGuard(router: Router) {
  router.beforeEach(async (to, from, next) => {
    // Check token
    if (!accessStore.accessToken) {
      if (to.path.startsWith('/auth')) {
        next();
      } else {
        next('/auth/login');
      }
      return;
    }

    // Fetch user info and access codes
    if (!userInfo.value) {
      await authStore.fetchUserInfo();
      await authStore.fetchAccessCodes();
    }

    next();
  });
}
```

## Admin 与 Platform 差异

| 维度 | Admin | Platform |
|------|-------|----------|
| 路由 code 前缀 | `Admin` | `Platform` |
| 菜单数据文件 | `menu/admin.php` | `menu/platform.php` |
| 多租户 | 有（`X-Tenant-Id`） | 无 |
| 路由重置 | 切换租户后重置 | 不需要 |

## 检查清单

- [ ] 路由 name 是否按 `{App}{Module}Action` 格式命名
- [ ] 新模块的路由是否在 `routes/modules/` 中创建了对应文件
- [ ] 菜单数据是否已在对应后端 `resource/data/menu/{app}.php` 中配置
- [ ] 插件路由是否正确扫描和注册

## 下一步

- [权限管理](./permission.md)
- [Admin 路由差异](./admin/route-menu.md)
- [Platform 路由差异](./platform/route-menu.md)
