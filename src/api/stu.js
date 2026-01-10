import request from "../utils/request";

// 学员分页查询
export const listApi = (params) => request.get('/students', { params });
// 预留：按需扩展增删改查
export const getByIdApi = (id) => request.get(`/students/${id}`);
export const addApi = (stu) => request.post('/students', stu);
export const updateApi = (stu) => request.put('/students', stu);
export const delByIdsApi = (ids) => request.delete(`/students/${ids}`);
// 学员违纪扣分
export const violationApi = (id, score) => request.put(`/students/violation/${id}/${score}`);
