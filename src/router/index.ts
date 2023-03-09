/*
 * @Author: tangbo 852425209@qq.com
 * @Date: 2022-06-15 15:30:27
 * @LastEditors: tangbo 852425209@qq.com
 * @LastEditTime: 2022-06-15 15:50:24
 * @FilePath: \saas-platform\src\router\index.ts
 * @Description: 路由
 */
import { createRouter, createWebHashHistory } from 'vue-router'
import routes from 'virtual:generated-pages'
import NProgress from 'nprogress'
import 'nprogress/nprogress.css'

routes.push({
  path: '/',
  redirect: '/',
})

//导入生成的路由数据
const router = createRouter({
  history: createWebHashHistory(),
  routes,
})

router.beforeEach(async (_to, _from, next) => {
  NProgress.start()
  next()
})

router.afterEach((_to) => {
  NProgress.done()
})

export default router
