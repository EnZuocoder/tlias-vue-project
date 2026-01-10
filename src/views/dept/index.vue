<!-- 完成部门管理 -->
<script setup>
import {onMounted, ref} from 'vue'
import { listApi ,addApi , getByIdApi , updateApi , delApi } from '../../api/dept'
import { ElMessage ,ElMessageBox} from 'element-plus';
//部门列表展示
const deptList = ref([]);
async function serach()
{
  const result=await listApi();
  if(result.code)
  deptList.value=result.data;
}
onMounted(()=>{
 serach();
})
// 新增部门对话框相关
const operateTitle=ref('')
const dialogFormVisible = ref(false);
const dept=ref({
  name:''
});
//校验用户输入
// 定义校验规则
const rules = {
  name: [
    { required: true, message: '请输入部门名称', trigger: 'blur' },  //blur表示失去焦点时触发校验
    { min: 2, max: 10, message: '长度需在 2-10 个字符', trigger: 'blur' },
  ]
};
const deptFormRef=ref(null);//获取表单对象引用,判断是否校验通过
function addDept()
{
  //清空校验
  if(deptFormRef.value)
    deptFormRef.value.clearValidate();
  //清空dept对象 
  dept.value={
    name:''
  };
  operateTitle.value='新增部门'//设置对话框标题
  dialogFormVisible.value=true;//显示对话框
 
}
async function save()
{
  if(!deptFormRef.value) //没有绑定上表单对象上也返回,不过不可能发生
    return;
    //valid表示绑定的表单对象基于rules规则的校验是否都通过
  const valid=await deptFormRef.value.validate(valid => valid); //等价于(valid)=>{return valid;}
  //校验失败返回
  if (!valid) {
    ElMessage({ message: '表单校验失败', type: 'error', duration: 2000 })
    return
  }
  let result;
  //校验成功,调用新增部门的接口
  if(dept.value.id)
  { 
    //调用修改部门接口
    result = await updateApi(dept.value);
  }
  else{
    //调用新增部门接口
    result = await addApi(dept.value);
  }
  if(result.code==1)
  {
    //显示查询成功,使用el-message
    ElMessage({
      message: dept.value.id ? '修改部门成功' : '新增部门成功',
      type: 'success',
      duration: 2000 
    });
    await serach();
    dialogFormVisible.value=false;
  }
  else{
    ElMessage({
      message: result.msg,  
      type: 'error',
      duration: 2000 
    });
  }
}

//编辑部门
async function edit(id)
{ 
  //清空校验
  if(deptFormRef.value)
    deptFormRef.value.clearValidate();
  operateTitle.value='修改部门'//设置对话框标题
  dialogFormVisible.value=true;//显示对话框
  //根据id查询部门信息,并显示在对话框中
  dept.value= (await getByIdApi(id)).data;//注意此时,与输入框对象绑定的dept对象从原来只有一个name属性变成了有完整的dept对象包含应该有的所有属性
}

//删除部门
async function del(id)
{
  ElMessageBox.confirm(
    '是否确认删除该部门？',
    '警告',
    {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning',
    }
  )
  // 用户点击了确定的成功回调
    .then(async () => {
      const result=await delApi(id);
      if(result.code)
      {
      ElMessage({
        type: 'success',
        message: '删除部门成功',
      });
       serach();
      }
      else{
        ElMessage({
          type: 'error',
          message: result.msg,
        });
      }
      
    })
     // 用户点击了取消的回调
    .catch(() => {
      ElMessage({
        type: 'info',
        message: '删除已取消',
      })
    })
}

</script>
<template>

  <el-divider content-position="center" class="title-bar">
    <el-icon class="mr-6"><OfficeBuilding /></el-icon>
    <span class="title-text">部门管理</span>
  </el-divider>
  <!-- 新增部门按钮 -->
  <el-button type="primary" id="addButton" @click="addDept"><el-icon><Plus /></el-icon>新增部门</el-button>  
  <!-- 展示的表格 -->
  <el-table :data="deptList" border style="width: 100%" >
    <el-table-column type="index" label="序号" width="100" align="center"/>
    <el-table-column prop="name" label="部门名称" width="180" align="center"/>
    <el-table-column prop="updateTime" label="最后操作时间"align="center" />
    <el-table-column label="操作" width="200">
    <template #default="scope">
      <el-button type="primary" text size="small" @click="edit(scope.row.id)">
        <el-icon><Edit /></el-icon> 编辑
      </el-button>
      <el-button type="danger" text size="small" @click="del(scope.row.id)">
        <el-icon><Delete /></el-icon> 删除
      </el-button>
    </template>
    </el-table-column>
</el-table>


<!-- 新增部门对话框 -->
<el-dialog v-model="dialogFormVisible" :title="operateTitle" width="500">
    <el-form :model="dept" :rules="rules" ref="deptFormRef" status-icon>
      <el-form-item label="部门名称" :label-width="'80px'" prop="name"> <!-- 这里的prop是和rules中同名的字段name对应的,会校验此处输入是否满足name处的校验规则 -->
        <el-input v-model="dept.name"/> 
      </el-form-item>
    </el-form>
    <template #footer>
      <div class="dialog-footer">
        <el-button @click="dialogFormVisible = false">取消</el-button>
        <el-button type="primary" @click="save">
          确认
        </el-button>
      </div>
    </template>
  </el-dialog>
</template>
<style scoped>
 #addButton{
    margin-top: 15px;
    margin-bottom: 15px;
 }

 .title-bar{ margin: 8px 0 12px; }
 .title-text{ font-size: 18px; font-weight: 600; }
 .mr-6{ margin-right: 6px; }

</style>
