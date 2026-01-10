import axios from 'axios'
import { ElMessage } from 'element-plus'
import router from '../router'

//创建axios实例对象
const request = axios.create({
  baseURL: '/api',
  timeout: 600000
})
//axios的请求 request 拦截器为所有请求添加token
request.interceptors.request.use(
  (config) => { //成功回调
    let loginUser = null
    const raw = localStorage.getItem('loginUser')
    if (raw) {
      try { loginUser = JSON.parse(raw) } catch { loginUser = null }
    }
    if(loginUser&&loginUser.token){
      config.headers.token=loginUser.token
    }
      return config;
  },
)
//axios的响应 response 拦截器
request.interceptors.response.use(
  (response) => { //成功回调
    return response.data
  },
  (error) => { //失败回调
    const status = error && error.response ? error.response.status : undefined
    if(status===401){
      //token过期或未登录，跳转到登录页面
      ElMessage.error('请登录')
      router.push('/login')
    }

    return Promise.reject(error)
  }
)
export default request