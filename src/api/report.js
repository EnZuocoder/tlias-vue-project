import request from '@/utils/request'

// 员工性别统计
export function getEmpGenderData() {
	return request.get('/report/empGenderData')
}

// 员工职位统计
export function getEmpJobData() {
  return request.get('/report/empJobData')
}

// 学员学历统计
export function getStudentDegreeData() {
	return request.get('/report/studentDegreeData')
}

// 班级人数统计
export function getStudentCountData() {
	return request.get('/report/studentCountData')
}

