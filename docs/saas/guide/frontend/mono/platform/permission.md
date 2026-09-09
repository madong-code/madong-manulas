# Platform 应用 - 权限管理

本文介绍 Platform 应用的 **权限管理差异部分**（共同部分请参考 [Mono 权限管理](../config.md)）。

## Platform 权限模型

Platform 应用使用 **平台级 RBAC** 权限模型，与 Admin 应用的区别：

| 维度 | Admin 应用 | Platform 应用 |
|-------|------------|---------------|
| 权限范围 | **租户级**（每个租户独立权限） | **平台级**（全局权限） |
| 角色类型 | 租户管理员、租户用户 | 平台管理员、平台用户 |
| 数据隔离 | 强制租户 ID 过滤 | 无租户过滤 |
| 租户切换 | 需要（多租户管理） | 不需要 |

## 权限校验流程

```
用户登录
  → 获取用户角色
  → 获取角色权限列表
  → 缓存到 Pinia（auth store）
  → 路由守卫校验
  → 按钮权限校验
```

## 路由守卫

### Platform 专用守卫

```typescript
// apps/platform/router/guard.ts
import { setupRouterGuard } from '@shared/utils/permission'

export function setupPlatformRouterGuard(router: Router) {
  // 1. 基础守卫（无租户校验）
  setupRouterGuard(router)
  
  // 2. Platform 专用守卫（如平台状态校验）
  router.beforeEach((to, from, next) => {
    const authStore = useAuthStore()
    
    // 检查平台是否维护中
    if (to.meta.requirePlatform && authStore.platformStatus === 'maintenance') {
      next({ name: 'Maintenance' })
      return
    }
    
    next()
  })
}
```

## 按钮权限校验

### 使用权限指令

```vue
<template>
  <div>
    <!-- 有 user:add 权限才显示 -->
    <el-button v-permission="'user:add'" type="primary">新增</el-button>
  </div>
</template>
```

### 使用权限函数

```typescript
// apps/platform/store/auth.ts
export const useAuthStore = defineStore('platform-auth', () => {
  const permissions = ref<string[]>([])
  
  // 检查权限
  function hasPermission(permission: string) {
    return permissions.value.includes(permission)
  }
  
  return { permissions, hasPermission }
})
```

## 与 Admin 的差异

### 1. 无租户切换

Platform 应用是 **平台级应用**，不需要租户切换功能。

### 2. 权限全局生效

在 Platform 应用中，权限是 **全局生效** 的，不区分租户。

### 3. 角色管理界面不同

- **Admin 应用**：租户管理员可以管理本租户的角色
- **Platform 应用**：平台管理员可以管理所有角色

## 下一步

- [Admin 应用 - 权限管理](../admin/permission.md)
- [Mono 共享配置](../config.md)
