import { defineComponent, h, inject, onBeforeUnmount, onMounted, ref, watch } from 'vue'
import Container from '../utils/Container'
import useStyles from '../utils/useStyles'
import { clearViewerInstance } from '../utils/viewerRegistry'
import { cesiumConfigKey } from '../context'

export default defineComponent({
  name: 'CesiumViewer',
  setup() {
    const config = inject(cesiumConfigKey)
    const viewerContainer = ref<Container | null>(null)
    const styles = useStyles()

    onMounted(() => {
      const containerId = config?.containerId.value ?? 'cesium-container'
      viewerContainer.value = new Container(containerId)
    })

    watch(
      () => config?.containerId.value,
      () => {
        if (!viewerContainer.value) {
          return
        }
        viewerContainer.value.destroy()
        const containerId = config?.containerId.value ?? 'cesium-container'
        viewerContainer.value = new Container(containerId)
      }
    )

    onBeforeUnmount(() => {
      if (viewerContainer.value) {
        viewerContainer.value.destroy()
        viewerContainer.value = null
      }
      clearViewerInstance()
    })

    return () =>
      h('div', {
        id: config?.containerId.value ?? 'cesium-container',
        class: styles.value.cesiumContainer,
      })
  },
})
