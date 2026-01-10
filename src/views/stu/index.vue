<script setup>
import { onMounted, ref } from 'vue'
import { ElMessageBox, ElMessage } from 'element-plus'
import {degreeMap} from'../../utils/dict.js'//学历字典
import {listAllClassApi} from'../../api/clazz'
import { listApi as listStuApi, delByIdsApi, addApi, getByIdApi, updateApi, violationApi } from '../../api/stu'
//学生列表查询
const searchForm = ref({
  name: '',
  clazzId: '',
  degree:'',
  page:'',
  pageSize:''
})
const classOptions = ref([]) 
const total = ref(0)
// 学员列表
const studentList = ref([])
async function loadClassOptions(){
    const result = await listAllClassApi()
    if(result.code){
      classOptions.value = result.data
    }
}

// 查询学生列表
async function search(){
  const page = Number(searchForm.value.page) || 1
  const pageSize = Number(searchForm.value.pageSize) || 10
  const params = {
    name: searchForm.value.name || undefined,
    clazzId: searchForm.value.clazzId || undefined,
    degree: searchForm.value.degree || undefined,
    page,
    pageSize
  }
  const result = await listStuApi(params)
  if(result.code){
    studentList.value =result.data.rows;
    total.value = result.data.total;
  }else{
    ElMessage.error(result.msg || '查询失败')
  }
}
function clear(){
  searchForm.value = { name:'', clazzId:'', degree:'', page:1, pageSize:10 }
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





//删除学生
const showSelection = ref(false);//是否显示多选删除按钮
const selectedIds = ref([]);//选中的删除学生数组
const stuTable = ref(null);//表格引用
//删除单个学生
function deleteSingleStu(id){
  selectedIds.value = [id];
  deleteSelectedStudents();
}
//批量删除学生
//监听多选框变化
function handleSelectionChange(val){
  selectedIds.value = val.map(item => item.id);
}
//确定删除学生
function deleteSelectedStudents() {
  if (selectedIds.value.length === 0) {
    ElMessage.warning('请先选择要删除的学生');
    return;
  }
  else {
    ElMessageBox.confirm('确定要删除选中的学生吗？', '提示', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning',
    }).then(async () => {
      const result = await delByIdsApi(selectedIds.value.join(','));
      if (result.code) {
        ElMessage.success('删除成功');
        // 重新加载学生列表
        search();
        // 清空选择
        selectedIds.value = [];
        showSelection.value = false;
        if(stuTable.value)
          stuTable.value.clearSelection();
      } else {
        ElMessage.error(result.msg || '删除失败');
      }
    }).catch(() => {
      ElMessage.info('已取消删除');
    });
  }
}
//取消批量删除
function cancelallSelection() {
  showSelection.value = false;
  if(stuTable.value)
    stuTable.value.clearSelection();

}




//新增学生
const newStudent = ref({
    "name": '',
    "no": '',
    "gender": '',
    "phone": '',
    "idCard": '',
    "isCollege": '',
    "address": '',
    "degree": '',
    "graduationDate": '',
    "clazzId": ''
});
const dialogName = ref('新增学生');
const dialogVisible = ref(false);
const formRef = ref(null);
const isEditing = ref(false);
const editingId = ref(null);
// 表单校验规则
const formRules = {
  name: [{ required: true, message: '请输入姓名', trigger: 'blur' }],
  no: [{ required: true, message: '请输入学号', trigger: 'blur' }],
  phone: [{ required: true, message: '请输入手机号', trigger: 'blur' }],
  idCard: [{ required: true, message: '请输入身份证号', trigger: 'blur' }],
  degree: [{ required: true, message: '请选择最高学历', trigger: 'change' }],
  clazzId: [{ required: true, message: '请选择班级', trigger: 'change' }],
  graduationDate: [{ required: true, message: '请选择毕业日期', trigger: 'change' }],
};
function AddNewEmp(){
  dialogName.value = '新增学生';
  dialogVisible.value = true;
  // 重置表单
  newStudent.value = {
    name: '',
    no: '',
    gender: 1,
    phone: '',
    idCard: '',
    isCollege: 1,
    address: '',
    degree: '',
    graduationDate: '',
    clazzId: ''
  };
  if (formRef.value) formRef.value.clearValidate();
  isEditing.value = false;
  editingId.value = null;
}
async function submitNewStudent(){
  if (!formRef.value) return;
  const valid = await formRef.value.validate(valid => valid);
  if (!valid) return;
      const param = { ...newStudent.value };
      let result;
      if (isEditing.value && editingId.value) {
        param.id = editingId.value;
        result = await updateApi(param);
      } else {
        result = await addApi(param);
      }
      if (result && result.code) {
        ElMessage.success(isEditing.value ? '修改成功' : '新增成功');
        dialogVisible.value = false;
        search();
      } else {
        ElMessage.error(result?.msg || (isEditing.value ? '修改失败' : '新增失败'));
      }
}
function cancelNewStudent(){
  dialogVisible.value = false;
  newStudent.value = {
    name: '',
    no: '',
    gender: 1,
    phone: '',
    idCard: '',
    isCollege: 1,
    address: '',
    degree: '',
    graduationDate: '',
    clazzId: ''
  };
  if (formRef.value) formRef.value.clearValidate();
}



//修改学生信息
async function editStudent(id){
  try {
    const res = await getByIdApi(id);
    if (res && res.code) {
      const data = res.data || {};
      newStudent.value = {
        name: data.name ?? '',
        no: data.no ?? '',
        gender: data.gender ?? 1,
        phone: data.phone ?? '',
        idCard: data.idCard ?? '',
        isCollege: data.isCollege ?? 0,
        address: data.address ?? '',
        degree: data.degree ?? '',
        graduationDate: data.graduationDate ?? '',
        clazzId: data.clazzId ?? ''
      };
      dialogName.value = '修改学员';
      isEditing.value = true;
      editingId.value = data.id ?? id;
      dialogVisible.value = true;
      if (formRef.value) formRef.value.clearValidate();
    } else {
      ElMessage.error(res?.msg || '查询失败');
    }
  } catch (e) {
    ElMessage.error('查询失败，请稍后重试');
  }
}

// 违纪扣分
async function handleViolation(id){
  try{
    const { value } = await ElMessageBox.prompt('请输入违纪扣分', '提示', {
      confirmButtonText: '确认',
      cancelButtonText: '取消',
      inputPlaceholder: '请输入正整数',
      inputType: 'number',
      inputPattern: /^[1-9]\d*$/, // 仅正整数
      inputErrorMessage: '请输入正整数'
    })

    const score = parseInt(value, 10)
    if(!Number.isInteger(score) || score <= 0){
      ElMessage.error('请输入正整数')
      return
    }
    const res = await violationApi(id, score)
    if(res && res.code){
      ElMessage.success('违纪扣分已更新')
      search()
    }else{
      ElMessage.error(res?.msg || '操作失败')
    }
  }catch{
    // 用户取消
  }
}


onMounted(()=>{
  if(!searchForm.value.page) searchForm.value.page = 1
  if(!searchForm.value.pageSize) searchForm.value.pageSize = 10
  loadClassOptions()
  search()
})
</script>
<template>  
  <!-- 标题 -->
 <el-divider content-position="center" class="title-bar">
    <el-icon class="mr-6"><UserFilled /></el-icon>
    <span class="title-text">学员管理</span>
  </el-divider>
   <div style="height:10px"></div>

  <!-- 搜索栏 -->
   <div style="margin-top:10px; margin-bottom:10px;" >
    <el-form :inline="true" :model="searchForm" class="searchBar">
      <el-form-item label="姓名">
        <el-input v-model="searchForm.name" placeholder="请输入学生姓名" />
      </el-form-item>

        <el-form-item label="最高学历">
        <el-select v-model="searchForm.degree" placeholder="请选择最高学历">
          <el-option v-for="(label, value) in degreeMap" :key="value" :label="label" :value="Number(value)" />
        </el-select>
      </el-form-item><el-form-item label="班级">
        <el-select v-model="searchForm.clazzId" placeholder="请选择班级">
          <el-option v-for="item in classOptions" :key="item.id" :label="item.name" :value="item.id" />
        </el-select>
      </el-form-item>
      <el-form-item>
        <el-button type="primary" @click="search">查询</el-button>
      </el-form-item>
      <el-form-item>
        <el-button type="info" @click="clear">清空</el-button>
      </el-form-item>
    </el-form>
  </div>
  <!-- 操作按钮 -->
   <div style="margin-top:10px; margin-bottom:10px;">
    <el-button type="primary" @click="AddNewEmp"><el-icon>
        <Plus />
      </el-icon>新增学生</el-button>
      <!-- 删除相关 -->
    <el-button type="danger" v-if="!showSelection" @click="showSelection = true"><el-icon>
        <Delete />
      </el-icon>批量删除</el-button>
    <span v-else style="margin-left:10px">
      <el-button type="info" @click="cancelallSelection"><el-icon>
          <Close />
        </el-icon>取消批量删除</el-button>
      <el-button type="danger" @click="deleteSelectedStudents"><el-icon>
          <Delete />
        </el-icon>确认删除</el-button>
    </span>
  </div>


  <!-- 展示表格 -->
  <el-table :data="studentList" border style="width: 100%" ref="stuTable" @selection-change="handleSelectionChange">
    <el-table-column type="selection" v-if="showSelection" width="55" />
    <el-table-column prop="name" label="姓名" width="120" align="center" />
    <el-table-column prop="no" label="学号" width="140" align="center" />
    <el-table-column prop="clazzName" label="班级" width="180" align="center" />
    <el-table-column label="性别" width="80" align="center">
      <template #default="scope">{{ scope.row.gender==1 ? '男' : scope.row.gender==2 ? '女' : '未知' }}</template>
    </el-table-column>
    <el-table-column prop="phone" label="手机号" width="140" align="center" />
    <el-table-column label="最高学历" width="120" align="center">
      <template #default="scope">{{ degreeMap[scope.row.degree] || '未知' }}</template>
    </el-table-column>
    <el-table-column prop="violationCount" label="违纪次数" width="100" align="center" />
    <el-table-column prop="violationScore" label="违纪扣分" width="100" align="center" />
    <el-table-column prop="updateTime" label="最后修改时间" align="center" />
    <el-table-column label="操作" width="220" align="center">
      <template #default="{ row }">
        <el-button type="primary" text size="small" @click="editStudent(row.id)">编辑</el-button>
        <el-button type="warning" text size="small" @click="handleViolation(row.id)">违纪</el-button>
        <el-button type="danger" text size="small" @click="deleteSingleStu(row.id)">删除</el-button>
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

  <!-- 新增学生对话框 -->
  <el-dialog v-model="dialogVisible" :title="dialogName" width="600px" destroy-on-close>
    <el-form ref="formRef" :model="newStudent" :rules="formRules" label-width="100px">
      <el-form-item label="姓名" prop="name">
        <el-input v-model="newStudent.name" placeholder="请输入姓名" />
      </el-form-item>
      <el-form-item label="学号" prop="no">
        <el-input v-model="newStudent.no" placeholder="请输入学号" />
      </el-form-item>
      <el-form-item label="性别">
        <el-radio-group v-model="newStudent.gender">
          <el-radio :label="1">男</el-radio>
          <el-radio :label="2">女</el-radio>
        </el-radio-group>
      </el-form-item>
      <el-form-item label="手机号" prop="phone">
        <el-input v-model="newStudent.phone" placeholder="请输入手机号" />
      </el-form-item>
      <el-form-item label="身份证号" prop="idCard">
        <el-input v-model="newStudent.idCard" placeholder="请输入身份证号" />
      </el-form-item>
      <el-form-item label="是否在校">
        <el-switch v-model="newStudent.isCollege" :active-value="1" :inactive-value="0" />
      </el-form-item>
      <el-form-item label="地址">
        <el-input v-model="newStudent.address" placeholder="请输入地址" />
      </el-form-item>
      <el-form-item label="最高学历" prop="degree">
        <el-select v-model="newStudent.degree" placeholder="请选择最高学历">
          <el-option v-for="(label, value) in degreeMap" :key="value" :label="label" :value="Number(value)" />
        </el-select>
      </el-form-item>
      <el-form-item label="毕业日期" prop="graduationDate">
        <el-date-picker v-model="newStudent.graduationDate" type="date" placeholder="选择日期" value-format="YYYY-MM-DD" />
      </el-form-item>
      <el-form-item label="班级" prop="clazzId">
        <el-select v-model="newStudent.clazzId" placeholder="请选择班级">
          <el-option v-for="item in classOptions" :key="item.id" :label="item.name" :value="item.id" />
        </el-select>
      </el-form-item>
    </el-form>
    <template #footer>
      <el-button @click="cancelNewStudent">取消</el-button>
      <el-button type="primary" @click="submitNewStudent">确定</el-button>
    </template>
  </el-dialog>

</template>
<style scoped>
.title-bar{ margin: 8px 0 12px; }
 .title-text{ font-size: 18px; font-weight: 600; }
 .mr-6{ margin-right: 6px; }
 /* 让搜索栏保持单行，不新增新类名，仅使用现有 .searchBar */
 .searchBar{ display:flex; align-items:center; flex-wrap:nowrap; overflow-x:auto; }
 .searchBar :deep(.el-form-item){ margin-right:15px; margin-bottom:0; white-space:nowrap; }
 .searchBar :deep(.el-input),
 .searchBar :deep(.el-select){ width:200px; }
</style>