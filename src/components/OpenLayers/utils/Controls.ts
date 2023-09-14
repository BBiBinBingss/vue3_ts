/*
 * @Author       : tangbo 852425209@qq.com
 * @Date         : 2023-08-11 11:32:42
 * @LastEditors  : tangbo 852425209@qq.com
 * @LastEditTime : 2023-08-11 11:33:20
 * @FilePath     : \vue3_ts\src\components\OpenLayers\utils\Controls.ts
 * @Description  :  基本配置设备
 */
import { defaults as defaultControls } from 'ol/control'

export const controls = defaultControls({
  zoom: false,
  rotate: false,
  attribution: false,
})
