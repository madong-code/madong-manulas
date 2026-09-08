# 3.2.4 请求与状态

## 一、请求层概览

web 端的请求层是 `src/api/request.ts` 中自实现的 `Http` 类（基于原生 `fetch`），与 admin 端的 axios 封装不同。

```ts
import request from '~/api/request';          // 默认导出，HTTP 客户端
import { sse, requestSSE, postSSE } from '~/api/request';   // SSE 能力
```

> 注意是**默认导出**：`import request from '~/api/request'`。

## 二、基础用法

```ts
import request from '~/api/request';

// GET —— 第二参数是 query，内部用 qs 序列化
const list = await request.get('/content/article', { page: 1, limit: 10 });

// POST
await request.post('/member/login', { username: 'a', password: 'b' });

// PUT / DELETE
await request.put('/member/profile', { nickname: 'Tom' });
await request.delete('/member/address', { id: 1 });

// 上传
const fd = new FormData();
fd.append('file', file);
const res = await request.upload('/upload/image', fd);
```

**默认只返回 `data` 字段**，无需 `.data.data`。

## 三、请求配置 `ConfigOption`

所有方法的最后一个参数：

```ts
export interface ConfigOption {
  showErrorMessage?: boolean;
  showSuccessMessage?: boolean;
  headers?: Headers | Record<string, string>;
  // 控制是否返回完整响应对象（默认 false 返回 data）
  returnFullResponse?: boolean;
  // 响应类型
  responseType?: 'json' | 'blob' | 'text';
  // 多租户：允许请求级别覆盖 X-Tenant-Id
  //   tenantId: string | number → 使用指定值
  //   tenantId: null          → 跳过注入
  //   tenantId: undefined     → 自动注入（默认行为）
  tenantId?: string | number | null;
}
```

### 常用场景

```ts
// 1. 静默失败（不弹错误提示，自行处理）
const res = await request.get('/may/fail', {}, { showErrorMessage: false });

// 2. 成功时弹提示
await request.post('/member/sign', {}, { showSuccessMessage: true });

// 3. 需要完整响应体（拿 code / msg）
const full = await request.get('/x', {}, { returnFullResponse: true });
console.log(full.code, full.msg, full.data);

// 4. 下载文件
const blob = await request.get('/export/excel', {}, { responseType: 'blob' });

// 5. 指定租户
await request.get('/site/config', {}, { tenantId: 2 });

// 6. 跳过租户注入
await request.get('/public/info', {}, { tenantId: null });
```

## 四、自动注入的请求头

请求拦截器统一注入：

```ts
this.options.onRequest = (data) => {
  const runtimeConfig = useRuntimeConfig();

  this.options.baseURL =
    (runtimeConfig.public.API_BASE_URL as string) || `${location.origin}/api/`;
  const channelKey =
    (runtimeConfig.public.REQUEST_HEADER_CHANNEL_KEY as string) || 'channel';
  const tokenKey =
    (runtimeConfig.public.REQUEST_HEADER_TOKEN_KEY as string) || 'Authorization';

  this.options.headers[channelKey] = 'pc';
  const token = getToken();
  if (token) {
    this.options.headers[tokenKey] = token;
  } else {
    // 清除Authorization头，确保退出登录后不会携带旧token
    delete this.options.headers[tokenKey];
  }
};
```

| 请求头 | 来源 |
| --- | --- |
| `Authorization` | `getToken()`，字段名由 `NUXT_PUBLIC_REQUEST_HEADER_TOKEN_KEY` 决定 |
| 渠道标识（默认 `pc`） | `NUXT_PUBLIC_REQUEST_HEADER_CHANNEL_KEY` |
| `X-Tenant-Id` | 见下节 |
| `Content-Type` | `application/json`（upload 除外） |

> 退出登录时会**主动 `delete`** Token 头，避免残留旧 Token。

## 五、多租户

租户 ID 的解析优先级：

```ts
private resolveTenantId(config: ConfigOption): string | null {
  // 1. 请求配置显式传入（tenantId: null = 跳过注入）
  if (config.tenantId !== undefined) {
    return config.tenantId !== null ? String(config.tenantId) : null;
  }
  // 2. 从环境变量读取默认值
  const runtimeConfig = useRuntimeConfig();
  const envTenantId = runtimeConfig.public.X_TENANT_ID;
  if (envTenantId) {
    return String(envTenantId);
  }
  // 3. 从 store 读取（仅客户端）
  if (process.client) {
    const storeTenantId = useSystemStore().tenantId;
    return storeTenantId ? String(storeTenantId) : null;
  }
  return null;
}
```

```
请求配置 tenantId  >  NUXT_PUBLIC_X_TENANT_ID  >  useSystemStore().tenantId
```

## 六、响应处理

### 成功判定

```ts
if (data && data.code != undefined) {
  if (data.code == 0) {
    if (options.showSuccessMessage) ElMessage({ message: data.msg, type: 'success' });
  } else {
    this.handleAuthError(data.code);
  }
}
```

**`code == 0` 为成功**。

### 业务错误

`code != 0` 时：

- `showErrorMessage !== false` → 弹 `ElMessage` 错误提示并 `reject`
- `showErrorMessage === false` → 不提示，正常 `resolve`（由调用方自行判断）

### 特殊状态码

| code | 处理 |
| --- | --- |
| `401` | 触发 Token 刷新流程（见下节） |
| `402` | `navigateTo('/site/close')` —— 站点已关闭 |
| `403` | 权限不足提示 |

### HTTP 状态码

`handleNetworkError` 把 400/401/403/404/405/408/409/500/501/502/503/504/505 映射为国际化文案（`common.request.xxx`）。

### 超时

| 类型 | 超时 |
| --- | --- |
| 普通请求 | 30 秒 |
| 文件上传 | 60 秒 |

## 七、Token 自动刷新

这是请求层最复杂也最关键的部分：**并发请求下只刷新一次**。

```ts
private async handle401Error(originalRequest: any): Promise<string> {
  if (this.isRefreshing) {
    // 如果正在刷新 token，将请求加入队列
    return new Promise<string>((resolve, reject) => {
      this.refreshSubscribers.push({ resolve, reject });
    });
  }

  this.isRefreshing = true;

  try {
    const newToken = await this.refreshToken();

    // 通知所有队列中的请求
    this.refreshSubscribers.forEach(({ resolve: resolveFn }) => resolveFn(newToken));
    this.refreshSubscribers = [];

    return newToken;
  } catch (error) {
    // 刷新失败：reject 所有挂起请求（避免并发请求永久 pending），再登出
    this.refreshSubscribers.forEach(({ reject: rejectFn }) => rejectFn(error));
    this.refreshSubscribers = [];
    useMemberStore().logout();
    throw error;
  } finally {
    this.isRefreshing = false;
  }
}
```

### 流程

```
请求返回 401
   │
   ├─ 无 refreshToken  →  memberStore.logout()  →  reject
   │
   └─ 有 refreshToken
        ├─ 正在刷新？  →  加入 refreshSubscribers 队列等待
        └─ 否
             ├─ POST /auth/refresh
             ├─ 成功 → 更新 store token → 通知队列 → 重发原请求
             └─ 失败 → reject 全部队列 → logout()
```

刷新实现：

```ts
private async refreshToken(): Promise<string> {
  const memberStore = useMemberStore();
  const refreshToken = memberStore.refreshToken;

  if (!refreshToken) {
    throw new Error('No refresh token available');
  }

  const response = await fetch(this.buildFullUrl('/auth/refresh'), {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ refresh_token: refreshToken }),
  });

  const data = await response.json();

  if (data.code == 0 && data.data) {
    const { access_token, refresh_token } = data.data;
    await memberStore.setToken(access_token, refresh_token);
    return access_token;
  }
  throw new Error(data.msg || 'Failed to refresh token');
}
```

> Token **仅持久化在 member store**，不写 cookie。

## 八、SSE

提供两种模式。

### 模式一：`sse()` —— EventSource（纯 GET）

```ts
import { sse } from '~/api/request';

const conn = sse('/content/notify/sse', {
  onOpen: () => console.log('连接成功'),
  success: (payload) => console.log('数据:', payload),
  error: (payload) => console.error('服务端错误:', payload),
  onError: (event) => console.error('连接错误'),
});

onUnmounted(() => conn.close());
```

特性：

- **仅客户端可用**（`process.client` 判断，SSR 下返回空实现）
- 自动拼 baseURL、自动注入 Token（通过 URL `token` 参数，因为 EventSource 不支持自定义头）
- **同 URL 自动去重**，旧连接自动关闭
- 任意自定义事件名自动注册为 SSE 事件监听
- `error`（带 data）= 业务错误；`onError`（无 data）= 连接断开

### 模式二：`requestSSE()` / `postSSE()` —— fetch + ReadableStream

支持 **POST**，适合 AI 对话等流式场景：

```ts
import { postSSE } from '~/api/request';

const abortController = new AbortController();

await postSSE(
  '/chat/stream',
  { message: 'Hello' },
  {
    onMessage: (chunk) => console.log('收到:', chunk),
    onEnd: () => console.log('流结束'),
    signal: abortController.signal,
  },
);

// 取消
abortController.abort();
```

按行解析 `data:` 帧，自动跳过 `[DONE]` 标记，支持 `AbortSignal` 取消。

## 九、状态管理

使用 Pinia + `pinia-plugin-persistedstate/nuxt`。

### 核心 Store

| Store | 职责 |
| --- | --- |
| `useMemberStore` | 会员登录态：`token`、`refreshToken`、用户信息、`logout()` |
| `useSystemStore` | 系统级：`tenantId`、站点配置 |

### 定义一个 Store

```ts
// src/stores/example.ts
export const useExampleStore = defineStore('example', {
  state: () => ({
    list: [] as any[],
    loading: false,
  }),

  getters: {
    total: (state) => state.list.length,
  },

  actions: {
    async fetchList() {
      this.loading = true;
      try {
        this.list = await request.get('/example/list');
      } finally {
        this.loading = false;
      }
    },
  },

  persist: true,   // 持久化
});
```

### 使用

```vue
<script setup lang="ts">
const memberStore = useMemberStore();

if (!memberStore.token) {
  await navigateTo('/login');
}
</script>
```

> Nuxt 自动导入 store，无需手动 `import`。

## 十、与 SSR 配合

当前 `ssr: false`（SPA 模式）。若开启 SSR，注意：

1. **`sse()` 和 `requestSSE()` 仅客户端可用**，已内置 `process.client` 判断。
2. **`resolveTenantId` 的 store 分支仅客户端生效**，服务端需依赖环境变量。
3. **数据获取用 `useAsyncData` / `useFetch`**，避免服务端与客户端重复请求：

```ts
const { data } = await useAsyncData('article-list', () =>
  request.get('/content/article'),
);
```

## 十一、最佳实践

1. **接口集中定义在 `src/api/<模块>/`**，页面只 import，不散落 URL 字符串。
2. **需要自行处理错误时用 `showErrorMessage: false`**，不要 try/catch 后再吞掉全局提示。
3. **SSE 必须在 `onUnmounted` 中 `close()`**。
4. **多租户优先用环境变量**，请求级 `tenantId` 仅用于跨租户查询等特殊场景。
5. **SSR 场景用 `useAsyncData` 包裹请求**，并给稳定的 key。

> 下一节：[3.2.5 渲染与 SEO](seo.md)
