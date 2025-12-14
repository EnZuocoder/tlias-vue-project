import request from "../utils/request";
//展示部门列表
export const listApi=()=>request.get('/depts')
//新增部门
export const addApi=(dept)=>request.post('/depts',dept) 
//根据id查询部门信息
export const getByIdApi=(id)=>request.get(`/depts/${id}`)
//修改部门信息
export const updateApi=(dept)=>request.put('/depts',dept)
//删除部门
export const delApi=(id)=>request.delete(`/depts?id=${id}`)
