import * as Cesium from 'cesium'

export const ViewerSettingStore: any = {
  animation: false, // 控制场景动画的播放速度控件
  baseLayerPicker: false,
  fullscreenButton: false,
  geocoder: false,
  homeButton: false,
  infoBox: false,
  sceneModePicker: false,
  selectionIndicator: false,
  shouldAnimate: true,
  timeline: false,
  navigationHelpButton: false,
  navigationInstructionsInitiallyVisible: false,
  scene3DOnly: false,
  baseLayer: false,
  requestRenderMode: true, // 按需渲染模式，避免 Worker 连续通信
  maximumRenderTimeChange: Infinity, // 禁用自动性能优化
}

