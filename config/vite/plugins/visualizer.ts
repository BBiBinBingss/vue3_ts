import visualizer from 'rollup-plugin-visualizer'
import { ANALYSIS } from '../../../mock/constant'

export function ConfigVisualizerConfig() {
  if (ANALYSIS) {
    return visualizer({
      filename: './node_modules/.cache/visualizer/stats.html',
      open: false,
      gzipSize: true,
      brotliSize: true,
    })
  }
  return []
}
