# Admin 路由和菜单

## 路由模式

Admin 使用 **后端菜单驱动模式**（`accessMode: 'backend'`），路由和菜单由后端动态返回。

## 路由配置

### preferences.ts

```typescript
// apps/admin/src/preferences.ts
import { defineOverridesPreferences } from '@vben/preferences';

export const overridesPreferences = defineOverridesPreferences({
  app: {
    name: import.meta.env.VITE_APP_TITLE,
    accessMode: 'backend',         // Backend menu mode
    enableRefreshToken: true,      // Enable refresh token
  },
});
```

### 路由文件结构

```
apps/admin/src/router/
├── index.ts                     # Router instance creation
├── access.ts                    # Permission route generation (backend menu mode)
├── guard.ts                     # Route guards
├── routes/
│   ├── index.ts                 # Route aggregation
│   ├── core.ts                  # Core routes (Root/Auth/404)
│   ├── backend.ts               # Backend mode routes (Profile)
│   └── modules/
│       ├── system.ts            # System management routes
│       ├── member.ts            # Member management routes
│       ├── goods.ts             # Goods management routes
│       ├── order.ts             # Order management routes
│       ├── marketing.ts         # Marketing management routes
│       ├── finance.ts           # Finance management routes
│       ├── content.ts           # Content management routes
│       ├── plugin.ts            # Plugin management routes
│       └── tools.ts             # Tools management routes
└── plugin/
    ├── index.ts                 # Plugin route manager
    └── scanner.ts               # Plugin route scanner
```

## 路由 name 命名规范

```
Admin{Module}{Action}
```

示例：

| 路由 | code | 说明 |
|------|------|------|
| 系统菜单列表 | `AdminSystemMenuList` | 系统菜单 |
| 会员用户列表 | `AdminMemberUserList` | 会员用户 |
| 租户管理 | `AdminTenantList` | 租户管理 |
| 内容管理 | `AdminContentArticleList` | 内容文章 |
| 运维工具 | `AdminOpsTerminalList` | 终端管理 |
| 插件管理 | `AdminPluginList` | 插件列表 |

## 路由定义示例

### core.ts - 核心路由

```typescript
// apps/admin/src/router/routes/core.ts
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
// apps/admin/src/router/routes/modules/system.ts
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

后端菜单数据文件位于：

```
backend/resource/data/menu/admin.php
```

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

插件路由由 `plugin/` 下的管理器动态扫描注册：

```typescript
// apps/admin/src/router/plugin/scanner.ts
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
- **多租户**：切换租户后重置路由

```typescript
// apps/admin/src/router/guard.ts
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

## 多租户路由重置

切换租户后，需要重置路由：

```typescript
// apps/admin/src/store/auth.ts
async function switchTenant(tenantId) {
  // 1. Update tenant ID
  accessStore.setTenantId(tenantId);

  // 2. Refresh user info
  await fetchUserInfo();

  // 3. Refresh access codes
  await fetchAccessCodes();

  // 4. Reset routes
  resetRouter();

  // 5. Navigate to dashboard
  router.push('/dashboard');
}
```

## 与 Platform 的差异

| 维度 | Admin | Platform |
|------|-------|----------|
| 路由 code 前缀 | `Admin` | `Platform` |
| 菜单数据文件 | `menu/admin.php` | `menu/platform.php` |
| 多租户 | 有（`X-Tenant-Id`） | 无 |
| 业务模块数量 | 10 个 | 6 个 |
| 路由重置 | 切换租户后重置 | 不需要 |

## 检查清单

- [ ] 路由 name 是否按 `Admin{Module}Action` 格式命名
- [ ] 新模块的路由是否在 `routes/modules/` 中创建了对应文件
- [ ] 菜单数据是否已在后端 `resource/data/menu/admin.php` 中配置
- [ ] 插件路由是否正确扫描和注册
- [ ] 切换租户后是否正确重置路由

## 下一步

- [基础组件](../components/overview.md) - 开发自定义组件
- [国际化配置](../i18n.md) - 配置多语言支持
- [权限管理](./permission.md) - 配置权限控制
