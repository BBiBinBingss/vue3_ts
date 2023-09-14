/*
 * @Author       : tangbo 852425209@qq.com
 * @Date         : 2023-08-11 11:08:15
 * @LastEditors  : tangbo 852425209@qq.com
 * @LastEditTime : 2023-08-11 15:36:28
 * @FilePath     : \vue3_ts\src\components\OpenLayers\utils\view.ts
 * @Description  : 基本配置
 */
import { View } from 'ol'

interface SwingMonthView {
  Projection: string
  Coordinate: number[]
  zoomTo: number
  maxZoom: number
  minZoom: number
}

export function SwingMonthView(basic: SwingMonthView) {
  const { Projection, Coordinate, zoomTo, maxZoom, minZoom } = basic
  return new View({
    projection: Projection, // 投影设置
    center: Coordinate, // 地图中心点坐标
    zoom: zoomTo, // 初始缩放级别
    // maxZoom, // 最大缩放级别
    // minZoom, // 最小缩放级别
  })
}
