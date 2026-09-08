# 请求层与 API 约定

---

## 一、结构总览

```
src/
├── core/request/                      请求内核（框架层，勿改）
│   ├── index.ts
│   └── request-client/
│       ├── request-client.ts              RequestClient 主体
│       ├── preset-interceptors.ts         预置拦截器
│       ├── types.ts                       类型定义
│       └── modules/
│           ├── interceptor.ts                 拦截器管理
│           ├── downloader.ts                  下载
│           ├── uploader.ts                    上传
│           └── sse.ts                         SSE
│
├── api/
│   ├── request.ts                     ⭐ 请求实例配置（业务层，可改）
│   ├── index.ts                       统一导出
│   ├── core/
│   │   └── base.ts                    ⭐ BaseService 通用 CRUD 工厂
│   └── <业务域>/<模块>/
│       ├── index.ts                   接口定义
│       └── types.ts                   类型定义
```

> `src/api/request.ts` 文件头注释明确：**"该文件可自行根据业务逻辑进行调整"**。

---

## 二、请求实例

### 2.1 两个实例

```ts
export const requestClient = createRequestClient(apiURL, {
  responseReturn: 'data',        // 自动解包，直接返回 data
});

export const baseRequestClient = new RequestClient({ baseURL: apiURL });
```

| 实例 | 用途 |
| --- | --- |
| `requestClient` | **业务默认使用**，带完整拦截器，自动解包 `data` |
| `baseRequestClient` | 无拦截器，用于登录/刷新令牌等特殊场景 |

`apiURL` 来自环境变量 `VITE_GLOB_API_URL`（开发环境为 `/adminapi`）：

```ts
const { apiURL } = useAppConfig(import.meta.env, import.meta.env.PROD);
```

---

## 三、拦截器链

### 3.1 请求拦截器 — 注入认证与语言

```ts
client.addRequestInterceptor({
  fulfilled: async (config) => {
    const accessStore = useAccessStore();
    config.headers.Authorization = formatToken(accessStore.accessToken);
    config.headers['Accept-Language'] = preferences.app.locale;
    return config;
  },
});

function formatToken(token: null | string) {
  return token ? `Bearer ${token}` : null;
}
```

每个请求自动携带：

| 请求头 | 值 |
| --- | --- |
| `Authorization` | `Bearer <access_token>` |
| `Accept-Language` | 当前语言（`zh-CN` / `en-US`） |

### 3.2 响应拦截器①：统一响应格式

```ts
client.addResponseInterceptor(
  defaultResponseInterceptor({
    codeField: 'code',
    dataField: 'data',
    successCode: (code) => code === 0 || code === 200,
  }),
);
```

**后端响应契约**：

```json
{
  "code": 0,
  "msg": "success",
  "data": { }
}
```

| 字段 | 说明 |
| --- | --- |
| `code` | `0` 或 `200` 视为成功，其他为失败 |
| `msg` | 提示信息 |
| `data` | 业务数据，成功时被自动解包返回 |

因此业务代码拿到的直接是 `data`：

```ts
const list = await GoodsCategoryService.list({ page: 1 });
// list 已经是 data，无需 res.data.data
```

### 3.3 响应拦截器②：令牌过期与自动刷新

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

**刷新令牌逻辑**：

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

**重新认证逻辑**：

```ts
async function doReAuthenticate() {
  console.warn('Access token or refresh token is invalid or expired. ');
  const accessStore = useAccessStore();
  const authStore = useAuthStore();
  accessStore.setAccessToken(null);
  if (
    preferences.app.loginExpiredMode === 'modal' &&
    accessStore.isAccessChecked
  ) {
    accessStore.setLoginExpired(true);    // 弹窗内重新登录，不丢失页面状态
  } else {
    await authStore.logout();             // 跳转登录页
  }
}
```

**过期处理流程**：

```
请求返回 401
      ↓
enableRefreshToken?
   ├─ 是 → 用 refresh_token 换新 access_token → 重放原请求
   │        └─ 刷新失败 → doReAuthenticate()
   └─ 否 → doReAuthenticate()
                ↓
      loginExpiredMode === 'modal' 且已鉴权过？
         ├─ 是 → 弹出登录框（保留当前页面）
         └─ 否 → 登出并跳转登录页
```

### 3.4 响应拦截器③：统一错误提示

```ts
client.addResponseInterceptor(
  errorMessageResponseInterceptor((msg: string, error) => {
    const responseData = error?.response?.data ?? {};
    const errorMessage =
      responseData?.error ?? responseData?.message ?? responseData?.msg ?? '';
    // 如果没有错误信息，则会根据状态码进行提示
    ElMessage.error(errorMessage || msg);
  }),
);
```

错误信息取值优先级：`error` → `message` → `msg` → 状态码默认文案。

> ⚠️ **多套 UI 注意**：这里的 `ElMessage` 是 Element Plus API，换 UI 库时需替换（如 `message.error`、`window.$message.error`）。

---

## 四、`BaseService` 通用 CRUD 工厂

`src/api/core/base.ts` 提供标准 RESTful CRUD 方法工厂，避免重复代码。

### 4.1 使用方式

```ts
import type { GoodsCategory } from './types';

import BaseService from '#/api/core/base';
import { requestClient } from '#/api/request';

const baseUrl = '/goods/category';

export const GoodsCategoryService = {
  ...BaseService<GoodsCategory>({
    baseUrl,
    allowedMethods: [],       // 空数组 = 不限制
    forbiddenMethods: [],     // 禁用的方法
  }),

  // 追加自定义接口
  getEnabledList(): Promise<GoodsCategory[]> {
    return requestClient.get(`${baseUrl}/enabled`);
  },
};
```

### 4.2 提供的方法

| 方法 | HTTP | 路径 | 说明 |
| --- | --- | --- | --- |
| `list(params?)` | GET | `{baseUrl}` | 列表查询 |
| `get(id)` | GET | `{baseUrl}/{id}` | 详情 |
| `create(params)` | POST | `{baseUrl}` | 新增 |
| `update(id, params?)` | PUT | `{baseUrl}/{id}` | 编辑 |
| `remove(params?)` | DELETE | `{baseUrl}` | 批量删除 |
| `delete(id, params?)` | DELETE | `{baseUrl}/{id}` | 单条删除 |
| `export(params)` | POST | `{baseUrl}/export` | 导出 |
| `changStatus(id, params)` | PUT | `{baseUrl}/{id}/change-status` | 改状态 |
| `detail(params)` | GET | `{baseUrl}/{id}` | 详情（从 params 取 id） |

### 4.3 `update` 的智能重载

```ts
update(
  id: number | Record<string, any> | string,
  params?: Record<string, any>,
): Promise<any> {
  checkMethod('update');
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

两种调用方式均可：

```ts
// 方式一：分开传
Service.update(1, { name: 'foo' });          // PUT /xxx/1  { name: 'foo' }

// 方式二：传整个对象，自动提取 id（CRUD 组件常用）
Service.update({ id: 1, name: 'foo' });      // PUT /xxx/1  { name: 'foo' }
```

### 4.4 方法白/黑名单

```ts
BaseService<T>({
  baseUrl: '/xxx',
  forbiddenMethods: ['delete', 'export'],   // 禁用这些方法
})

BaseService<T>({
  baseUrl: '/xxx',
  allowedMethods: ['list', 'get'],          // 只允许这两个
})
```

违规调用会抛出错误：

```
Error: delete method is forbidden.
Error: create method is not allowed.
```

---

## 五、SSE（Server-Sent Events）

用于服务端推送场景（如安装进度、消息通知）。

### 5.1 基本用法

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

// 关闭连接
conn.close();
```

### 5.2 特性

| 特性 | 说明 |
| --- | --- |
| 自动拼接 BaseURL | 相对路径自动加上 `apiURL` |
| 自动注入 Token | EventSource 不支持自定义 header，通过 URL 参数 `token=Bearer xxx` 传递 |
| 连接去重 | 同一 URL 只保持一个活跃连接，新建时自动关闭旧连接 |
| 自定义事件 | 除 `onOpen`/`onMessage`/`onError` 外，任意事件名会注册为 `addEventListener` |
| 自动 JSON 解析 | 收到数据尝试 `JSON.parse`，失败则回传原始字符串 |
| 额外参数 | 第三个参数 `extraParams` 可注入查询参数 |

### 5.3 error 事件的双重语义

```ts
eventSource.addEventListener('error', (event) => {
  const me = event as MessageEvent;
  if (me.data) {
    // 服务器主动发送的 event: error（业务错误）
    eventHandlers.error?.(JSON.parse(me.data));
  } else if (eventHandlers.onError) {
    // 连接断开（非服务器主动错误）
    eventHandlers.onError(event);
  }
});
```

| 回调 | 触发场景 |
| --- | --- |
| `error` | 服务端主动推送 `event: error` 且带 `data`（业务错误） |
| `onError` | 连接断开、网络异常（`data` 为空） |

### 5.4 返回对象

```ts
{
  eventSource,              // 原生 EventSource 实例
  close: () => void,        // 关闭并从缓存移除
  readyState: () => number, // 连接状态
}
```

---

## 六、文件上传与下载

请求内核提供了独立模块：

| 模块 | 文件 |
| --- | --- |
| 上传 | `core/request/request-client/modules/uploader.ts` |
| 下载 | `core/request/request-client/modules/downloader.ts` |

```ts
// 上传
requestClient.upload('/upload/image', { file });

// 下载
requestClient.download('/system/log/export', { params });
```

---

## 七、接口定义规范

### 7.1 目录结构

```
api/<业务域>/<模块>/
├── index.ts      接口方法
└── types.ts      类型定义
```

业务域与后端保持一致：`system` / `member` / `content` / `ops` / `web` / `app` / `devtools` / `auth` / `core`。

### 7.2 类型定义

```ts
// api/goods/category/types.ts
export interface GoodsCategory {
  id: string;              // ⭐ 用 string，避免大整数精度丢失
  name: string;
  parent_id: number;
  description: string;
  sort: number;
  enabled: number;
  enabled_text?: string;   // 后端 $appends 追加字段
  created_at?: string;
  updated_at?: string;
}
```

> **字段命名用 snake_case**，与后端保持一致，不做驼峰转换。

### 7.3 接口定义

```ts
// api/goods/category/index.ts
import type { GoodsCategory } from './types';

import BaseService from '#/api/core/base';
import { requestClient } from '#/api/request';

const baseUrl = '/goods/category';

export const GoodsCategoryService = {
  ...BaseService<GoodsCategory>({ baseUrl, allowedMethods: [], forbiddenMethods: [] }),

  // ========== 分组注释便于阅读 ==========

  /** 获取启用的分类列表 */
  getEnabledList(): Promise<GoodsCategory[]> {
    return requestClient.get(`${baseUrl}/enabled`);
  },

  /** 更新排序 */
  updateSort(data: Record<string, any>): Promise<any> {
    return requestClient.put(`${baseUrl}/update-sort`, data);
  },
};
```

**命名约定**：

| 项 | 规则 | 示例 |
| --- | --- | --- |
| 导出对象 | `<模块名>Service` | `GoodsCategoryService`、`MemberTagService` |
| 基础路径变量 | `baseUrl` | `const baseUrl = '/goods/category'` |
| 方法名 | 动词开头驼峰 | `getEnabledList`、`batchAssignTags` |

### 7.4 统一导出

在 `api/<业务域>/index.ts` 中汇总：

```ts
export * from './category';
export * from './goods';
```

便于业务侧统一 import：

```ts
import { GoodsCategoryService } from '#/api/goods';
```

---

## 八、查询参数约定

搜索字段使用前缀声明查询方式，后端自动解析：

| 前缀 | 含义 | SQL |
| --- | --- | --- |
| `LINK_` | 模糊查询 | `field LIKE '%value%'` |
| `EQ_` | 精确匹配 | `field = value` |

```ts
// Schema 中
{ component: 'Input',   fieldName: 'LINK_name' }
{ component: 'ApiDict', fieldName: 'EQ_enabled' }

// 实际请求
GET /adminapi/goods/category?LINK_name=手机&EQ_enabled=1&page=1&limit=10
```

**分页参数**：

| 参数 | 说明 |
| --- | --- |
| `page` | 页码，从 1 开始 |
| `limit` | 每页条数 |

**分页响应**：

```json
{
  "code": 0,
  "msg": "success",
  "data": {
    "list": [],
    "total": 100
  }
}
```

---

## 九、最佳实践

| ✅ 推荐 | ❌ 避免 |
| --- | --- |
| 用 `requestClient` | 直接 `axios.get()` |
| 用 `BaseService` 复用 CRUD | 每个模块手写 8 个方法 |
| `id` 类型用 `string` | 用 `number`（大整数精度丢失） |
| 字段用 snake_case | 前端做驼峰转换 |
| 相对路径 `/goods/category` | 写死完整域名 |
| 类型定义放 `types.ts` | 到处写 `any` |
| 错误由拦截器统一处理 | 每个调用点 try/catch 弹提示 |
| SSE 用完 `conn.close()` | 忘记关闭导致连接泄漏 |

---

## 十、多套 UI 注意点

`src/api/request.ts` 中**唯一与 UI 强相关**的是错误提示：

```ts
import { ElMessage } from 'element-plus';
// ...
ElMessage.error(errorMessage || msg);
```

换 UI 库时替换为对应 API：

| UI 库 | 写法 |
| --- | --- |
| Element Plus | `ElMessage.error(msg)` |
| Ant Design Vue | `message.error(msg)` |
| Naive UI | `window.$message?.error(msg)`（需先挂载 Provider） |

其余部分（拦截器逻辑、`BaseService`、SSE）**完全通用**。

---

## 十一、下一步

- [路由与菜单](./router.md)
- [权限控制](./access.md)
- [后端接口设计规范](../../dev-guide/api-spec.md)
