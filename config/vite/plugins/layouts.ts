/*
 * @Author       : tangbo 852425209@qq.com
 * @Date         : 2023-03-07 14:42:31
 * @LastEditors  : tangbo 852425209@qq.com
 * @LastEditTime : 2023-03-07 14:43:33
 * @FilePath     : \vue3_ts\config\vite\plugins\layouts.ts
 * @Description  :
 */

/**
 * @name ConfigLayoutsPlugin
 * @description 动态生成路由
 */

import Layouts from 'vite-plugin-vue-layouts'

export const ConfigLayoutsPlugin = () => {
  return Layouts({
    layoutsDirs: 'src/layouts',
    defaultLayout: 'default',
  })
}
