/*
 * @Author       : tangbo 852425209@qq.com
 * @Date         : 2023-08-11 11:01:20
 * @LastEditors  : tangbo 852425209@qq.com
 * @LastEditTime : 2023-08-22 10:20:33
 * @FilePath     : \vue3_ts\src\components\Cesium\utils\CesiumTerrainLoader.ts
 * @Description  : 高层地形
 */

import * as Cesium from 'cesium'

// 加载高层地形
export function loadTerrain(viewer: Cesium.Viewer, terrainUrl: string): void {
  viewer.terrainProvider = new Cesium.CesiumTerrainProvider({
    url: terrainUrl,
  } as Cesium.CesiumTerrainProvider.ConstructorOptions)
}

// 移除高层地形
export function removeTerrain(viewer: Cesium.Viewer): void {
  viewer.terrainProvider = new Cesium.EllipsoidTerrainProvider()
}
