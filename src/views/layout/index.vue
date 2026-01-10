<script setup>
import {onMounted, ref} from 'vue'
import { useRouter } from 'vue-router';
import { ElMessageBox, ElMessage } from 'element-plus';
const currentUser=ref(JSON.parse(localStorage.getItem('loginUser')))
const loginfo=ref('')
const router=useRouter()
function logout(){
  if(!currentUser.value){
    router.push('/login')
    return;
  }
  ElMessageBox.confirm(
    '是否确认退出登录？',
    '警告',
    {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning',
    }
  )
  // 用户点击了确定的成功回调
    .then(() => {
      ElMessage({
        type: 'success',
        message: '退出登录成功',
      });
       localStorage.removeItem('loginUser')
        router.push('/login')
    })
     // 用户点击了取消的回调
    .catch(() => {
      ElMessage({
        type: 'info',
        message: '退出登录已取消',
      })
    })
}
onMounted(() => {
  if(currentUser.value)
    {loginfo.value=`退出登录 [${currentUser.value.name}]`;}
  else{
    loginfo.value='请登录'
  }

})
</script>
<template>
  <div class="common-layout">
    <el-container>
      <!-- Header 区域 -->
      <el-header class="header">
        <span class="title">Tlias智能学习辅助系统</span>
        <span class="right_tool">
          <a href="javascript:void(0);" @click="logout">
            <el-icon>
              <SwitchButton  />
          </el-icon> {{loginfo}}
          </a>
        
        </span>
      </el-header>

      <el-container>
        <!-- 左侧菜单 -->
        <el-aside width="200px" class="aside">
          <!-- 左侧导航栏 -->
          <el-menu  class="menuAside" router >
            <el-menu-item index="/home" >
                  <el-icon><House /></el-icon>
                <span>首页</span>
            </el-menu-item>
            <el-sub-menu index="1">
              <template #title>
                <el-icon><Avatar /></el-icon>
                <span>班级学员管理</span>
              </template>
              <el-menu-item class="item"  index="/clazzs" ><el-icon><Grid /></el-icon>班级管理</el-menu-item>
              <el-menu-item class="item"  index="/students"><el-icon><UserFilled /></el-icon>学员管理</el-menu-item>
            </el-sub-menu>

            <el-sub-menu index="2">
              <template #title>
                <el-icon><Tools /></el-icon>
                <span>系统信息管理</span>
              </template>
              <el-menu-item class="item"  index="/depts"><el-icon><StarFilled /></el-icon>部门管理</el-menu-item>
              <el-menu-item class="item"  index="/emps"><el-icon><User /></el-icon>员工管理</el-menu-item>
            </el-sub-menu>

             <el-sub-menu index="3">
              <template #title>
                <span><el-icon><TrendCharts /></el-icon>数据统计管理</span>
              </template>
              <el-menu-item class="item"  index="/report/emp"><el-icon><PieChart /></el-icon>员工信息统计</el-menu-item>
              <el-menu-item class="item"  index="/report/stu"><el-icon><Histogram /></el-icon>学员信息统计</el-menu-item>
            </el-sub-menu>

            <el-menu-item class="item ai-item" index="/ai-assistant" >
                  <el-icon><ChatLineSquare /></el-icon>
                <span>AI助手</span>
            </el-menu-item>



          </el-menu>
          
        </el-aside>

        <el-main>
          <router-view></router-view>
        </el-main>
      </el-container>

    </el-container>
  </div>
</template>

<style scoped>
.header {
  background-image: linear-gradient(to right, #00547d, #007fa4, #00aaa0, #00d072, #a8eb12);
}

.title {
  color: white;
  font-size: 40px;
  font-family: 楷体;
  line-height: 60px;
  font-weight: bolder;
}
.menuAside{
background-image: linear-gradient(to right, #174c66, #2e6f8f, #3f9c96, #49b277, #c3e66a);}
.item{
  /* 与 .menuAside 相称但更柔和的蓝青渐变 */
  background-image: linear-gradient(to right, #125a78, #2c7f99, #3fa3a0, #55b88a, #cbe87a);
}
.right_tool {
  float: right;
  line-height: 60px;
}

a {
  color: white;
  text-decoration: none;
}

.aside {
  width: 220px;
  border-right: 1px solid #ccc;
  /* 这个是右边栏分界线的宽度 */
  height: 730px;
}

/* AI助手菜单项：与侧栏一致的渐变，并带悬停与激活特效 */
.ai-item {
  margin: 8px 10px;
  border-radius: 8px;
  padding-left: 14px;
  color: #fff;
  background-image: linear-gradient(to right, #174c66, #2e6f8f, #3f9c96, #49b277, #c3e66a);
  transition: filter .18s ease, transform .12s ease, color .18s ease;
}
.ai-item .el-icon { color: #fff; transition: color .18s ease; }
.ai-item:hover { filter: brightness(1.08) saturate(1.05); transform: translateY(-1px); }
.menuAside .el-menu-item.ai-item.is-active {
  filter: brightness(1.12) saturate(1.1);
  box-shadow: 0 2px 6px rgba(0,0,0,0.12);
}
</style>
