# Admin 主题配置

## 概述

Admin 使用 Vben Admin 5 的主题系统，支持动态切换主题、布局、颜色等。

## 主题配置

### preferences.ts

主题配置位于 `apps/admin/src/preferences.ts`：

```typescript
// apps/admin/src/preferences.ts
import { defineOverridesPreferences } from '@vben/preferences';

export const overridesPreferences = defineOverridesPreferences({
  app: {
    name: import.meta.env.VITE_APP_TITLE,
    accessMode: 'backend',
    enableRefreshToken: true,
  },
  theme: {
    // Theme mode: light, dark, auto
    mode: 'light',
    // Color primary
    colorPrimary: '#1677ff',
    // Border radius
    borderRadius: 6,
    // Layout
    layout: 'sidebar-nav',
    // Sidebar
    sidebar: {
      width: 210,
      collapsedWidth: 48,
      collapsed: false,
    },
    // Header
    header: {
      height: 48,
      hidden: false,
    },
    // Content
    content: {
      padding: 16,
      bg: '#f5f5f5',
    },
  },
});
```

## 主题模式

### 浅色模式

```typescript
{
  theme: {
    mode: 'light',
  },
}
```

### 深色模式

```typescript
{
  theme: {
    mode: 'dark',
  },
}
```

### 自动模式

根据系统主题自动切换：

```typescript
{
  theme: {
    mode: 'auto',
  },
}
```

## 主题颜色

### 主色

```typescript
{
  theme: {
    colorPrimary: '#1677ff', // Blue
  },
}
```

**预设颜色**：
- `#1677ff` - Blue（默认）
- `#722ed1` - Purple
- `#eb2f96` - Pink
- `#f5222d` - Red
- `#fa8c16` - Orange
- `#faad14` - Yellow
- `#52c41a` - Green
- `#13c2c2` - Cyan

### 成功色

```typescript
{
  theme: {
    colorSuccess: '#52c41a',
  },
}
```

### 警告色

```typescript
{
  theme: {
    colorWarning: '#faad14',
  },
}
```

### 错误色

```typescript
{
  theme: {
    colorError: '#f5222d',
  },
}
```

## 布局配置

### 侧边栏导航

```typescript
{
  theme: {
    layout: 'sidebar-nav',
    sidebar: {
      width: 210,
      collapsedWidth: 48,
      collapsed: false,
    },
  },
}
```

### 顶部导航

```typescript
{
  theme: {
    layout: 'top-nav',
  },
}
```

### 混合导航

```typescript
{
  theme: {
    layout: 'mixed-nav',
  },
}
```

## 侧边栏配置

### 宽度

```typescript
{
  theme: {
    sidebar: {
      width: 210, // Expanded width
      collapsedWidth: 48, // Collapsed width
    },
  },
}
```

### 折叠

```typescript
{
  theme: {
    sidebar: {
      collapsed: false, // false: expanded, true: collapsed
    },
  },
}
```

### 主题

```typescript
{
  theme: {
    sidebar: {
      theme: 'light', // light, dark
    },
  },
}
```

## 顶栏配置

### 高度

```typescript
{
  theme: {
    header: {
      height: 48,
    },
  },
}
```

### 隐藏

```typescript
{
  theme: {
    header: {
      hidden: false,
    },
  },
}
```

### 主题

```typescript
{
  theme: {
    header: {
      theme: 'light', // light, dark
    },
  },
}
```

## 内容区配置

### 内边距

```typescript
{
  theme: {
    content: {
      padding: 16,
    },
  },
}
```

### 背景色

```typescript
{
  theme: {
    content: {
      bg: '#f5f5f5',
    },
  },
}
```

## 圆角配置

```typescript
{
  theme: {
    borderRadius: 6, // 0, 4, 6, 8, 10, 12, 16
  },
}
```

## 动画配置

### 页面切换动画

```typescript
{
  theme: {
    animation: {
      // Page transition animation: fade, slide, zoom, none
      pageTransition: 'fade',
    },
  },
}
```

### 侧边栏切换动画

```typescript
{
  theme: {
    animation: {
      // Sidebar toggle animation: zoom, fade, none
      sidebarToggle: 'zoom',
    },
  },
}
```

## 动态切换主题

### 切换主题模式

```typescript
import { updatePreferences } from '@vben/preferences';

// Switch to dark mode
updatePreferences({
  theme: {
    mode: 'dark',
  },
});

// Switch to light mode
updatePreferences({
  theme: {
    mode: 'light',
  },
});

// Switch to auto mode
updatePreferences({
  theme: {
    mode: 'auto',
  },
});
```

### 切换主色

```typescript
import { updatePreferences } from '@vben/preferences';

// Switch to purple
updatePreferences({
  theme: {
    colorPrimary: '#722ed1',
  },
});
```

### 切换布局

```typescript
import { updatePreferences } from '@vben/preferences';

// Switch to top navigation
updatePreferences({
  theme: {
    layout: 'top-nav',
  },
});
```

### 折叠侧边栏

```typescript
import { updatePreferences } from '@vben/preferences';

// Collapse sidebar
updatePreferences({
  theme: {
    sidebar: {
      collapsed: true,
    },
  },
});

// Expand sidebar
updatePreferences({
  theme: {
    sidebar: {
      collapsed: false,
    },
  },
});
```

## 主题持久化

主题配置存储在本地存储中，key 为 `{namespace}-preferences`：

```typescript
// Get preferences from localStorage
const preferences = localStorage.getItem('madong_admin-5.7.0-preferences');
```

## 检查清单

- [ ] 主题模式是否正确配置（light/dark/auto）
- [ ] 主色是否正确配置
- [ ] 布局是否正确配置（sidebar-nav/top-nav/mixed-nav）
- [ ] 侧边栏宽度是否正确配置
- [ ] 圆角是否正确配置
- [ ] 动画是否正确配置

## 下一步

- [路由和菜单](./route-menu.md) - 配置路由和菜单
- [基础组件](../components/overview.md) - 了解基础组件
- [Mono 共享配置](../config.md) - 了解共享配置
