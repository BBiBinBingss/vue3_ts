/*
 * @Author       : tangbo 852425209@qq.com
 * @Date         : 2023-02-18 00:27:24
 * @LastEditors  : tangbo 852425209@qq.com
 * @LastEditTime : 2023-03-08 17:03:53
 * @FilePath     : \vue3_ts\src\utils\index.ts
 * @Description  :
 */

/**
 * 图片转Base64
 * @param {String} imageUrl w图片地址
 * @return null
 */

const imageUrlToBase64 = (imageUrl: string) => {
  let image = new Image() //解决跨域问题
  image.setAttribute('crossOrigin', 'anonymous')
  image.src = imageUrl //image.onload为异步加载
  image.onload = () => {
    let canvas = document.createElement('canvas')
    canvas.width = image.width
    canvas.height = image.height
    let context: CanvasRenderingContext2D | null = canvas.getContext('2d')
    context?.drawImage(image, 0, 0, image.width, image.height)
    let quality = 0.8 //这里的dataurl就是base64类型
    let dataURL = canvas.toDataURL('image/jpeg', quality) //使用toDataUrl将图片转换成jpeg的格式,不要把图片压缩成png，因为压缩成png后base64的字符串可能比不转换前的长！
    return dataURL
  }
}

/**
 * @param {Function} fn 目标函数
 * @param {Number} time 延迟执行毫秒数
 * @param {Boolean} immediate true - 立即执行 false - 延迟执行
 * @description 防抖函数
 */

export const debounce = (
  fn: { apply: (arg0: any, arg1: IArguments) => void },
  time: number | undefined,
  immediate = true
) => {
  let timer: string | number | NodeJS.Timeout | null | undefined
  return function () {
    const that = this
    const args = arguments

    if (timer) clearTimeout(timer)
    if (immediate) {
      const callNow = !timer
      timer = setTimeout(() => {
        timer = null
      }, time)
      if (callNow) {
        fn.apply(that, args)
      }
    } else {
      timer = setTimeout(() => {
        fn.apply
      }, time)
    }
  }
}

/**
 * @param {Function} fn 目标函数
 * @param {Number} time 延迟执行毫秒数
 * @param {Boolean} type 1-立即执行，2-不立即执行
 * @description 节流函数
 */

export const throttle = (
  fn: { apply: (arg0: any, arg1: IArguments) => void },
  time: number | undefined,
  type: number
) => {
  let previous = 0
  let timeout: NodeJS.Timeout | null
  return function () {
    let that = this
    let args = arguments
    if (type === 1) {
      let now = Date.now()

      if (now - previous > time) {
        fn.apply(that, args)
        previous = now
      }
    } else if (type === 2) {
      if (!timeout) {
        timeout = setTimeout(() => {
          timeout = null
          fn.apply(that, args)
        }, time)
      }
    }
  }
}
