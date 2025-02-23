/*
 * @Author       : tangbo 852425209@qq.com
 * @Date         : 2023-02-18 00:27:23
 * @LastEditors: BBiBinBings 
 * @LastEditTime: 2025-02-23 22:34:06
 * @FilePath: \vue3_tsv\config\vite\proxy.ts
 * @Description  :
 */
import {
  API_BASE_URL,
  API_TARGET_URL,
  MOCK_API_BASE_URL,
  MOCK_API_TARGET_URL,
} from '../../config/constant'
import { ProxyOptions } from 'vite'
type ProxyTargetList = Record<string, ProxyOptions>

const init: ProxyTargetList = {
  // test
  [API_BASE_URL]: {
    target: API_TARGET_URL,
    changeOrigin: true,
    rewrite: (path) => path.replace(new RegExp(`^${API_BASE_URL}`), ''),
  },
  // mock
  [MOCK_API_BASE_URL]: {
    target: MOCK_API_TARGET_URL,
    changeOrigin: true,
    rewrite: (path) => path.replace(new RegExp(`^${MOCK_API_BASE_URL}`), '/api'),
  },
}

export default init
