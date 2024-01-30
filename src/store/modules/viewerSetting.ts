import { defineStore } from 'pinia'
import { store } from '/@/store'
import { Viewer, ErlMergeViewer } from '/@/settings/viewerSetting'

interface ViewerSettingState {
  Viewer: any[]
  ErlMergeViewer: any[]
}

export const viewerSettingStore = defineStore({
  id: 'app-viewer-setting',
  state: (): ViewerSettingState => ({
    Viewer,
    ErlMergeViewer,
  }),
  getters: {},
  actions: {
    // 合并图层数值
    setErlMergeViewer(viewer: any[]) {
      this.ErlMergeViewer = viewer
    },
  },
})

export function useDesignSettingWithOut() {
  return viewerSettingStore(store)
}
