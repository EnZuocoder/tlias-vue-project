<script setup>
import { ref, computed, onMounted, onBeforeUnmount, nextTick } from 'vue'
import { ElMessage } from 'element-plus'
import * as echarts from 'echarts'
import { getStudentDegreeData, getStudentCountData } from '@/api/report'

// 学历统计（饼图）
const degLoading = ref(false)
const degChartRef = ref(null)
let degChartInstance = null
const degreeData = ref([])
const updatedAtDeg = ref('')

const degTotal = computed(() =>
  degreeData.value.reduce((sum, item) => sum + (Number(item?.value) || 0), 0)
)

function calcDegPercent(value) {
  const t = degTotal.value || 0
  if (!t) return 0
  return Math.round((Number(value || 0) / t) * 100)
}

async function fetchDegreeData() {
  try {
    degLoading.value = true
    const res = await getStudentDegreeData()
    if (res && res.code === 1) {
      degreeData.value = Array.isArray(res.data) ? res.data.map(d => ({ name: d.name, value: Number(d.value || 0) })) : []
      updatedAtDeg.value = new Date().toLocaleString()
      // 关闭 loading 后再渲染并 resize，避免容器尺寸为 0
      degLoading.value = false
      await nextTick()
      renderDegreeChart()
      degChartInstance && degChartInstance.resize()
    } else {
      ElMessage.error(res?.msg || '学历数据加载失败')
    }
  } catch (e) {
    ElMessage.error('请求失败，请稍后重试')
  } finally {
    degLoading.value = false
  }
}

function renderDegreeChart() {
  if (!degChartRef.value) return
  if (!degChartInstance) {
    degChartInstance = echarts.init(degChartRef.value)
  }
  const colors = ['#3BA272', '#E6A23C', '#909399', '#5470C6', '#9A60B4']
  const option = {
    tooltip: { trigger: 'item' },
    legend: { bottom: 0, itemGap: 16 },
    color: colors,
    graphic: [
      {
        type: 'text', left: 'center', top: 'center',
        style: { text: `总人数\n${degTotal.value}`, textAlign: 'center', fill: '#606266', fontSize: 16, fontWeight: 600 }
      }
    ],
    series: [
      {
        name: '学历占比', type: 'pie', center: ['50%', '45%'], radius: ['55%', '78%'], avoidLabelOverlap: true,
        label: { show: true, formatter: '{b}: {d}%', fontSize: 14 },
        labelLine: { length: 15, length2: 10 },
        data: degreeData.value.map(d => ({ name: d.name, value: d.value }))
      }
    ]
  }
  degChartInstance.setOption(option)
}

// 班级人数统计（条形图）
const clsLoading = ref(false)
const clsChartRef = ref(null)
let clsChartInstance = null
const clazzData = ref([]) // { name, value }
const updatedAtCls = ref('')

async function fetchClazzData() {
  try {
    clsLoading.value = true
    const res = await getStudentCountData()
    if (res && res.code === 1 && res.data) {
      const list = Array.isArray(res.data?.clazzList) ? res.data.clazzList : []
      const vals = Array.isArray(res.data?.dataList) ? res.data.dataList : []
      clazzData.value = list.map((name, idx) => ({ name, value: Number(vals[idx] || 0) }))
      updatedAtCls.value = new Date().toLocaleString()
      clsLoading.value = false
      await nextTick()
      renderClazzChart()
      clsChartInstance && clsChartInstance.resize()
    } else {
      ElMessage.error(res?.msg || '班级数据加载失败')
    }
  } catch (e) {
    ElMessage.error('请求失败，请稍后重试')
  } finally {
    clsLoading.value = false
  }
}

function renderClazzChart() {
  if (!clsChartRef.value) return
  if (!clsChartInstance) {
    clsChartInstance = echarts.init(clsChartRef.value)
  }
  const option = {
    tooltip: { trigger: 'axis' },
    // 调整边距以让图更居中，并保证轴名完整显示
    grid: { left: 80, right: 72, top: 24, bottom: 64, containLabel: true },
    xAxis: {
      type: 'value',
      name: '人数',
      nameLocation: 'end',
      nameGap: 28,
      nameRotate: 0,
      nameTextStyle: { color: '#606266' }
    },
    yAxis: {
      type: 'category',
      data: clazzData.value.map(d => d.name),
      axisLabel: { interval: 0, margin: 10 }
    },
    series: [
      {
        name: '人数', type: 'bar', data: clazzData.value.map(d => d.value),
        itemStyle: { color: '#409EFF' },
        label: { show: true, position: 'right' }
      }
    ]
  }
  clsChartInstance.setOption(option)
}

function handleResize() {
  degChartInstance && degChartInstance.resize()
  clsChartInstance && clsChartInstance.resize()
}

onMounted(() => {
  fetchDegreeData()
  fetchClazzData()
  window.addEventListener('resize', handleResize)
})

onBeforeUnmount(() => {
  window.removeEventListener('resize', handleResize)
  if (degChartInstance) { degChartInstance.dispose(); degChartInstance = null }
  if (clsChartInstance) { clsChartInstance.dispose(); clsChartInstance = null }
})
</script>

<template>
  <div class="report-stu">
    <!-- 学历统计 -->
    <el-card class="mb16 page-header-card" shadow="hover">
      <div class="header">
        <div class="title">学员信息统计 · 学历</div>
        <div class="actions">
          <el-button type="primary" size="small" :loading="degLoading" @click="fetchDegreeData">刷新数据</el-button>
        </div>
      </div>
      <div class="meta">
        <el-tag type="info" size="small">最近更新：{{ updatedAtDeg || '—' }}</el-tag>
        <el-tag type="success" size="small" class="ml8">总人数：{{ degTotal }}</el-tag>
      </div>
    </el-card>

    <el-row :gutter="16" class="mb24">
      <el-col :span="14">
        <el-card class="chart-card" shadow="never">
          <template #header>
            <div class="card-header"><span>学历占比</span></div>
          </template>
          <div class="chart-container">
            <div v-show="!degLoading" ref="degChartRef" class="chart"></div>
            <el-skeleton v-if="degLoading" animated :rows="5" />
          </div>
        </el-card>
      </el-col>
      <el-col :span="10">
        <el-card shadow="never">
          <template #header>
            <div class="card-header"><span>数据明细</span></div>
          </template>
          <el-table :data="degreeData" size="small" style="width: 100%">
            <el-table-column prop="name" label="学历" />
            <el-table-column prop="value" label="人数" />
            <el-table-column label="占比">
              <template #default="{ row }">
                <el-progress :percentage="calcDegPercent(row.value)" :stroke-width="12" />
              </template>
            </el-table-column>
          </el-table>
        </el-card>
      </el-col>
    </el-row>

    <!-- 班级人数统计 -->
    <el-card class="mb16 page-header-card" shadow="hover">
      <div class="header">
        <div class="title">学员信息统计 · 班级人数</div>
        <div class="actions">
          <el-button type="primary" size="small" :loading="clsLoading" @click="fetchClazzData">刷新数据</el-button>
        </div>
      </div>
      <div class="meta">
        <el-tag type="info" size="small">最近更新：{{ updatedAtCls || '—' }}</el-tag>
      </div>
    </el-card>

    <el-row :gutter="16">
      <el-col :span="14">
        <el-card class="chart-card" shadow="never">
          <template #header>
            <div class="card-header"><span>班级人数（条形图）</span></div>
          </template>
          <div class="chart-container">
            <div v-show="!clsLoading" ref="clsChartRef" class="chart"></div>
            <el-skeleton v-if="clsLoading" animated :rows="5" />
          </div>
        </el-card>
      </el-col>
      <el-col :span="10">
        <el-card shadow="never">
          <template #header>
            <div class="card-header"><span>数据明细</span></div>
          </template>
          <el-table :data="clazzData" size="small" style="width: 100%">
            <el-table-column prop="name" label="班级" />
            <el-table-column prop="value" label="人数" />
          </el-table>
        </el-card>
      </el-col>
    </el-row>
  </div>
</template>

<style scoped>
.report-stu { padding: 8px; }
.mb16 { margin-bottom: 16px; }
.mb24 { margin-bottom: 24px; }
.ml8 { margin-left: 8px; }
.page-header-card .header { display: flex; align-items: center; justify-content: space-between; }
.page-header-card .title { font-size: 18px; font-weight: 600; }
.page-header-card .meta { margin-top: 8px; display: flex; align-items: center; }
.card-header { display: flex; align-items: center; justify-content: space-between; }
.chart-container { position: relative; }
.chart { width: 100%; height: 360px; }
</style>