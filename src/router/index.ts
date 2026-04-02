/*
 * @Author       : tangbo 852425209@qq.com
 * @Date         : 2023-05-15 10:58:15
 * @LastEditors  : tangbo 852425209@qq.com
 * @LastEditTime : 2023-08-24 10:54:06
 * @FilePath     : \vue3_ts\src\router\index.ts
 * @Description  :
 */
import { createRouter, createWebHashHistory, RouteRecordRaw } from 'vue-router'
import { setupLayouts } from 'virtual:generated-layouts'
import generatedRoutes from 'virtual:generated-pages'
import NProgress from 'nprogress'
import '/@/assets/styles/nprogress.less'

type ExtendedRouteRecordRaw = RouteRecordRaw & {
  meta?: {
    layout?: boolean
  }
}
const routes: Array<ExtendedRouteRecordRaw> = generatedRoutes.map((v: ExtendedRouteRecordRaw) =>
  v.meta?.layout !== false ? setupLayouts([v])[0] : v,
)

const router = createRouter({
  history: createWebHashHistory(),
  routes,
})

router.beforeEach(async (_to, _from, next) => {
  NProgress.start()
  next()
})

router.afterEach(() => {
  NProgress.done()
})

export default router
