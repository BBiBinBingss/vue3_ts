import type { InjectionKey, Ref } from 'vue'

export interface CesiumConfigContext {
  containerId: Ref<string>
  defaultBaseLayerIds: Ref<string[]>
  terrainEnabled: Ref<boolean>
  terrainUrl: Ref<string>
}

export const cesiumConfigKey: InjectionKey<CesiumConfigContext> = Symbol('CesiumConfigContext')
