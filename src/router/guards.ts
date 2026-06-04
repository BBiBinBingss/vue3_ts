import type { Router } from 'vue-router'
import NProgress from 'nprogress'
import '/@/assets/styles/nprogress.less'

/*
 * 路由守卫统一入口。
 *
 * 基础框架只保留通用体验能力：页面切换进度条。
 * 登录鉴权、菜单权限、埋点上报等业务规则不要直接写在 router/index.ts，
 * 后续可以继续按 authGuard、permissionGuard、analyticsGuard 拆分。
 */
export function setupRouterGuards(router: Router): void {
  router.beforeEach(() => {
    NProgress.start()
  })

  router.afterEach(() => {
    NProgress.done()
  })

  router.onError(() => {
    NProgress.done()
  })
}
