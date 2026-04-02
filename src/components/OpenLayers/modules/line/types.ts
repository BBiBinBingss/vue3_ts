/**
 * line 模块类型定义。
 */
import type { CommonFeatureOptions } from '../point/types'

export interface LineStyleOptions {
  /** 线颜色。 */
  strokeColor?: string
  /** 线宽。 */
  strokeWidth?: number
  /** 虚线样式数组。 */
  lineDash?: number[]
}

export interface LineFeatureOptions extends CommonFeatureOptions {
  /** 折线坐标集合。 */
  coordinates: [number, number][]
  /** 线样式。 */
  style?: LineStyleOptions
}
