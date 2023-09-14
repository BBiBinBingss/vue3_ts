/*
 * @Author       : tangbo 852425209@qq.com
 * @Date         : 2023-08-11 11:32:42
 * @LastEditors  : tangbo 852425209@qq.com
 * @LastEditTime : 2023-08-11 15:48:14
 * @FilePath     : \vue3_ts\src\components\OpenLayers\utils\ControlLayerVisibility.ts
 * @Description  :  切换图层控制
 */

export const toggleLayerVisibility = (
  map: any,
  val: string[] | { [s: string]: unknown } | ArrayLike<unknown>
) => {
  const layers = map.container.getLayers()
  const values = Array.isArray(val) ? val : Object.values(val)
  layers.forEach((layer: any) => {
    const layerName = layer.getClassName()
    const reg = new RegExp('[\\u4E00-\\u9FFF]+', 'g')
    reg.test(layerName) ? layer.setVisible(values.includes(layerName)) : layer.setVisible(true)
  })
}
