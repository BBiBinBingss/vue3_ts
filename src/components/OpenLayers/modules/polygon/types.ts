/**
 * polygon 模块类型定义。
 */
import type { CommonFeatureOptions } from '../point/types'

export interface PolygonStyleOptions {
  /** 面填充颜色。 */
  fillColor?: string
  /** 面边界颜色。 */
  strokeColor?: string
  /** 面边界宽度。 */
  strokeWidth?: number
}

export interface PolygonFeatureOptions extends CommonFeatureOptions {
  /** 多边形坐标环集合。 */
  coordinates: [number, number][][]
  /** 面样式。 */
  style?: PolygonStyleOptions
}
