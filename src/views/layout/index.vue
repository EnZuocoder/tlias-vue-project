<script setup>
</script>
<template>
  <div class="common-layout">
    <el-container>
      <!-- Header 区域 -->
      <el-header class="header">
        <span class="title">Tlias智能学习辅助系统</span>
        <span class="right_tool">
          <a href="">
            <el-icon>
              <EditPen />
            </el-icon> 修改密码 &nbsp;&nbsp;&nbsp; | &nbsp;&nbsp;&nbsp;
          </a>
          <a href="/login">
            <el-icon>
              <SwitchButton />
            </el-icon> 退出登录
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
              <el-menu-item class="item"  index="/log"><el-icon><HelpFilled /></el-icon>日志信息统计</el-menu-item>
            </el-sub-menu>
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
  background-color: #aac7d6;
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
</style>
