/**
 * 图层注册表能力定义。
 */
export interface LayerRegistryHandle<T> {
  has: (id: string) => boolean
  get: (id: string) => T | undefined
  set: (id: string, value: T) => void
  remove: (id: string) => void
  clear: () => void
  size: () => number
}

/**
 * 创建轻量图层注册表。
 * 用于 source/layer 去重、更新、删除与生命周期管理。
 */
export const createLayerRegistry = <T>(): LayerRegistryHandle<T> => {
  const records = new Map<string, T>()

  return {
    has: (id: string) => records.has(id),
    get: (id: string) => records.get(id),
    set: (id: string, value: T) => {
      records.set(id, value)
    },
    remove: (id: string) => {
      records.delete(id)
    },
    clear: () => {
      records.clear()
    },
    size: () => records.size,
  }
}
