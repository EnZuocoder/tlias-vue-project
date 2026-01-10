<script setup>
import { ref, computed, onMounted, onBeforeUnmount, nextTick } from 'vue'
import { ElMessage } from 'element-plus'
import * as echarts from 'echarts'
import { getEmpGenderData, getEmpJobData } from '@/api/report'

const loading = ref(false)
const chartRef = ref(null)
let chartInstance = null

const genderData = ref([])
const updatedAt = ref('')

const total = computed(() =>
  genderData.value.reduce((sum, item) => sum + (Number(item?.value) || 0), 0)
)

function calcPercent(value) {
  const t = total.value || 0
  if (!t) return 0
  return Math.round((Number(value || 0) / t) * 100)
}

// 职位统计相关状态
const jobLoading = ref(false)
const jobChartRef = ref(null)
let jobChartInstance = null
const jobData = ref([])
const updatedAtJob = ref('')
const jobColors = ['#67C23A', '#E6A23C', '#909399', '#9A60B4', '#3BA272', '#5470C6']

const jobTotal = computed(() =>
  jobData.value.reduce((sum, item) => sum + (Number(item?.value) || 0), 0)
)

function calcJobPercent(value) {
  const t = jobTotal.value || 0
  if (!t) return 0
  return Math.round((Number(value || 0) / t) * 100)
}

async function fetchData() {
  try {
    loading.value = true
    const res = await getEmpGenderData()
    if (res && res.code === 1) {
      genderData.value = Array.isArray(res.data) ? res.data : []
      updatedAt.value = new Date().toLocaleString()
      // 先关闭 loading 以确保图表容器可见，再渲染并 resize
      loading.value = false
      await nextTick()
      renderChart()
      chartInstance && chartInstance.resize()
    } else {
      ElMessage.error(res?.msg || '数据加载失败')
    }
  } catch (e) {
    ElMessage.error('请求失败，请稍后重试')
  } finally {
    loading.value = false
  }
}

function renderChart() {
  if (!chartRef.value) return
  if (!chartInstance) {
    chartInstance = echarts.init(chartRef.value)
  }
  const colors = ['#409EFF', '#F56C6C']
  const option = {
    tooltip: { trigger: 'item' },
    legend: { bottom: 0 },
    color: colors,
    graphic: [
      {
        type: 'text',
        left: 'center',
        top: 'center',
        style: {
          text: `总人数\n${total.value}`,
          textAlign: 'center',
          fill: '#606266',
          fontSize: 16,
          fontWeight: 600
        }
      }
    ],
    series: [
      {
        name: '性别占比',
        type: 'pie',
        center: ['50%', '45%'],
        radius: ['55%', '78%'],
        avoidLabelOverlap: true,
        label: {
          show: true,
          formatter: '{b}: {d}%',
          fontSize: 14
        },
        labelLine: { length: 15, length2: 10 },
        data: genderData.value.map((d) => ({ name: d.name, value: d.value }))
      }
    ]
  }
  chartInstance.setOption(option)
}

async function fetchJobData() {
  try {
    jobLoading.value = true
    const res = await getEmpJobData()
    if (res && res.code === 1 && res.data) {
      const list = Array.isArray(res.data?.jobList) ? res.data.jobList : []
      const vals = Array.isArray(res.data?.dataList) ? res.data.dataList : []
      jobData.value = list.map((name, idx) => ({ name, value: Number(vals[idx] || 0) }))
      updatedAtJob.value = new Date().toLocaleString()
      // 先关闭 loading 以确保图表容器可见，再渲染并 resize
      jobLoading.value = false
      await nextTick()
      renderJobChart()
      jobChartInstance && jobChartInstance.resize()
    } else {
      ElMessage.error(res?.msg || '职位数据加载失败')
    }
  } catch (e) {
    ElMessage.error('请求失败，请稍后重试')
  } finally {
    jobLoading.value = false
  }
}

function renderJobChart() {
  if (!jobChartRef.value) return
  if (!jobChartInstance) {
    jobChartInstance = echarts.init(jobChartRef.value)
  }
  const option = {
    tooltip: { trigger: 'item' },
    legend: { bottom: 0, itemGap: 16 },
    color: jobColors,
    graphic: [
      {
        type: 'text',
        left: 'center',
        top: 'center',
        style: {
          text: `总人数\n${jobTotal.value}`,
          textAlign: 'center',
          fill: '#606266',
          fontSize: 16,
          fontWeight: 600
        }
      }
    ],
    series: [
      {
        name: '职位占比',
        type: 'pie',
        center: ['50%', '45%'],
        radius: ['55%', '78%'],
        avoidLabelOverlap: true,
        label: { show: true, formatter: '{b}: {d}%', fontSize: 14 },
        labelLine: { length: 15, length2: 10 },
        data: jobData.value.map((d) => ({ name: d.name, value: d.value }))
      }
    ]
  }
  jobChartInstance.setOption(option)
}

function handleResize() {
  chartInstance && chartInstance.resize()
  jobChartInstance && jobChartInstance.resize()
}

onMounted(() => {
  fetchData()
  fetchJobData()
  window.addEventListener('resize', handleResize)
})

onBeforeUnmount(() => {
  window.removeEventListener('resize', handleResize)
  if (chartInstance) {
    chartInstance.dispose()
    chartInstance = null
  }
  if (jobChartInstance) {
    jobChartInstance.dispose()
    jobChartInstance = null
  }
})
</script>

<template>
  <div class="report-emp">
    <el-card class="mb16 page-header-card" shadow="hover">
      <div class="header">
        <div class="title">员工信息统计 · 性别</div>
        <div class="actions">
          <el-button type="primary" size="small" :loading="loading" @click="fetchData">刷新数据</el-button>
        </div>
      </div>
      <div class="meta">
        <el-tag type="info" size="small">最近更新：{{ updatedAt || '—' }}</el-tag>
        <el-tag type="success" size="small" class="ml8">总人数：{{ total }}</el-tag>
      </div>
    </el-card>

    <el-row :gutter="16">
      <el-col :span="14">
        <el-card class="chart-card" shadow="never">
          <template #header>
            <div class="card-header"><span>性别占比</span></div>
          </template>
          <div class="chart-container">
            <div v-show="!loading" ref="chartRef" class="chart"></div>
            <el-skeleton v-if="loading" animated :rows="5" />
          </div>
        </el-card>
      </el-col>
      <el-col :span="10">
        <el-card shadow="never">
          <template #header>
            <div class="card-header"><span>数据明细</span></div>
          </template>
          <el-table :data="genderData" size="small" style="width: 100%">
            <el-table-column prop="name" label="分类" />
            <el-table-column prop="value" label="人数" />
            <el-table-column label="占比">
              <template #default="{ row }">
                <el-progress
                  :percentage="calcPercent(row.value)"
                  :stroke-width="12"
                  :color="row.name.includes('男') ? '#409EFF' : '#F56C6C'"
                />
              </template>
            </el-table-column>
          </el-table>
        </el-card>
      </el-col>
    </el-row>

    <!-- 职位统计 -->
    <el-card class="mb16 page-header-card" shadow="hover">
      <div class="header">
        <div class="title">员工信息统计 · 职位</div>
        <div class="actions">
          <el-button type="primary" size="small" :loading="jobLoading" @click="fetchJobData">刷新数据</el-button>
        </div>
      </div>
      <div class="meta">
        <el-tag type="info" size="small">最近更新：{{ updatedAtJob || '—' }}</el-tag>
        <el-tag type="success" size="small" class="ml8">总人数：{{ jobTotal }}</el-tag>
      </div>
    </el-card>

    <el-row :gutter="16">
      <el-col :span="14">
        <el-card class="chart-card" shadow="never">
          <template #header>
            <div class="card-header"><span>职位占比</span></div>
          </template>
          <div class="chart-container">
            <div v-show="!jobLoading" ref="jobChartRef" class="chart"></div>
            <el-skeleton v-if="jobLoading" animated :rows="5" />
          </div>
        </el-card>
      </el-col>
      <el-col :span="10">
        <el-card shadow="never">
          <template #header>
            <div class="card-header"><span>数据明细</span></div>
          </template>
          <el-table :data="jobData" size="small" style="width: 100%">
            <el-table-column prop="name" label="职位" />
            <el-table-column prop="value" label="人数" />
            <el-table-column label="占比">
              <template #default="{ row, $index }">
                <el-progress
                  :percentage="calcJobPercent(row.value)"
                  :stroke-width="12"
                  :color="jobColors[$index % jobColors.length]"
                />
              </template>
            </el-table-column>
          </el-table>
        </el-card>
      </el-col>
    </el-row>
  </div>
  
</template>

<style scoped>
.report-emp {
  padding: 8px;
}
.mb16 { margin-bottom: 16px; }
.ml8 { margin-left: 8px; }
.page-header-card .header {
  display: flex;
  align-items: center;
  justify-content: space-between;
}
.page-header-card .title {
  font-size: 18px;
  font-weight: 600;
}
.page-header-card .meta {
  margin-top: 8px;
  display: flex;
  align-items: center;
}
.card-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
}
.chart-container { position: relative; }
.chart { width: 100%; height: 360px; }
</style>