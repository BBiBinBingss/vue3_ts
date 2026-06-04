# Vue3 TS 框架

## Cesium 组件化（参考 vue-cesium）

当前项目对 Cesium 采用“参考其架构、结合本项目实现”的方式，没有引入外部 `vue-cesium` 依赖。

组件分层如下：

- `src/components/Cesium/components/CesiumConfigProvider.ts`：统一下发地图配置（容器、默认底图、地形参数）。
- `src/components/Cesium/components/CesiumViewer.ts`：仅负责 Viewer 生命周期（创建/销毁）。
- `src/components/Cesium/components/CesiumBaseLayerProvider.ts`：负责底图显隐切换。
- `src/components/Cesium/components/CesiumTerrainProvider.ts`：负责地形加载与卸载。

页面调用保持简洁：

```vue
<Cesium :default-base-layer-ids="currentBaseLayerIds" :terrain-url="terrainUrl" />
```

这样做的目标是：

- 保持现有项目目录和状态管理（Pinia、settings）不被破坏；
- 降低 `index.vue` 对 Cesium 细节的直接耦合；
- 让后续图层/地形能力可按组件继续扩展。

### 多底图配置（天地图 / 高德 / 百度 / 腾讯）

底图配置统一在 `src/settings/baseLayerSetting.ts` 中维护，分两层：

- `BASE_LAYER_PROVIDER_CONFIGS`：底层 provider 定义（URL、子域、类型、是否启用）。
- `BASE_LAYER_OPTIONS`：页面上的“底图按钮”组合（可以把多个 provider 组合成一个选项）。

可配置能力：

- 支持 provider 级别 `enabled: false` 关闭（例如临时禁用百度）。
- 支持 option 级别 `enabled: false` 隐藏按钮。
- 支持任意组合 `layerIds`（例如“高德底图 + 天地图注记”）。

示例（在 `BASE_LAYER_OPTIONS` 中新增一个混合底图）：

```ts
{ key: 'gaodeWithLabel', label: '高德+天地图注记', layerIds: ['gaode-vec', 'cva'] }
```

页面无需改业务代码，`src/pages/index/index.vue` 会自动读取启用后的配置项。



## 基础框架

## 目录结构

以下是系统的目录结构

```text
├── config
│   ├── vite             // vite配置
│   ├── constant         // 系统常量
|   └── themeConfig      // 主题配置
├── docs                 // 文档相关
├── mock                 // mock数据
├── plop-tpls            // plop模板
├── src
│    ├── api             // api请求
│    ├── assets          // 静态文件
│    ├── components      // 业务通用组件
│    ├── page            // 业务页面
│    ├── router          // 路由文件
│    ├── store           // 状态管理
│    ├── utils           // 工具类
│    ├── App.vue         // vue模板入口
│    ├── main.ts         // vue模板js
├── .d.ts                // 类型定义
├── tailwind.config.js   // tailwind全局配置
├── tsconfig.json        // ts配置
└── vite.config.ts       // vite全局配置
```

## 💕 支持 JSX 语法

```json
{
    ...
    "@vitejs/plugin-vue-jsx": "^1.3.10"
    ...
}
```

## 🎸UI 组件按需加载，自动导入

```typescript
//模块化写法
import Components from 'unplugin-vue-components/vite'
import { ElementPlusResolver, VueUseComponentsResolver } from 'unplugin-vue-components/resolvers'
export const AutoRegistryComponents = () => {
  return Components({
    // dirs: ['src/components'],
    extensions: ['vue', 'md'],
    deep: true,
    dts: 'types/components.d.ts',
    directoryAsNamespace: false,
    globalNamespaces: [],
    directives: true,
    include: [/\.vue$/, /\.vue\?vue/, /\.md$/],
    exclude: [/[\\/]node_modules[\\/]/, /[\\/]\.git[\\/]/, /[\\/]\.nuxt[\\/]/],
    resolvers: [ElementPlusResolver(), VueUseComponentsResolver()],
  })
}
```

## 🧩Vite 插件模块化

为了方便管理插件，将所有的`config`统一放入`config/vite/plugins`里面，未来还会有更多插件直接分文件夹管理十分干净。值得一提的是，`Fast-Vue3`增加了统一环境变量管理，来区分动态开启某些插件。

```typescript
// vite/plugins/index.ts
/**
 * @name createVitePlugins
 * @description 封装plugins数组统一调用
 */
import type { Plugin } from 'vite'
import vue from '@vitejs/plugin-vue'
import vueJsx from '@vitejs/plugin-vue-jsx'
import { ConfigSvgIconsPlugin } from './svgIcons'
import { AutoRegistryComponents } from './component'
import { AutoImportDeps } from './autoImport'
import { ConfigMockPlugin } from './mock'
import { ConfigVisualizerConfig } from './visualizer'
import { ConfigCompressPlugin } from './compress'
import { ConfigPagesPlugin } from './pages'
import { ConfigMarkDownPlugin } from './markdown'
import { ConfigRestartPlugin } from './restart'

export function createVitePlugins(isBuild: boolean) {
  const vitePlugins: (Plugin | Plugin[])[] = [
    // vue支持
    vue(),
    // JSX支持
    vueJsx(),
    // 自动按需引入组件
    AutoRegistryComponents(),
    // 自动按需引入依赖
    AutoImportDeps(),
    // 自动生成路由
    ConfigPagesPlugin(),
    // 开启.gz压缩  rollup-plugin-gzip
    ConfigCompressPlugin(),
    //支持markdown
    ConfigMarkDownPlugin(),
    // 监听配置文件改动重启
    ConfigRestartPlugin(),
  ]
  // vite-plugin-svg-icons
  vitePlugins.push(ConfigSvgIconsPlugin(isBuild))
  // vite-plugin-mock
  vitePlugins.push(ConfigMockPlugin(isBuild))
  // rollup-plugin-visualizer
  vitePlugins.push(ConfigVisualizerConfig())
  return vitePlugins
}
```

而`vite.config.ts`便干净多了

```typescript
import { createVitePlugins } from './config/vite/plugins'
...
return {
    resolve: {
      alias: [
        {
          find: 'vue-i18n',
          replacement: 'vue-i18n/dist/vue-i18n.cjs.js',
        },
        // /@/xxxx => src/xxxx
        {
          find: /\/@\//,
          replacement: pathResolve('src') + '/',
        },
        // /#/xxxx => types/xxxx
        {
          find: /\/#\//,
          replacement: pathResolve('types') + '/',
        },
      ],
    },
    // plugins
    plugins: createVitePlugins(isBuild)
}
...
```

## 📱 支持`Pinia` ,下一代`Vuex5`

创建文件`src/store/index.ts`

```typescript
// 支持模块化，配合plop可以通过命令行一键生成
import { createPinia } from 'pinia'
import { useAppStore } from './modules/app'
import { useUserStore } from './modules/user'
const pinia = createPinia()
export { useAppStore, useUserStore }
export default pinia
```

创建文件`src/store/modules/user/index.ts`

```typescript
import { defineStore } from 'pinia'
import piniaStore from '@/store'
export const useUserStore = defineStore(
  // 唯一ID
  'user',
  {
    state: () => ({}),
    getters: {},
    actions: {},
  }
)
```

## 🤖 支持`Plop`自动生成文件

⚙️ 代码文件自动生成，提供三种预设模板`pages`,`components`,`store`，也可以根据自己需要设计更多自动生成脚本。一般后端同学惯用此形式，十分高效。

```shell
# 安装plop
pnpm add plop
```

根目录创建`plopfile.ts`

```typescript
import { NodePlopAPI } from 'plop'
export default function (plop: NodePlopAPI) {
  plop.setWelcomeMessage('请选择需要创建的模式：')
  plop.setGenerator('page', require('./plop-tpls/page/prompt'))
  plop.setGenerator('component', require('./plop-tpls/component/prompt'))
  plop.setGenerator('store', require('./plop-tpls/store/prompt'))
}
```

```shell
# 启动命令
pnpm run plop
```

![image.png](https://p1-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/a6756aebd4d6407e8545eed41b6e5864~tplv-k3u1fbpfcp-watermark.image?)

## 🖼️ 支持`SVG`图标

随着浏览器兼容性的提升，SVG 的性能逐渐凸显，很多大厂团队都在创建自己的 SVG 管理库，后面工具库会有推荐。

```shell
# 安装svg依赖
pnpm add vite-plugin-svg-icons
```

配置`vite.config.ts`

```typescript
import viteSvgIcons from 'vite-plugin-svg-icons';
export default defineConfig({
plugins:[
...
 viteSvgIcons({
    // 指定需要缓存的图标文件夹
    iconDirs: [path.resolve(process.cwd(), 'src/assets/icons')],
    // 指定symbolId格式
    symbolId: 'icon-[dir]-[name]',
  }),
]
...
})
```

已封装一个简单的`SvgIcon`组件，可以直接读取文件下的`svg`，可以根据文件夹目录自动查找文件。

```html
<template>
  <svg aria-hidden="true" class="svg-icon-spin" :class="calsses">
    <use :xlink:href="symbolId" :fill="color" />
  </svg>
</template>

<script lang="ts" setup>
  const props = defineProps({
    prefix: {
      type: String,
      default: 'icon',
    },
    name: {
      type: String,
      required: true,
    },
    color: {
      type: String,
      default: '#333',
    },
    size: {
      type: String,
      default: 'default',
    },
  })
  const symbolId = computed(() => `#${props.prefix}-${props.name}`)
  const calsses = computed(() => {
    return {
      [`sdms-size-${props.size}`]: props.size,
    }
  })
  const fontSize = reactive({ default: '32px', small: '20px', large: '48px' })
</script>
```

## 📦 支持`axios(ts版)`

已封装了主流的拦截器，请求调用等方法，区分了模块`index.ts`/`status.ts`/`type.ts`

```typescript
//封装src/api/user/index.ts
import request from '@utils/http/axios'
import { IResponse } from '@utils/http/axios/type'
import { ReqAuth, ReqParams, ResResult } from './type'
enum URL {
  login = '/v1/user/login',
  permission = '/v1/user/permission',
  userProfile = 'mock/api/userProfile',
}
const getUserProfile = async () => request<ReqAuth>({ url: URL.userProfile })
const login = async (data: ReqParams) => request({ url: URL.login, data })
const permission = async () => request<ReqAuth>({ url: URL.permission })
export default { getUserProfile, login, permission }
```

```typescript
//调用
import userApi from '@api/user'
// setup模式下组件可以直接引用
const res = await userApi.profile()
```

## 👽 自动生成`router`，过滤`components`组件

支持`vue-router4.0`的模块化，通过检索 pages 文件夹可自动生成路由，并支持动态路由

```typescript
import { createRouter, createWebHashHistory, RouteRecordRaw } from 'vue-router'
import routes from 'virtual:generated-pages'

console.log(routes, '打印生成自动生成的路由')
//导入生成的路由数据
const router = createRouter({
  history: createWebHashHistory(),
  routes,
})

export default router
```

## 🧬 支持 Mock 数据

使用`vite-plugin-mock`插件，支持自动区分和启停的环境配置

```javascript
// vite config
viteMockServe({
  ignore: /^\_/,
  mockPath: 'mock',
  localEnabled: !isBuild,
  prodEnabled: false,
  // https://github.com/anncwb/vite-plugin-mock/issues/9
  injectCode: `
       import { setupProdMockServer } from '../mock/_createProdMockServer';
       setupProdMockServer();
       `,
})
```

根目录下创建 `_createProductionServer.ts`文件,非`_`开头文件会被自动加载成 mock 文件

```typescript
import { createProdMockServer } from 'vite-plugin-mock/es/createProdMockServer'
// 批量加载
const modules = import.meta.globEager('./mock/*.ts')

const mockModules: Array<string> = []
Object.keys(modules).forEach((key) => {
  if (key.includes('/_')) {
    return
  }
  mockModules.push(...modules[key].default)
})
export function setupProdMockServer() {
  createProdMockServer(mockModules)
}
```

## 🎎Proxy 代理

```typescript
// vite config
import proxy from '@config/vite/proxy';
export default defineConfig({
    ...
    server: {
        hmr: { overlay: false }, // 禁用或配置 HMR 连接 设置 server.hmr.overlay 为 false 可以禁用服务器错误遮罩层
        // 服务配置
        port: VITE_PORT, // 类型： number 指定服务器端口;
        open: false, // 类型： boolean | string在服务器启动时自动在浏览器中打开应用程序；
        cors: false, // 类型： boolean | CorsOptions 为开发服务器配置 CORS。默认启用并允许任何源
        host: '0.0.0.0', // IP配置，支持从IP启动
        proxy,
    }
    ...
})
```

```typescript
// proxy.ts
import {
  API_BASE_URL,
  API_TARGET_URL,
  MOCK_API_BASE_URL,
  MOCK_API_TARGET_URL,
} from '@config/constant'
import { ProxyOptions } from 'vite'
type ProxyTargetList = Record<string, ProxyOptions>

const init: ProxyTargetList = {
  // test
  [API_BASE_URL]: {
    target: API_TARGET_URL,
    changeOrigin: true,
    rewrite: (path) => path.replace(new RegExp(`^${API_BASE_URL}`), ''),
  },
  // mock
  [MOCK_API_BASE_URL]: {
    target: MOCK_API_TARGET_URL,
    changeOrigin: true,
    rewrite: (path) => path.replace(new RegExp(`^${MOCK_API_BASE_URL}`), '/api'),
  },
}

export default init
```

## 🎉 其他

- 🏗 支持`vw/vh`移动端布局兼容，也可以使用`plop`自己配置生成文件
- 还有更多新功能增在`commiting`,如果你有更好的方案欢迎`PR`

## 工具库

学会使用适当的工具库，让`coding`事半功倍。尤其是开源的工具库，值得每个人学习，因为这本身就是你应该达到的层次。这里推荐一些大厂常用的类库，因为我喜新...，以下工具均可直接引入。

## JS 库

- [pnpm](https://pnpm.io/)，一个依赖包全局管理的工具，老板再也不用担心我的 C 盘不够用。Vite 官方推荐，字节官方前端团队大规模项目考验

![image-20220110125758056](https://cdn.jsdelivr.net/gh/MaleWeb/picture/images/techblog/image-20220110125758056.png)

- [mitt 全局事件监听库](https://github.com/developit/mitt)，Vue3 官方推荐
- [Hammer](http://hammerjs.github.io/)，可以识别由触摸、鼠标和指针事件做出的手势,只有 7.34kb
- [outils](https://github.com/proYang/outils)，开发中常用的函数集，也可以使用`lodash`

- [tailwindcss](https://tailwindcss.com/)，艾玛香的一塌糊涂，一行 css 不写，3 分钟出一个页面。不适合初中级前端，建议还是先踏实学基础再用框架。

  ![tailwindcss-1](https://cdn.jsdelivr.net/gh/MaleWeb/picture/images/techblog/tailwindcss-1.gif)

  ![tailwindcss-2](https://cdn.jsdelivr.net/gh/MaleWeb/picture/images/techblog/tailwindcss-2.gif)

- [Vue I18n](https://vue-i18n.intlify.dev/) 是 Vue.js 的国际化插件，如果你想做开源框架，国际化首选插件。

- [ViteSSG](https://github.com/antfu/vite-ssg)，SEO 优化，这个项目有点意思，大家可以玩玩这个方案，之前我都是通过服务端渲染搞 SEO，后来了解到这个可以直接在 Vue3 的服务器上生成。

- [Vitest](https://github.com/vitest-dev/vitest),基于 Vite 的单元测试工具，目前迭代比较快，尤大金牌赞助。可以持续关注，不建议使用在小项目中。

  ![image-20220110125605172](https://cdn.jsdelivr.net/gh/MaleWeb/picture/images/techblog/image-20220110125605172.png)

## UI 库

- [arco-design](https://github.com/arco-design/arco-design)，字节团队新出的 UI 框架,配置层面更为灵活,`fast-vue3`使用的就是这个,不喜欢的小伙伴可以移除
- [semi-design](https://github.com/DouyinFE/semi-design)，抖音前端出的框架，面向经常撕逼 UI 和 FE，可以尝鲜玩玩
- [nutui](https://github.com/jdf2e/nutui)，京东前端团队出的 UI 框架，已升级到 3.X，个人认为颜值最高并接受反驳
- [naive-ui](https://github.com/TuSimple/naive-ui)，尤大推荐，TypeScript 语法，主题可调，这家公司挺厉害

---

## GIS 模块说明（Turf + Cesium）

为保证“全局唯一文档”，GIS 详细说明统一维护在：

- `GIS_RANDOM_MODULE.md`

包含内容：

- 模块结构与职责
- 统一 API 与业务规范
- 基于当前定位随机生成策略
- Cesium 交互能力（click/hover/highlight/flyTo/fitBounds）
- 分批加载节流与队列化渲染策略
- 容错、性能建议与扩展方案
