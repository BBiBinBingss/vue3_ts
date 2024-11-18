/*
 * @Author       : tangbo 852425209@qq.com
 * @Date         : 2023-08-11 16:40:27
 * @LastEditors: tangbo 
 * @LastEditTime: 2024-08-23 17:19:56
 * @FilePath: \vue3_ts\src\components\Cesium\utils\useStyles.ts
 * @Description  : Cesium样式
 */

import { createUseStyles } from 'vue-jss'

const useStyles = createUseStyles({
  cesiumContainer: {
    width: '100%',
    height: '100vh',
    overflow: 'hidden',
    position: 'relative',
    '& .cesium-credit-textContainer *, .cesium-credit-logoContainer *': {
      display: 'none !important',
    },
    '& .cesium-credit-expand-link': {
      display: 'none !important',
    },
  },
})

export default useStyles
