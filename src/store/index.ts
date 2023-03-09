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

export function setupStore(app: App<Element>) {
  app.use(store)
}

export { store }
