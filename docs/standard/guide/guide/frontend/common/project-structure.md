# 工程结构约定

---

## 一、应用根目录

以 `template/admin/` 为例：

```
admin/
├── src/                    源码 ⭐
├── public/                 静态资源（原样拷贝，不经打包）
├── build/                  构建配置与部署脚本
├── lib/                    本地库（如 visual-form/designer.umd.js）
├── tooling/                工程化工具（含 mock 服务）
├── docs/                   应用级说明
│
├── index.html              HTML 入口
├── loading.html            首屏加载页
├── vite.config.ts          Vite 配置
├── vitest.config.ts        测试配置
├── tsconfig.json           TS 配置
├── tsconfig.node.json      Node 端 TS 配置
├── tsconfig.eslint.json    Lint 用 TS 配置
├── package.json            依赖与脚本
├── pnpm-workspace.yaml     工作区 + catalog 版本
├── eslint.config.mjs       ESLint
├── oxlint.config.ts        Oxlint
├── oxfmt.config.ts         格式化
├── stylelint.config.mjs    样式检查
├── lefthook.yml            Git Hooks
├── .node-version           Node 版本约定
├── .env                    通用环境变量
├── .env.development        开发环境
├── .env.production         生产环境
├── .env.integrated         集成环境
└── .env.analyze            分析模式
```

---

## 二、`src/` 分层

### 2.1 三层模型

```
┌───────────────────────────────────────────┐
│  业务层  api/ views/ store/ components/    │  ← 日常开发在这里
│          plugin/ enums/ types/ lang/       │
├───────────────────────────────────────────┤
│  适配层  adapter/                          │  ← 换 UI 改这里
├───────────────────────────────────────────┤
│  内核层  core/                             │  ← 框架能力，谨慎修改
└───────────────────────────────────────────┘
```

### 2.2 完整目录职责

| 目录 | 层 | 职责 | 修改频率 |
| --- | --- | --- | --- |
| `src/api/` | 业务 | 接口定义与类型 | 高 |
| `src/views/` | 业务 | 业务页面 | 高 |
| `src/store/` | 业务 | 业务状态 | 中 |
| `src/components/` | 业务 | 业务通用组件 | 中 |
| `src/plugin/` | 业务 | 前端插件 | 中 |
| `src/enums/` | 业务 | 枚举常量 | 中 |
| `src/types/` | 业务 | 类型定义 | 中 |
| `src/lang/` | 业务 | 语言包 | 中 |
| `src/locales/` | 业务 | 国际化装配 | 低 |
| `src/utils/` | 业务 | 工具函数 | 中 |
| `src/layouts/` | 业务 | 业务布局 | 低 |
| `src/router/` | 业务 | 路由 | 低 |
| `src/assets/` | 业务 | 静态资源 | 低 |
| `src/adapter/` | 适配 | UI 库适配 | 换 UI 时 |
| `src/core/` | 内核 | 框架能力 | 极低 |

---

## 三、`src/core/` 内核

> 🔒 内核代码是框架层，**除非必要不要修改**，升级时可能被覆盖。

```
core/
├── request/          请求内核（axios 封装、拦截器、SSE、上传下载）
├── access/           权限内核（指令、组件、判断逻辑）
├── stores/           内核状态（access / user / tabbar / timezone）
├── ui/               UI 基座
│   ├── layout/           整体布局（vben-layout.vue）
│   ├── menu/             菜单（menu.vue / sub-menu.vue）
│   ├── tabs/             标签页（tabs-view.vue）
│   ├── form/             表单引擎（form-api.ts / vben-form.vue）
│   ├── popup/            弹层（modal / drawer / alert）
│   ├── common/           通用能力（globalShareState 等）
│   └── primitives/       无样式基础组件
├── layouts/          布局骨架
├── preferences/      偏好设置（主题、布局、accessMode）
├── locales/          国际化内核（$t）
├── composables/      通用组合式函数
├── plugins/          内核插件
├── design/           设计变量与全局样式
└── shared/           共享类型与工具
```

**修改内核的正确姿势**：

| 需求 | ❌ 错误 | ✅ 正确 |
| --- | --- | --- |
| 加一个业务组件 | 改 `core/ui/` | 放 `components/form/components/` |
| 改请求错误提示 | 改 `core/request/` | 改 `api/request.ts` |
| 加业务状态 | 改 `core/stores/` | 放 `store/modules/` |
| 换 UI 组件 | 改 `core/ui/` | 改 `adapter/` |

---

## 四、`src/api/` 接口层

### 4.1 结构

```
api/
├── request.ts              ⭐ 请求实例配置（可改）
├── index.ts                统一导出
├── core/
│   └── base.ts             BaseService CRUD 工厂
├── auth/                   认证
├── system/                 系统管理
├── member/                 会员
├── content/                内容
├── ops/                    运维
├── web/                    门户
├── app/                    应用
└── devtools/               开发工具
```

### 4.2 模块内结构

```
api/<业务域>/<模块>/
├── index.ts       接口方法（导出 XxxService）
└── types.ts       类型定义（导出 interface）
```

示例：

```
api/member/tag/index.ts     → MemberTagService
api/member/tag/types.ts     → interface MemberTag
```

---

## 五、`src/views/` 视图层

### 5.1 结构

```
views/
├── _core/          内核页面（登录、404、403、500）
├── dashboard/      仪表盘
├── system/         系统管理
├── member/         会员管理
├── content/        内容管理
├── ops/            运维管理
├── web/            门户管理
├── app/            应用管理
└── devtools/       开发工具
```

> `_core/` 前缀下划线表示框架内置页面，与业务页面区分。

### 5.2 页面标准结构

```
views/<业务域>/<模块>/
├── index.vue                 页面入口（组装）
├── schemas/
│   └── index.tsx             CRUD 配置（表格列、搜索、表单、权限）
└── components/               页面专属组件（可选）
    └── xxx-dialog.vue
```

**为什么 Schema 用 `.tsx`？**
因为需要在列配置中写 JSX 渲染函数（如自定义单元格），`.tsx` 比 `.ts` 更方便。

### 5.3 页面代码规范

```vue
<script setup lang="ts">
// ① 类型导入（type 关键字）
import type { SomeType } from '#/api/xxx/types';

// ② 框架导入
import { ref, computed } from 'vue';

// ③ 项目内部导入（按 # 路径字母序）
import { useCrud } from '#/adapter/crud';
import { Page } from '#/components/page';
import { $t } from '#/locales';

// ④ 相对路径导入
import { useCrudSchema } from './schemas';

// ⑤ 逻辑
const [BasicCrud, crudApi] = useCrud({ ...useCrudSchema() });
</script>

<template>
  <Page auto-content-height>
    <BasicCrud />
  </Page>
</template>
```

---

## 六、`src/components/` 业务组件

```
components/
├── crud/               CRUD 组件（表格 + 搜索 + 弹窗一体）
├── form/               ⭐ 表单组件体系
│   ├── component-map.ts    自动扫描注册表
│   └── components/         各表单组件（自动注册）
├── dialog/             弹窗
├── page/               页面容器（Page 组件）
├── render/             动态渲染
├── icon/               图标
└── tenant-switch/      租户切换
```

### 6.1 表单组件自动注册

`components/form/components/` 下的组件会被自动扫描注册，命名映射：

```
kebab-case 目录名  →  PascalCase 组件名

api-dict/index.vue         → ApiDict
input-number/index.vue     → InputNumber
key-value-editor/index.vue → KeyValueEditor
```

新增组件三步走：

```
① 创建 components/form/components/my-widget/index.vue
② adapter/component/index.ts 的 ComponentType 加 'MyWidget'
③ （可选）ComponentPropsMap 声明属性类型
```

详见 [UI 适配层设计](./ui-adapter.md)。

---

## 七、`src/plugin/` 插件

```
plugin/
├── codegen/        代码生成器
│   ├── routes.ts       ⭐ 路由（自动扫描）
│   ├── views/          页面
│   ├── api/            接口
│   └── components/     组件
└── demo/           示例插件
```

插件是**自包含**的功能单元，删除整个目录即可移除该功能。

详见 [插件 → 前端插件开发](../../plugin/frontend-plugin.md)。

---

## 八、命名规范

### 8.1 文件与目录

| 类型 | 规则 | 示例 |
| --- | --- | --- |
| 目录 | kebab-case | `api-select-dept/` |
| Vue 组件 | kebab-case | `dept-select-dialog.vue` |
| 组件目录入口 | `index.vue` | `api-dict/index.vue` |
| TS 模块 | kebab-case | `component-map.ts` |
| 类型文件 | `types.ts` | 固定 |
| Schema | `schemas/index.tsx` | 固定 |
| 测试 | `*.test.ts` | `use-access.test.ts` |

### 8.2 代码标识

| 类型 | 规则 | 示例 |
| --- | --- | --- |
| 组件名（`defineOptions`） | PascalCase | `AccessControl` |
| 接口服务 | `<模块>Service` | `MemberTagService` |
| 类型/接口 | PascalCase | `MemberTag`、`CrudSchema` |
| 组合式函数 | `use` + PascalCase | `useCrud`、`useAccess` |
| 常量 | UPPER_SNAKE_CASE | `DICT_ENUM` |
| 变量/函数 | camelCase | `getEnabledList` |
| 枚举值 | PascalCase 或 UPPER | `DictEnum.SYS_ENABLED_STATUS` |

### 8.3 后端字段

**接口字段保持 snake_case，不做转换**：

```ts
interface MemberTag {
  id: string;
  tag_name: string;        // ✅ 与后端一致
  created_at: string;      // ✅
  // tagName: string;      // ❌ 不要转驼峰
}
```

---

## 九、导入规范

### 9.1 路径别名

| 别名 | 指向 |
| --- | --- |
| `#/` | `src/` |
| `#lib/` | `lib/` |

```ts
import { useCrud } from '#/adapter/crud';       // ✅
import { useCrud } from '@/adapter/crud';       // ❌ 项目不用 @
import { useCrud } from '../../adapter/crud';   // ❌ 避免多级相对路径
```

### 9.2 导入顺序

```ts
// 1. 类型导入
import type { RouteRecordRaw } from 'vue-router';
import type { MemberTag } from '#/api/member/tag/types';

// 2. 第三方库
import { computed, ref } from 'vue';
import { defineStore } from 'pinia';

// 3. 项目内部（# 开头，字母序）
import { useCrud } from '#/adapter/crud';
import { Page } from '#/components/page';
import { $t } from '#/locales';

// 4. 相对路径
import { useCrudSchema } from './schemas';
```

Oxlint 会自动检查与修复顺序，执行 `pnpm format` 即可。

---

## 十、代码放置决策表

| 我要写… | 放在 |
| --- | --- |
| 业务页面 | `views/<域>/<模块>/index.vue` |
| 页面的表格/表单配置 | `views/<域>/<模块>/schemas/index.tsx` |
| 页面专属子组件 | `views/<域>/<模块>/components/` |
| 接口方法 | `api/<域>/<模块>/index.ts` |
| 接口类型 | `api/<域>/<模块>/types.ts` |
| 跨页面复用的表单控件 | `components/form/components/<name>/index.vue` |
| 跨页面复用的业务组件 | `components/<name>/` |
| UI 库适配 | `adapter/` |
| 业务状态 | `store/modules/<name>.ts` |
| 工具函数 | `utils/tools/` |
| 常量枚举 | `enums/` |
| 全局类型 | `types/` |
| 语言文案 | `lang/zh-CN/<域>.json`、`lang/en-US/<域>.json` |
| 可独立卸载的功能 | `plugin/<name>/` |
| 框架级能力 | `core/`（⚠️ 谨慎） |

---

## 十一、受保护目录

以下目录**不可随意修改**：

```
frontend/packages/*      工作区共享包
frontend/scripts/*       构建脚本
frontend/internal/*      内部工具
依赖定义文件（pnpm-workspace.yaml 中的 catalog 等）
```

`apps/*`（即 `template/admin` 等业务应用）可自由修改。

---

## 十二、下一步

- [UI 适配层设计](./ui-adapter.md)
- [请求层与 API 约定](./request.md)
- [前端编码规范](../../dev-guide/frontend-style.md)
