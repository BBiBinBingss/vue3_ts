/*
 * @Author       : tangbo 852425209@qq.com
 * @Date         : 2023-08-11 11:32:42
 * @LastEditors  : tangbo 852425209@qq.com
 * @LastEditTime : 2023-08-11 15:48:14
 * @FilePath     : \vue3_ts\src\components\OpenLayers\utils\ControlLayerVisibility.ts
 * @Description  :  切换图层控制
 */

import type Container from './Container'

/**
 * 切换图层的可见性
 * @param {Container | null} map - 地图对象
 * @param {string[]} val - 图层名称列表
 */
export function toggleLayerVisibility(map: Container | null, val: string[]) {
  if (!map) {
    return
  }

  const layers = map.container.getLayers().getArray()

  layers.forEach((layer) => {
    const layerName = layer.getClassName()
    const reg = new RegExp('[\\u4E00-\\u9FFF]+', 'g')
    if (reg.test(layerName)) {
      layer.setVisible(val.includes(layerName))
    } else {
      layer.setVisible(true)
    }
  })
}
