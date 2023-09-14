/*
 * @Author       : tangbo 852425209@qq.com
 * @Date         : 2022-06-29 16:54:06
 * @LastEditors  : tangbo 852425209@qq.com
 * @LastEditTime : 2023-08-24 11:05:50
 * @FilePath     : \vue3_ts\postcss.config.js
 * @Description  :
 */
module.exports = ({ file }) => {
  const isVueFile = file && file.dirname && file.dirname.endsWith('vue')

  const config = {
    plugins: {
      autoprefixer: {},
      'postcss-px-to-viewport': {},
    },
  }

  if (isVueFile) {
    // 在这里获取屏幕宽度，例如从 window 或者其他途径
    const screenWidth = window.innerWidth // 这里仅为示例，实际情况需要根据项目结构获取

    config.plugins['postcss-px-to-viewport'] = {
      unitToConvert: 'px',
      viewportWidth: screenWidth, // 使用获取到的屏幕宽度
      unitPrecision: 3,
      propList: ['*'],
      viewportUnit: 'vw',
      fontViewportUnit: 'vw',
      selectorBlackList: ['.ignore'], // 在这里添加 nprogress 相关类名和 ID
      minPixelValue: 1,
      mediaQuery: false,
    }
  }

  return config
}
