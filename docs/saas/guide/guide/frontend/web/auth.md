# 认证系统

## 概述

`template/web` 的认证系统支持**登录、注册、忘记密码、Token 自动刷新**等功能，基于 JWT（JSON Web Token）实现。

## 认证流程

```
用户访问需要登录的页面
        │
        ▼
  middleware/auth.ts 检查
  memberStore.isLogin
        │
   ┌─── 已登录 ────┐
   │                    │
   ▼                    ▼
 直接进入页面      跳转到登录页
                       │
                       ▼
                登录成功
                       │
                       ▼
              设置 Token（memberStore）
                       │
                       ▼
               跳回原页面（redirect）
```

## 登录

### 登录对话框（components/login-dialog/）

项目使用**全局登录对话框**（非独立登录页），用户在任何页面都可以点击"登录"按钮弹出对话框。

```
components/login-dialog/
├── index.vue            # 对话框容器（控制显示/隐藏）
├── login.vue           # 登录表单
├── register.vue        # 注册表单
└── forget-password.vue # 忘记密码表单
```

### 触发登录对话框

```ts
// 在组件中
import { useGlobalsStore } from '~/stores/globals'

const globalsStore = useGlobalsStore()
globalsStore.loginDialogVisible = true
```

### 登录逻辑（composables/login.ts）

```ts
// src/composables/login.ts
export function useLogin() {
  const memberStore = useMemberStore()

  async function handleLogin(formData: LoginRequest) {
    try {
      // 1. 调用登录接口
      const data = await loginApi(formData)

      // 2. 保存 Token
      await memberStore.setToken(data.access_token, data.refresh_token)

      // 3. 获取用户信息
      const userInfo = await getUserInfoApi()
      await memberStore.setUserInfo(userInfo)

      // 4. 关闭对话框
      const globalsStore = useGlobalsStore()
      globalsStore.loginDialogVisible = false

      // 5. 跳转到重定向地址或首页
      const redirect = useRoute().query.redirect as string
      navigateTo(redirect || '/')

    } catch (error) {
      // 登录失败，显示错误消息
      console.error('登录失败', error)
    }
  }

  return { handleLogin }
}
```

## 注册

注册表单包含以下字段（以实际为准）：

| 字段 | 说明 | 验证规则 |
|------|------|----------|
| `username` | 用户名 | 必填，4-20 位字符 |
| `password` | 密码 | 必填，至少 6 位 |
| `confirm_password` | 确认密码 | 必填，需与密码一致 |
| `email` | 邮箱 | 选填，邮箱格式 |
| `mobile` | 手机号 | 选填，手机号格式 |
| `sms_code` | 短信验证码 | 如果启用短信验证则必填 |

### 发送短信验证码（composables/send-sms.ts）

```ts
export function useSendSMS() {
  const countdown = ref(0)
  let timer: number | null = null

  async function sendCode(mobile: string) {
    // 调用发送短信接口
    await sendSMSApi({ mobile })

    // 开始倒计时
    countdown.value = 60
    timer = window.setInterval(() => {
      countdown.value--
      if (countdown.value <= 0) {
        clearInterval(timer!)
        timer = null
      }
    }, 1000)
  }

  return { countdown, sendCode }
}
```

## 忘记密码

忘记密码流程：

1. 用户输入**手机号/邮箱**
2. 发送验证码（短信/邮件）
3. 用户输入验证码和新密码
4. 提交重置密码请求
5. 重置成功，跳转到登录页

## Token 管理

### Access Token

- **有效期**：短期（如 2 小时）
- **存储位置**：`localStorage`（`member-store`）
- **使用方式**：每次请求自动注入到 `Authorization` 请求头

### Refresh Token

- **有效期**：长期（如 30 天）
- **存储位置**：`localStorage` + `Cookie`（双存储）
- **使用方式**：Access Token 过期时自动使用 Refresh Token 刷新

### Token 刷新流程

```
API 请求返回 401
        │
        ▼
request.ts 检测到 401
        │
        ▼
检查是否有 refreshToken
        │
   ┌─── 有 ────┐
   │                │
   ▼                ▼
调用 /auth/refresh   清除登录态
   │               跳转登录页
   ▼
刷新成功
   │
   ▼
更新 accessToken
   │
   ▼
重试原请求
```

### 手动刷新 Token

```ts
// 在请求拦截器中自动处理，一般无需手动调用
// 如果需要手动刷新：
const memberStore = useMemberStore()
const newToken = await refreshTokenApi(memberStore.refreshToken)
await memberStore.setToken(newToken.access_token, newToken.refresh_token)
```

## 登出

```ts
// src/stores/member.ts
async function logout() {
  // 1. 调用后端登出接口（可选）
  try {
    await logoutApi()
  } catch (error) {
    // 忽略错误，继续登出
  }

  // 2. 清除本地状态
  isLogin.value = false
  userInfo.value = null
  accessToken.value = ''
  refreshToken.value = ''

  // 3. 清除持久化存储
  localStorage.removeItem('member-store')
  document.cookie = 'refreshToken=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/'

  // 4. 跳转登录页
  navigateTo('/auth/login')
}
```

## 认证初始化（plugins/auth-init.ts）

在应用启动时，自动检查登录态并恢复用户状态：

```ts
// src/plugins/auth-init.ts
export default defineNuxtPlugin(() => {
  if (process.server) return

  const memberStore = useMemberStore()

  // 如果已登录，获取最新用户信息
  if (memberStore.isLogin) {
    getUserInfoApi().then(userInfo => {
      memberStore.setUserInfo(userInfo)
    }).catch(() => {
      // Token 可能已过期，尝试刷新
      memberStore.refreshToken && memberStore.logout()
    })
  }
})
```

## 路由守卫集成

```ts
// middleware/auth.ts
export default defineNuxtRouteMiddleware((to, from) => {
  const memberStore = useMemberStore()

  if (to.meta.requiresAuth && !memberStore.isLogin) {
    return navigateTo(`/auth/login?redirect=${to.fullPath}`)
  }
})
```

在页面中使用：

```vue
<script setup lang="ts">
definePageMeta({
  middleware: ['auth'],
  requiresAuth: true,
})
</script>
```

## 安全注意事项

- Access Token 只存储在 `localStorage`，不在 Cookie 中存敏感信息
- Refresh Token 同时存 `localStorage` 和 `Cookie`，Cookie 设置 `HttpOnly` 更安全（需要后端配合）
- 退出登录时务必清除所有存储的 Token
- 生产环境下，Token 传输必须使用 HTTPS
