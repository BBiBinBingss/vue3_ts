/*
 * @Author       : tangbo 852425209@qq.com
 * @Date         : 2023-08-11 11:01:20
 * @LastEditors  : tangbo 852425209@qq.com
 * @LastEditTime : 2023-08-11 15:31:46
 * @FilePath     : \vue3_ts\src\components\OpenLayers\utils\container.ts
 * @Description  : 初始化地图
 */
import OLMap from 'ol/Map'
import { layer } from './Layer'
import { SwingMonthView, type MapViewSettings } from './View'
import { controls } from './Controls'

export default class Container {
  public container: OLMap

  constructor(containerSelector: string | HTMLElement, basicLayer: MapViewSettings) {
    this._initMap(containerSelector, basicLayer)
  }

  _initMap(containerSelector: string | HTMLElement, basicLayer: MapViewSettings) {
    this.container = new OLMap({
      target: containerSelector,
      layers: Object.values(Object.assign(layer, {})),
      view: SwingMonthView(basicLayer),
      controls: controls,
    })
  }
}
