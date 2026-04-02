<!--
 * @Author       : tangbo 852425209@qq.com
 * @Date         : 2022-06-29 16:54:07
 * @LastEditors: BBiBinBings 
 * @LastEditTime: 2025-02-23 22:36:18
 * @FilePath: \vue3_tsv\src\pages\index\index.vue
 * @Description  : 首页
-->

<template>
  <div class="index-page">
    <OpenLayers
      ref="openLayersRef"
      :visible-types="activeTypes"
      @mock-ready="onMockReady"
      @basemap-ready="onBaseMapReady"
      @basemap-changed="onBaseMapChanged" />

    <aside class="mock-panel">
      <h2 class="mock-title">首页 Mock 实例</h2>
      <p class="mock-subtitle">统计卡控制显隐；点击实例卡会自动显示并飞行定位</p>

      <div class="mock-actions">
        <button type="button" class="action-btn" @click="reloadRandom">随机重建</button>
        <button type="button" class="action-btn" @click="reloadByViewport">按视野重建</button>
      </div>

      <div class="basemap-section">
        <div class="section-title">切换地图示例</div>
        <div class="basemap-actions">
          <!-- eslint-disable-next-line vue/valid-v-for -->
          <template v-for="(preset, presetIndex) in baseMapPresets" :key="presetIndex">
            <button
              type="button"
              class="basemap-btn"
              :class="{ active: preset.key === currentBaseMap }"
              @click="switchBaseMap(preset.key)">
              {{ preset.label }}
            </button>
          </template>
        </div>
      </div>

      <div class="mock-stats">
        <button
          class="stat-item"
          type="button"
          :class="{ off: !isActive('point') }"
          @click="toggleType('point')">
          <span class="label">点</span>
          <span class="value">{{ mockStats.pointVisible }}/{{ mockStats.pointTotal }}</span>
        </button>
        <button
          class="stat-item"
          type="button"
          :class="{ off: !isActive('line') }"
          @click="toggleType('line')">
          <span class="label">线</span>
          <span class="value">{{ mockStats.lineVisible }}/{{ mockStats.lineTotal }}</span>
        </button>
        <button
          class="stat-item"
          type="button"
          :class="{ off: !isActive('polygon') }"
          @click="toggleType('polygon')">
          <span class="label">面</span>
          <span class="value">{{ mockStats.polygonVisible }}/{{ mockStats.polygonTotal }}</span>
        </button>
      </div>

      <ul class="mock-list">
        <!-- eslint-disable-next-line vue/valid-v-for -->
        <template v-for="(mockItem, mockIndex) in mockItems" :key="mockIndex">
          <li
            class="mock-item"
            :class="{ off: !isActive(mockItem.type) }"
            @click="focusMockItem(mockItem)">
            <span class="type" :class="mockItem.type">{{ mockItem.typeLabel }}</span>
            <div class="content">
              <div class="name">{{ mockItem.name }}</div>
              <div class="desc">{{ mockItem.description }}</div>
            </div>
          </li>
        </template>
      </ul>
    </aside>
  </div>
</template>

<script setup lang="ts">
  import { computed, nextTick, ref } from 'vue'
  import OpenLayers from '../../components/OpenLayers/index'

  type MockGeometryType = 'point' | 'line' | 'polygon'

  interface MockItem {
    id: string
    type: MockGeometryType
    typeLabel: string
    name: string
    description: string
  }

  interface OpenLayersExpose {
    flyToMockById: (featureId: string) => void
    getMockItems: () => MockItem[]
    reloadMockRandom: () => void
    reloadMockByViewport: () => void
    switchBaseMap: (presetKey: BaseMapPresetKey) => void
  }

  type BaseMapPresetKey = 'vector' | 'image' | 'terrain' | 'osm'

  interface BaseMapPresetOption {
    key: BaseMapPresetKey
    label: string
    layerNames: string[]
  }

  const activeTypes = ref<MockGeometryType[]>(['point', 'line', 'polygon'])
  const openLayersRef = ref<OpenLayersExpose | null>(null)
  const mockItems = ref<MockItem[]>([])
  const baseMapPresets = ref<BaseMapPresetOption[]>([])
  const currentBaseMap = ref<BaseMapPresetKey>('osm')

  const onMockReady = (items: MockItem[]) => {
    mockItems.value = items
  }

  const onBaseMapReady = (payload: {
    presets: BaseMapPresetOption[]
    current: BaseMapPresetKey
  }) => {
    baseMapPresets.value = payload.presets
    currentBaseMap.value = payload.current
  }

  const onBaseMapChanged = (presetKey: BaseMapPresetKey) => {
    currentBaseMap.value = presetKey
  }

  const isActive = (type: MockGeometryType) => activeTypes.value.includes(type)

  const toggleType = (type: MockGeometryType) => {
    if (isActive(type)) {
      activeTypes.value = activeTypes.value.filter((item) => item !== type)
      return
    }

    activeTypes.value = [...activeTypes.value, type]
  }

  const focusMockItem = async (item: MockItem) => {
    if (!isActive(item.type)) {
      activeTypes.value = [...activeTypes.value, item.type]
      await nextTick()
    }

    openLayersRef.value?.flyToMockById(item.id)
  }

  const enableAllTypes = () => {
    activeTypes.value = ['point', 'line', 'polygon']
  }

  const reloadRandom = () => {
    enableAllTypes()
    openLayersRef.value?.reloadMockRandom()
  }

  const reloadByViewport = () => {
    enableAllTypes()
    openLayersRef.value?.reloadMockByViewport()
  }

  const switchBaseMap = (presetKey: BaseMapPresetKey) => {
    openLayersRef.value?.switchBaseMap(presetKey)
    currentBaseMap.value = presetKey
  }

  const getTypeTotal = (type: MockGeometryType) =>
    mockItems.value.filter((item) => item.type === type).length

  const mockStats = computed(() => ({
    pointTotal: getTypeTotal('point'),
    lineTotal: getTypeTotal('line'),
    polygonTotal: getTypeTotal('polygon'),
    pointVisible: isActive('point') ? getTypeTotal('point') : 0,
    lineVisible: isActive('line') ? getTypeTotal('line') : 0,
    polygonVisible: isActive('polygon') ? getTypeTotal('polygon') : 0,
  }))
</script>

<style lang="less" scoped>
  @import url('./index.less');
</style>
