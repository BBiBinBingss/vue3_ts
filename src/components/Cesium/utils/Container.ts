/*
 * @Author       : tangbo 852425209@qq.com
 * @Date         : 2023-08-11 11:01:20
 * @LastEditors: tangbo 852425209@qq.com
 * @LastEditTime: 2024-01-08 10:24:20
 * @FilePath     : \vue3_ts\src\components\Cesium\utils\Container.ts
 * @Description  : 初始化地图
 */

import { Viewer, Cartesian3, Math as CesiumMath, EasingFunction } from 'cesium'
import { nextTick } from 'vue'
import { layers } from './useLayer'
import { viewerSettingStore } from '/@/store/modules/viewerSetting'
import { coordinatesSettingStore } from '/@/store/modules/coordinatesSetting'

export default class Container {
  private viewer: Viewer

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
    const { lon, lat, height, heading, pitch, roll } = coordinatesSettingStore().LocationComponent
    const destination = Cartesian3.fromDegrees(lon, lat, height)
    const orientation = {
      heading: CesiumMath.toRadians(heading),
      pitch: CesiumMath.toRadians(pitch),
      roll: CesiumMath.toRadians(roll),
    }

    // 设置动画效果的相机过渡参数
    const flyToOptions = {
      destination,
      orientation,
      duration: 3.0,
      easingFunction: EasingFunction?.LINEAR_NONE,
    }

    // 使用 flyTo 进行平滑过渡
    await this.viewer.scene.camera.flyTo(flyToOptions)
  }
}
