<script setup>
import { ElTableColumn ,ElMessage} from 'element-plus';
import { ElMessageBox } from 'element-plus'
import { ref, watch, onMounted } from 'vue'
import { mapText } from '../../utils/dict';
import { listApi, addEmpApi,getEmpByIdApi,editEmpApi,deleteEmpApi } from '../../api/emp';
import { listApi as deptListApi } from '../../api/dept';
// 查询表单（未提交的条件）
const searchForm = ref({
  name: '',
  gender: '',
  date: [],
  begin: '',
  end: ''
})
// 实际请求使用的查询参数（只有点击“查询”后才更新）
const queryParams = ref({
  name: '',
  gender: '',
  begin: '',
  end: ''
})
const EmpList = ref([]);
const empTable = ref(null); // 表格引用用于清空选择
//分页相关数据
const currentPage = ref(1); /* 当前页码 */
const pageSize = ref(10); /* 每页条数 */
const total = ref(1); /* 总条数 */
// 根据条件查询员工列表
async function search() {
  const Result = await listApi(
    queryParams.value.name,
    queryParams.value.gender,
    queryParams.value.begin,
    queryParams.value.end,
    currentPage.value,
    pageSize.value
  );
  if (Result.code) {
    EmpList.value = Result.data.rows;
    total.value = Result.data.total;
  }
}
// 清空搜索条件
function clear() {
  searchForm.value = {
    name: '',
    gender: '',
    date: [],
    begin: '',
    end: ''
  }
  //重置分页
  pageSize.value = 10;
  currentPage.value = 1;
  // 清空不自动查询；清空已应用的参数
  queryParams.value = { name: '', gender: '', begin: '', end: '' }
}
// 点击“查询”时应用条件并查询
function applySearch() {
  queryParams.value = {
    name: searchForm.value.name,
    gender: searchForm.value.gender,
    begin: searchForm.value.begin,
    end: searchForm.value.end
  }
  currentPage.value = 1;
  search();
}
// 当每页展示的记录数改变时触发
const handleSizeChange = (val) => {
  pageSize.value = val;
  currentPage.value = 1;
  search();
}
// 当当前页码改变时触发
const handleCurrentChange = (val) => {
  currentPage.value = val;
  search();
}
//watch监听写法监听,date的值,如果发生变化,就重新赋值begin和end,比上面点击查询按钮才更新begin,end更智能
watch(() => searchForm.value.date, (newValue) => {
  // 新的值必须是数组且长度为2才赋值
  if (Array.isArray(newValue) && newValue.length === 2) {
    searchForm.value.begin = newValue[0];
    searchForm.value.end = newValue[1];
  } else {
    searchForm.value.begin = '';
    searchForm.value.end = '';
  }
})




//新增员工:
const dialogFormVisible = ref(false);
const dialogName = ref();
const newEmp = ref({
  "image": "",
  "username": "",
  "name": "",
  "gender": "",
  "job": "",
  "entryDate": "",
  "deptId": "",
  "phone": "",
  "salary": "",
  "exprList": []
});
// 独立管理工作经历的日期范围，避免在提交给后端时夹带 date 字段
const exprDates = ref([]);
const deptList=ref([]);//预加载部门列表
const empForm=ref(null);//表单引用
const token=ref('');//上传头像需要用到token


// 点击新增员工按钮触发
function AddNewEmp()
{
  dialogFormVisible.value=true;
  dialogName.value='新增员工';
  //清空newEmp对象
  newEmp.value={
    "image": "",
    "username": "",
    "name": "",
    "gender": "",
    "job": "",
    "entryDate": "",
    "deptId": "",
    "phone": "",
    "salary": "",
    "exprList": []
  }
  // 同步清空工作经历日期
  exprDates.value = [];
  //重置表单校验状态
  empForm.value.resetFields();
}
//点击保存按钮触发
async function save()
{
  //表单校验
  const valid=await empForm.value.validate(valid => valid);
  if(!valid){
    ElMessage.error('请输入完整信息');
    return;
  }
  else{
    dialogFormVisible.value=false;
    // 直接提交 newEmp，exprList 中已不包含 date 字段
    let result = newEmp.value.id ? await editEmpApi(newEmp.value) : await addEmpApi(newEmp.value);
    if(result.code)
    {
      ElMessage.success('操作成功!');
      search();
    }
    else{
      ElMessage.error(result.message);
    }
  }
}
//上传头像相关函数
function handleAvatarSuccess(response) 
{

  if(response.code==1)
  {
    newEmp.value.image=response.data;
  }
}
//上传前的图片格式和大小校验
function beforeAvatarUpload(file)
{
  const isJPGorPNG = file.type === 'image/jpeg' || file.type === 'image/png';
  const isLt2M = file.size / 1024 / 1024 < 2;

  if (!isJPGorPNG) {
    ElMessage.error('上传头像图片只能是 JPG 或 PNG 格式!');
  }
  if (!isLt2M) {
    ElMessage.error('上传头像图片大小不能超过 2MB!');
  }
  return isJPGorPNG && isLt2M;
}
function loadToken()
{
  const loginUser=JSON.parse(localStorage.getItem('loginUser'))
  if(loginUser&&loginUser.token){
    token.value=loginUser.token
  }
}

// 添加工作经历
function AddEmpExpr()
{
  newEmp.value.exprList.push({
    "company":"",
    "job":"",
    "begin":"",
    "end":""
  });
  // 为对应的经历初始化一个日期范围容器
  exprDates.value.push([]);
}
//删除工作经历
function DeleteEmpExpr(index)
{
  newEmp.value.exprList.splice(index,1);
  exprDates.value.splice(index,1);
}
// 监听独立的日期数组，实时回填 begin/end
watch(() => exprDates.value, (newVal) => {
  if (Array.isArray(newVal) && Array.isArray(newEmp.value.exprList)) {
    newEmp.value.exprList.forEach((expr, idx) => {
      const d = newVal[idx];
      if (Array.isArray(d) && d.length === 2) {
        expr.begin = d[0];
        expr.end = d[1];
      } else {
        expr.begin = '';
        expr.end = '';
      }
    });
  }
}, { deep: true })

//表单校验:
const rules = ref({
  username: [
    { required: true, message: '请输入用户名', trigger: 'blur' },
    { min: 2, max: 20, message: '用户名长度应在2到20个字符之间', trigger: 'blur' }
  ],
  name: [
    { required: true, message: '请输入姓名', trigger: 'blur' },
    { min: 2, max: 10, message: '姓名长度应在2到10个字符之间', trigger: 'blur' }
  ],
  gender: [
    { required: true, message: '请选择性别', trigger: 'change' }
  ],
  phone: [
    { required: true, message: '请输入手机号', trigger: 'blur' },
    { pattern: /^1[3-9]\d{9}$/, message: '请输入有效的手机号', trigger: 'blur' }
  ]
});
// 编辑员工信息
async function edit(id)
{
  dialogFormVisible.value=true;
  dialogName.value='编辑员工';
  //如果表单渲染过记得重置表单校验状态
  if(empForm.value)
  {
    empForm.value.resetFields();
  }
  const result= await getEmpByIdApi(id);
  if(result.code)
  {
    newEmp.value=result.data;
    // 将 begin/end 同步到独立的日期数组
    exprDates.value = Array.isArray(newEmp.value.exprList)
      ? newEmp.value.exprList.map(expr => (expr.begin && expr.end ? [expr.begin, expr.end] : []))
      : [];
  }
}


//删除员工
const showSelection = ref(false);  // 是否显示多选框
const selectedIds = ref([]); // 选中的员工ID数组
async function deleteSingleEmp(id)
{
  ElMessageBox.confirm(
    '是否确认删除该员工？',
    '警告',
    {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning',
    }
  )
  // 用户点击了确定的成功回调
    .then(async () => {
      const result=await deleteEmpApi([id]);
      if(result.code)
      {
      ElMessage({
        type: 'success',
        message: '删除员工成功',
      });
       search();
      }
      else{
        ElMessage({
          type: 'error',
          message: result.msg,
        });
      }
      
    })
    // 用户点击取消时，避免控制台 Promise 拒绝报错
    .catch(() => {
      ElMessage({
        type: 'info',
        message: '已取消删除',
      });
    })
}
//批量删除员工
async function deleteSelectedEmps()
{
  ElMessageBox.confirm(
    `是否确认删除选中的${selectedIds.value.length}名员工？`,
    '警告',
    {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning',
    }
  )
  // 用户点击了确定的成功回调
    .then(async () => {
      const result=await deleteEmpApi(selectedIds.value);
      if(result.code)
      {
      ElMessage({
        type: 'success',
        message: '批量删除员工成功',
      });
       //清空已选择的id
       selectedIds.value=[];
       showSelection.value=false;
       search();
      }
      else{
        ElMessage({
          type: 'error',
          message: result.msg,
        });
      }
      
    })
    // 用户点击取消时，避免控制台 Promise 拒绝报错
    .catch(() => {
      ElMessage({
        type: 'info',
        message: '已取消删除',
      });
    })
}
// 取消批量删除并清空选择状态
function cancelallSelection() {
  showSelection.value = false;
  selectedIds.value = [];
  // 清空表格的选择状态
  if (empTable.value) {
    empTable.value.clearSelection();
  }
}
// 当表格中的选择状态改变时触发函数
function handleSelectionChange(val) {
  // val是选中的数组
  selectedIds.value = val.map(item => item.id);
  
}

// 加载与处理
//预加载部门列表
async function loadingDeptList()
{
  const result= await deptListApi();
  if(result.code)
  deptList.value=result.data;
}
onMounted(() => {
  // 初始加载用空的 queryParams
    search();
    //加载部门列表
    loadingDeptList();
    //加载上传头像函数的token
    loadToken();
})

</script>
<template>

  <!-- 标题 -->
  <el-divider content-position="center" class="title-bar">
    <el-icon class="mr-6"><UserFilled /></el-icon>
    <span class="title-text">员工管理</span>
  </el-divider>
  <!-- 空一行 -->
  <div style="height:10px"></div>
  <!-- 搜索栏 -->
  <div class="searchbar">
    <el-form :inline="true" :model="searchForm" class="search-form">
      <el-form-item label="姓名">
        <el-input v-model="searchForm.name" placeholder="请输入姓名" />
      </el-form-item>
      <el-form-item label="性别">
        <el-select v-model="searchForm.gender" placeholder="请选择">
          <el-option label="男" :value="1" />
          <el-option label="女" :value="2" />
        </el-select>
      </el-form-item>
      <el-form-item label="入职日期">
        <el-date-picker v-model="searchForm.date" type="daterange" range-separator="到" start-placeholder="开始日期"
          end-placeholder="结束日期" value-format="YYYY-MM-DD" format="YYYY-MM-DD"/> <!-- 注意都是大写 -->
      </el-form-item>
      <el-form-item>
        <el-button type="primary" @click="applySearch">查询</el-button>
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
      </el-icon>新增员工</el-button>

      <!-- 删除相关 -->

      <!-- 没有showselection就显示批量删除按钮,有就显示取消和确认删除按钮 -->
    <el-button type="danger" v-if="!showSelection" @click="showSelection = true"><el-icon>
        <Delete />
      </el-icon>批量删除</el-button>
    <span v-else style="margin-left:10px">
      <el-button type="info" @click="cancelallSelection"><el-icon>
          <Close />
        </el-icon>取消批量删除</el-button>


      <el-button type="danger" @click="deleteSelectedEmps"><el-icon>
          <Delete />
        </el-icon>确认删除</el-button>
    </span>
  </div>

  <!-- 员工列表 -->
  <el-table :data="EmpList" border style="width: 100%" @selection-change="handleSelectionChange" ref="empTable">
    <el-table-column type="selection" v-if="showSelection" width="55" />
    <el-table-column prop="name" label="姓名" width="100px" align="center" />
    <el-table-column label="性别" width="80px" align="center">
      <template #default="scope">
        {{ scope.row.gender == 1 ? '男' : '女' }}
      </template>
    </el-table-column>
    <el-table-column prop="image" label="头像" align="center">
      <template #default="scope">
        <el-image :src="scope.row.image" style="height:40px" />
      </template>
    </el-table-column>
    <el-table-column prop="deptName" label="所属部门" width="100px" align="center" />
    <el-table-column label="职位" width="80px" align="center">
      <template #default="scope">
        {{ mapText(scope.row.job) }}
      </template>
    </el-table-column>
    <el-table-column prop="entryDate" label="入职日期" width="170px" align="center" />
    <el-table-column prop="updateTime" label="最后操作时间" width="170px" align="center" />
    <el-table-column label="操作" width="170px" align="center">
      <template #default="scope">
        <div><el-button type="primary" size="small" @click="edit(scope.row.id)">
            <el-icon>
              <Edit />
            </el-icon> 编辑
          </el-button>
          <el-button type="danger" size="small" @click="deleteSingleEmp(scope.row.id)">
            <el-icon>
              <Delete />
            </el-icon> 删除
          </el-button>
        </div>
      </template>
    </el-table-column>
  </el-table>
  <!-- 分页条 -->
  <div style="margin-top:15px; text-align:right">
    <el-pagination v-model:current-page="currentPage" v-model:page-size="pageSize" :page-sizes="[5, 10, 20, 30, 40]"
      layout="total, sizes, prev, pager, next, jumper" :disabled="false" :background="true" :total="total"
      @size-change="handleSizeChange" @current-change="handleCurrentChange" />
  </div>

  <!-- 新增员工或者编辑员工对话框 -->
  <el-dialog v-model="dialogFormVisible" :title="dialogName" width="600">
    <el-form :model="newEmp" :rules="rules" ref="empForm" >
      <!-- 第一行 -->
      <el-row :gutter="20" class="rowInDialog" >
        <el-col :span="12">
          <el-form-item label="用户名" label-width="80px" prop="username">
            <el-input v-model="newEmp.username" placeholder="请输入用户名"/>
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item label="姓名" label-width="80px" prop="name">
            <el-input v-model="newEmp.name" placeholder="请输入姓名" />
          </el-form-item>
        </el-col>
      </el-row>
      <!-- 第二行 -->
      <el-row :gutter="20" class="rowInDialog">
        <el-col :span="12">
          <el-form-item label="性别" label-width="80px" prop="gender">
            <el-select v-model="newEmp.gender" placeholder="请选择">
              <el-option label="男" :value="1" />
              <el-option label="女" :value="2" />
            </el-select>
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item label="手机号" label-width="80px" prop="phone">
            <el-input v-model="newEmp.phone" placeholder="请输入手机号" />
          </el-form-item>
        </el-col>
      </el-row>

      <!-- 第三行 职位,薪资 -->
      <el-row :gutter="20" class="rowInDialog">
        <el-col :span="12">
          <el-form-item label="职位" label-width="80px" >
            <el-select v-model="newEmp.job" placeholder="请选择职位">
              <el-option
                v-for="v in [1,2,3,4,5]"
                :key="v"
                :label="mapText(v)"
                :value="v"
              />
            </el-select>
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item label="薪资" label-width="80px" >
            <el-input v-model="newEmp.salary" placeholder="请输入薪资" />
          </el-form-item>
        </el-col>
      </el-row> 

      <!-- 第四行 所属部门,入职日期 -->
      <el-row :gutter="20" class="rowInDialog">
        <el-col :span="12">
          <el-form-item label="所属部门" label-width="80px" >

            <el-select v-model="newEmp.deptId" placeholder="请选择所属部门">
              <el-option
                v-for="v in deptList"
                :key="v.id"
                :label="v.name"
                :value="v.id"
              />
            </el-select>
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item label="入职日期" label-width="80px" >
            <el-date-picker v-model="newEmp.entryDate" type="date" placeholder="选择入职日期"
              value-format="YYYY-MM-DD" />
          </el-form-item>
        </el-col>
      </el-row>

      <!-- 第五行 头像单独成行需要上传图片 -->
      <el-row :gutter="20" class="rowInDialog">
        <el-col :span="24">
          <el-form-item label="头像" label-width="80px">
              <el-upload
                class="avatar-uploader" 
                action="/api/upload"
                :headers="{'token': token}"
                :show-file-list="false" 
                :on-success="handleAvatarSuccess" 
                :before-upload="beforeAvatarUpload">
                <el-image v-if="newEmp.image" :src="newEmp.image" fit="cover" style="width:80px; height:80px" />
                <el-icon v-else class="avatar-uploader-icon">
                <Plus />
              </el-icon>
            </el-upload>
          </el-form-item>
        </el-col>
      </el-row>
      <!-- 第六行添加工作经历按钮 -->
      <el-row class="rowInDialog">
        <el-col :span="24" width="80px">
          <el-form-item label="工作经历" label-width="80px">
            <el-button type="success" size="small" @click="AddEmpExpr">
              <el-icon>
                <Plus />
              </el-icon> 添加工作经历
            </el-button>
            </el-form-item>
        </el-col>
      </el-row>

      <!-- 接下来的行是工作经历列表 -->
       <el-row class="rowInDialog" 
         v-for="(expr,index) in newEmp.exprList" :key="index" :gutter="5" >
             <el-col :span="11">
               <el-form-item label="时间" label-width="40px">
                <el-date-picker v-model="exprDates[index]" type="daterange" size="small" 
                range-separator="到" 
                start-placeholder="开始日期"
                end-placeholder="结束日期" 
                value-format="YYYY-MM-DD"
                format="YYYY-MM-DD" />
               </el-form-item>
              </el-col>
            <el-col :span="7">
             <el-form-item label="公司" label-width="40px">
              <el-input v-model="expr.company" placeholder="请输入公司名称" size="small" style="width:100%" />
             </el-form-item>
            </el-col>

            <el-col :span="6">
             <el-form-item label="职位" label-width="40px">
              <el-input v-model="expr.job" placeholder="请输入职位" size="small" style="width:100%" />
             </el-form-item>
            </el-col>

            <el-col >
             <el-form-item class="expr-actions">
              <el-button type="danger" size="small" @click="DeleteEmpExpr(index)">
                <el-icon>
                  <Delete />
                </el-icon> 删除
              </el-button>
             </el-form-item>
            </el-col>

       </el-row>





      </el-form>
      <template #footer>
        <div class="dialog-footer">
          <el-button @click="dialogFormVisible = false">取消</el-button>
          <el-button type="primary" @click="save">
            保存
          </el-button>
        </div>
      </template>
  </el-dialog>


</template>
<style scoped>
/* 标题样式 */
.title-bar{ margin: 8px 0 12px; }
 .title-text{ font-size: 18px; font-weight: 600; }
 .mr-6{ margin-right: 6px; }
.search-form {
  margin-top: 10px;
  display: flex;
}
.avatar-uploader{
  height: 80px;
  width:  80px;
  border: 1px dashed var(--el-border-color);
  border-radius: 6px;
  cursor: pointer;
  position: relative;
  overflow: hidden;
  transition: var(--el-transition-duration-fast);
}


.avatar-uploader-icon {
  font-size: 28px;
  color: #8c939d;
  width: 80px;
  height: 80px;
  text-align: center;
}

.avatar-uploader:hover {
  border-color: var(--el-color-primary);
}
</style>