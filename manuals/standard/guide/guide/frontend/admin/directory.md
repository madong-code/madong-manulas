# 3.1.2 目录结构

## 一、项目根目录

```
template/admin/
├── src/                  源码
├── build/                构建脚本、Nginx/Docker 模板
├── tooling/              工程化配置包（eslint / ts / vite 等）
├── lib/                  本地依赖包
├── public/               直接拷贝到产物根的静态资源
├── .env                  公共环境变量
├── .env.development      开发环境
├── .env.production       生产环境
├── .env.integrated       一体化部署
├── .env.analyze          体积分析
├── vite.config.ts        Vite 配置（含开发代理）
├── uno.config.ts
├── package.json
└── pnpm-workspace.yaml   pnpm catalog 版本集中管理
```

## 二、`src/` 目录

```
src/
├── core/           【内核】内联的 Vben 框架层
├── api/            接口定义
├── adapter/        UI 适配层
├── components/     业务通用组件（含 crud、page）
├── views/          页面
├── router/         路由
├── store/          Pinia 状态
├── layouts/        布局
├── locales/        国际化入口
├── lang/           语言包 JSON
├── plugin/         前端插件
├── enums/          枚举常量
├── types/          全局类型声明
├── utils/          工具函数
├── assets/         图片、样式等资源
├── app.vue         根组件
├── main.ts         入口
├── bootstrap.ts    启动引导
└── preferences.ts  偏好设置默认值
```

## 三、各目录职责

### `src/core/` — 框架内核（勿改）

内联进来的 Vben Admin 内核，包含布局、通用组件、hooks、访问控制、偏好设置、共享工具等。

```ts
import { generateAccessible } from '#/core/access';
import { preferences } from '#/core/preferences';
import { mergeRouteModules, traverseTreeValues } from '#/core/shared';
```

> **规则**：把它当作 `node_modules` 看待。需要定制时优先在 `src/adapter/` 覆盖默认配置，而不是改 `core`。

### `src/api/` — 接口层

按后端模块镜像组织，与 `app/adminapi/controller` 的目录一一对应：

```
api/
├── core/           基础能力
│   └── base.ts     BaseService 工厂（CRUD 通用方法）
├── auth/           登录、鉴权
├── system/         系统管理
│   ├── user/       ├── index.ts  接口定义
│   ├── role/       └── types.ts  类型定义
│   ├── menu/
│   ├── dept/
│   ├── post/
│   ├── dict/
│   ├── config/
│   ├── files/
│   ├── recycle/
│   └── rule/
├── member/         会员
├── content/        内容
├── app/            应用
├── ops/            运维
├── devtools/       开发工具
├── web/            门户相关
├── request.ts      请求客户端
└── index.ts        统一导出
```

**约定**：每个模块一个目录，固定包含 `index.ts`（接口）与 `types.ts`（类型）。

### `src/adapter/` — UI 适配层

用于**集中覆盖**第三方组件的全局默认行为，是定制 UI 的推荐入口：

```
adapter/
├── form.ts             表单组件注册与默认配置
├── vxe-table.ts        表格全局配置
├── component/index.ts  组件映射
└── crud/index.ts       CRUD 能力导出
```

`adapter/crud/index.ts` 内容很简单，只是把内核 CRUD 能力重新导出：

```ts
export type {
  CrudApi,
  CrudApiInstance,
  CrudColumn,
  CrudSchema,
} from '#/components/crud/components/types';
export { default as Crud } from '#/components/crud/crud.vue';
export { useCrud } from '#/components/crud/use-crud';
```

### `src/router/` — 路由

```
router/
├── index.ts                路由实例
├── guard.ts                全局守卫
├── access.ts               权限路由生成（核心）
├── plugin/
│   ├── index.ts            插件路由合并
│   └── scanner.ts          插件扫描
└── routes/
    ├── index.ts            路由聚合
    ├── core.ts             核心路由（登录、404 等，不鉴权）
    ├── backend.ts          后端模式路由声明
    └── modules/            业务静态路由（自动 glob 扫描）
        ├── dashboard.ts
        ├── system.ts
        ├── member.ts
        ├── content.ts
        ├── app.ts
        ├── ops.ts
        ├── devtools.ts
        └── web.ts
```

详见 [3.1.4 路由与菜单](router.md)。

### `src/store/` — 状态管理

```
store/
├── index.ts
├── auth.ts                 认证（登录、登出、用户信息）
└── modules/
    ├── dict.ts             字典缓存
    ├── notify.ts           通知消息
    ├── site-config.ts      站点配置
    └── terminal.ts         Web 终端会话
```

详见 [3.1.6 状态管理](store.md)。

### `src/views/` — 页面

按业务域分目录，与路由路径保持一致：

```
views/
├── _core/          核心页面（登录、403、404 等）
├── dashboard/      仪表盘
├── system/         系统管理
│   └── post/
│       ├── index.vue           页面（极薄）
│       └── schemas/index.tsx   CRUD 配置（主要逻辑）
├── member/
├── content/
├── app/
├── ops/
├── devtools/
└── web/
```

**页面组织规范**

| 文件 | 职责 |
| --- | --- |
| `index.vue` | 页面入口，通常只有 `useCrud(useCrudSchema())` |
| `schemas/index.tsx` | 表格列、搜索表单、编辑表单、权限、接口绑定 |
| `components/*.vue` | 该页面专属的子组件（如角色页的 `auth-menu.vue`） |

复杂页面示例可参考 `views/system/role/`（含授权菜单、数据范围、用户分配等子组件）和 `views/system/config/`（多 Tab 配置页）。

### `src/plugin/` — 前端插件

每个子目录是一个插件，插件内的 `.vue` 会被路由扫描器一并发现：

```ts
// router/access.ts 中的组件扫描
const viewsMap = import.meta.glob('../views/**/*.vue', { eager: false });
const pluginsMap = import.meta.glob('../plugin/**/*.vue', { eager: false });
```

详见 [3.1.10 前端插件](plugin.md)。

### 其他目录

| 目录 | 说明 |
| --- | --- |
| `src/components/` | 跨页面复用的业务组件，其中 `crud/` 与 `page/` 最常用 |
| `src/layouts/` | `BasicLayout`、`IFrameView` 等布局 |
| `src/locales/` | i18n 初始化与 `$t` 导出 |
| `src/lang/` | 具体语言包（JSON） |
| `src/enums/` | 枚举常量，如 `DictEnum` |
| `src/types/` | 全局 `.d.ts` |
| `src/utils/` | 通用工具函数 |

## 四、路径别名

`#/` 指向 `src/`：

```ts
import { requestClient } from '#/api/request';        // src/api/request.ts
import { $t } from '#/locales';                        // src/locales/index.ts
import { useCrud } from '#/adapter/crud';              // src/adapter/crud/index.ts
import { Page } from '#/components/page';              // src/components/page
import { preferences } from '#/core/preferences';      // src/core/preferences
```

## 五、代码放置速查

| 我要写… | 放在哪 |
| --- | --- |
| 新接口 | `src/api/<域>/<模块>/index.ts` + `types.ts` |
| 新页面 | `src/views/<域>/<模块>/index.vue` + `schemas/index.tsx` |
| 页面私有组件 | `src/views/<域>/<模块>/components/` |
| 跨页面组件 | `src/components/` |
| 本地静态路由 | `src/router/routes/modules/<域>.ts` |
| 全局状态 | `src/store/modules/<名>.ts` |
| 枚举常量 | `src/enums/` |
| 工具函数 | `src/utils/` |
| 语言文案 | `src/lang/<语言>/...` |
| 组件全局默认值 | `src/adapter/` |
| 独立功能模块 | `src/plugin/<插件名>/` |

> 下一节：[3.1.3 请求层](request.md)
