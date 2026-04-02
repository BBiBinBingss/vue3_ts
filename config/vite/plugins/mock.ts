/*
 * @Author: bbibinbings
 * @Date: 2025-04-29 15:23:44
 * @LastEditors: bbibinbings
 * @LastEditTime: 2026-04-01 15:56:04
 * @FilePath: /vue3_ts/config/vite/plugins/mock.ts
 * @Description: 
 */
/**
 * @name ConfigMockPlugin
 * @description 引入mockjs，本地模拟接口
 */
import { viteMockServe } from 'vite-plugin-mock'
export const ConfigMockPlugin = (isBuild: boolean) => {
  return viteMockServe({
    ignore: /^_/,
    mockPath: 'mock',
    enable: !isBuild,
  })
}
