/*
 * @Author       : tangbo 852425209@qq.com
 * @Date         : 2023-02-18 00:27:22
 * @LastEditors: tangbo
 * @LastEditTime: 2024-08-23 17:02:38
 * @FilePath: \vue3_ts\vite.config.ts
 * @Description  :
 */
import { UserConfig, ConfigEnv } from 'vite'
import { createVitePlugins } from './config/vite/plugins'
import { createConnection, createServer } from 'net'
import { resolve } from 'path'
import proxy from './config/vite/proxy'
import { VITE_DROP_CONSOLE, VITE_PORT } from './config/constant'

const DEV_SERVER_HOST = '0.0.0.0'
const PORT_CHECK_HOSTS = ['127.0.0.1', '::1']

function pathResolve(dir: string) {
  return resolve(process.cwd(), '.', dir)
}

function checkPortUsed(port: number, host: string): Promise<boolean> {
  return new Promise((resolvePort) => {
    const socket = createConnection({ port, host })

    const finish = (used: boolean) => {
      socket.removeAllListeners()
      socket.destroy()
      resolvePort(used)
    }

    socket.setTimeout(300)
    socket.once('connect', () => finish(true))
    socket.once('timeout', () => finish(false))
    socket.once('error', () => finish(false))
  })
}

function checkPortListen(port: number, host: string): Promise<boolean> {
  return new Promise((resolvePort) => {
    const server = createServer()

    server.once('error', () => resolvePort(false))
    server.once('listening', () => {
      server.close(() => resolvePort(true))
    })

    server.listen({
      port,
      host,
      ipv6Only: host === '::',
    })
  })
}

async function isPortAvailable(port: number) {
  const usedResults = await Promise.all(PORT_CHECK_HOSTS.map((host) => checkPortUsed(port, host)))

  if (usedResults.some(Boolean)) {
    return false
  }

  const listenResults = await Promise.all([checkPortListen(port, DEV_SERVER_HOST), checkPortListen(port, '::')])

  return listenResults.every(Boolean)
}

async function findAvailablePort(port: number) {
  let currentPort = port

  // 启动前同时检查本机访问地址与通配监听地址；如果端口重复，则持续累加直到找到可用端口。
  while (!(await isPortAvailable(currentPort))) {
    currentPort += 1
  }

  return currentPort
}

export default async ({ command, mode }: ConfigEnv): Promise<UserConfig> => {
  const isBuild = command === 'build'
  const serverPort = isBuild ? VITE_PORT : await findAvailablePort(VITE_PORT)

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
      port: serverPort, // 类型： number 指定服务器端口，启动时会自动累加到可用端口;
      strictPort: false, // 端口在探测后又被占用时，允许 Vite 继续查找下一个可用端口
      open: false, // 类型： boolean | string在服务器启动时自动在浏览器中打开应用程序；
      cors: true, // 类型： boolean | CorsOptions 为开发服务器配置 CORS。默认启用并允许任何源
      host: DEV_SERVER_HOST, // IP配置，支持从IP启动
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
      minify: 'terser',
      reportCompressedSize: false,
      chunkSizeWarningLimit: 2000,
    },
  }
}
