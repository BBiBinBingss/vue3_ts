/*
 * @Author       : tangbo 852425209@qq.com
 * @Date         : 2023-02-18 00:27:22
 * @LastEditors  : tangbo 852425209@qq.com
 * @LastEditTime : 2023-07-11 14:50:58
 * @FilePath     : \vue3_ts\vite.config.mts
 * @Description  :
 */
import type { UserConfig, ConfigEnv } from 'vite'
import { createVitePlugins } from './config/vite/plugins'
import { resolve } from 'path'
import proxy from './config/vite/proxy'
import { VITE_DROP_CONSOLE, VITE_PORT } from './mock/constant'

function pathResolve(dir: string) {
  return resolve(process.cwd(), '.', dir)
}

export default async ({ command, mode }: ConfigEnv): Promise<UserConfig> => {
  const isBuild = command === 'build'

  return {
    resolve: {
      alias: [
        {
          find: /\/@\//,
          replacement: pathResolve('src') + '/',
        },
        {
          find: /\/#\//,
          replacement: pathResolve('types') + '/',
        },
      ],
    },
    plugins: await createVitePlugins(isBuild, mode),
    css: {
      preprocessorOptions: {
        less: {
          javascriptEnabled: true,
          additionalData: `@import "./src/assets/styles/base.less";`,
        },
      },
    },
    base: './',
    server: {
      hmr: { overlay: false },
      port: VITE_PORT,
      open: false,
      cors: true,
      host: '0.0.0.0',
      proxy: proxy,
    },
    build: {
      target: 'es2018',
      terserOptions: {
        compress: {
          keep_infinity: true,
          drop_console: VITE_DROP_CONSOLE,
        },
      },
      rollupOptions: {
        external: [],
      },
      reportCompressedSize: false,
      chunkSizeWarningLimit: 2000,
    },
  }
}