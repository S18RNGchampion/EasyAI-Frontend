<!--用户提问组件-->
<template>
  <div class="input-wrapper">

    <!-- 主输入区域 -->
    <div class="input-container" :class="{ 'has-file': isUploadFile }">
      <!-- 文件上传预览区 -->
      <div class="file-preview" v-if="isUploadFile">
        <div class="preview-content">
          <img
            v-if="isImage"
            :src="fileUrl"
            alt="预览图"
            class="preview-image"
            @click="previewUploadImage"
          />
          <v-icon v-else icon="mdi-file-document-outline" size="32" color="primary"></v-icon>
          <v-btn
            icon="mdi-close"
            size="x-small"
            variant="text"
            color="default"
            class="close-button"
            @click="cancelUploadImage"
          ></v-btn>
        </div>
      </div>

      <!-- 输入框区域 -->
      <v-textarea
        v-model="inputText"
        :placeholder="chatStore.inputDisabled ? '点击重新生成或刷新页面' : '输入你的问题...(Enter发送，Shift+Enter换行)'"
        variant="outlined"
        :disabled="chatStore.inputDisabled"
        hide-details
        auto-grow
        rows="1"
        max-rows="8"
        class="chat-input"
        @input="countRow"
        @keydown.enter.exact.prevent="checkInputAndSend"
      >
        <!-- 左侧工具按钮 -->
        <template #prepend>
          <div class="input-tools">
            <v-tooltip location="top" text="上传文件">
              <template #activator="{ props }">
                <v-btn
                  v-bind="props"
                  icon="mdi-paperclip"
                  variant="text"
                  size="small"
                  class="tool-button"
                  @click="handleFileUpload"
                ></v-btn>
              </template>
            </v-tooltip>
          </div>
        </template>

        <!-- 发送按钮 -->
        <template #append>
          <v-slide-x-transition>
            <v-btn
              v-if="!chatStore.isChatting"
              :icon="inputText.trim() ? 'mdi-send' : 'mdi-microphone'"
              :color="inputText.trim() ? 'primary' : 'default'"
              size="small"
              class="send-button"
              :disabled="!inputText.trim()"
              @click="checkInputAndSend"
            ></v-btn>
            <v-btn
              v-else
              icon="mdi-stop-circle"
              color="error"
              size="small"
              class="send-button"
              @click="preventConversion"
            ></v-btn>
          </v-slide-x-transition>
        </template>
      </v-textarea>
    </div>

    <!-- 隐藏的文件输入 -->
    <input
      type="file"
      ref="fileInput"
      style="display: none"
      @change="handleFileChange"
      accept="image/*,.pdf,.doc,.docx"
    >

    <!-- 图片预览对话框 -->
    <v-dialog v-model="isPreviewUploadImage" max-width="800" class="preview-dialog">
      <v-card>
        <v-card-text class="pa-0">
          <v-img
            :src="fileUrl"
            cover
            class="preview-dialog-image"
            max-height="80vh"
          ></v-img>
        </v-card-text>
        <v-card-actions class="justify-end">
          <v-btn
            color="primary"
            variant="text"
            @click="isPreviewUploadImage = false"
          >
            关闭
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <!-- 提示消息 -->
    <v-snackbar
      v-model="snackBar.show"
      :color="snackBar.status ? 'success' : 'error'"
      location="top"
      :timeout="2000"
    >
      {{ snackBar.title }}
    </v-snackbar>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted, watch } from 'vue'
import bus from "@/js/bus";
import { useChatStore } from "@/js/store";
import message from "@/utils/message";
const emit = defineEmits(['submitConversion']);
const chatStore = useChatStore();

// 输入相关
const inputText = ref('');
const fileInput = ref(null);
const isUploadFile = ref(false);
const fileUrl = ref('');
const isImage = ref(false);
const isPreviewUploadImage = ref(false);

// 文件类型限制
const supportedFileTypes = [
  'image/jpeg', 'image/png', 'image/gif', 'application/pdf', 'application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
];

// 提示消息
const snackBar = ref({
  show: false,
  status: false,
  title: '',
  width: '',
});

// 监听文件URL变化
watch(fileUrl, () => {
  isImage.value = fileUrl.value.startsWith('data:image/');
});

onMounted(() => {
  bus.on('preventConversion', preventConversion);
});

onUnmounted(() => {
  bus.off('preventConversion', preventConversion);
});

// 检查输入并发送
function checkInputAndSend() {
  // 如果正在对话中，直接返回不执行发送
  if (chatStore.isChatting) {
    message.success("正在对话中，请等待回复完成", 1500);
    return;
  }

  if (inputText.value.trim() !== '') {
    emit('submitConversion', { inputText: inputText.value });
    inputText.value = "";
  }
}

// 取消对话
function preventConversion() {
  message.info("暂停生成暂未上线",1500);
  // chatStore.isChatting = false;
  // bus.emit('finishUserRequest');

}

// 文件上传相关函数
function handleFileUpload() {
  message.info("上传文件暂未上线",1500);
  // fileInput.value.click();
}

function handleFileChange(event) {
  const file = event.target.files[0];
  if (!file) return;

  if (!supportedFileTypes.includes(file.type)) {
    snackBar.value = {
      show: true,
      status: false,
      title: '不支持的文件类型',
    };
    return;
  }

  const reader = new FileReader();
  reader.onload = () => {
    fileUrl.value = reader.result;
    isUploadFile.value = true;
    snackBar.value = {
      show: true,
      status: true,
      title: '文件上传成功',
    };
  };
  reader.readAsDataURL(file);
}

function cancelUploadImage() {
  isUploadFile.value = false;
  fileUrl.value = '';
}

function previewUploadImage() {
  if (isImage.value) {
    isPreviewUploadImage.value = true;
  }
}

// 计算输入框行数
function countRow() {
  const textarea = document.querySelector('.chat-input textarea');
  if (textarea) {
    chatStore.inputRow = Math.min(5, Math.floor((textarea.scrollHeight / 24)) - 1);
  }
}
</script>
<style scoped>
.input-wrapper {
  position: relative;
  width: 100%;
  max-width: 900px;
  margin: 0 auto;
  background-color: transparent;
}

.input-container {
  position: relative;
  background: transparent;
  border-radius: 12px;
  transition: all 0.3s ease;
  margin: 0 auto;
  width: 100%;
}

.input-container.has-file {
  padding-top: 76px;
}

.chat-input {
  width: 100%;
  transition: all 0.3s ease;
}

.chat-input :deep(.v-field) {
  border-radius: 12px !important;
  background-color: white !important;
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.05);
  transition: all 0.3s ease;
}

.chat-input :deep(.v-field:hover) {
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  transform: translateY(-1px);
}

.chat-input :deep(.v-field--focused) {
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  transform: translateY(-1px);
}

.chat-input :deep(.v-field__append-inner),
.chat-input :deep(.v-field__prepend-inner) {
  padding-top: 6px;
}

.input-tools {
  display: flex;
  gap: 4px;
}

.tool-button {
  opacity: 0.7;
  transition: all 0.3s ease;
}

.tool-button:hover {
  opacity: 1;
  transform: scale(1.1);
}

.send-button {
  margin: 0 4px;
  transition: all 0.3s ease !important;
}

.send-button:not(:disabled):hover {
  transform: scale(1.1);
}

.file-preview {
  position: absolute;
  top: 8px;
  left: 0;
  right: 0;
  padding: 0 12px;
}

.preview-content {
  position: relative;
  background: #f8f9fa;
  border-radius: 8px;
  padding: 8px;
  height: 60px;
  display: flex;
  align-items: center;
  gap: 8px;
}

.preview-image {
  height: 100%;
  width: auto;
  border-radius: 4px;
  cursor: pointer;
  transition: transform 0.2s ease;
}

.preview-image:hover {
  transform: scale(1.05);
}

.close-button {
  position: absolute;
  top: -6px;
  right: -6px;
  opacity: 0;
  transition: all 0.2s ease;
}

.preview-content:hover .close-button {
  opacity: 1;
}

.preview-dialog-image {
  width: 100%;
  height: auto;
}

@media (max-width: 768px) {
  .input-container {
    border-radius: 8px;
  }

  .chat-input :deep(.v-field) {
    border-radius: 8px !important;
  }
}

.token-info {
  position: absolute;
  top: -40px;
  right: 0;
  z-index: 1;
}

.token-text {
  font-size: 0.85rem;
  color: #6EACF5;
  cursor: help;
  padding: 4px 12px;
  border-radius: 20px;
  background: #E4F0FE;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
  backdrop-filter: blur(8px);
  transition: all 0.3s ease;
  display: inline-flex;
  align-items: center;
  gap: 4px;
}

/* 确保输入框样式不受影响 */
.chat-input {
  margin-top: 0;
}

/* 添加动画效果 */
@keyframes pulse {
  0% {
    transform: scale(1);
  }
  50% {
    transform: scale(1.05);
  }
  100% {
    transform: scale(1);
  }
}

.token-count {
  animation: pulse 2s infinite;
  display: inline-block;
}

/* 在新建对话模式下的特殊样式 */
:deep(.new-chat-input) {
  .token-info {
    top: -40px;
    right: 24px;
  }

  .chat-input :deep(.v-field) {
    background-color: white !important;
    box-shadow: 0 3px 12px rgba(0, 0, 0, 0.08);
  }
}
</style>
