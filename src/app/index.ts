import './styles'

import { createApp } from 'vue'
import App from '/@/App.vue'
import { setupAppPlugins } from './plugins'

/*
 * 应用启动入口。
 *
 * Vue 官方建议在 mount 前完成应用级配置和插件注册；本文件将
 * createApp、插件注册、mount 收束在一个函数里，方便后续扩展
 * 微前端、SSR、水合或测试环境的独立启动逻辑。
 */
export function bootstrap(): void {
  const app = createApp(App)

  setupAppPlugins(app)
  app.mount('#app')
}
