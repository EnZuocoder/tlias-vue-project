<script setup>
import { onMounted, ref } from 'vue'
import { ElButton, ElMessage, ElMessageBox } from 'element-plus'
import { listApi, addApi, getByIdApi, updateApi, delByIdApi } from '../../api/clazz'
//为班级指定班主任的员工列表接口
import { listAllEmpApi } from '../../api/emp'
import{subjectMap} from'../../utils/dict.js'//学科字典
//查询条件
const searchForm = ref({
  name: '',
  begin: '',
  end: '',
  page:'',
  pageSize:''
})
//列表条件分页查询
const date=ref([]);//课程时间
//班级列表
const clazzList = ref([])
const total = ref(0)
async function search(){
    const [begin, end] = Array.isArray(date.value) && date.value.length===2 ? [date.value[0], date.value[1]] : ['', '']
    const page = Number(searchForm.value.page) || 1
    const pageSize = Number(searchForm.value.pageSize) || 10
    const params = {
      name: searchForm.value.name || undefined,
      begin: begin || undefined,
      end: end || undefined,
      page,
      pageSize
    }
    const result = await listApi(params)
    if(result.code){
      clazzList.value =result.data.rows;
      total.value = result.data.total;
      searchForm.value.page = page
      searchForm.value.pageSize = pageSize
    }else{
      ElMessage.error(result.msg || '查询失败')
    }
}
function clear(){
  searchForm.value = { name: '', begin: '', end: '', page: 1, pageSize: 10 }
  date.value = []
  search()
}
function handleSizeChange(size){
  searchForm.value.pageSize = size
  searchForm.value.page = 1
  search()
}
function handleCurrentChange(page){
  searchForm.value.page = page
  search()
}
// 删除班级
async function delClazz(id){
  ElMessageBox.confirm('是否确认删除该班级？', '警告', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning'
  })
    .then(async () => {
      const res = await delByIdApi(id)
      if(res.code){
        ElMessage({ type: 'success', message: '删除班级成功' })
        search()
      }else{
        ElMessage({ type: 'error', message: res.msg || '删除失败' })
      }
    })
    .catch(() => {
      ElMessage({ type: 'info', message: '删除已取消' })
    })
}


//新增/编辑班级对话框标题
const dialogTitle = ref('新增班级')
const newClazz =ref({
  name: '',
  room: '',
  masterId: '',
  beginDate: '',
  endDate: '',
  subject: ''
})
const addDialogVisible = ref(false)
// 班主任/学科选项（若有接口可替换为接口加载）
const masterOptions = ref([]) 
async function loadMasterOptions(){
    const result = await listAllEmpApi()
    if(result.code){
      masterOptions.value = result.data
    }
}
const addRules = {
  name: [ { required: true, message: '请输入班级名称', trigger: 'blur' } ],
  room: [ { required: true, message: '请输入班级教室', trigger: 'blur' } ],
  beginDate: [ { required: true, message: '请选择开课时间', trigger: 'change' } ],
  endDate: [ { required: true, message: '请选择结课时间', trigger: 'change' } ],
  masterId: [ { required: true, message: '请选择班主任', trigger: 'change' } ],
  subject: [ { required: true, message: '请选择学科', trigger: 'change' } ],
}
const addFormRef = ref(null)

function addClazz(){
  if(addFormRef.value) addFormRef.value.clearValidate()
  newClazz.value = { name: '', room: '', masterId: '', beginDate: '', endDate: '', subject: '' }
  dialogTitle.value = '新增班级'
  addDialogVisible.value = true
}

async function saveNewClazz(){
  if(!addFormRef.value) return
  const valid = await addFormRef.value.validate(v => v)
  if(!valid){
    ElMessage.error('表单校验失败')
    return
  }
  const payload = { ...newClazz.value }
  let res
  if(payload.id){
    // 编辑更新
    res = await updateApi(payload)
  }else{
    // 新增
    res = await addApi(payload)
  }
  if(res.code){
    ElMessage.success(payload.id ? '修改班级成功' : '新增班级成功')
    addDialogVisible.value = false
    // 重载列表，回到第一页以便看到新增项（可按需调整）
    searchForm.value.page = 1
    search()
  }else{
    ElMessage.error(res.msg || '新增失败')
  }
}

// 编辑班级：复用新增对话框
async function editClazz(id){
  if(addFormRef.value) addFormRef.value.clearValidate()
  const res = await getByIdApi(id)
  if(res.code){
    const d = res.data || {}
    // 回显到同一个模型
    newClazz.value = {
      id: d.id,
      name: d.name || '',
      room: d.room || '',
      masterId: d.masterId ?? '',
      beginDate: d.beginDate || '',
      endDate: d.endDate || '',
      subject: d.subject ?? ''
    }
    dialogTitle.value = '修改班级'
    addDialogVisible.value = true
  }else{
    ElMessage.error(res.msg || '查询班级详情失败')
  }
}
  


onMounted(()=>{
  if(!searchForm.value.page) searchForm.value.page = 1
  if(!searchForm.value.pageSize) searchForm.value.pageSize = 10
  search()
  loadMasterOptions()//加载班主任列表
})
</script>

<template>
<!-- 标题 -->
  <el-divider content-position="center" class="title-bar">
    <el-icon class="mr-6"><Grid /></el-icon>
    <span class="title-text">班级管理</span>
  </el-divider>
   <div style="height:10px"></div>

  <!-- 搜索栏 -->
  <div class="searchbar">
    <el-form :inline="true" :model="searchForm" class="search-form">
      <el-form-item label="班级名称">
        <el-input v-model="searchForm.name" placeholder="请输入班级名称" />
      </el-form-item>
      
      <el-form-item label="结课时间">
        <el-date-picker v-model="date" type="daterange" range-separator="到" start-placeholder="开始日期"
          end-placeholder="结束日期" value-format="YYYY-MM-DD" /> <!-- 注意都是大写 -->
      </el-form-item>
      <el-form-item>
        <el-button type="primary" @click="search">查询</el-button>
      </el-form-item>
      <el-form-item>
        <el-button type="info" @click="clear">清空</el-button>
      </el-form-item>
    </el-form>
  </div>
  <div><ElButton type="success" @click="addClazz">新增班级</ElButton></div>

  <!-- 展示表格 -->
  <el-table :data="clazzList" border style="width: 100%" >
    <el-table-column type="index" label="序号" width="80" align="center" />
    <el-table-column prop="name" label="班级名称" width="200" align="center" />
    <el-table-column prop="room" label="班级教室" width="120" align="center" />
    <el-table-column prop="masterName" label="班主任" width="140" align="center" />
    <el-table-column prop="beginDate" label="开课时间" width="140" align="center" />
    <el-table-column prop="endDate" label="结课时间" width="140" align="center" />
    <el-table-column prop="status" label="状态" width="120" align="center" />
    <el-table-column prop="updateTime" label="最后修改时间" align="center" />
    <el-table-column label="操作" width="200" align="center">
      <template #default="scope">
        <el-button type="primary" text size="small" @click="editClazz(scope.row.id)"><el-icon><Edit /></el-icon> 编辑</el-button>
        <el-button type="danger" text size="small" @click="delClazz(scope.row.id)"><el-icon><Delete /></el-icon> 删除</el-button>
      </template>
    </el-table-column>
  </el-table>
  <!-- 分页 -->
  <div style="margin-top:12px; display:flex; justify-content: space-between; align-items:center;">
    <div>共 {{ total }} 条</div>
    <el-pagination
      background
      layout="sizes, prev, pager, next, jumper"
      :total="total"
      v-model:current-page="searchForm.page"
      v-model:page-size="searchForm.pageSize"
      :page-sizes="[5,10,20,50]"
      @size-change="handleSizeChange"
      @current-change="handleCurrentChange"
    />
  </div>


  <!-- 新增班级对话框 -->
  <el-dialog v-model="addDialogVisible" :title="dialogTitle" width="560">
    <el-form :model="newClazz" :rules="addRules" ref="addFormRef" status-icon>
      <el-form-item label="班级名称" :label-width="'90px'" prop="name">
        <el-input v-model="newClazz.name" placeholder="请输入班级名称" />
      </el-form-item>
      <el-form-item label="班级教室" :label-width="'90px'" prop="room">
        <el-input v-model="newClazz.room" placeholder="请输入班级教室" />
      </el-form-item>
      <el-form-item label="开课时间" :label-width="'90px'" prop="beginDate">
        <el-date-picker v-model="newClazz.beginDate" type="date" value-format="YYYY-MM-DD" placeholder="请选择开课时间" />
      </el-form-item>
      <el-form-item label="结课时间" :label-width="'90px'" prop="endDate">
        <el-date-picker v-model="newClazz.endDate" type="date" value-format="YYYY-MM-DD" placeholder="请选择结课时间" />
      </el-form-item>
      <el-form-item label="班主任" :label-width="'90px'" prop="masterId">
        <el-select v-model="newClazz.masterId" placeholder="请选择班主任" filterable>
          <el-option v-for="m in masterOptions" :key="m.id" :label="m.name" :value="m.id" />
        </el-select>
      </el-form-item>
      <el-form-item label="学科" :label-width="'90px'" prop="subject">
        <el-select v-model="newClazz.subject" placeholder="请选择学科">
          <el-option
                v-for="v in Object.keys(subjectMap)"
                :key="v"
                :label="subjectMap[v]"
                :value="Number(v)"
              />
        </el-select>
      </el-form-item>
    </el-form>
    <template #footer>
      <div class="dialog-footer">
        <el-button @click="addDialogVisible=false">取消</el-button>
        <el-button type="primary" @click="saveNewClazz">保存</el-button>
      </div>
    </template>
  </el-dialog>


</template>

<style scoped>
.title-bar{ margin: 8px 0 12px; }
 .title-text{ font-size: 18px; font-weight: 600; }
 .mr-6{ margin-right: 6px; }
 .mr-10{ margin-right: 10px; }
 .w-220{ width: 220px; }
 .w-160{ width: 160px; }
 .query-bar{ margin: 10px 0; }
 #addButton{ margin: 12px 0; }
</style>