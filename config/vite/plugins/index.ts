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
import type { PluginOption } from 'vite'
import vue from '@vitejs/plugin-vue'
import windiCSS from 'vite-plugin-windicss'
import { ConfigSvgIconsPlugin } from './svgIcons'
import { AutoRegistryComponents } from './component'
import { AutoImportDeps } from './autoImport'
import { ConfigMockPlugin } from './mock'
import { ConfigVisualizerConfig } from './visualizer'
import { ConfigCompressPlugin } from './compress'
import { ConfigPagesPlugin } from './pages'
import { ConfigProgressPlugin } from './progress'
import { createTitlePlugin } from './plugintitle'
import { ConfigLayoutsPlugin } from './layouts'
import { ConfigRestartPlugin } from './restart'

export async function createVitePlugins(isBuild: boolean, mode: string) {
  const { default: vueJsx } = await import('@vitejs/plugin-vue-jsx')

  const vitePlugins: PluginOption[] = [
    // vue支持
    vue(),
    // JSX/TSX支持
    vueJsx(),
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
    // 构建时显示进度条
    ConfigProgressPlugin(),
    // 监听配置文件改动重启
    ConfigRestartPlugin(),
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
