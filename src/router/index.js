import { createRouter, createWebHistory } from 'vue-router'
const LayoutView=()=>import('../views/layout/index.vue')
const IndexView = () => import('../views/index/index.vue')
const LoginView = () => import('../views/login/index.vue')
const DeptView = () => import('../views/dept/index.vue')
const EmpView = () => import('../views/emp/index.vue')
const LogView = () => import('../views/log/index.vue')
const ClazzView = () => import('../views/clazz/index.vue')
const StuView = () => import('../views/stu/index.vue')
const ReportEmpView = () => import('../views/report/emp/index.vue')
const ReportStuView = () => import('../views/report/stu/index.vue')
//配置路由表
const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      // 如果不是访问登录就默认访问layout
      path:'/',name:'layout',
      component:LayoutView,
      children:[
        { path: '/home', name: 'home', component: IndexView },
        { path: '/depts', name: 'depts', component: DeptView },
        { path: '/emps', name: 'emps', component: EmpView },
        { path: '/log', name: 'log', component: LogView },
        { path: '/clazzs', name: 'clazzs', component: ClazzView },
        { path: '/students', name: 'students', component: StuView },
        { path: '/report/emp', name: 'report-emp', component: ReportEmpView },
        { path: '/report/stu', name: 'report-stu', component: ReportStuView },
      ],
      redirect:'/home'  /* 默认重定向到index这个视图组件 */
    },
    { path: '/login', name: 'login', component: LoginView },
  ]
})

export default router
