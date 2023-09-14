import { defineStore } from 'pinia'
import { store } from '/@/store'
import { ViewerSettingStore } from '/@/settings/viewerSetting'

interface ViewerSettingState {
  viewerModule: {
    animation: boolean
    baseLayerPicker: boolean
    fullscreenButton: boolean
    geocoder: boolean
    homeButton: boolean
    infoBox: boolean
    sceneModePicker: boolean
    selectionIndicator: boolean
    timeline: boolean
    navigationHelpButton: boolean
    navigationInstructionsInitiallyVisible: boolean
  }
}

export const viewerSettingStore = defineStore({
  id: 'app-viewer-setting',
  state: (): ViewerSettingState => ({
    viewerModule: ViewerSettingStore,
  }),
  getters: {},
  actions: {},
})

export function useDesignSettingWithOut() {
  return viewerSettingStore(store)
}
