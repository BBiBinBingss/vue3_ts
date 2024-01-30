/*
 * @Author       : tangbo 852425209@qq.com
 * @Date         : 2023-08-11 11:32:42
 * @LastEditors  : tangbo 852425209@qq.com
 * @LastEditTime : 2023-08-11 15:48:14
 * @FilePath     : \vue3_ts\src\components\OpenLayers\utils\ControlLayerVisibility.ts
 * @Description  :  切换图层控制
 */

/**
 * 切换图层的可见性
 * @param {any} map - 地图对象
 * @param {string[] | { [s: string]: unknown } | ArrayLike<unknown>} val - 图层名称或其他类型的值列表
 */
export function toggleLayerVisibility(
  map: any,
  val: string[] | { [s: string]: unknown } | ArrayLike<unknown>
) {
  // 获取地图上的所有图层
  const layers = map.container.getLayers()
  // 如果val是数组，则直接使用；如果是对象，则获取其值数组
  const values = Array.isArray(val) ? val : Object.values(val)
  // 遍历每个图层
  layers.forEach((layer: any) => {
    // 获取图层的名称
    const layerName = layer.getClassName()
    // 创建一个正则表达式来检查是否包含中文字符
    const reg = new RegExp('[\\u4E00-\\u9FFF]+', 'g')
    // 如果图层名称包含中文，则根据值列表来设置其可见性；否则，默认设置为可见
    reg.test(layerName) ? layer.setVisible(values.includes(layerName)) : layer.setVisible(true)
  })
}
