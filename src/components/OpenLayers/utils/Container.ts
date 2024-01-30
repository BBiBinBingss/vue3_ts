/*
 * @Author       : tangbo 852425209@qq.com
 * @Date         : 2023-08-11 11:01:20
 * @LastEditors  : tangbo 852425209@qq.com
 * @LastEditTime : 2023-08-11 15:31:46
 * @FilePath     : \vue3_ts\src\components\OpenLayers\utils\container.ts
 * @Description  : 初始化地图
 */

import map from 'ol/Map'
import { layer } from './Layer'
import { SwingMonthView } from './View'
import { controls } from './Controls'

export default class Container {
  public container: any

  constructor(containerSelector: string | HTMLElement | undefined, basicLayer: any) {
    // 当构造器被调用时，直接初始化地图
    this._initMap(containerSelector, basicLayer)
  }

  /**
   * 初始化地图
   * @param {string | HTMLElement | undefined} containerSelector - 地图容器的选择器或元素
   * @param {any} basicLayer - 基础图层信息
   */
  _initMap(containerSelector: string | HTMLElement | undefined, basicLayer: any) {
    this.container = new map({
      target: containerSelector,
      // 将图层对象的值提取为数组
      layers: Object.values(Object.assign(layer, {})),
      // 使用基础图层信息创建视图
      view: SwingMonthView(basicLayer),
      // 设置地图控制
      controls: controls,
    })
  }
}
