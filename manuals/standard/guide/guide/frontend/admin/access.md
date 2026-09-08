# 3.1.5 权限控制

admin 端权限分三层，自上而下逐级收紧：

```
① 路由级   能否进入这个页面      →  菜单 + accessRoutes
② 按钮级   能否看到这个操作按钮   →  CrudSchema.permissions / v-access
③ 接口级   能否调用这个接口      →  由后端 Casbin 最终把关（前端仅是体验层）
```

> **前端权限只负责"体验"，真正的安全边界在后端。** 任何前端隐藏的功能，后端都必须同样校验，详见 [4.2.7 权限管理](../../backend/basic/permission.md)。

## 一、权限码

权限码格式为 `模块:资源:动作`，与后端保持完全一致：

```
org:post:read      查看岗位
org:post:create    新增岗位
org:post:update    编辑岗位
org:post:delete    删除岗位
```

来源接口 `getAccessCodesApi()`，登录后写入 `accessStore`。

## 二、登录时预加载权限码

`src/store/auth.ts` 中，登录成功后**立即**拉取权限码：

```ts
if (accessToken) {
  accessStore.setAccessToken(accessToken);
  accessStore.setRefreshToken(refreshToken);

  // 登录成功后立即预加载权限码，确保路由渲染（权限判断钩子）前权限码已就绪。
  // 避免「刚登录时按钮缺失、刷新后正常」的时序竞态；失败不阻塞登录，由路由守卫补偿。
  try {
    const accessCodes = await getAccessCodesApi();
    accessStore.setAccessCodes(accessCodes);
  } catch {
    // 预加载失败由 setupAccessGuard 补偿加载
  }
  // ...
}
```

这段注释解释了一个典型坑：**若等到路由守卫才加载权限码，首次登录时按钮会短暂缺失**。这里做了前置加载，且失败不阻塞登录（由守卫兜底）。

## 三、路由级权限

在路由 `meta.authority` 中声明：

```ts
{
  path: 'goods',
  name: 'ShopGoods',
  component: () => import('#/views/shop/goods/index.vue'),
  meta: {
    title: '商品管理',
    authority: ['shop:goods:list'],
  },
}
```

无权限时渲染 403 页面：

```ts
const FORBIDDEN_COMPONENT = () =>
  import('#/views/_core/fallback/forbidden.vue');
```

在后端菜单模式下，用户看到的菜单本身就是后端按角色过滤后的结果，因此通常无需再写 `authority`。

## 四、按钮级权限

### 方式一：CRUD Schema（推荐）

```tsx
export const useCrudSchema = (): CrudSchema => {
  return {
    crudApi: { /* ... */ },

    hasAdd: true,
    hasEdit: true,
    hasView: true,
    hasRemove: true,

    permissions: {
      add: 'org:post:create',
      edit: 'org:post:update',
      remove: 'org:post:delete',
      view: 'org:post:read',
    },
    // ...
  };
};
```

| 字段 | 作用 |
| --- | --- |
| `hasAdd` / `hasEdit` / `hasView` / `hasRemove` | **功能开关**：该操作是否存在 |
| `permissions.*` | **权限开关**：有该权限码的用户才能看到按钮 |

两者是"与"关系：`hasAdd: false` 时按钮一定不显示；`hasAdd: true` 时还要看是否具备 `permissions.add`。

### 方式二：指令

```vue
<template>
  <ElButton v-access:code="'shop:goods:export'">导出</ElButton>
  <ElButton v-access:role="['super']">危险操作</ElButton>
</template>
```

### 方式三：组合式函数

适合需要条件判断而非简单显隐的场景：

```vue
<script setup lang="ts">
import { useAccess } from '#/core/access';

const { hasAccessByCodes, hasAccessByRoles } = useAccess();

function handleExport() {
  if (!hasAccessByCodes(['shop:goods:export'])) {
    ElMessage.warning('无导出权限');
    return;
  }
  // ...
}
</script>

<template>
  <ElButton :disabled="!hasAccessByCodes(['shop:goods:update'])">
    编辑
  </ElButton>
</template>
```

### 方式四：组件包裹

```vue
<AccessControl :codes="['shop:goods:delete']">
  <ElButton type="danger">删除</ElButton>
</AccessControl>
```

## 五、访问模式

由 `src/preferences.ts` 的 `app.accessMode` 决定：

| 模式 | 说明 | 适用 |
| --- | --- | --- |
| `backend` | 菜单与路由由后端下发（**项目默认**） | 生产环境，权限需动态调整 |
| `frontend` | 完全使用本地静态路由，按 `authority` 过滤 | 简单项目或纯前端演示 |

```ts
return await generateAccessible(preferences.app.accessMode, {
  ...options,
  fetchMenuListAsync: fetchBackendMenus,
  forbiddenComponent: FORBIDDEN_COMPONENT,
  layoutMap: { BasicLayout, IFrameView, RouteView },
  pageMap,
});
```

## 六、登出与状态清理

`logout()` 的三步清理值得注意：

```ts
async function logout(redirect: boolean = true) {
  try {
    await logoutApi();
  } catch {
    // 不做任何处理
  }

  // 1. 重置所有 store（access/user/siteConfig/tabbar...）
  resetAllStores();

  // 2. 强制清除 token 并写入 storage，
  //    防止 pinia-plugin-persistedstate 在 $reset 后恢复旧 token
  accessStore.$patch({
    accessToken: null,
    refreshToken: null,
  });

  // 3. 回登录页（路由守卫检测 accessToken 为空 → 放行）
  await router.replace({
    path: LOGIN_PATH,
    query: redirect
      ? { redirect: encodeURIComponent(router.currentRoute.value.fullPath) }
      : {},
  });
}
```

> 第 2 步是关键：仅调用 `$reset()` 时，持久化插件可能把旧 Token 从 storage 恢复回来，必须显式 `$patch` 覆盖。

## 七、权限落地清单

新增一个功能时，需要同步四处：

| # | 位置 | 内容 |
| --- | --- | --- |
| 1 | 后端控制器 | 声明权限码（注解/中间件） |
| 2 | 后台菜单管理 | 新增菜单及按钮权限记录 |
| 3 | 前端 `schemas` | `permissions` 填写对应权限码 |
| 4 | 角色管理 | 把权限码分配给角色 |

漏掉任何一步都会出现"按钮不显示"或"点了报 403"。

## 八、排查表

| 现象 | 排查 |
| --- | --- |
| 按钮不显示 | 权限码拼写；角色是否已分配；`hasXxx` 是否为 `true` |
| 刚登录按钮缺失，刷新后正常 | 权限码预加载失败，查看 `getAccessCodesApi` 是否报错 |
| 有按钮但点击 403 | 前端权限码与后端不一致，以后端为准 |
| 菜单看不到 | 后端菜单未分配给角色，或 `hideInMenu: true` |
| 登出后仍能访问 | 检查是否绕过了 `logout()` 的 `$patch` 清理 |

> 下一节：[3.1.6 状态管理](store.md)
