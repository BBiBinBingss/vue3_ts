/*
 * @Author       : tangbo 852425209@qq.com
 * @Date         : 2022-10-26 10:09:00
 * @LastEditors  : tangbo 852425209@qq.com
 * @LastEditTime : 2023-03-07 15:22:12
 * @FilePath     : \vue3_ts\src\store\index.ts
 * @Description  :
 */

import type { App } from 'vue'
import { createPinia } from 'pinia'

const store = createPinia()

/*
 * Pinia 注册入口。
 *
 * 保持全局 store 单例导出，既支持组件内 useXxxStore()，
 * 也支持路由守卫、请求拦截器等组件外场景通过 store 实例读取状态。
 */
export function setupStore(app: App<Element>): void {
  app.use(store)
}

export { store }
