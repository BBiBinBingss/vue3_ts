/*
 * @Author       : tangbo 852425209@qq.com
 * @Date         : 2023-08-11 11:01:20
 * @LastEditors  : tangbo 852425209@qq.com
 * @LastEditTime : 2023-08-23 10:38:03
 * @FilePath     : \vue3_ts\src\components\Cesium\utils\Container.ts
 * @Description  : 初始化地图
 */

import { Viewer, Cartesian3, Math } from 'cesium'
import { nextTick } from 'vue'
import { layers } from './useLayer'
import { viewerSettingStore } from '/@/store/modules/viewerSetting'
import { coordinatesSettingStore } from '/@/store/modules/coordinatesSetting'

export default class Container {
  private container: Viewer

  constructor(containerSelector: string) {
    // 初始化容器
    this.container = this._initViewer(containerSelector)
    // 异步加载
    nextTick(async () => {
      // 初始化图层
      this._initLayer()
      // 初始化位置
      await this._initPosition()
    })
  }

  // 初始化容器
  private _initViewer(containerSelector: string): Viewer {
    return new Viewer(containerSelector, { ...viewerSettingStore().viewerModule })
  }

  // 初始化图层
  private _initLayer(): void {
    // 初始化加载图层
    layers.forEach((layer: any) => {
      this.container.imageryLayers.addImageryProvider(layer)
    })

    // 隐藏图层
    const layerCount = this.container.imageryLayers.length
    for (let i = 0; i < layerCount; i++) {
      const layer = this.container.imageryLayers.get(i)
      layer.show = false
    }
  }

  // 初始化位置
  private async _initPosition(): Promise<void> {
    const { lon, lat, height, heading, pitch, roll } = coordinatesSettingStore().LocationComponent
    const destination = Cartesian3.fromDegrees(lon, lat, height)
    const orientation = {
      heading: Math.toRadians(heading),
      pitch: Math.toRadians(pitch),
      roll: Math.toRadians(roll),
    }
    await this.container.scene.camera.setView({
      destination,
      orientation,
    })
  }
}
