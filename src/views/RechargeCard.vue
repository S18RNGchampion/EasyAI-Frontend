<template>
  <el-dialog v-model="chatStore.rechargeCardShow" title="卡密充值" width="500px" :close-on-click-modal="false"
    class="recharge-dialog" top="3vh">
    <div class="recharge-content">
      <!-- 顶部图标和标题 -->
      <div class="header-section">
        <div class="header-icon">💎</div>
        <p class="header-subtitle">输入您购买的卡密，立即获得 Token</p>
      </div>

      <!-- 卡密输入区域 -->
      <div class="card-input-section">
        <el-form :model="form" ref="formRef" :rules="rules" class="card-form">
          <el-form-item prop="cardKey">
            <div class="input-wrapper">
              <el-input style="height: 40px;" v-model="form.cardKey" placeholder="请输入卡密" class="card-input"
                :prefix-icon="Key" @keyup.enter="handleSubmit" />
              <el-button type="primary" style="height: 40px;width: 80px;" class="submit-button" @click="handleSubmit"
                :loading="loading">
                充值
              </el-button>
            </div>
          </el-form-item>
        </el-form>
      </div>

      <!-- 使用说明区域 -->
      <div class="instructions-section">
        <div class="instruction-title">
          <el-icon>
            <InfoFilled />
          </el-icon>
          <span>使用说明</span>
        </div>
        <div class="instruction-items">
          <div class="instruction-item">
            <div class="item-icon">1</div>
            <div class="item-text">购买卡密后，请妥善保管</div>
          </div>
          <div class="instruction-item">
            <div class="item-icon">2</div>
            <div class="item-text">每个卡密仅可使用一次</div>
          </div>
          <div class="instruction-item">
            <div class="item-icon">3</div>
            <div class="item-text">充值后系统将自动为您增加相应的 Token！</div>
          </div>
        </div>
      </div>

      <!-- 最近充值记录 -->
      <div class="recent-records" v-if="rechargeRecords.length > 0">
        <div class="records-title">
          <el-icon>
            <Timer />
          </el-icon>
          <span>最近充值记录</span>
        </div>
        <div class="records-list">
          <div v-for="(record, index) in rechargeRecords" :key="index" class="record-item">
            <span class="record-time">{{ record.create_time }}</span>
            <span class="record-amount">+{{ record.reward }} tokens</span>
          </div>
        </div>
      </div>
      <div v-else>
        <el-empty description="暂无充值记录" style="padding-bottom: 10px;padding-top: 10px;" />
      </div>
    </div>
  </el-dialog>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'
import { Key, InfoFilled, Timer } from '@element-plus/icons-vue'
import { useChatStore } from '@/js/store'
import { rechargeWithCard, getUsedCardList } from "@/js/api/card/card";
import message from '@/utils/message'
import notification from '@/utils/notification'

const chatStore = useChatStore()
const loading = ref(false)
const formRef = ref(null)

// 表单数据
const form = reactive({
  cardKey: ''
})

// 表单验证规则
const rules = {
  cardKey: [
    { required: true, message: '请输入卡密', trigger: 'blur' },
    { min: 6, message: '卡密长度不能小于6个字符', trigger: 'blur' }
  ]
}

onMounted(async () => {
  try {
    const res = await getUsedCardList();
    rechargeRecords.value = res;
  } catch {
    if (error.code === 500) {
      message.error(error.msg, 3000);
    } else if (error.code === 501) {
      notification.networkError();
    }
  }
})

// 模拟充值记录数据
const rechargeRecords = ref([])

// 提交充值
const handleSubmit = async () => {
  if (!formRef.value) return

  try {
    await formRef.value.validate()
    loading.value = true
    const result = await rechargeWithCard(form.cardKey)
    rechargeRecords.value.push(result);
    notification.success('充值成功！',"获得 "+result.reward+" tokens!");
    form.cardKey = '';
  } catch (error) {
    if (error.code === 500) {
      message.error(error.msg)
    } else if (error.code === 501) {
      notification.networkError()
    }
  } finally {
    loading.value = false
  }
}
</script>

<style scoped>
.recharge-dialog {
  :deep(.el-dialog) {
    border-radius: 16px;
    overflow: hidden;
  }

  :deep(.el-dialog__header) {
    display: none;
  }

  :deep(.el-dialog__body) {
    padding: 0;
  }
}

.recharge-content {
  padding: 5px;
}

.header-section {
  text-align: center;
  margin-bottom: 8px;
}

.header-icon {
  font-size: 36px;
  margin-bottom: 6px;
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

.header-title {
  font-size: 24px;
  font-weight: 600;
  color: #333;
  margin: 0 0 8px;
}

.header-subtitle {
  font-size: 14px;
  color: #666;
  margin: 0;
}

.card-input-section {
  margin-bottom: 16px;
  width: 100%;
  display: flex;
  justify-content: center;
}

.input-wrapper {
  width: 95%;
  max-width: 460px;
  display: flex;
  gap: 16px;
  align-items: center;

  .card-input {
    flex: 1;

    :deep(.el-input__wrapper) {
      box-shadow: none;
      border-radius: 16px;
      padding: 0 20px;
      transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
      background: #f5f7fa;
      border: 2px solid transparent;
      height: 52px;
      backdrop-filter: blur(10px);
      display: flex;
      align-items: center;

      .el-input__prefix-inner {
        color: #909399;
        transition: color 0.3s ease;
      }

      &:hover .el-input__prefix-inner {
        color: #606266;
      }

      &.is-focus .el-input__prefix-inner {
        color: var(--el-color-primary);
      }
    }

    :deep(.el-input__wrapper:hover) {
      background: #eef0f6;
      transform: translateY(-1px);
    }

    :deep(.el-input__wrapper.is-focus) {
      background: #ffffff;
      border: 2px solid var(--el-color-primary);
      box-shadow: 0 0 0 4px rgba(var(--el-color-primary-rgb), 0.1);
      transform: translateY(-1px);
    }

    :deep(.el-input__inner) {
      font-size: 16px;
      color: #333;
      font-weight: 500;
      height: 100%;
      line-height: normal;
    }

    :deep(.el-input__prefix) {
      margin-right: 12px;
      height: 100%;
      display: flex;
      align-items: center;
    }

    :deep(.el-input__prefix-inner) {
      font-size: 20px;
      display: flex;
      align-items: center;
      height: 100%;
    }

    :deep(.el-input__clear) {
      margin-right: 8px;
      border-radius: 50%;
      background: rgba(0, 0, 0, 0.1);
      color: #666;
      width: 18px;
      height: 18px;
      line-height: 18px;
      transition: all 0.3s ease;

      &:hover {
        background: rgba(0, 0, 0, 0.2);
        color: #333;
      }
    }
  }

  .submit-button {
    height: 52px;
    min-width: 120px;
    border-radius: 16px;
    padding: 0 32px;
    font-size: 16px;
    font-weight: 600;
    letter-spacing: 0.5px;
    background: linear-gradient(145deg, var(--el-color-primary), rgba(var(--el-color-primary-rgb), 0.9));
    box-shadow: 0 4px 15px rgba(var(--el-color-primary-rgb), 0.3);
    transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
    border: none;

    &:hover {
      transform: translateY(-1px);
      box-shadow: 0 6px 20px rgba(var(--el-color-primary-rgb), 0.4);
      background: linear-gradient(145deg, var(--el-color-primary), var(--el-color-primary));
    }

    &:active {
      transform: translateY(1px);
      box-shadow: 0 2px 10px rgba(var(--el-color-primary-rgb), 0.2);
    }
  }
}

.instructions-section {
  background: #f8f9fa;
  border-radius: 12px;
  padding: 5px 10px;
  margin-bottom: 24px;
}

.instruction-title {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 16px;
  font-weight: 500;
  color: #333;
  margin-bottom: 16px;
}

.instruction-items {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.instruction-item {
  display: flex;
  align-items: center;
  gap: 12px;
}

.item-icon {
  width: 24px;
  height: 24px;
  background: rgba(var(--el-color-primary-rgb), 0.1);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 12px;
  color: var(--el-color-primary);
  font-weight: 500;
}

.item-text {
  font-size: 14px;
  color: #666;
}

.recent-records {
  background: #fff;
  border-radius: 12px;
  padding: 10px;
  border: 1px solid #eee;
}

.records-title {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 14px;
  font-weight: 500;
  color: #333;
  margin-bottom: 16px;
}

.records-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
  max-height: 200px;
  width: 440px;
  overflow-y: auto;
  overflow-x: hidden;
  padding-right: 8px;
}

.records-list::-webkit-scrollbar {
  width: 4px;
}

.records-list::-webkit-scrollbar-track {
  background: transparent;
}

.records-list::-webkit-scrollbar-thumb {
  background: #e0e0e0;
  border-radius: 2px;
}

.records-list::-webkit-scrollbar-thumb:hover {
  background: #d0d0d0;
}

.record-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 8px 0;
  border-bottom: 1px solid #f5f5f5;
}

.record-item:last-child {
  border-bottom: none;
}

.record-time {
  font-size: 13px;
  color: #666;
}

.record-amount {
  font-size: 14px;
  color: #67c23a;
  font-weight: 500;
}

/* 添加一些动画效果 */
.instruction-item {
  transition: transform 0.2s ease;
}

.instruction-item:hover {
  transform: translateX(4px);
}

.record-item {
  transition: all 0.2s ease;
}

.record-item:hover {
  background: #f8f9fa;
  border-radius: 6px;
  padding: 8px 8px;
  transform: translateX(4px);
}
</style>
