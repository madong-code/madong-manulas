# 3.1.3 请求层

请求层位于 `src/api/request.ts`，对外导出三样东西：

| 导出 | 用途 |
| --- | --- |
| `requestClient` | **业务主用**，自动解包 `data`、带鉴权、带错误提示 |
| `baseRequestClient` | 裸客户端，不做响应处理（登录、刷新 Token 等场景） |
| `sse()` | Server-Sent Events 封装（消息通知、长任务进度） |

## 一、基础用法

```ts
import { requestClient } from '#/api/request';

// GET
const list = await requestClient.get('/system/post', { params: { page: 1 } });

// POST
await requestClient.post('/system/post', { name: '开发工程师' });

// PUT
await requestClient.put('/system/post/1', { name: '高级工程师' });

// DELETE
await requestClient.delete('/system/post/1');
```

`requestClient` 配置了 `responseReturn: 'data'`，因此**直接拿到业务数据**，不需要再 `.data.data`。

## 二、BaseService —— CRUD 接口工厂

绝大多数模块不需要手写请求，直接用 `src/api/core/base.ts` 提供的工厂：

```ts
import type { PostRow } from './types';

import BaseService from '#/api/core/base';

const baseUrl = '/system/post';

export const PostService = {
  ...BaseService<PostRow>({ baseUrl }),
  getList: BaseService<PostRow>({ baseUrl }).list,
};
```

### 自动获得的方法

| 方法 | 请求 | 说明 |
| --- | --- | --- |
| `list(params?)` | `GET /system/post` | 列表（分页/查询参数） |
| `get(id)` | `GET /system/post/{id}` | 详情 |
| `create(params)` | `POST /system/post` | 新增 |
| `update(id, params?)` | `PUT /system/post/{id}` | 修改 |
| `delete(id, params?)` | `DELETE /system/post/{id}` | 单条删除 |
| `remove(params?)` | `DELETE /system/post` | 批量删除（id 走 params） |
| `export(params)` | `POST /system/post/export` | 导出 |
| `changStatus(id, params)` | `PUT /system/post/{id}/change-status` | 改状态 |
| `detail(params)` | `GET /system/post/{id}` | 详情（从对象取 id） |

### `update` 的两种调用方式

```ts
// 方式一：显式传 id
PostService.update(1, { name: 'xxx' });

// 方式二：传整个对象，自动提取 id
PostService.update({ id: 1, name: 'xxx' });
```

源码：

```ts
update(id, params?) {
  if (typeof id === 'object' && id !== null) {
    const { id: extractedId, ...extractedParams } = id as any;
    if (extractedId !== undefined) {
      return requestClient.put(`${baseUrl}/${extractedId}`, extractedParams);
    }
    return requestClient.put(baseUrl, id);
  }
  return requestClient.put(`${baseUrl}/${id}`, params);
}
```

### 限制可用方法

```ts
// 禁用删除与导出
BaseService<GoodsRow>({
  baseUrl: '/shop/goods',
  forbiddenMethods: ['delete', 'remove', 'export'],
});

// 只允许查询
BaseService<LogRow>({
  baseUrl: '/ops/log',
  allowedMethods: ['list', 'get'],
});
```

调用被禁用的方法会直接抛出异常，便于在开发期暴露问题。

### 扩展自定义接口

```ts
import BaseService from '#/api/core/base';
import { requestClient } from '#/api/request';

const baseUrl = '/system/user';

export const UserService = {
  ...BaseService<UserRow>({ baseUrl }),

  // 自定义：重置密码
  resetPassword(id: number | string, password: string) {
    return requestClient.put(`${baseUrl}/${id}/reset-password`, { password });
  },

  // 自定义：分配角色
  grantRole(id: number | string, roleIds: number[]) {
    return requestClient.post(`${baseUrl}/${id}/roles`, { role_ids: roleIds });
  },
};
```

## 三、拦截器

### 请求拦截：注入 Token 与语言

```ts
client.addRequestInterceptor({
  fulfilled: async (config) => {
    const accessStore = useAccessStore();
    config.headers.Authorization = formatToken(accessStore.accessToken);
    config.headers['Accept-Language'] = preferences.app.locale;
    return config;
  },
});
```

- `Authorization: Bearer <token>`
- `Accept-Language`：与前端当前语言联动，后端据此返回对应语言的提示文案

### 响应拦截 1：解包业务数据

```ts
client.addResponseInterceptor(
  defaultResponseInterceptor({
    codeField: 'code',
    dataField: 'data',
    successCode: (code) => code === 0 || code === 200,
  }),
);
```

**成功判定：`code === 0` 或 `code === 200`**，成功时返回 `data` 字段的内容。

### 响应拦截 2：Token 过期与刷新

```ts
client.addResponseInterceptor(
  authenticateResponseInterceptor({
    client,
    doReAuthenticate,
    doRefreshToken,
    enableRefreshToken: preferences.app.enableRefreshToken,
    formatToken,
  }),
);
```

刷新逻辑：

```ts
async function doRefreshToken() {
  const accessStore = useAccessStore();
  const refreshToken = accessStore.refreshToken;
  if (!refreshToken) {
    throw new Error('No refresh token available');
  }
  const resp = await refreshTokenApi(refreshToken);
  const data = resp.data?.data;
  if (!data?.access_token) {
    throw new Error('Invalid refresh token response');
  }
  accessStore.setAccessToken(data.access_token);
  if (data.refresh_token) {
    accessStore.setRefreshToken(data.refresh_token);
  }
  return data.access_token as string;
}
```

重新认证逻辑（刷新失败或未启用刷新）：

```ts
async function doReAuthenticate() {
  const accessStore = useAccessStore();
  const authStore = useAuthStore();
  accessStore.setAccessToken(null);
  if (
    preferences.app.loginExpiredMode === 'modal' &&
    accessStore.isAccessChecked
  ) {
    accessStore.setLoginExpired(true);   // 弹窗内重新登录，保留页面状态
  } else {
    await authStore.logout();            // 跳回登录页
  }
}
```

> `loginExpiredMode` 在 `src/preferences.ts` 中配置：`modal` 弹窗续期（不丢失当前页面）或跳转登录页。

### 响应拦截 3：统一错误提示

```ts
client.addResponseInterceptor(
  errorMessageResponseInterceptor((msg: string, error) => {
    const responseData = error?.response?.data ?? {};
    const errorMessage =
      responseData?.error ?? responseData?.message ?? responseData?.msg ?? '';
    ElMessage.error(errorMessage || msg);
  }),
);
```

依次尝试 `error` → `message` → `msg` 字段，都没有则回退到基于 HTTP 状态码的默认文案。

> 若某个接口需要自行处理错误、不弹全局提示，可捕获异常处理，或改用 `baseRequestClient`。

## 四、baseURL 来源

```ts
const { apiURL } = useAppConfig(import.meta.env, import.meta.env.PROD);
```

取自环境变量 `VITE_GLOB_API_URL`：

| 环境 | 值 |
| --- | --- |
| 开发 | `/adminapi`（由 Vite 代理转发到后端） |
| 生产 | `/adminapi`（由 Nginx 反向代理到后端） |

## 五、SSE（服务端推送）

用于消息通知未读数、长任务进度等场景。

```ts
import { sse } from '#/api/request';

const conn = sse('/content/message/notify/sse', {
  onOpen: () => console.log('连接成功'),
  success: (payload) => {
    console.log('unread:', payload?.data?.data);
  },
  error: (payload) => {
    console.error('服务端错误:', payload?.data?.message);
  },
  onError: (event) => console.error('连接错误'),
});

// 组件卸载时务必关闭
onUnmounted(() => conn.close());
```

### 特性

| 特性 | 说明 |
| --- | --- |
| 自动拼 baseURL | 相对路径自动补全为完整地址 |
| 自动带 Token | `EventSource` 不支持自定义 header，Token 通过 URL 的 `token` 参数传递 |
| 连接去重 | 同一 URL 重复调用会先关闭旧连接，避免重复定时器 |
| 自定义事件 | 除 `onOpen`/`onMessage`/`onError` 外，任意键名都会注册为同名 SSE 事件监听 |
| JSON 自动解析 | 解析失败则回退为原始字符串 |

### `error` 与 `onError` 的区别

```ts
eventSource.addEventListener('error', (event) => {
  const me = event as MessageEvent;
  if (me.data) {
    // 服务器主动发送的 event: error（业务错误）→ eventHandlers.error
  } else {
    // 连接断开（无 data）→ eventHandlers.onError
  }
});
```

- `error`：**服务端主动推送的业务错误**（带 data）
- `onError`：**连接层面异常**（断线、超时）

### 额外查询参数

```ts
const conn = sse('/task/progress/sse', { progress: (d) => {} }, { uuid: taskId });
```

## 六、约定与最佳实践

1. **优先使用 `BaseService`**，只有非标准接口才手写。
2. **接口定义与页面分离**：接口写在 `src/api/`，页面只 import，便于复用与 Mock。
3. **类型先行**：每个模块配套 `types.ts`，避免 `any` 蔓延。
4. **查询参数使用前缀约定**（`LIKE_`、`EQ_` 等），交由后端 `madong/query` 解析，前端不拼 SQL 语义。
5. **SSE 必须在 `onUnmounted` 中 `close()`**，否则会造成连接泄漏。

> 下一节：[3.1.4 路由与菜单](router.md)
