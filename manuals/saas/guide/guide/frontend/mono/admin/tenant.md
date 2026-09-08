# Admin 应用 - 租户切换

本文介绍 Admin 应用的 **租户切换功能**（差异部分）。

## 租户切换场景

Admin 应用是 **多租户管理后台**，需要支持：
1. 平台管理员：管理所有租户
2. 租户管理员：管理本租户的数据
3. 租户用户：使用本租户的功能

## 租户 Store

```typescript
// apps/admin/store/tenant.ts
import { defineStore } from 'pinia'
import { ref, computed } from 'vue'

export const useTenantStore = defineStore('admin-tenant', () => {
  // 当前租户 ID
  const currentTenantId = ref<string | null>(
    localStorage.getItem('admin_tenant_id')
  )
  
  // 租户列表
  const tenantList = ref<any[]>([])
  
  // 当前租户信息
  const currentTenant = computed(() =>
    tenantList.value.find(t => t.id === currentTenantId.value)
  )
  
  // 设置当前租户
  function setCurrentTenant(tenantId: string) {
    currentTenantId.value = tenantId
    localStorage.setItem('admin_tenant_id', tenantId)
  }
  
  // 获取租户列表
  async function fetchTenantList() {
    const res = await api.getTenantList()
    tenantList.value = res.data
  }
  
  return {
    currentTenantId,
    tenantList,
    currentTenant,
    setCurrentTenant,
    fetchTenantList
  }
})
```

## 租户切换组件

```vue
<!-- apps/admin/components/TenantSwitch.vue -->
<template>
  <el-dropdown trigger="click" @command="handleSwitchTenant">
    <el-button class="tenant-switch-btn">
      <el-icon><OfficeBuilding /></el-icon>
      {{ currentTenant?.name || '请选择租户' }}
      <el-icon class="el-icon--right"><ArrowDown /></el-icon>
    </el-button>
    
    <template #dropdown>
      <el-dropdown-menu>
        <el-dropdown-item
          v-for="tenant in tenantList"
          :key="tenant.id"
          :command="tenant.id"
          :class="{ 'is-active': tenant.id === currentTenantId }"
        >
          <el-icon v-if="tenant.id === currentTenantId"><Check /></el-icon>
          {{ tenant.name }}
        </el-dropdown-item>
      </el-dropdown-menu>
    </template>
  </el-dropdown>
</template>

<script setup lang="ts">
import { useTenantStore } from '@/store/tenant'
import { ElMessage } from 'element-plus'

const tenantStore = useTenantStore()

const currentTenantId = computed(() => tenantStore.currentTenantId)
const currentTenant = computed(() => tenantStore.currentTenant)
const tenantList = computed(() => tenantStore.tenantList)

// 切换租户
async function handleSwitchTenant(tenantId: string) {
  if (tenantId === tenantStore.currentTenantId) return
  
  try {
    // 1. 设置当前租户
    tenantStore.setCurrentTenant(tenantId)
    
    // 2. 重新加载用户信息（获取新租户的权限）
    await authStore.fetchUserInfo()
    
    // 3. 刷新页面
    window.location.reload()
    
    ElMessage.success('租户切换成功')
  } catch (error) {
    ElMessage.error('租户切换失败')
  }
}

// 初始化
onMounted(async () => {
  await tenantStore.fetchTenantList()
})
</script>

<style scoped>
.tenant-switch-btn {
  display: flex;
  align-items: center;
  gap: 8px;
}
</style>
```

## 路由守卫（租户校验）

```typescript
// apps/admin/router/guard.ts
import { useTenantStore } from '@/store/tenant'

export function setupAdminRouterGuard(router: Router) {
  router.beforeEach((to, from, next) => {
    const tenantStore = useTenantStore()
    
    // 检查是否需要租户（某些页面如租户列表不需要）
    if (to.meta.requireTenant && !tenantStore.currentTenantId) {
      ElMessage.warning('请先选择租户')
      next({ name: 'TenantSelect' })
      return
    }
    
    next()
  })
}
```

## API 请求注入租户 ID

```typescript
// apps/admin/utils/request.ts
import { useTenantStore } from '@/store/tenant'

// 覆盖 shared 的 request 配置
request.interceptors.request.use(config => {
  const tenantStore = useTenantStore()
    
  // Admin 应用强制注入租户 ID
  if (tenantStore.currentTenantId) {
    config.headers['X-Tenant-Id'] = tenantStore.currentTenantId
  } else {
    // 未选择租户，跳转到租户选择页
    router.push({ name: 'TenantSelect' })
    return Promise.reject(new Error('未选择租户'))
  }
    
  return config
})
```

## 菜单根据租户动态加载

```typescript
// apps/admin/router/index.ts
import { useTenantStore } from '@/store/tenant'

// 动态加载菜单（根据租户 ID）
async function loadMenus() {
  const tenantStore = useTenantStore()
    
  if (!tenantStore.currentTenantId) {
    return []
  }
    
  const res = await api.getMenus({
    tenant_id: tenantStore.currentTenantId
  })
    
  return res.data
}
```

## 下一步

- [Admin 应用 - 权限管理](./permission.md)
- [Platform 应用 - 权限管理](../platform/permission.md)
