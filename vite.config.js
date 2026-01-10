import { fileURLToPath, URL } from 'node:url'
import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
// https://vitejs.dev/config/
export default defineConfig({
  plugins: [vue()],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url))
    }
  },
  //使用/test可以请求到我自己写的本地服务
   server: {
     proxy: {
       '/api': {
        target: 'http://127.0.0.1:8000',
        changeOrigin: true,
        //重写路径,把路径中的/api替换为空字符串
        rewrite: (path) => path.replace(/^\/api/, '')
      }
     }
   }
})