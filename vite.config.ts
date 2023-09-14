/*
 * @Author       : tangbo 852425209@qq.com
 * @Date         : 2023-02-18 00:27:22
 * @LastEditors  : tangbo 852425209@qq.com
 * @LastEditTime : 2023-07-11 14:50:58
 * @FilePath     : \vue3_ts\vite.config.ts
 * @Description  :
 */
import { UserConfig, ConfigEnv } from 'vite'
import { createVitePlugins } from './config/vite/plugins'
import { resolve } from 'path'
import proxy from './config/vite/proxy'
import { VITE_DROP_CONSOLE, VITE_PORT } from './config/constant'

function pathResolve(dir: string) {
  return resolve(process.cwd(), '.', dir)
}

export default ({ command, mode }: ConfigEnv): UserConfig => {
  const isBuild = command === 'build'
  console.log(command, mode)
  return {
    resolve: {
      alias: [
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
    // 插件
    plugins: createVitePlugins(isBuild, mode),

    // CSS
    css: {
      preprocessorOptions: {
        less: {
          javascriptEnabled: true,
          additionalData: `@import "./src/assets/styles/base.less";`,
        },
      },
    },

    // 基础配置
    base: './',

    // 服务器配置
    server: {
      hmr: { overlay: false }, // 禁用或配置 HMR 连接 设置 server.hmr.overlay 为 false 可以禁用服务器错误遮罩层
      // 服务配置
      port: VITE_PORT, // 类型： number 指定服务器端口;
      open: false, // 类型： boolean | string在服务器启动时自动在浏览器中打开应用程序；
      cors: true, // 类型： boolean | CorsOptions 为开发服务器配置 CORS。默认启用并允许任何源
      host: '0.0.0.0', // IP配置，支持从IP启动
      proxy: proxy,
    },

    // 构建配置
    build: {
      target: 'es2020',
      terserOptions: {
        compress: {
          keep_infinity: true,
          drop_console: VITE_DROP_CONSOLE,
        },
      },
      rollupOptions: {
        external: [],
      },
      watch: {},

      brotliSize: false,
      chunkSizeWarningLimit: 2000,
    },
  }
}
