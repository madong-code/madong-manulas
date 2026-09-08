# 状态管理

## 概述

`template/web` 使用 **Pinia** 作为状态管理库，配合 `pinia-plugin-persistedstate` 实现状态持久化。

## Store 文件结构

```
src/stores/
├── app.ts            # 应用状态（全局）
├── config.ts         # 配置状态
├── globals.ts        # 全局共享状态
├── member.ts        # 会员状态（登录信息、Token）
├── system.ts         # 系统状态（站点配置、租户）
├── constant/
│   └── keys.ts     # 持久化 Key 常量
└── interface/
    └── index.ts     # Store 接口定义
```

## member Store（会员状态）

管理用户登录态和 Token，是最核心的 Store。

### 状态定义

```ts
// src/stores/member.ts
export const useMemberStore = defineStore('member', () => {
  // 登录态
  const isLogin = ref(false)

  // 用户信息
  const userInfo = ref<MemberInfo | null>(null)

  // Tokens
  const accessToken = ref('')
  const refreshToken = ref('')

  // ...计算方法和动作
  return { isLogin, userInfo, accessToken, refreshToken, ... }
}, {
  persist: [
    // 持久化配置
    {
      key: 'member-store',
      storage: piniaPluginPersistedstate.localStorage(),
      paths: ['isLogin', 'userInfo', 'accessToken', 'refreshToken']
    },
    {
      key: 'refreshToken',
      storage: piniaPluginPersistedstate.cookies(),
      paths: ['refreshToken']
    }
  ]
})
```

### 持久化策略

| 状态 | 存储位置 | 说明 |
|------|----------|------|
| `isLogin` | `localStorage` | 登录态标识 |
| `userInfo` | `localStorage` | 用户基本信息 |
| `accessToken` | `localStorage` | 访问令牌（短期） |
| `refreshToken` | `localStorage` + `Cookie` | 刷新令牌（长期，双存储） |

> 📌 `refreshToken` 同时存到 Cookie，方便服务端刷新时读取。

### 核心方法

```ts
// 设置 Token（登录成功时调用）
async function setToken(accessToken: string, refreshToken: string) {
  isLogin.value = true
  accessToken.value = accessToken
  refreshToken.value = refreshToken
}

// 登出（清除所有状态）
async function logout() {
  isLogin.value = false
  userInfo.value = null
  accessToken.value = ''
  refreshToken.value = ''
  // 跳转登录页
  navigateTo('/auth/login')
}
```

### 在组件中使用

```vue
<script setup lang="ts">
const memberStore = useMemberStore()
</script>

<template>
  <div v-if="memberStore.isLogin">
    欢迎，{{ memberStore.userInfo?.nickname }}
    <el-button @click="memberStore.logout()">登出</el-button>
  </div>
  <div v-else>
    <el-button @click="showLoginDialog = true">登录</el-button>
  </div>
</template>
```

## system Store（系统状态）

管理系统配置和租户信息。

```ts
// src/stores/system.ts
export const useSystemStore = defineStore('system', () => {
  // 站点配置
  const siteConfig = ref<SiteConfig | null>(null)

  // 当前租户 ID
  const tenantId = ref<string>('')

  // 获取站点配置
  async function fetchSiteConfig() {
    const data = await getSiteConfig()
    siteConfig.value = data
  }

  return { siteConfig, tenantId, fetchSiteConfig }
}, {
  persist: {
    key: 'system-store',
    storage: piniaPluginPersistedstate.localStorage(),
    paths: ['tenantId']
  }
})
```

## app Store（应用状态）

管理全局应用状态（如全局加载态、通知等）。

```ts
// src/stores/app.ts
export const useAppStore = defineStore('app', () => {
  // 全局加载态
  const globalLoading = ref(false)

  // 设备类型
  const device = ref<'desktop' | 'mobile'>('desktop')

  return { globalLoading, device }
})
```

## config Store（配置状态）

管理前端配置（如主题、语言等客户端配置）。

```ts
// src/stores/config.ts
export const useConfigStore = defineStore('config', () => {
  // 主题模式
  const theme = ref<'light' | 'dark'>('light')

  // 侧边栏折叠
  const sidebarCollapsed = ref(false)

  return { theme, sidebarCollapsed }
}, {
  persist: {
    key: 'config-store',
    storage: piniaPluginPersistedstate.localStorage(),
    paths: ['theme', 'sidebarCollapsed']
  }
})
```

## globals Store（全局共享状态）

管理跨页面共享的临时状态。

```ts
// src/stores/globals.ts
export const useGlobalsStore = defineStore('globals', () => {
  // 登录对话框显示态
  const loginDialogVisible = ref(false)

  // 消息通知数量
  const unreadCount = ref(0)

  return { loginDialogVisible, unreadCount }
})
```

## Pinia 持久化配置（plugins/pinia-persist.ts）

```ts
// src/plugins/pinia-persist.ts
export default defineNuxtPlugin(() => {
  const pinia = getActivePinia()

  pinia.use(piniaPluginPersistedstate, {
    // 全局持久化配置
    storage: {
      cookie: piniaPluginPersistedstate.cookies({
        maxAge: 60 * 60 * 24 * 30, // 30 天
      }),
      localStorage: piniaPluginPersistedstate.localStorage(),
    },
  })
})
```

## 在组件中使用 Store

```vue
<script setup lang="ts">
import { useMemberStore } from '~/stores/member'
import { storeToRefs } from 'pinia'

const memberStore = useMemberStore()

// 使用 storeToRefs 保持响应性
const { isLogin, userInfo } = storeToRefs(memberStore)
const { logout } = memberStore
</script>
```

## 在服务端使用 Store

```ts
// 在 API 插件或中间件中
export default defineNuxtPlugin(() => {
  if (process.server) return

  const memberStore = useMemberStore()
  // 初始化...
})
```

## 注意事项

- Store 的 `persist` 配置**只在客户端生效**，服务端渲染时不会读取 `localStorage`
- 使用 `storeToRefs()` 解构 Store 时保持响应性，直接解构会丢失响应性
- 刷新页面时，`localStorage` 中的状态会自动恢复
- Cookie 中存储的 `refreshToken` 可以在服务端读取，用于首屏渲染时的 Token 刷新
