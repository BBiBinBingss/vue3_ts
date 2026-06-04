import type { App } from 'vue'
import { setupRouter } from '/@/router'
import { setupStore } from '/@/store'

type AppPluginSetup = (app: App<Element>) => void

/*
 * 框架级插件注册顺序。
 *
 * 约定：
 * 1. 状态管理先注册，路由守卫、页面和组件都可以安全读取 Pinia；
 * 2. 路由后注册，避免守卫执行时依赖的全局能力尚未完成初始化；
 * 3. 第三方 SDK、埋点、权限等长期基础能力以后追加到这里即可。
 */
const appPluginSetups: AppPluginSetup[] = [setupStore, setupRouter]

export function setupAppPlugins(app: App<Element>): void {
  appPluginSetups.forEach((setup) => setup(app))
}
