/*
 * @Author       : tangbo 852425209@qq.com
 * @Date         : 2022-06-29 16:54:06
 * @LastEditors  : tangbo 852425209@qq.com
 * @LastEditTime : 2023-05-15 11:25:22
 * @FilePath     : \vue3_ts\config\vite\plugins\index.ts
 * @Description  :
 */
/**
 * @name createVitePlugins
 * @description 封装plugins数组统一调用
 */
import type { Plugin } from 'vite'
import vue from '@vitejs/plugin-vue'
import vueJsx from '@vitejs/plugin-vue-jsx'
import windiCSS from 'vite-plugin-windicss'
import VitePluginCertificate from 'vite-plugin-mkcert'
import vueSetupExtend from 'vite-plugin-vue-setup-extend'
import { ConfigSvgIconsPlugin } from './svgIcons'
import { AutoRegistryComponents } from './component'
import { AutoImportDeps } from './autoImport'
import { ConfigMockPlugin } from './mock'
import { ConfigVisualizerConfig } from './visualizer'
import { ConfigCompressPlugin } from './compress'
import { ConfigPagesPlugin } from './pages'
import { ConfigRestartPlugin } from './restart'
import { ConfigProgressPlugin } from './progress'
import { createTitlePlugin } from './plugintitle'
import { ConfigLayoutsPlugin } from './layouts'

export function createVitePlugins(isBuild: boolean, mode: string) {
  const vitePlugins: (Plugin | Plugin[])[] = [
    // vue支持
    vue({
      reactivityTransform: true,
    }),
    // JSX支持
    vueJsx(),
    // 提供https证书
    // VitePluginCertificate({
    //   source: 'coding',
    // }),
    // setup语法糖组件名支持
    vueSetupExtend(),
    // 自动按需引入组件
    AutoRegistryComponents(),
    // 自动按需引入依赖
    AutoImportDeps(),
    // 自动生成路由
    ConfigPagesPlugin(),
    // 自动生成嵌套路由
    ConfigLayoutsPlugin(),
    // 开启.gz压缩  rollup-plugin-gzip
    ConfigCompressPlugin(),
    // 监听配置文件改动重启
    ConfigRestartPlugin(),
    // 构建时显示进度条
    ConfigProgressPlugin(),
    // 页面title
    createTitlePlugin(mode),
  ]

  vitePlugins.push(windiCSS())

  // vite-plugin-svg-icons
  vitePlugins.push(ConfigSvgIconsPlugin(isBuild))

  // vite-plugin-mock
  vitePlugins.push(ConfigMockPlugin(isBuild))

  // rollup-plugin-visualizer
  vitePlugins.push(ConfigVisualizerConfig())

  return vitePlugins
}
