/*
 * @Author       : tangbo 852425209@qq.com
 * @Date         : 2022-10-26 10:09:00
 * @LastEditors  : tangbo 852425209@qq.com
 * @LastEditTime : 2023-07-11 14:42:58
 * @FilePath     : \vue3_ts\src\utils\http\axios\index.ts
 * @Description  :
 */
import axios, { AxiosInstance, AxiosRequestConfig, AxiosResponse } from 'axios'
import { showMessage } from './status'
import { IResponse } from './type'
import { getToken } from '/@/utils/auth'

// Initialize Axios Instance with Default Config
const axiosInstance: AxiosInstance = axios.create({
  baseURL: import.meta.env.VITE_APP_API_BASEURL,
  timeout: 5000,
  withCredentials: false,
  headers: {
    'Access-Control-Allow-Origin': '*',
  },
})

// Interceptor for requests
axiosInstance.interceptors.request.use(
  (config: AxiosRequestConfig) => {
    const token = getToken()
    //if (token) config.headers.Authorization = `${TokenPrefix}${token}`
    return config
  },
  (error: any) => Promise.reject(error)
)

// Interceptor for responses
axiosInstance.interceptors.response.use(
  (response: AxiosResponse) => {
    if (response.status === 200) {
      return response
    }
    window.$message.error(showMessage(response.status))
    return Promise.reject(response)
  },
  (error: any) => {
    const { response } = error
    if (response) {
      showMessage(response.status)
      return Promise.reject(response.data)
    }
    window.$message.error(showMessage('网络连接异常,请稍后再试!'))
    return Promise.reject(error)
  }
)

const request = async <T = any>(config: AxiosRequestConfig): Promise<T> => {
  const response = await axiosInstance.request<any, AxiosResponse<IResponse>>(config)
  return response.data as unknown as Promise<T>
}

export const get = <T = any>(config: AxiosRequestConfig): Promise<T> =>
  request({ ...config, method: 'GET' })
export const post = <T = any>(config: AxiosRequestConfig): Promise<T> =>
  request({ ...config, method: 'POST' })

export default request
export type { AxiosInstance, AxiosResponse }
