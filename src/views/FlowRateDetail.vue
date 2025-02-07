<template>
  <el-dialog v-model="chatStore.flowRateDetailShow" title="流量明细" width="600px" :close-on-click-modal="false"
    class="flow-rate-dialog" top="3vh">
    <div class="flow-rate-content">
      <!-- 顶部卡片：显示剩余 token -->
      <div class="token-card">
        <div class="token-info">
          <div class="token-icon">💎</div>
          <div class="token-details">
            <div class="token-label">剩余额度</div>
            <div class="token-amount">{{ chatStore.remainingTokens }} tokens</div>
          </div>
        </div>
      </div>

      <div class="scrollable-content">
        <!-- 饼图区域 -->
        <div class="chart-section">
          <div class="section-title">
            <el-icon>
              <DataAnalysis />
            </el-icon>
            <span>模型使用分布</span>
          </div>
          <div class="chart-container" ref="chartRef"></div>
        </div>

        <!-- 使用明细列表 -->
        <div class="usage-list">
          <div class="section-title">
            <el-icon>
              <List />
            </el-icon>
            <span>使用明细</span>
          </div>
          <div class="list-content">
            <div v-for="(item, index) in usageData" :key="index" class="usage-item">
              <div class="model-info">
                <div class="color-dot" :style="{ backgroundColor: getChartColor(index) }"></div>
                <span class="model-name">{{ item.modelName }}</span>
              </div>
              <div class="usage-count">{{ item.usageCount }} tokens</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </el-dialog>
</template>

<script setup>
import { ref, onMounted, watch, onUnmounted } from 'vue'
import { useChatStore } from '@/js/store'
import * as echarts from 'echarts'
import { DataAnalysis, List } from '@element-plus/icons-vue'
import { getModelUsage } from '@/js/api/chat/chat'
import { getUserInfo } from '@/js/api/user/user'
import message from '@/utils/message'
import notification from '@/utils/notification'
import { ElLoading } from 'element-plus'

const chatStore = useChatStore()
const chartRef = ref(null)
let chart = null

// 使用数据
const usageData = ref([])



// 图表颜色
const chartColors = [
  '#6366f1',
  '#8b5cf6',
  '#ec4899',
  '#f43f5e',
  '#f97316',
  '#eab308'
]

const getChartColor = (index) => {
  return chartColors[index % chartColors.length]
}

const initChart = () => {
  if (!chartRef.value) return

  // 销毁旧的图表实例
  if (chart) {
    chart.dispose()
  }

  // 创建新的图表实例
  chart = echarts.init(chartRef.value)

  // 准备图表数据
  const chartData = usageData.value.map(item => ({
    name: item.modelName,
    value: item.usageCount
  }))

  // 图表配置
  const option = {
    tooltip: {
      trigger: 'item',
      formatter: '{b}: {c} tokens ({d}%)'
    },
    legend: {
      show: false
    },
    series: [
      {
        name: '模型使用情况',
        type: 'pie',
        radius: ['40%', '70%'],
        avoidLabelOverlap: false,
        itemStyle: {
          borderRadius: 10,
          borderColor: '#fff',
          borderWidth: 2
        },
        label: {
          show: false
        },
        emphasis: {
          label: {
            show: true,
            fontSize: '14',
            fontWeight: 'bold'
          }
        },
        labelLine: {
          show: false
        },
        data: chartData,
        color: chartColors
      }
    ]
  }

  // 设置图表配置
  chart.setOption(option)
}
onMounted(async () => {

  const loading = ElLoading.service({
    lock: true,
    text: '加载中...',
    background: 'rgba(255, 255, 255, 0.7)',
  })
  try {
    console.log("?");
    const getModelUsagePromise = getModelUsage().catch(error => {
      if (error.code === 500) {
        notification.error('加载模型使用情况失败！', error.msg);
      } else if (error.code === 501) {
        notification.networkError();
      }
      return []; // 返回空数组作为默认值
    });
    const getTokenPromise = getUserInfo().catch(error => {
      if (error.code === 500) {
        notification.error('加载token数失败！', error.msg);
      } else if (error.code === 501) {
        notification.networkError();
      }
      return null; // 返回null作为默认值
    });
    const [usageDataRes, userInfoRes] = await Promise.all([
      getModelUsagePromise,
      getTokenPromise
    ]);
    console.log("????????????")
    console.log(usageDataRes);
    console.log(userInfoRes);
    if (usageDataRes) {
      usageData.value = usageDataRes;
    }
    if (userInfoRes) {
      chatStore.remainingTokens = userInfoRes.power;
    }
    initChart()
  } catch (error) {
    if (error.code === 500) {
      message.error(error.msg)
    } else if (error.code === 501) {
      notification.networkError()
    }
  } finally {
    loading.close()
  }
})
// 监听对话框显示状态


// 监听窗口大小变化
window.addEventListener('resize', () => {
  if (chart) {
    chart.resize()
  }
})



</script>

<style scoped>
.flow-rate-dialog {
  :deep(.el-dialog__body) {
    padding: 0;
  }

  :deep(.el-dialog) {
    border-radius: 16px;
    overflow: hidden;
    margin-top: 12vh !important;
  }
}

.flow-rate-content {
  padding: 10px;
  max-height: 75vh;
  display: flex;
  flex-direction: column;
}

.scrollable-content {
  flex: 1;
  overflow-y: auto;
  padding-right: 5px;
}

.scrollable-content::-webkit-scrollbar {
  width: 6px;
}

.scrollable-content::-webkit-scrollbar-track {
  background: transparent;
  border-radius: 3px;
}

.scrollable-content::-webkit-scrollbar-thumb {
  background: rgba(0, 0, 0, 0.2);
  border-radius: 3px;
  transition: background-color 0.3s ease;
}

.scrollable-content::-webkit-scrollbar-thumb:hover {
  background: rgba(0, 0, 0, 0.3);
}

.token-card {
  background: linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%);
  border-radius: 16px;
  padding: 14px;
  margin-bottom: 14px;
  box-shadow: 0 8px 16px rgba(99, 102, 241, 0.12);
  flex-shrink: 0;
}

.token-info {
  display: flex;
  align-items: center;
  gap: 16px;
}

.token-icon {
  font-size: 32px;
  animation: bounce 2s infinite;
}

@keyframes bounce {

  0%,
  100% {
    transform: translateY(0);
  }

  50% {
    transform: translateY(-10px);
  }
}

.token-details {
  color: white;
}

.token-label {
  font-size: 0.875rem;
  opacity: 0.9;
  margin-bottom: 4px;
}

.token-amount {
  font-size: 1.5rem;
  font-weight: 600;
}

.chart-section {
  background: white;
  border-radius: 12px;
  padding: 5px;
  margin-bottom: 5px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.04);
}

.section-title {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 1rem;
  font-weight: 500;
  color: #333;
  margin-bottom: 16px;
}

.chart-container {
  height: 300px;
  width: 100%;
}

.usage-list {
  background: white;
  border-radius: 12px;
  padding: 20px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.04);
}

.list-content {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.usage-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px;
  background: #f8f9fa;
  border-radius: 8px;
  transition: all 0.2s ease;
}

.usage-item:hover {
  background: #f1f3f5;
  transform: translateX(4px);
}

.model-info {
  display: flex;
  align-items: center;
  gap: 8px;
}

.color-dot {
  width: 10px;
  height: 10px;
  border-radius: 50%;
}

.model-name {
  font-size: 0.875rem;
  color: #333;
}

.usage-count {
  font-size: 0.875rem;
  color: #666;
  font-weight: 500;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .flow-rate-content {
    padding: 16px;
  }

  .token-card {
    padding: 20px;
  }

  .chart-container {
    height: 250px;
  }

  .token-amount {
    font-size: 1.25rem;
  }
}
</style>
