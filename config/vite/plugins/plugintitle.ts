/*
 * @Author       : tangbo 852425209@qq.com
 * @Date         : 2022-10-26 10:22:18
 * @LastEditors  : tangbo 852425209@qq.com
 * @LastEditTime : 2022-10-26 10:34:56
 * @FilePath     : \hubei-traffic\config\vite\plugins\plugintitle.ts
 * @Description  :
 */
/**
 * @name createTitlePlugin
 * @description 获取页面title
 */

import { loadEnv } from 'vite'
import { createHtmlPlugin } from 'vite-plugin-html'

//这个配置 为了在html中使用 环境变量
const getViteEnv = (mode, target) => {
  return loadEnv(mode, process.cwd())[target]
}

export const createTitlePlugin = (mode: string) => {
  return createHtmlPlugin({
    inject: {
      data: {
        title: getViteEnv(mode, 'VITE_APP_TITLE'),
      },
    },
  })
}
