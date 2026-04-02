/*
 * @Author       : tangbo 852425209@qq.com
 * @Date         : 2023-02-18 00:27:23
 * @LastEditors  : tangbo 852425209@qq.com
 * @LastEditTime : 2023-07-11 14:59:30
 * @FilePath     : \vue3_ts\config\vite\plugins\autoImport.ts
 * @Description  :
 */
/**
 * @name AutoImportDeps
 * @description 按需加载，自动引入
 */
import AutoImport from 'unplugin-auto-import/vite'
import { NaiveUiResolver } from 'unplugin-vue-components/resolvers'
// Automatically import 'vue', 'pinia', 'vue-router' and '@vueuse/core'
export const AutoImportDeps = () => {
  const importsList: Array<'vue' | 'pinia' | 'vue-router' | '@vueuse/core'> = ['vue', 'pinia', 'vue-router', '@vueuse/core']

  const resolversList = [NaiveUiResolver()]

  return AutoImport({
    dts: 'types/auto-imports.d.ts',
    imports: importsList,
    resolvers: resolversList,
  })
}
