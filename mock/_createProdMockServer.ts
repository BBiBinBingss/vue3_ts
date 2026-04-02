import { createProdMockServer } from 'vite-plugin-mock/client'
// 批量加载
const modules = import.meta.glob<{ default: any[] }>('./*.ts', { eager: true })

const mockModules: Array<string> = []
Object.keys(modules).forEach((key) => {
  if (key.includes('/_')) {
    return
  }
  mockModules.push(...(modules[key].default || []))
})
export function setupProdMockServer() {
  return createProdMockServer(mockModules)
}
