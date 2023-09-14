/*
 * @Author       : tangbo 852425209@qq.com
 * @Date         : 2023-02-18 00:27:24
 * @LastEditors  : tangbo 852425209@qq.com
 * @LastEditTime : 2023-07-11 14:36:23
 * @FilePath     : \vue3_ts\src\utils\index.ts
 * @Description  :
 */

/**
 * 图片转Base64
 * @param {String} imageUrl 图片地址
 * @return null
 */

export const imageUrlToBase64 = (imageUrl: string): Promise<string> => {
  return new Promise((resolve, reject) => {
    let image = new Image()
    image.setAttribute('crossOrigin', 'anonymous')
    image.src = imageUrl
    image.onload = () => {
      try {
        let canvas = document.createElement('canvas')
        canvas.width = image.width
        canvas.height = image.height
        let context = canvas.getContext('2d')
        if (!context) {
          throw new Error('Unable to get 2D context')
        }
        context.drawImage(image, 0, 0, image.width, image.height)
        let quality = 0.8
        let dataURL = canvas.toDataURL('image/jpeg', quality)
        resolve(dataURL)
      } catch (error) {
        reject(error)
      }
    }
    image.onerror = () => {
      reject(new Error('Could not load image at ' + imageUrl))
    }
  })
}
