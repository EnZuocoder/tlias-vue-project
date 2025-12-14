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
         target: 'http://localhost:8080',
         changeOrigin: true,
         rewrite: (path) => path.replace(/^\/api/, '') // 将 /test/depts 重写为 /depts
       },
       
     }
   }
})