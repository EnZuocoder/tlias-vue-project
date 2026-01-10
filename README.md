# Tlias智能学习辅助系统前端

## 技术栈:

 * ### Vue框架

 * ### Axios前后端异步通信

 * ### ElementPlus 前端组件库

 * ### Apache Echarts 可视化图表库

 * ###   ~~github copilot vibe coding,智能代码补全太好用了!~~

## 特色:

**在前端画了个智能AI助手对话界面,有大语言模型的API的话,如果能可以对其接口,就能人模狗样的进行AI对话,也可以美其名曰:AI智能应用**

## 部署:

**首先下载Node.js,npm 下载相关依赖(axios,ElementPlus,Echats什么的)用vscode直接打开,直接生产环境运行,生产环境运行注意配置```vite.config.js``**,**本机同时运行前后端项目,要解决跨域问题,反向代理一下后端服务所在端口**

```javascript
server: {
     proxy: {
       '/api': {
        target: 'http://127.0.0.1:8000',  //这里本机后端服务所在端口
        changeOrigin: true,
        //重写路径,把路径中的/api替换为空字符串
        rewrite: (path) => path.replace(/^\/api/, '')
      }
     }
   }
```



**当然了也可进一步部署到ngnix服务器**

