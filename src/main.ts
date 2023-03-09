/*
 * @Author       : tangbo 852425209@qq.com
 * @Date         : 2022-10-26 10:08:59
 * @LastEditors  : tangbo 852425209@qq.com
 * @LastEditTime : 2023-03-07 15:22:31
 * @FilePath     : \vue3_ts\src\main.ts
 * @Description  :
 */
/*
 * @Author: tangbo 852425209@qq.com
 * @Date: 2022-06-15 15:30:27
 * @LastEditors: tangbo 852425209@qq.com
 * @LastEditTime: 2022-06-15 16:50:28
 * @FilePath: \saas-platform\src\main.ts
 * @Description:
 */
import 'virtual:windi-base.css'
import 'virtual:windi-components.css'
import 'virtual:windi-utilities.css'

import { createApp } from 'vue'
import App from './App.vue'
import router from './router'
import { setupStore } from '/@/store'

// 支持SVG
import 'virtual:svg-icons-register'
createApp(App).use(router).use(setupStore).mount('#app')
