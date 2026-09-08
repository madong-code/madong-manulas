# API 层

## 概述

`template/web` 的 API 层位于 `src/api/` 目录，**按业务模块分组**，每个模块包含：

- `index.ts` — 接口方法定义
- `types.ts` — 请求/响应类型定义

## 目录结构

```
src/api/
├── auth/              # 认证模块
│   ├── index.ts       # login(), register(), refreshToken() 等
│   └── types.ts      # AuthRequest, AuthResponse 等
├── member/            # 会员模块
│   ├── index.ts
│   └── types.ts
├── system/            # 系统模块
│   ├── index.ts
│   └── types.ts
└── site/             # 站点模块
    ├── index.ts
    └── types.ts
```

## 请求封装（utils/request.ts）

所有接口都使用 `src/utils/request.ts` 导出的 `request` 实例，它是基于原生 `fetch` 封装的 `Http` 类单例。

### 基本用法

```ts
import request from '~/utils/request'

// GET 请求
const data = await request.get<ResponseData>('/api/user/info', { id: 1 })

// POST 请求
const data = await request.post<ResponseData>('/api/user/update', { name: 'John' })

// PUT 请求
const data = await request.put<ResponseData>('/api/user/update', { id: 1, name: 'John' })

// DELETE 请求
const data = await request.delete<ResponseData>('/api/user/delete', { id: 1 })

// 文件上传
const data = await request.upload<ResponseData>('/api/upload/avatar', formData)
```

### 配置项（ConfigOption）

```ts
interface ConfigOption {
  // 是否显示错误消息（默认 true）
  showErrorMessage?: boolean
  // 是否显示成功消息（默认 false）
  showSuccessMessage?: boolean
  // 自定义请求头
  headers?: Headers
  // 是否返回完整响应对象（默认 false，只返回 data）
  returnFullResponse?: boolean
  // 响应类型（json | blob | text）
  responseType?: 'json' | 'blob' | 'text'
  // 多租户：允许请求级别覆盖 X-Tenant-Id
  //   tenantId: string | number → 使用指定值
  //   tenantId: null          → 跳过注入
  //   tenantId: undefined     → 自动注入（默认行为）
  tenantId?: string | number | null
}
```

### 示例

```ts
// 不显示错误消息（自行处理）
const data = await request.get('/api/user/info', {}, {
  showErrorMessage: false
})

// 显示成功消息
const data = await request.post('/api/user/update', payload, {
  showSuccessMessage: true
})

// 返回完整响应（包含 code、msg）
const fullResp = await request.get('/api/user/info', {}, {
  returnFullResponse: true
})
// fullResp.code === 0
// fullResp.data === ...

// 下载文件（blob 类型）
const blob = await request.get('/api/export', { id: 1 }, {
  responseType: 'blob'
})
const url = URL.createObjectURL(blob)
window.open(url)

// 指定租户 ID（覆盖自动注入）
const data = await request.get('/api/tenant/data', {}, {
  tenantId: 123
})

// 跳过租户 ID 注入（调用公共接口）
const data = await request.get('/api/public/info', {}, {
  tenantId: null
})
```

## 接口示例（auth 模块）

### types.ts

```ts
// src/api/auth/types.ts

// 登录请求
export interface LoginRequest {
  username: string
  password: string
  captcha?: string
}

// 登录响应
export interface LoginResponse {
  access_token: string
  refresh_token: string
  expires_in: number
  user: UserInfo
}

// 注册请求
export interface RegisterRequest {
  username: string
  password: string
  confirm_password: string
  email?: string
  mobile?: string
  sms_code?: string
}

// 刷新 Token 请求
export interface RefreshTokenRequest {
  refresh_token: string
}

// 用户信息
export interface UserInfo {
  id: number
  username: string
  nickname: string
  avatar: string
  email: string
  mobile: string
}
```

### index.ts

```ts
// src/api/auth/index.ts
import request from '~/utils/request'
import type { LoginRequest, LoginResponse, RegisterRequest } from './types'

// 登录
export function loginApi(data: LoginRequest) {
  return request.post<LoginResponse>('/auth/login', data)
}

// 注册
export function registerApi(data: RegisterRequest) {
  return request.post<any>('/auth/register', data, {
    showSuccessMessage: true
  })
}

// 刷新 Token
export function refreshTokenApi(refreshToken: string) {
  return request.post<LoginResponse>('/auth/refresh', {
    refresh_token: refreshToken
  })
}

// 登出
export function logoutApi() {
  return request.post<any>('/auth/logout')
}

// 获取用户信息
export function getUserInfoApi() {
  return request.get<UserInfo>('/member/info')
}
```

## 自动注入的请求头

每次请求会自动注入以下请求头：

| 请求头 | 来源 | 说明 |
|---------|--------|------|
| `Authorization` | `memberStore.accessToken` | Bearer Token |
| `pc` / `h5` 等 | `runtimeConfig.public.REQUEST_HEADER_CHANNEL_KEY` | 渠道标识 |
| `X-Tenant-Id` | `tenantId` 配置 > 环境变量 > `systemStore.tenantId` | 多租户 |

## Token 自动刷新

当请求返回 **401** 时，`request.ts` 会自动尝试刷新 Token：

1. 检查是否有 `refreshToken`
2. 如果有，调用 `/auth/refresh` 接口
3. 刷新成功后，自动重试原请求
4. 刷新失败，跳转到登录页

> 📌 刷新 Token 的过程是**队列化**的，多个并发请求只会刷新一次。

## 在组件中使用 API

```vue
<script setup lang="ts">
import { loginApi, getUserInfoApi } from '~/api/auth'
import { useMemberStore } from '~/stores/member'

const memberStore = useMemberStore()

async function handleLogin() {
  try {
    const data = await loginApi({
      username: 'admin',
      password: '123456'
    })
    await memberStore.setToken(data.access_token, data.refresh_token)
    await memberStore.setUserInfo(data.user)
    navigateTo('/member/profile')
  } catch (error) {
    console.error('登录失败', error)
  }
}
</script>
```

## 统一错误处理

`request.ts` 的响应拦截器会统一处理错误码：

| 错误码 | 处理方式 |
|--------|----------|
| `0` | 成功（自动返回 `data` 字段） |
| `401` | 自动刷新 Token，刷新失败跳转登录 |
| `403` | 跳转站点关闭页 |
| 其他 | 显示错误消息（`showErrorMessage: true` 时） |

## 开发代理

开发环境下，`nuxt.config.ts` 中的 Vite 代理会将 `/api` 请求转发到后端：

```ts
// nuxt.config.ts
vite: {
  server: {
    proxy: {
      "/api": {
        target: "http://127.0.0.1:8500",
        changeOrigin: true,
      },
    },
  },
}
```

生产环境下，通过 `NUXT_PUBLIC_API_BASE_URL` 环境变量配置后端地址。
