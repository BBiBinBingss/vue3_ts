/*
 * @Author       : tangbo 852425209@qq.com
 * @Date         : 2023-08-11 11:01:20
 * @LastEditors: tangbo 852425209@qq.com
 * @LastEditTime: 2024-01-08 10:24:20
 * @FilePath     : \vue3_ts\src\components\Cesium\utils\Container.ts
 * @Description  : 初始化地图
 */

import { Viewer, Cartesian3, Math as CesiumMath } from 'cesium'
import { nextTick } from 'vue'
import { layers } from './useLayer'
import { viewerSettingStore } from '/@/store/modules/viewerSetting'
import { coordinatesSettingStore } from '/@/store/modules/coordinatesSetting'
import { setViewerInstance } from './viewerRegistry'

export default class Container {
  private viewer: Viewer
  private destroyed = false

  // 公开的getter，以允许外部访问_viewer
  public get container(): Viewer {
    return this.viewer
  }

  constructor(containerSelector: string) {
    this.viewer = this.initializeViewer(containerSelector)
    nextTick(this.postInitialize.bind(this))
  }

  /**
   * 初始化Viewer实例
   * @param containerSelector 容器选择器
   * @returns Viewer实例
   */
  private initializeViewer(containerSelector: string): Viewer {
    const viewerSettings = viewerSettingStore().viewerModule
    return new Viewer(containerSelector, { ...viewerSettings })
  }

  /**
   * 异步加载后的初始化
   */
  private async postInitialize(): Promise<void> {
    this.initializeLayers()
    await this.initializePosition()
    if (this.destroyed || this.viewer.isDestroyed()) {
      return
    }
    // 中文备注：必须等默认视角飞行完成后再通知业务页面生成默认点线面。
    // 否则页面会按 Cesium 初始相机位置取 bbox，出现“计数有数据但屏幕看不到图层”的情况。
    setViewerInstance(this.viewer)
  }

  /**
   * 初始化图层
   */
  private initializeLayers(): void {
    layers.forEach((layer) => {
      this.viewer.imageryLayers.addImageryProvider(layer)
    })

    for (let i = 0; i < this.viewer.imageryLayers.length; i++) {
      const layer = this.viewer.imageryLayers.get(i)
      layer.show = false
    }
  }

  /**
   * 初始化Viewer的位置
   */
  private async initializePosition(): Promise<void> {
    if (this.destroyed || this.viewer.isDestroyed()) {
      return
    }
    const { lon, lat, height, heading, pitch, roll } = coordinatesSettingStore().LocationComponent
    const destination = Cartesian3.fromDegrees(lon, lat, height)
    const orientation = {
      heading: CesiumMath.toRadians(heading),
      pitch: CesiumMath.toRadians(pitch),
      roll: CesiumMath.toRadians(roll),
    }

    await new Promise<void>((resolve) => {
      this.viewer.scene.camera.flyTo({
        destination,
        orientation,
        duration: 3.0,
        complete: resolve,
        cancel: resolve,
      })
    })
  }

  public destroy(): void {
    if (this.destroyed) {
      return
    }

    this.destroyed = true
    if (!this.viewer.isDestroyed()) {
      this.viewer.destroy()
    }
  }
}
