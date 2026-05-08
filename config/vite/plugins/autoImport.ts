/*
 * @Author       : tangbo 852425209@qq.com
 * @Date         : 2023-02-18 00:27:23
 * @LastEditors: tangbo 852425209@qq.com
 * @LastEditTime: 2024-01-05 17:04:10
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
  const importsList = [
    'vue',
    'pinia',
    'vue-router',
    '@vueuse/core',
    {
      from: 'vue',
      imports: [{ name: 'ref', as: '$ref' }],
    },
  ] as NonNullable<NonNullable<Parameters<typeof AutoImport>[0]>['imports']>

  const resolversList = [NaiveUiResolver()]

  return AutoImport({
    dts: 'types/auto-imports.d.ts',
    imports: importsList,
    resolvers: resolversList,
  })
}
