import { get, post } from '/@/utils/http/axios'

enum URL {
  login = '/user/login',
  logout = '/user/logout', 
}
interface LoginRes {
  token: string
}

export interface LoginData {
  username: string
  password: string
}

const login = async (data: LoginData) => post<any>({ url: URL.login, data })
const logout = async () => post<LoginRes>({ url: URL.logout })
 

export { logout, login }
