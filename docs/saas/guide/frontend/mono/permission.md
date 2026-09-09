# Mono 权限管理（公共范式）

本文介绍 mono 下 admin / platform 两个应用**共用的权限机制**（基于 Vben Admin 的 `@vben/access`）。两应用采用相同的 RBAC（角色 + 权限码）模型，仅权限作用域不同（租户级 vs 平台级）。

## 权限模型

Admin / Platform 均使用 **RBAC（角色基于访问控制）** 权限模型：

```
用户登录
  → 后端返回 access_token
  → 获取用户信息（含角色 roles）
  → 获取权限码 access_codes（getAccessCodesApi）
  → 缓存到 accessStore
  → 路由守卫用权限码生成可访问路由/菜单
  → 组件内用 hasAccessByCodes 做按钮级控制
```

### 权限作用域差异

| 维度 | Admin | Platform |
|------|-------|----------|
| 权限范围 | **租户级**（每个租户独立权限） | **平台级**（全局权限） |
| 数据隔离 | 强制租户 ID 过滤 | 无租户过滤 |
| 租户切换 | 需要（多租户管理） | 不需要 |

## 权限码（后端来源）

权限码由后端 `#[Permission]` 注解声明，前端通过接口获取。**前端与后端共用契约（字段名、权限码），禁止为单个 UI 改后端契约。**

## 权限状态（accessStore）

登录后调用 `getAccessCodesApi()` 获取权限码并写入 `accessStore`：

```typescript
// apps/{app}/src/store/auth.ts
const accessCodes = await getAccessCodesApi();
accessStore.setAccessCodes(accessCodes);
```

## 前端判断权限

使用 `@vben/access` 提供的 `useAccess()` 组合式函数：

### 按钮级判断（代码内）

```vue
<script setup lang="ts">
import { useAccess } from '@vben/access';

const { hasAccessByCodes } = useAccess();
</script>

<template>
  <ElButton v-if="hasAccessByCodes(['system:config:create'])">新增配置</ElButton>
</template>
```

### 使用权限指令

`@vben/access` 提供 `v-access` 指令：

```vue
<template>
  <ElButton v-access:code="['system:config:create']">新增配置</ElButton>
</template>
```

> 权限码格式约定：`{模块}:{资源}:{操作}`，如 `system:config:create`、`member:user:edit`。

### 角色判断

```typescript
const { hasAccessByRoles } = useAccess();
if (hasAccessByRoles(['admin'])) {
  // 管理员逻辑
}
```

## 路由权限守卫

路由守卫 `guard.ts` 负责 Token 检查与权限码加载：

```typescript
// apps/{app}/src/router/guard.ts
export function setupRouterGuard(router: Router) {
  router.beforeEach(async (to, from, next) => {
    // 1. Token 检查
    if (!accessStore.accessToken) {
      if (to.path.startsWith('/auth')) {
        next();
      } else {
        next('/auth/login');
      }
      return;
    }

    // 2. 加载用户信息与权限码（未加载时补偿）
    if (!userInfo.value) {
      await authStore.fetchUserInfo();
      await authStore.fetchAccessCodes();
    }

    next();
  });
}
```

路由可访问性由 `access.ts` 的 `generateAccess()` 根据权限码生成：

```typescript
// apps/{app}/src/router/access.ts
const { accessibleMenus, accessibleRoutes } = await generateAccess({
  roles: userRoles,
  router,
  routes: accessRoutes,
});
accessStore.setAccessMenus(accessibleMenus);
accessStore.setAccessRoutes(accessibleRoutes);
```

## 多租户权限（仅 Admin）

Admin 切换租户后需重新加载该租户上下文下的用户与权限码，并重置路由：

```typescript
// apps/{app}/src/store/auth.ts
async function switchTenant(tenantId) {
  // 1. 更新 token 与租户 ID
  accessStore.setAccessToken(result.access_token);
  accessStore.setTenantId(String(tenantId));

  // 2. 重新加载用户信息与权限码（新租户上下文）
  const [userInfo, accessCodes] = await Promise.all([
    fetchUserInfo(),
    getAccessCodesApi(),
  ]);
  userStore.setUserInfo(userInfo);
  accessStore.setAccessCodes(accessCodes);

  // 3. 重置路由，重新生成新租户菜单/路由
  resetRouterRoutes();
  const { accessibleMenus, accessibleRoutes } = await generateAccess({ ... });
  accessStore.setAccessMenus(accessibleMenus);
  accessStore.setAccessRoutes(accessibleRoutes);
}
```

> Platform 无多租户，无需切换租户逻辑。

## 最佳实践

- 权限码统一由后端 `#[Permission]` 下发，前端只消费不定义
- 按钮级控制优先用 `hasAccessByCodes()` 或 `v-access:code`
- 新增业务模块时，前后端权限码必须同步

## 检查清单

- [ ] 权限码是否与后端 `#[Permission]` 一致
- [ ] 按钮是否用 `hasAccessByCodes` 控制而非直接 `v-if`
- [ ] Admin 切换租户后是否正确重置路由并重新加载权限码

## 下一步

- [路由与菜单](./route-menu.md)
- [Admin 权限差异](./admin/permission.md)
- [Platform 权限差异](./platform/permission.md)
