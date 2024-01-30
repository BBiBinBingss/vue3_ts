/*
 * @Author       : tangbo 852425209@qq.com
 * @Date         : 2022-10-26 10:08:58
 * @LastEditors  : tangbo 852425209@qq.com
 * @LastEditTime : 2023-07-11 15:02:52
 * @FilePath     : \vue3_ts\config\vite\plugins\component.ts
 * @Description  :
 */
/**
 * @name  AutoRegistryComponents
 * @description 按需加载，自动引入组件
 */
import Components from 'unplugin-vue-components/vite'
import { NaiveUiResolver } from 'unplugin-vue-components/resolvers'

export const AutoRegistryComponents = () => {
  return Components({
    // dirs: ['src/components'],
    extensions: ['vue', 'md'],
    deep: true,
    dts: 'types/components.d.ts',
    directoryAsNamespace: true,
    globalNamespaces: [],
    directives: true,
    include: [/\.vue$/, /\.vue\?vue/, /\.md$/],
    exclude: [/[\\/]node_modules[\\/]/, /[\\/]\.git[\\/]/, /[\\/]\.nuxt[\\/]/],
    resolvers: [NaiveUiResolver()],
  })
}
