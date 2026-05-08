import type { Viewer } from 'cesium'

type ViewerReadyListener = (viewer: Viewer) => void

/**
 * 全局 Viewer 实例缓存。
 */
let viewerInstance: Viewer | null = null
const viewerListeners = new Set<ViewerReadyListener>()

/**
 * 注册 Viewer 实例，并通知等待中的监听器。
 */
export function setViewerInstance(viewer: Viewer): void {
  viewerInstance = viewer
  viewerListeners.forEach((listener) => listener(viewer))
}

/**
 * 获取当前 Viewer 实例。
 */
export function getViewerInstance(): Viewer | null {
  return viewerInstance
}

/**
 * 清理 Viewer 实例引用。
 */
export function clearViewerInstance(): void {
  viewerInstance = null
}

/**
 * 监听 Viewer 就绪事件。
 * - 若已就绪立即触发一次
 * - 返回取消监听函数
 */
export function onViewerReady(listener: ViewerReadyListener): () => void {
  if (viewerInstance) {
    listener(viewerInstance)
    return () => undefined
  }

  viewerListeners.add(listener)
  return () => {
    viewerListeners.delete(listener)
  }
}
