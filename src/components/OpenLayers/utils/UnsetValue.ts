/*
 * @Author       : tangbo 852425209@qq.com
 * @Date         : 2023-08-11 11:26:02
 * @LastEditors  : tangbo 852425209@qq.com
 * @LastEditTime : 2023-08-11 15:58:22
 * @FilePath     : \vue3_ts\src\components\OpenLayers\utils\UnsetValue.ts
 * @Description  :
 */

/**
 * 将地图的中心点设置为指定坐标，如果地图容器为空，则不执行操作。
 * @param map 地图实例
 * @param center 新的中心点坐标 [经度, 纬度]
 */

export function setMapCenter(map: any, center: number[]): void {
  if (!map.container) return // 如果地图容器为空，直接返回
  const view = map.container.getView() // 获取地图视图实例
  view.setCenter(center) // 设置地图中心点
}
