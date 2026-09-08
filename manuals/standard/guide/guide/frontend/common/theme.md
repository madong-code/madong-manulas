# 主题与样式

---

## 一、样式技术栈

| 技术 | 作用 |
| --- | --- |
| Tailwind CSS 4 + `@tailwindcss/vite` | 原子化 CSS 主力 |
| CSS 变量 | 主题令牌，支持运行时切换 |
| Sass / `sass-embedded` | 预处理器（局部使用） |
| `class-variance-authority` (CVA) | 组件变体管理 |
| `clsx` + `tailwind-merge` | 类名合并去重 |
| `@ctrl/tinycolor` + `theme-colors` | 主题色动态计算 |

---

## 二、目录结构

```
src/core/
├── design/                 设计系统
│   ├── icons/                  图标体系
│   │   ├── base/                   基础图标（lucide）
│   │   ├── iconify/                Iconify 集成
│   │   ├── svg/                    本地 SVG（icons/*.svg）
│   │   └── icons/                  自定义图标组件
│   └── （样式变量、全局样式）
│
└── preferences/            偏好设置（主题模式、主题色、布局）
```

---

## 三、主题模式

### 3.1 亮色 / 暗色 / 跟随系统

```ts
import { preferences, updatePreferences } from '#/core/preferences';

// 读取
preferences.theme.mode;        // 'light' | 'dark' | 'auto'

// 切换
updatePreferences({ theme: { mode: 'dark' } });
```

暗黑模式通过在 `<html>` 上切换 `dark` 类实现，Tailwind 的 `dark:` 变体自动生效：

```vue
<template>
  <div class="bg-white text-black dark:bg-gray-900 dark:text-white">
    内容
  </div>
</template>
```

### 3.2 主题色

```ts
updatePreferences({
  theme: {
    colorPrimary: 'hsl(212 100% 45%)',
  },
});
```

主题色变更后，`@ctrl/tinycolor` + `theme-colors` 会自动计算出完整色阶（hover、active、disabled 等）并写入 CSS 变量。

---

## 四、CSS 变量体系

### 4.1 核心变量

```css
:root {
  /* 主色 */
  --primary: 212 100% 45%;
  --primary-foreground: 0 0% 98%;

  /* 背景与前景 */
  --background: 0 0% 100%;
  --foreground: 222 47% 11%;

  /* 卡片 */
  --card: 0 0% 100%;
  --card-foreground: 222 47% 11%;

  /* 边框与输入 */
  --border: 240 6% 90%;
  --input: 240 6% 90%;
  --ring: 212 100% 45%;

  /* 语义色 */
  --destructive: 0 84% 60%;
  --success: 144 57% 58%;
  --warning: 42 84% 61%;

  /* 圆角 */
  --radius: 0.5rem;
}

.dark {
  --background: 222 47% 11%;
  --foreground: 0 0% 98%;
  /* ... 暗色覆盖 */
}
```

> 变量值使用 **HSL 分量格式**（不带 `hsl()` 包裹），便于 Tailwind 的透明度修饰符（如 `bg-primary/50`）。

### 4.2 在 Tailwind 中使用

```vue
<template>
  <div class="bg-background text-foreground border-border">
    <button class="bg-primary text-primary-foreground hover:bg-primary/90">
      按钮
    </button>
  </div>
</template>
```

### 4.3 在自定义 CSS 中使用

```css
.my-card {
  background-color: hsl(var(--card));
  color: hsl(var(--card-foreground));
  border-radius: var(--radius);
}
```

---

## 五、布局偏好

```ts
updatePreferences({
  app: {
    layout: 'sidebar-nav',      // 布局模式
    accessMode: 'backend',      // 权限模式
    locale: 'zh-CN',            // 语言
    enableRefreshToken: true,   // 令牌刷新
    loginExpiredMode: 'modal',  // 登录过期处理：modal | page
  },
  sidebar: {
    collapsed: false,
    width: 224,
  },
  tabbar: {
    enable: true,
    showIcon: true,
    persist: true,
  },
  breadcrumb: { enable: true },
  footer: { enable: false },
});
```

**常用布局模式**：

| 值 | 说明 |
| --- | --- |
| `sidebar-nav` | 侧边栏导航 |
| `header-nav` | 顶部导航 |
| `mixed-nav` | 混合导航 |
| `sidebar-mixed-nav` | 侧边混合 |
| `full-content` | 全屏内容（无导航） |

偏好设置会持久化到 localStorage（带 `VITE_APP_NAMESPACE` 前缀）。

---

## 六、图标体系

### 6.1 三种图标来源

| 来源 | 用途 | 使用方式 |
| --- | --- | --- |
| **Iconify** | 主力，海量图标集 | 字符串名称 |
| **Lucide** | 基础线性图标 | 组件导入 |
| **本地 SVG** | 项目专属图标 | 自动注册 |

### 6.2 Iconify（推荐）

```vue
<script setup lang="ts">
import { IconifyIcon } from '#/core/design/icons';
</script>

<template>
  <IconifyIcon icon="ant-design:user-outlined" />
  <IconifyIcon icon="lucide:settings" class="size-5" />
</template>
```

在路由 `meta` 与 Schema 中直接写字符串：

```ts
meta: { icon: 'ant-design:appstore-outlined' }

tableActions: [
  { label: '编辑', icon: 'ant-design:edit-outlined' },
]
```

### 6.3 本地 SVG

将 `.svg` 放入 `src/core/design/icons/svg/icons/`，自动注册：

```
svg/icons/bell.svg      → SvgBellIcon
svg/icons/github.svg    → SvgGithubIcon
```

现有本地图标：`avatar-1~4`、`bell`、`cake`、`card`、`dingding`、`download`、`github`、`google`、`qqchat` 等。

### 6.4 离线图标

```ini
VITE_APP_ICON_OFFLINE=true
```

开启后使用本地 `@iconify/json` 数据，不请求 Iconify CDN。**内网部署必须开启**。

---

## 七、类名工具

### 7.1 `cn()` 合并类名

```ts
import { cn } from '#/core/shared/utils';

const cls = cn(
  'px-4 py-2 rounded',
  isActive && 'bg-primary text-white',
  props.class,             // 允许外部覆盖
);
```

`cn()` = `clsx` + `tailwind-merge`，自动处理冲突（后者覆盖前者）：

```ts
cn('px-4', 'px-6')     // → 'px-6'（不会两个都保留）
```

### 7.2 CVA 变体管理

```ts
import { cva } from 'class-variance-authority';

const buttonVariants = cva(
  'inline-flex items-center justify-center rounded transition-colors',
  {
    variants: {
      variant: {
        default: 'bg-primary text-primary-foreground hover:bg-primary/90',
        outline: 'border border-input bg-background hover:bg-accent',
        ghost: 'hover:bg-accent hover:text-accent-foreground',
      },
      size: {
        sm: 'h-8 px-3 text-sm',
        md: 'h-9 px-4',
        lg: 'h-10 px-6',
      },
    },
    defaultVariants: { variant: 'default', size: 'md' },
  },
);

// 使用
buttonVariants({ variant: 'outline', size: 'lg' });
```

---

## 八、样式编写规范

### 8.1 优先级

```
① Tailwind 原子类（首选）
② CSS 变量（主题相关）
③ scoped CSS（复杂样式）
④ 全局 CSS（尽量避免）
```

### 8.2 示例

```vue
<script setup lang="ts">
import { cn } from '#/core/shared/utils';
</script>

<template>
  <!-- ✅ 优先原子类 -->
  <div class="flex items-center gap-2 rounded-lg border p-4">
    <span class="text-sm text-muted-foreground">标签</span>
  </div>

  <!-- ✅ 复杂逻辑用 cn() -->
  <div :class="cn('p-4', isActive && 'bg-primary/10')">内容</div>

  <!-- ⚠️ 复杂样式才用 scoped -->
  <div class="custom-chart"></div>
</template>

<style scoped>
.custom-chart {
  background: linear-gradient(
    to right,
    hsl(var(--primary)),
    hsl(var(--primary) / 0.3)
  );
}
</style>
```

### 8.3 禁止事项

| ❌ 避免 | 原因 |
| --- | --- |
| 硬编码颜色 `#1890ff` | 无法响应主题切换 |
| 全局样式污染 | 影响其他组件 |
| `!important` | 破坏优先级体系 |
| 深度选择器穿透 UI 库 `:deep()` 滥用 | 换 UI 库时全部失效 |
| 内联 `style` 写主题色 | 无法暗黑适配 |

---

## 九、响应式

Tailwind 断点：

| 前缀 | 最小宽度 |
| --- | --- |
| `sm:` | 640px |
| `md:` | 768px |
| `lg:` | 1024px |
| `xl:` | 1280px |
| `2xl:` | 1536px |

```vue
<div class="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
  <!-- 移动端 1 列，平板 2 列，桌面 4 列 -->
</div>
```

Schema 中的表单布局：

```ts
formDialog: {
  wrapperClass: 'grid-cols-1 md:grid-cols-2',   // 响应式栅格
}
```

---

## 十、水印

集成 `watermark-js-plus`：

```ts
updatePreferences({
  app: { watermark: true },
});
```

---

## 十一、多套 UI 注意点

主题系统分两部分：

| 部分 | 换 UI 时 |
| --- | --- |
| **Tailwind + CSS 变量**（自有体系） | ✅ 基本不改 |
| **UI 库主题**（Element Plus / Ant Design Vue / Naive UI） | ❌ 需重新对接 |

**对接工作**：将自有 CSS 变量映射到 UI 库的设计令牌，使两套体系视觉统一。

| UI 库 | 主题定制方式 |
| --- | --- |
| Element Plus | SCSS 变量覆盖 + CSS 变量 `--el-color-primary` |
| Ant Design Vue | `ConfigProvider` 的 `theme.token` |
| Naive UI | `NConfigProvider` 的 `theme-overrides` |

具体做法见各分册的「主题定制」章节：
[Element Plus](../admin-ele/theme.md) · [Ant Design Vue](../admin-antd/theme.md) · [Naive UI](../admin-naive/theme.md)

---

## 十二、下一步

- [环境变量与构建](./build.md)
- [Element Plus 主题定制](../admin-ele/theme.md)
