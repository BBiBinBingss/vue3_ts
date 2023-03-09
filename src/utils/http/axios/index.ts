/*
 * @Author       : tangbo 852425209@qq.com
 * @Date         : 2022-10-26 10:09:00
 * @LastEditors  : tangbo 852425209@qq.com
 * @LastEditTime : 2022-10-26 11:41:18
 * @FilePath     : \hubei-traffic\src\utils\http\axios\index.ts
 * @Description  :
 */
import axios, { AxiosInstance, AxiosRequestConfig, AxiosResponse } from 'axios'
import { showMessage } from './status'
import { IResponse } from './type'
import { getToken } from '/@/utils/auth'

// 如果请求话费了超过 `timeout` 的时间，请求将被中断
axios.defaults.timeout = 5000
// 表示跨域请求时是否需要使用凭证
axios.defaults.withCredentials = false
// axios.defaults.headers.common['token'] =  AUTH_TOKEN
// 允许跨域
axios.defaults.headers.post['Access-Control-Allow-Origin-Type'] = '*'

// 请求地址 import.meta.env.BASE_URL  拼接请求地址
const axiosInstance: AxiosInstance = axios.create({
  baseURL: import.meta.env.VITE_APP_API_BASEURL,
  // transformRequest: [
  //   function (data) {
  //     //由于使用的 form-data传数据所以要格式化
  //     delete data.Authorization
  //     data = qs.stringify(data)
  //     return data
  //   },
  // ],
})

// axios实例拦截响应
axiosInstance.interceptors.response.use(
  (response: AxiosResponse) => {
    // if (response.headers.authorization) {
    //   localStorage.setItem('app_token', response.headers.authorization)
    // } else if (response.data && response.data.token) {
    //   localStorage.setItem('app_token', response.data.token)
    // }

    if (response.status === 200) {
      return response
    }
    window.$message.error(showMessage(response.status))

    return response
  },
  // 请求失败
  (error: any) => {
    const { response } = error
    if (response) {
      // 请求已发出，但是不在2xx的范围
      showMessage(response.status)
      return Promise.reject(response.data)
    }
    window.$message.error(showMessage(showMessage('网络连接异常,请稍后再试!')))
  }
)

// axios实例拦截请求
axiosInstance.interceptors.request.use(
  (config: AxiosRequestConfig) => {
    const token = getToken()
    //if (token) config.headers.Authorization = `${TokenPrefix}${token}`
    return config
  },
  (error: any) => {
    return Promise.reject(error)
  }
)

const request = <T = any>(config: AxiosRequestConfig): Promise<T> => {
  const conf = config
  return new Promise((resolve) => {
    axiosInstance
      .request<any, AxiosResponse<IResponse>>(conf)
      .then((res: AxiosResponse<IResponse>) => {
        resolve(res.data as unknown as Promise<T>)
      })
  })
}

export function get<T = any>(config: AxiosRequestConfig): Promise<T> {
  return request({ ...config, method: 'GET' })
}

export function post<T = any>(config: AxiosRequestConfig): Promise<T> {
  return request({ ...config, method: 'POST' })
}

export default request

export type { AxiosInstance, AxiosResponse }
