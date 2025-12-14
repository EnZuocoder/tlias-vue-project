// /emps?name=张&gender=1&begin=2007-09-01&end=2022-09-01&page=1&pageSize=10
import request from '@/utils/request'
// 展示员工列表(带查询条件和分页)
export const listApi = (name, gender, begin, end, page, pageSize) =>
    request.get('/emps', {
        params: { name, gender, begin, end, page, pageSize }
    })
//新增员工
export const addEmpApi = (emps) =>
    request.post('/emps', emps) 

//根据id查询员工信息
export const getEmpByIdApi = (id) =>
    request.get(`/emps/${id}`)
//修改员工信息
export const editEmpApi = (emps) =>
    request.put('/emps', emps)
//删除(支持批量删除) 期望后端接收 ids=1,2,3 的查询参数
export const deleteEmpApi = (ids) =>request.delete(`/emps?ids=${ids}`)

