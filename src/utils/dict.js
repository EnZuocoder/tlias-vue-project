const jobMap = {
  1: '班主任',
  2: '讲师',
  3: '学工主管',
  4: '教研主管',
  5: '咨询师'
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