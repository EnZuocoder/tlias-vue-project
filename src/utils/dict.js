export const jobMap = {
  1: '班主任',
  2: '讲师',
  3: '学工主管',
  4: '教研主管',
  5: '咨询师'
}
//学科映射表
export const subjectMap = {
  1: 'Java',
  2: '前端',
  3: '大数据',
  4: 'Python',
  5: 'Go',
  6: '嵌入式'
}
//学历映射表
export const degreeMap = {
  1: '初中',
  2: '高中',
  3: '大专',
  4: '本科',
  5: '硕士',
  6: '博士'
}
/**
 * 将数字按字典映射为文本
 * @param {number|string} value 数字或可转换为数字的字符串
 * @param {Record<number,string>} map 映射字典
 * @param {string} [fallback='未知'] 兜底文案
 */
export function mapText(value, map=jobMap, fallback = '未知') {
  const key = Number(value)
  return map[key] ?? fallback
}