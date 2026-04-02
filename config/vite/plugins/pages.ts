/*
 * @Author       : tangbo 852425209@qq.com
 * @Date         : 2023-02-18 00:27:23
 * @LastEditors  : tangbo 852425209@qq.com
 * @LastEditTime : 2023-03-07 14:34:44
 * @FilePath     : \vue3_ts\config\vite\plugins\pages.ts
 * @Description  :
 */
/**
 * @name ConfigPagesPlugin
 * @description 动态生成路由
 */
import Pages from 'vite-plugin-pages'
export const ConfigPagesPlugin = () => {
  return Pages({
    dirs: [{ dir: 'src/pages', baseRoute: '' }],
    extensions: ['vue', 'md'],
    exclude: ['**/components/**'],
    routeStyle: 'nuxt',
  })
}
