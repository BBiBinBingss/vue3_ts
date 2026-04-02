/*
 * @Author       : tangbo 852425209@qq.com
 * @Date         : 2023-02-18 00:27:23
 * @LastEditors  : tangbo 852425209@qq.com
 * @LastEditTime : 2023-03-09 16:03:55
 * @FilePath     : \vue3_ts\config\vite\plugins\restart.ts
 * @Description  : 
 */
/**
 * @name ConfigRestartPlugin
 * @description 监听配置文件修改自动重启Vite
 */
export const ConfigRestartPlugin = async () => {
  const { default: ViteRestart } = await import('vite-plugin-restart')

  return ViteRestart({
    restart: ['*.config.[jt]s', '**/config/*.[jt]s'],
  })
}
