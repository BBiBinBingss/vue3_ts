import { computed, defineComponent, provide, toRef, type PropType } from 'vue'
import { cesiumConfigKey } from '../context'

export default defineComponent({
  name: 'CesiumConfigProvider',
  props: {
    containerId: {
      type: String,
      default: 'cesium-container',
    },
    defaultBaseLayerIds: {
      type: Array as PropType<string[]>,
      default: () => ['vec', 'cva'],
    },
    terrainEnabled: {
      type: Boolean,
      default: true,
    },
    terrainUrl: {
      type: String,
      default: '',
    },
  },
  setup(props, { slots }) {
    provide(cesiumConfigKey, {
      containerId: toRef(props, 'containerId'),
      defaultBaseLayerIds: computed(() => [...props.defaultBaseLayerIds]),
      terrainEnabled: toRef(props, 'terrainEnabled'),
      terrainUrl: toRef(props, 'terrainUrl'),
    })

    return () => slots.default?.()
  },
})
