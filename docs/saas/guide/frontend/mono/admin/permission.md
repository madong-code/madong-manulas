# Admin 应用 - 权限管理

本文介绍 Admin 应用的 **权限管理差异部分**（共同部分请参考 [Mono 权限管理](../config.md)）。

## Admin 权限模型

Admin 应用使用 **RBAC（角色基于访问控制）** 权限模型，与 Platform 应用的区别：

| 维度 | Admin 应用 | Platform 应用 |
|-------|------------|---------------|
| 权限范围 | **租户级**（每个租户独立权限） | **平台级**（全局权限） |
| 角色类型 | 租户管理员、租户用户 | 平台管理员、平台用户 |
| 数据隔离 | 强制租户 ID 过滤 | 无租户过滤 |

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

### 基础守卫（在 `packages/shared/` 中定义）

```typescript
// packages/shared/src/utils/permission.ts
import { useAuthStore } from '@/store/auth'

export function setupRouterGuard(router: Router) {
  router.beforeEach((to, from, next) => {
    const authStore = useAuthStore()
    
    // 1. 检查是否登录
    if (!authStore.token) {
      next({ name: 'Login' })
      return
    }
    
    // 2. 检查是否有权限访问该路由
    if (to.meta.requireAuth && !authStore.hasPermission(to.meta.permission)) {
      next({ name: '403' })
      return
    }
    
    next()
  })
}
```

### Admin 应用扩展守卫

```typescript
// apps/admin/router/guard.ts
import { setupRouterGuard } from '@shared/utils/permission'
import { useTenantStore } from '@/store/tenant'

export function setupAdminRouterGuard(router: Router) {
  // 1. 基础守卫
  setupRouterGuard(router)
  
  // 2. Admin 专用守卫（租户校验）
  router.beforeEach((to, from, next) => {
    const tenantStore = useTenantStore()
    
    // 检查是否选择了租户
    if (to.meta.requireTenant && !tenantStore.currentTenantId) {
      next({ name: 'TenantSelect' })
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
    
    <!-- 有 user:edit 权限才显示 -->
    <el-button v-permission="'user:edit'" size="small">编辑</el-button>
  </div>
</template>
```

### 使用权限函数

```vue
<script setup lang="ts">
import { useAuthStore } from '@/store/auth'

const authStore = useAuthStore()

// 检查权限
const canAdd = authStore.hasPermission('user:add')
const canEdit = authStore.hasPermission('user:edit')
</script>

<template>
  <div>
    <el-button v-if="canAdd" type="primary">新增</el-button>
    <el-button v-if="canEdit" size="small">编辑</el-button>
  </div>
</template>
```

## 租户切换

### 租户 Store

```typescript
// apps/admin/store/tenant.ts
import { defineStore } from 'pinia'
import { ref } from 'vue'

export const useTenantStore = defineStore('tenant', () => {
  const currentTenantId = ref<string | null>(localStorage.getItem('tenant_id'))
  const tenantList = ref<any[]>([])
  
  // 设置当前租户
  function setCurrentTenant(tenantId: string) {
    currentTenantId.value = tenantId
    localStorage.setItem('tenant_id', tenantId)
  }
  
  // 获取租户列表
  async function fetchTenantList() {
    const res = await api.getTenantList()
    tenantList.value = res.data
  }
  
  return {
    currentTenantId,
    tenantList,
    setCurrentTenant,
    fetchTenantList
  }
})
```

### 租户切换组件

```vue
<!-- apps/admin/components/TenantSwitch.vue -->
<template>
  <el-dropdown @command="handleCommand">
    <span>{{ currentTenant?.name || '请选择租户' }}</span>
    <template #dropdown>
      <el-dropdown-menu>
        <el-dropdown-item
          v-for="tenant in tenantList"
          :key="tenant.id"
          :command="tenant.id"
        >
          {{ tenant.name }}
        </el-dropdown-item>
      </el-dropdown-menu>
    </template>
  </el-dropdown>
</template>

<script setup lang="ts">
import { useTenantStore } from '@/store/tenant'

const tenantStore = useTenantStore()

const currentTenant = computed(() =>
  tenantStore.tenantList.find(t => t.id === tenantStore.currentTenantId)
)

function handleCommand(tenantId: string) {
  tenantStore.setCurrentTenant(tenantId)
  // 刷新页面（重新加载该租户的数据）
  window.location.reload()
}
</script>
```

## API 请求注入租户 ID

### 自动注入（在 `packages/shared/` 中定义）

```typescript
// packages/shared/src/utils/request.ts
import { useTenantStore } from '@/store/tenant'

// 请求拦截器
request.interceptors.request.use(config => {
  const tenantStore = useTenantStore()
  
  // 注入租户 ID
  if (tenantStore.currentTenantId) {
    config.headers['X-Tenant-Id'] = tenantStore.currentTenantId
  }
  
  return config
})
```

## 下一步

- [Platform 应用 - 权限管理](../platform/permission.md)
- [Mono 共享配置](../config.md)
