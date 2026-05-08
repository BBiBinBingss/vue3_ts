<!--
 * @Author       : tangbo 852425209@qq.com
 * @Date         : 2022-06-29 16:54:07
 * @LastEditors  : tangbo 852425209@qq.com
 * @LastEditTime : 2023-08-24 11:06:20
 * @FilePath     : \vue3_ts\src\pages\index\index.vue
 * @Description  : 首页
-->

<template>
  <div>
    <Cesium />
  </div>
</template>

<script lang="ts" setup>
import { onBeforeUnmount } from 'vue'
import Cesium from '/@/components/Cesium'
import {
  addLineLayer,
  addPointLayer,
  addPolygonLayer,
  createMovingTrack,
  createRandomLines,
  createRandomPoints,
  createRandomPolygons,
  onCesiumViewerReady,
} from '/@/utils/gis'

const unsubscribe = onCesiumViewerReady(async () => {
  try {
    const points = createRandomPoints({
      count: 120,
      clusterTest: true,
      randomColor: true,
      id: 'demo-device',
    })

    const lines = createRandomLines({
      count: 30,
      curve: true,
      mockTrack: true,
      id: 'demo-track',
    })

    const polygons = createRandomPolygons({
      count: 8,
      randomColor: true,
      areaTest: true,
      validateGeometry: true,
      id: 'demo-warning',
    })

    await addPointLayer({
      sourceId: 'mock-device-points',
      data: points,
      style: {
        color: '#ffa726',
        strokeColor: '#ffffff',
        pointSize: 9,
      },
    })

    await addLineLayer({
      sourceId: 'mock-car-tracks',
      data: lines,
      style: {
        strokeColor: '#29b6f6',
        strokeWidth: 3,
      },
    })

    await addPolygonLayer({
      sourceId: 'mock-warning-polygons',
      data: polygons,
      style: {
        fillColor: '#ef5350',
        fillOpacity: 0.24,
        strokeColor: '#b71c1c',
        strokeWidth: 2,
      },
    })

    const route = lines.features?.[0]
    if (!route) {
      return
    }

    const track = createMovingTrack({
      id: 'car-replay-01',
      route,
      durationMs: 15000,
      fps: 20,
      loop: true,
    })

    await addPointLayer({
      sourceId: 'mock-moving-track',
      data: track.toFeatureCollection(),
      style: {
        color: '#66bb6a',
        pointSize: 6,
      },
    })
  } catch (error) {
    console.error('[GIS-DEMO] 图层渲染失败', error)
  }
})

onBeforeUnmount(() => {
  unsubscribe()
})
</script>

<style lang="less" scoped>
@import './index.less';
</style>
