# Platform 组件开发

Platform 应用（`template/mono/apps/platform`）的组件说明。

## 组件分类

Platform 的组件分为两类：

1. **共享基础组件** - 与 Admin 共用（crud / form / dialog / render / icon / page），用法见 [Mono 基础组件](../components/overview.md)
2. **Platform 特有组件** - 仅 Platform 使用（`notification-drawer` 消息通知抽屉）

## 共享基础组件

CRUD、表单、渲染等基础组件的用法见：

- [基础组件总览](../components/overview.md)
- [CRUD 组件](../components/crud/overview.md)
- [表单组件](../components/form.md)

Platform 与 Admin 使用同一套基础组件，仅业务模块与权限码不同。

## Platform 特有组件

### notification-drawer/ - 消息通知抽屉

Platform 端的消息通知抽屉组件，用于展示系统通知、告警等信息。

```vue
<!-- apps/platform/src/components/notification-drawer/index.vue -->
<script setup lang="ts">
import { ref } from 'vue';

const visible = ref(false);

const open = () => {
  visible.value = true;
};

const close = () => {
  visible.value = false;
};
</script>

<template>
  <el-drawer v-model="visible" title="消息通知" direction="rtl">
    <!-- Notification list -->
  </el-drawer>
</template>
```

**与 Admin 的差异**：
- Admin 使用 WebSocket Push + notify Store
- Platform 使用抽屉式 UI，不依赖 WebSocket

## 组件开发规范

### 组件命名

- 组件名使用大驼峰命名法（PascalCase）
- 文件名使用 kebab-case（如 `notification-drawer.vue`）

### 组件注册

全局组件在 `adapter/component/index.ts` 中注册：

```typescript
// apps/platform/src/adapter/component/index.ts
import { globalShareState } from '@vben/common-ui';

const componentMap: Record<string, Component> = {
  Input,
  InputNumber,
  Textarea,
  // ...
};

globalShareState.setComponents(componentMap);
```

## 检查清单

- [ ] 是否优先复用共享基础组件（见 [Mono 基础组件](../components/overview.md)）
- [ ] 组件名是否使用大驼峰
- [ ] 组件是否正确注册到全局组件系统

## 下一步

- [Mono 基础组件](../components/overview.md)
- [国际化配置](./i18n.md)
- [权限管理](./permission.md)
