import request from "../utils/request";
// 班级列表(条件分页查询)
export const listApi = (params) => request.get('/clazzs', { params });
// 全部班级列表
export const listAllClassApi = () => request.get('/clazzs/list');
// 新增班级
export const addApi = (clazz) => request.post('/clazzs', clazz);
// 根据id查询班级
export const getByIdApi = (id) => request.get(`/clazzs/${id}`);
// 修改班级
export const updateApi = (clazz) => request.put('/clazzs', clazz);
// 删除班级 路径参数
export const delByIdApi = (id) => request.delete(`/clazzs/${id}`);
