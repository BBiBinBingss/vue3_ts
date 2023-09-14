import { defineStore } from 'pinia'
import { store } from '/@/store'
import { LocationComponent } from '/@/settings/coordinatesSetting'

interface CoordinatesSettingState {
  LocationComponent: {
    lon: number
    lat: number
    height: number
    heading: number
    pitch: number
    roll: number
  }
}

export const coordinatesSettingStore = defineStore({
  id: 'app-coordinates-setting',
  state: (): CoordinatesSettingState => ({
    LocationComponent,
  }),
  getters: {},
  actions: {},
})

// Need to be used outside the setup
export const useCarouselSettingWithOut = () => {
  return coordinatesSettingStore(store)
}
