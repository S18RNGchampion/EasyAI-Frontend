<template>
  <div class="model-trigger" :class="{ 'is-fixed': isFixed }">
    <el-popover
      v-model:visible="showModelPopover"
      placement="bottom"
      :width="280"
      trigger="manual"
      popper-class="model-popover"
      :offset="12"
    >
      <template #reference>
        <v-btn
          class="model-button"
          color="primary"
          variant="tonal"
          @click.stop="togglePopover"
        >
          <v-icon icon="mdi-robot" size="small"></v-icon>
          {{ getModelDisplayName(chatStore.selectedModel) }}
        </v-btn>
      </template>

      <div class="model-groups">
        <div v-for="(models, provider) in modelOptions" :key="provider" class="model-group">
          <div class="group-title">{{ provider }}</div>
          <v-list class="model-list" density="compact">
            <v-list-item
              v-for="model in models"
              :key="model.modelName"
              :active="chatStore.selectedModel === model.modelName"
              :class="{ 'selected': chatStore.selectedModel === model.modelName }"
              @click="handleModelSelect(model.modelName)"
            >
              <template #prepend>
                <v-icon
                  :icon="chatStore.selectedModel === model.modelName ? 'mdi-check' : ''"
                  size="small"
                  color="primary"
                ></v-icon>
              </template>
              <v-list-item-title class="model-item-content">
                <span class="model-name">{{ model.modelName }}</span>
                <span class="model-price">{{ model.price }} tokens/次</span>
              </v-list-item-title>
            </v-list-item>
          </v-list>
        </div>
      </div>
    </el-popover>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useChatStore } from '@/js/store'
import { getModelList } from '@/js/api/chat/chat'

const props = defineProps({
  isFixed: {
    type: Boolean,
    default: false
  }
})

const chatStore = useChatStore()
const showModelPopover = ref(false)
const modelOptions = ref({})

const togglePopover = () => {
  showModelPopover.value = !showModelPopover.value
}

const getModelDisplayName = (modelName) => {
  for (const [provider, models] of Object.entries(modelOptions.value)) {
    const model = models.find(m => m.modelName === modelName)
    if (model) {
      return model.modelName
    }
  }
  return modelName
}

const handleModelSelect = (model) => {
  chatStore.selectedModel = model
  showModelPopover.value = false
}

onMounted(async () => {
  modelOptions.value = await getModelList();
  // 默认选择第一个厂商的第一个模型
  const firstProvider = Object.keys(modelOptions.value)[0];
  if (firstProvider && modelOptions.value[firstProvider].length > 0) {
    chatStore.selectedModel = modelOptions.value[firstProvider][0].modelName;
  }
  document.addEventListener('click', (e) => {
    const popover = document.querySelector('.model-trigger')
    if (popover && !popover.contains(e.target)) {
      showModelPopover.value = false
    }
  })
})
</script>

<style scoped>
.model-trigger {
  position: fixed;
  left: 80px;
  top: 10px;
  z-index: 100;
  transition: left 0.3s ease;
}

/* 当侧边栏展开时调整位置 */
.v-navigation-drawer--active ~ .v-main .model-trigger {
  left: 280px;
}

@media (max-width: 768px) {
  .model-trigger {
    left: 70px;
  }

  .v-navigation-drawer--active ~ .v-main .model-trigger {
    left: 270px;
  }
}

.model-button {
  display: flex;
  align-items: center;
  gap: 6px;
  height: 36px;
  font-size: 0.875rem;
  border-radius: 8px;
  transition: all 0.3s ease;
}

.model-button:hover {
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(64, 158, 255, 0.2);
}

:deep(.model-popover) {
  padding: 0;
  border-radius: 16px;
  border: none;
  box-shadow: 0 12px 32px rgba(0, 0, 0, 0.1), 0 2px 24px rgba(0, 0, 0, 0.08);
  background: rgba(255, 255, 255, 0.98);
  backdrop-filter: blur(20px);
}

:deep(.el-popper.model-popover) {
  padding: 0;
}

:deep(.el-popper.model-popover .el-popper__arrow) {
  display: none;
}

.model-groups {
  padding: 8px;
  max-height: 400px;
  overflow-y: auto;
  overflow-x: hidden;
  scrollbar-width: thin;
  scrollbar-color: rgba(0, 0, 0, 0.2) transparent;
}

/* 自定义滚动条样式 */
.model-groups::-webkit-scrollbar {
  width: 6px;
}

.model-groups::-webkit-scrollbar-track {
  background: transparent;
  border-radius: 3px;
}

.model-groups::-webkit-scrollbar-thumb {
  background-color: rgba(0, 0, 0, 0.2);
  border-radius: 3px;
  transition: background-color 0.3s ease;
}

.model-groups::-webkit-scrollbar-thumb:hover {
  background-color: rgba(0, 0, 0, 0.3);
}

.model-group {
  margin-bottom: 12px;
  background: rgba(255, 255, 255, 0.6);
  border-radius: 12px;
  backdrop-filter: blur(8px);
  transition: transform 0.2s ease;
}

.model-group:hover {
  transform: translateY(-1px);
}

.group-title {
  padding: 12px 16px 8px;
  font-size: 0.875rem;
  font-weight: 600;
  color: #444;
  letter-spacing: 0.3px;
  border-bottom: 1px solid rgba(0, 0, 0, 0.06);
  margin-bottom: 4px;
}

.model-list {
  border-radius: 8px;
  overflow: hidden;
  padding: 4px 8px;
  background: transparent;
}

:deep(.model-list .v-list-item) {
  border-radius: 8px;
  margin: 4px 0;
  min-height: 44px;
  cursor: pointer;
  padding: 0 12px;
  transition: all 0.2s ease;
}

:deep(.v-list-item__prepend) {
  margin-right: -28px !important;
}

:deep(.model-list .v-list-item.selected) {
  background: rgba(var(--v-theme-primary), 0.08);
  box-shadow: 0 2px 8px rgba(var(--v-theme-primary), 0.1);
}

:deep(.model-list .v-list-item:hover) {
  background: rgba(var(--v-theme-primary), 0.05);
  transform: translateX(2px);
}

.model-item-content {
  display: flex;
  justify-content: space-between;
  align-items: center;
  width: 100%;
  padding: 4px 0;
}

.model-name {
  font-size: 0.875rem;
  color: #333;
  font-weight: 500;
}

.model-price {
  font-size: 0.75rem;
  color: #666;
  margin-left: 12px;
  padding: 2px 8px;
  background: rgba(0, 0, 0, 0.04);
  border-radius: 12px;
  transition: all 0.2s ease;
}

:deep(.model-list .v-list-item:hover) .model-price {
  background: rgba(var(--v-theme-primary), 0.1);
  color: rgb(var(--v-theme-primary));
}

:deep(.model-list .v-list-item.selected) .model-price {
  background: rgba(var(--v-theme-primary), 0.15);
  color: rgb(var(--v-theme-primary));
}

:deep(.model-popover) {
  padding: 0;
  border-radius: 16px;
  border: none;
  box-shadow: 0 12px 32px rgba(0, 0, 0, 0.1), 0 2px 24px rgba(0, 0, 0, 0.08);
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(20px);
  transform-origin: top;
  animation: popoverEnter 0.2s ease;
}

@keyframes popoverEnter {
  from {
    opacity: 0;
    transform: scale(0.95);
  }
  to {
    opacity: 1;
    transform: scale(1);
  }
}
</style>
