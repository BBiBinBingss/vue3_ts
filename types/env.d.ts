/*
 * @Author       : tangbo 852425209@qq.com
 * @Date         : 2022-10-26 10:09:00
 * @LastEditors  : tangbo 852425209@qq.com
 * @LastEditTime : 2022-10-26 11:33:30
 * @FilePath     : \hubei-traffic\types\env.d.ts
 * @Description  : 
 */
/// <reference types="vite/client" />

declare module '*.vue' {
  import { DefineComponent } from 'vue'
  const component: DefineComponent<{}, {}, any>
  export default component
}

declare module 'virtual:*' {
  const result: any
  export default result
}

declare interface Window {
  $message: any
}
