/*
 * @Author       : tangbo 852425209@qq.com
 * @Date         : 2023-08-11 11:26:02
 * @LastEditors  : tangbo 852425209@qq.com
 * @LastEditTime : 2023-08-11 15:58:22
 * @FilePath     : \vue3_ts\src\components\OpenLayers\utils\UnsetValue.ts
 * @Description  :
 */

/**
 * 设置地图中心点
 * @param {any} map - 地图实例
 * @param {number[]} center - 要设置的中心点坐标，形如 [longitude, latitude]
 */
export function setMapCenter(map: any, center: number[]): void {
  // 如果地图容器不存在或为空，则直接退出函数
  if (!map.container) return
  // 从地图实例中获取当前的视图
  const view = map.container.getView()
  // 使用提供的坐标设置地图的中心位置
  view.setCenter(center)
}
