/*
 * @Author       : tangbo 852425209@qq.com
 * @Date         : 2023-08-11 11:01:20
 * @LastEditors  : tangbo 852425209@qq.com
 * @LastEditTime : 2023-08-22 10:20:33
 * @FilePath     : \vue3_ts\src\components\Cesium\utils\CesiumUtils.ts
 * @Description  : 切换地形
 */

import * as Cesium from 'cesium'
import { loadTerrain, removeTerrain } from './CesiumTerrainLoader'

// 切换2D
export function switch2D(viewer: Cesium.Viewer): void {
  viewer.scene.morphTo2D()
  removeTerrain(viewer)
}

// 切换3D
export function switch3D(viewer: Cesium.Viewer): void {
  viewer.scene.morphTo3D()
  loadTerrain(viewer, import.meta.env.VITE_APP_MAP_URL)
}
