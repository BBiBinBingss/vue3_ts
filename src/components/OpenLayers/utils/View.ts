/*
 * @Author       : tangbo 852425209@qq.com
 * @Date         : 2023-08-11 11:08:15
 * @LastEditors  : tangbo 852425209@qq.com
 * @LastEditTime : 2023-10-19 10:34:42
 * @FilePath     : \vue3_ts\src\components\OpenLayers\utils\View.ts
 * @Description  : 基本配置
 */
import { View } from 'ol'

export interface MapViewSettings {
  Projection: string // 投影设置
  Coordinate: number[] // 地图中心点坐标
  zoomTo: number // 初始缩放级别
  maxZoom?: number // 最大缩放级别（可选）
  minZoom?: number // 最小缩放级别（可选）
}

/**
 * 根据提供的基础视图设置创建OpenLayers View实例
 * @param {MapViewSettings} basic - 基础视图设置
 * @returns {View} 返回OpenLayers View实例
 */
export function SwingMonthView(basic: MapViewSettings): View {
  const { Projection, Coordinate, zoomTo, maxZoom, minZoom } = basic

  return new View({
    projection: Projection,
    center: Coordinate,
    zoom: zoomTo,
    maxZoom,
    minZoom,
  })
}
