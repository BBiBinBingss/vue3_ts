import { h, defineComponent, type PropType } from 'vue'
import CesiumConfigProvider from './components/CesiumConfigProvider'
import CesiumViewer from './components/CesiumViewer'
import CesiumBaseLayerProvider from './components/CesiumBaseLayerProvider'
import CesiumTerrainProvider from './components/CesiumTerrainProvider'

export default defineComponent({
  name: 'Cesium',
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
  setup(props) {
    return () =>
      h(
        CesiumConfigProvider,
        {
          containerId: props.containerId,
          defaultBaseLayerIds: props.defaultBaseLayerIds,
          terrainEnabled: props.terrainEnabled,
          terrainUrl: props.terrainUrl,
        },
        {
          default: () => [h(CesiumViewer), h(CesiumBaseLayerProvider), h(CesiumTerrainProvider)],
        }
      )
  },
})
