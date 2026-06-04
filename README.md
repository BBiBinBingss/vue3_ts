# Vue3 + TypeScript + OpenLayers 基础框架

基于 `Vue 3.5`、`Vite 6`、`TypeScript 5`、`Pinia`、`Naive UI` 的通用前端项目模板，适合业务应用、官网/活动页和中后台以外场景，内置自动路由、自动导入、布局系统、Mock、打包压缩和包体积分析能力。

## 技术栈

- `vue@3.5`
- `vite@6`
- `typescript@5.9`
- `vue-router@4.6`
- `pinia@2.3`
- `naive-ui@2.44`
- `ol@7`
- `unplugin-auto-import`
- `unplugin-vue-components`
- `vite-plugin-pages`
- `vite-plugin-vue-layouts`
- `vite-plugin-mock`
- `vite-plugin-compression`
- `rollup-plugin-visualizer`

## 环境要求

- `Node.js >= 20.18`
- `pnpm >= 10`

## 快速开始

```zsh
pnpm run bootstrap
pnpm dev
```

## 常用命令

```zsh
pnpm run bootstrap
pnpm run plop
pnpm dev
pnpm run dev:host -- 127.0.0.1
pnpm build
pnpm build:dev
pnpm build:pro
pnpm build:analyze
pnpm preview
pnpm exec vue-tsc --noEmit
pnpm lint:eslint
pnpm lint:prettier
pnpm lint:stylelint
pnpm plop
```

## 构建说明

- `pnpm build`：标准生产构建，构建完成后正常退出。
- `pnpm build:analyze`：生成包体积分析文件 `node_modules/.cache/visualizer/stats.html`，默认不会自动打开浏览器。
- `pnpm preview`：本地预览 `dist` 构建结果。

## 构建优化

本项目已做以下构建侧优化：

- 默认关闭包分析自动打开，避免 `build` 阶段额外打断。
- 保留 `gzip` 压缩能力，减少静态资源体积。
- 保留 `jsx/tsx` 支持，兼容混合写法场景。
- 使用 `postcss-px-to-viewport-8-plugin`，兼容 `PostCSS 8`，消除旧插件废弃警告。
- 关闭 `reportCompressedSize`，减少常规构建统计开销。

## 可调构建开关

以下开关定义在 `mock/constant.ts`，并支持通过环境变量覆盖：

- `ANALYSIS`：是否生成包分析报告，默认 `false`
- `COMPRESSION`：是否生成 `.gz` 压缩文件，默认 `true`
- `VITE_DROP_CONSOLE`：生产构建是否移除 `console`，默认 `true`

例如：

```zsh
ANALYSIS=true pnpm build
COMPRESSION=false pnpm build
VITE_DROP_CONSOLE=false pnpm build
```

推荐直接使用已封装脚本：

```zsh
pnpm build:analyze
```

## 目录结构

```text
.
├── config/
│   └── vite/
│       └── plugins/        # Vite 插件拆分配置
├── mock/                   # Mock 数据与构建开关
├── plop-tpls/              # plop 模板
├── public/
├── src/
│   ├── api/                # 接口层
│   ├── app/                # 应用启动、全局插件、Provider 配置
│   ├── assets/             # 静态资源与样式
│   ├── components/         # 公共组件
│   ├── layouts/            # 布局组件
│   ├── pages/              # 页面目录（自动生成路由）
│   ├── router/             # 路由入口
│   ├── settings/           # 业务配置
│   ├── store/              # Pinia 状态
│   ├── utils/              # 工具方法
│   ├── App.vue
│   └── main.ts
├── types/                  # 自动生成和项目类型声明
├── postcss.config.js
├── scripts/                # 依赖安装与清理脚本
├── tsconfig.json
├── vite.config.ts
└── package.json
```

## OpenLayers 说明

- `OpenLayers` 基础组件位于 `src/components/OpenLayers/`。
- 首页 `src/pages/index/index.vue` 默认接入 `OpenLayers` 地图容器。
- 若配置了 `VITE_APP_TDT_URL` 和 `VITE_APP_TOKEN`，会优先使用天地图底图；未配置时回退到 `OpenStreetMap`。
- 当前分支在目录骨架上与 `master` 保持一致，仅额外保留 `OpenLayers` 组件目录与相关接入代码。

## 核心能力

### 应用启动层

- `src/main.ts` 只调用 `bootstrap`，避免入口文件继续膨胀。
- `src/app/index.ts` 负责 `createApp`、插件注册和挂载。
- `src/app/styles.ts` 负责全局样式与 SVG 注册。
- `src/app/plugins.ts` 负责框架级插件注册顺序，当前顺序为 `Pinia -> Router`。
- `src/app/naive.ts` 负责 Naive UI 根级主题、语言和日期语言包配置。

### 自动路由

- 页面文件位于 `src/pages`
- 路由由 `vite-plugin-pages` 自动生成
- 当前使用 `nuxt` 风格路由命名策略

### 布局系统

- 布局文件位于 `src/layouts`
- 使用 `vite-plugin-vue-layouts` 自动注入布局
- 默认布局为 `default`

### 自动导入

- `vue`
- `pinia`
- `vue-router`
- `@vueuse/core`
- `Naive UI` 组件与 API

相关声明文件会生成到：

- `types/auto-imports.d.ts`
- `types/components.d.ts`

### Mock 能力

- 开发环境默认启用 `vite-plugin-mock`
- Mock 文件位于 `mock/`
- 以下划线 `_` 开头的文件会被忽略

## 开发建议

- 新增页面时优先放到 `src/pages/`
- 新增布局时放到 `src/layouts/`
- 新增通用组件可放到 `src/components/`
- 使用 `pnpm plop` 快速生成页面、组件、store 模板

## 升级记录

本次已完成：

- 升级到 `Vue 3.5`
- 升级到 `Vite 6`
- 升级 `TypeScript`、`vue-tsc`、`Naive UI`、`VueUse`、自动导入和路由相关插件
- 修复 `vite build` 构建完成不退出的问题
- 保留并兼容 `@vitejs/plugin-vue-jsx`
- 更新 `PostCSS` viewport 插件，消除废弃警告
- 调整分析插件为按需启用，避免每次构建自动弹出分析页

## 已知说明

- 如果出现 `Browserslist: browsers data is old`，可执行以下命令刷新数据库：

```zsh
pnpm dlx update-browserslist-db@latest
```

- `rollup-plugin-visualizer` 报告文件默认输出到：

```text
node_modules/.cache/visualizer/stats.html
```

如需继续扩展图层控制、绘制工具或行政区加载能力，可以在当前 `OpenLayers` 基础组件上继续补充。
