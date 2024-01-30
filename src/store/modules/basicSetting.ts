import { defineStore } from 'pinia'
import { store } from '/@/store'
import { Basic } from '/@/settings/basicSetting'

const { Projection, Coordinate, zoomTo } = Basic

interface BasicSettingState {
  Coordinate: any[]
  Projection: string
  zoomTo: number
}

export const basicSettingStore = defineStore({
  id: 'app-basic-setting',
  state: (): BasicSettingState => ({
    Coordinate,
    Projection,
    zoomTo,
  }),
  getters: {},
  actions: {},
})

export function useDesignSettingWithOut() {
  return basicSettingStore(store)
}
