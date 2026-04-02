/**
 * point 模块类型定义。
 */
export interface CommonFeatureOptions {
  /** 要素 id，用于检索与更新。 */
  id?: string
  /** 业务扩展属性，会挂载到 feature 上。 */
  properties?: Record<string, unknown>
}

export interface PointStyleOptions {
  /** 圆点半径。 */
  radius?: number
  /** 填充颜色。 */
  fillColor?: string
  /** 描边颜色。 */
  strokeColor?: string
  /** 描边宽度。 */
  strokeWidth?: number
}

export interface PointFeatureOptions extends CommonFeatureOptions {
  /** 点坐标（经纬度）。 */
  coordinate: [number, number]
  /** 点样式。 */
  style?: PointStyleOptions
}
