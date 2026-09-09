# 3.1.6 状态管理

使用 **Pinia**，配合 `pinia-plugin-persistedstate` 做持久化，敏感数据经 `secure-ls` 加密。

## 一、Store 分布

状态分两层：

| 层 | 位置 | 内容 |
| --- | --- | --- |
| 内核 | `src/core/stores` | `useAccessStore`、`useUserStore`、`useTabbarStore` 等框架级状态 |
| 业务 | `src/store` | `auth` 及 `modules/` 下的业务状态 |

```
src/store/
├── index.ts
├── auth.ts                 认证流程编排
└── modules/
    ├── dict.ts             数据字典缓存
    ├── notify.ts           通知消息
    ├── site-config.ts      站点配置
    └── terminal.ts         Web 终端会话
```

## 二、`auth` —— 认证

`src/store/auth.ts` 采用 setup 语法定义，只暴露流程方法，Token/用户信息实际存放在内核 store 中。

```ts
export const useAuthStore = defineStore('auth', () => {
  const accessStore = useAccessStore();
  const userStore = useUserStore();
  const router = useRouter();

  const loginLoading = ref(false);

  async function authLogin(params, onSuccess?) { /* ... */ }
  async function logout(redirect = true) { /* ... */ }
  async function fetchUserInfo() {
    const userInfo = await getUserInfoApi();
    userStore.setUserInfo(userInfo);
    return userInfo;
  }
  function $reset() { loginLoading.value = false; }

  return { $reset, authLogin, fetchUserInfo, loginLoading, logout };
});
```

### 使用

```vue
<script setup lang="ts">
import { useAuthStore } from '#/store';

const authStore = useAuthStore();

async function onSubmit(values: Record<string, any>) {
  await authStore.authLogin(values);
}
</script>

<template>
  <ElButton :loading="authStore.loginLoading" @click="onSubmit">
    登录
  </ElButton>
</template>
```

### 登录流程

```
authLogin(params)
  ├─ loginApi(params)                  → access_token / refresh_token
  ├─ accessStore.setAccessToken()
  ├─ accessStore.setRefreshToken()
  ├─ getAccessCodesApi()               → 预加载权限码（失败不阻塞）
  ├─ accessStore.setAccessCodes()
  └─ router.push(defaultHomePath)      或 onSuccess() 回调
```

支持自定义成功回调，用于登录后跳转到指定页：

```ts
await authStore.authLogin(values, async () => {
  await router.push('/dashboard/analytics');
});
```

### 与内核 store 的分工

| Store | 职责 |
| --- | --- |
| `useAuthStore`（业务） | 登录/登出/拉取用户信息的**流程编排** |
| `useAccessStore`（内核） | Token、权限码、路由、登录过期标记的**存储** |
| `useUserStore`（内核） | 用户资料的**存储** |

## 三、`dict` —— 数据字典

高频使用的 store，为 `ApiDict`、`CellDictTag` 等组件提供数据源。

```ts
export const useDictStore = defineStore('dict', {
  state: (): DictState => ({
    dictMap: new Map<string, NewOption[]>(),
    loadingMap: new Map<string, boolean>(),
  }),

  actions: {
    async getDictByType(dictType: string): Promise<NewOption[]> {
      // 1. 命中缓存直接返回
      if (this.dictMap.has(dictType)) {
        return this.dictMap.get(dictType) || [];
      }

      // 2. 正在加载则等待，避免并发重复请求
      if (this.loadingMap.get(dictType)) {
        await new Promise((resolve) => setTimeout(resolve, 10));
        return this.getDictByType(dictType);
      }

      // 3. 发起请求并写入缓存
      this.loadingMap.set(dictType, true);
      try {
        const res = await requestClient.get('/system/dict/options/by-type', {
          params: { dict_type: dictType },
        });
        const data = res || [];
        this.dictMap.set(dictType, data);
        return data;
      } finally {
        this.loadingMap.set(dictType, false);
      }
    },

    clearDictCache(dictType: string) { /* ... */ },
    clearAllCache() { /* ... */ },
  },
});
```

### 三个设计要点

1. **缓存优先** —— 同一字典类型只请求一次。
2. **并发去重** —— `loadingMap` 防止同一字典被多个组件同时触发重复请求（表格里十几个单元格同时渲染字典标签时非常关键）。
3. **可主动失效** —— 后台修改字典后调用 `clearDictCache(type)` 或 `clearAllCache()`。

### 字典项结构

```ts
interface NewOption {
  label: string;
  value: number | string;
  disabled?: boolean;
  bgColor?: string;    // 标签背景色
  textColor?: string;  // 标签文字色
}
```

`bgColor` / `textColor` 使字典可以直接驱动带颜色的状态标签。

### 使用

大多数情况**不需要直接调用**，通过组件的 `code` 属性即可：

```tsx
// 表格列
{
  field: 'enabled',
  title: '状态',
  cellRender: {
    name: 'CellDictTag',
    attrs: { code: DictEnum.SYS_ENABLED_STATUS },
  },
}

// 表单项
{
  label: '状态',
  fieldName: 'enabled',
  component: 'ApiDict',
  componentProps: {
    code: DictEnum.SYS_ENABLED_STATUS,
    isBtn: true,
    renderType: 'RadioGroup',
  },
}
```

需要手动取值时：

```ts
import { useDictStore } from '#/store/modules/dict';
import { DictEnum } from '#/enums';

const dictStore = useDictStore();
const options = await dictStore.getDictByType(DictEnum.SYS_ENABLED_STATUS);
```

> 字典类型常量统一定义在 `src/enums` 的 `DictEnum` 中，**不要在业务代码里硬编码字符串**。

## 四、其他业务 Store

| Store | 文件 | 职责 |
| --- | --- | --- |
| `notify` | `modules/notify.ts` | 通知消息列表与未读数，配合 SSE 实时更新 |
| `site-config` | `modules/site-config.ts` | 站点名称、Logo、备案号等全局配置，登出时随 `resetAllStores()` 重置 |
| `terminal` | `modules/terminal.ts` | Web 终端会话管理，配合 [4.3.1 Web 终端](../../backend/advanced/terminal.md) |

## 五、新增一个 Store

`src/store/modules/example.ts`：

```ts
import { defineStore } from 'pinia';

import { requestClient } from '#/api/request';

interface ExampleState {
  list: any[];
  loading: boolean;
}

export const useExampleStore = defineStore('example', {
  state: (): ExampleState => ({
    list: [],
    loading: false,
  }),

  getters: {
    total: (state) => state.list.length,
  },

  actions: {
    async fetchList() {
      this.loading = true;
      try {
        this.list = await requestClient.get('/example/list');
      } finally {
        this.loading = false;
      }
    },

    $reset() {
      this.list = [];
      this.loading = false;
    },
  },
});
```

> 建议实现 `$reset()`，这样登出时 `resetAllStores()` 能正确清理。

## 六、持久化

`.env` 中的相关配置：

```ini
VITE_APP_NAMESPACE=madong-single                                 # 存储命名空间，多项目隔离
VITE_APP_STORE_SECURE_KEY=please-replace-me-with-your-own-key    # 加密密钥
```

> **生产环境必须替换 `VITE_APP_STORE_SECURE_KEY`。**

## 七、注意事项

1. **`$reset()` 之后要小心持久化恢复** —— 参考 `logout()` 中显式 `$patch` 清空 Token 的做法。
2. **Map 类型状态无法直接持久化** —— `dict` store 使用 `Map`，属于内存缓存，刷新页面即失效，这是刻意设计。
3. **业务 store 不要直接存 Token** —— 统一交给内核 `useAccessStore`。
4. **组件内不要缓存 store 的解构值** —— 需要响应式时用 `storeToRefs()`。

> 下一节：[3.1.7 UI 适配层](ui-adapter.md)
