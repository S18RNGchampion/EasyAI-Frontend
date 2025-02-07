<!--用户对话核心组件-->
<template>
  <div class="chat-messages" ref="chatContainer" @scroll="handleScroll">
    <div class="messages-wrapper">
      <div v-for="(message, index) in chat" :key="index"
        :class="['message-item', message.role === 'User' ? 'message-user' : 'message-ai']" :data-message-index="index">
        <!-- 头像 -->
        <div class="avatar-container">
          <v-avatar size="36" :color="message.role === 'User' ? 'primary' : 'white'" class="message-avatar">
            <v-icon v-if="message.role==='User'" icon="mdi-account" color="white"></v-icon>
            <v-icon v-else icon="mdi-robot" color="primary" size="27"></v-icon>
          </v-avatar>
        </div>

        <!-- 消息内容 -->
        <div class="message-content" @mouseenter="selectedConversion = index" @mouseleave="selectedConversion = null">
          <div class="message-header">
            <span class="message-role">{{ message.role === 'User' ? '你' : 'AI助手' }}</span>
            <span class="message-time">{{ message.time }}</span>
          </div>

          <div :class="['message-bubble', { 'error-bubble': message.isError }]">
            <MdPreview :modelValue="message.content" previewTheme="github" :codeFoldable="false" :noImgZoomIn="true"
              :show-code-row-number="!chatStore.xs" />
          </div>

          <!-- 操作按钮 -->
          <div class="message-actions" v-if="message.role === 'AI'">
            <template v-if="!message.isError">
              <v-fade-transition>
                <div class="action-buttons"
                  v-show="!chatStore.isChatting && (index === chat.length - 1 || selectedConversion === index)">
                  <v-btn variant="text" density="comfortable" size="small" class="action-btn copy-btn"
                    @click="copyToClipboard(message, index)">
                    <template #prepend>
                      <v-icon :icon="index === copySelectedBtn ? 'mdi-check' : 'mdi-content-copy'"
                        size="small"></v-icon>
                    </template>
                    {{ index === copySelectedBtn ? "已复制" : "复制" }}
                  </v-btn>

                  <v-btn variant="text" density="comfortable" size="small" class="action-btn share-btn"
                    @click="handleShare(message, index)">
                    <template #prepend>
                      <v-icon icon="mdi-share-variant" size="small"></v-icon>
                    </template>
                    分享
                  </v-btn>
                </div>
              </v-fade-transition>
            </template>
            <template v-else>
              <v-btn color="error" variant="tonal" size="small" class="regenerate-btn" @click="regenerateResponse"
                :disabled="chatStore.isChatting" prepend-icon="mdi-refresh">
                重新生成
              </v-btn>
            </template>
          </div>
        </div>
      </div>
    </div>

    <!-- 返回底部按钮 -->
    <v-scale-transition>
      <v-btn v-show="showScrollButton" class="scroll-to-bottom-btn" @click="exportScrollToBottom" size="small"
        icon="mdi-chevron-down" variant="elevated"></v-btn>
    </v-scale-transition>
  </div>
</template>

<script setup>
import { computed, nextTick, onMounted, onUnmounted, ref, watch } from "vue";
import { useChatStore, useUserStore } from "@/js/store";
import bus from '@/js/bus';
import { MdPreview } from "md-editor-v3";
import 'md-editor-v3/lib/preview.css';
import 'github-markdown-css/github-markdown.css';
import { toPng } from 'html-to-image';
import MarkdownIt from 'markdown-it';
import { shareAsImage } from '@/utils/shareImage';

const chatContainer = ref(null);

const chatStore = useChatStore();
const userStore = useUserStore()

const userAvatar = 'https://randomuser.me/api/portraits/women/85.jpg';
const systemAvatar = 'https://randomuser.me/api/portraits/women/85.jpg';

const isUserScrolling = ref(false);
const disableScrollHandler = ref(false);
const lastScrollTop = ref(0);

const props = defineProps(
  {
    chat: {
      type: Array,
      required: true,
    }
  }
)

const copySelectedBtn = ref(null);
const selectedConversion = ref(null);  //选择对话的编号 控制下方按钮显示

// 添加控制按钮显示的响应式变量
const showScrollButton = ref(false);

onMounted(() => {
  bus.on('scrollToBottom', () => {
    if (chatContainer.value) {
      chatContainer.value.scrollTop = chatContainer.value.scrollHeight;
    }
  });
  bus.on('chatStart', () => {
    isUserScrolling.value = false;
  })
});
onUnmounted(() => {
  bus.off('scrollToBottom');
  bus.off('chatStart');
})




// scrollTop 距离滑到对话顶部距离
const scrollToBottom = () => {
  if (!chatContainer.value) return;
  if (!chatStore.isChatting) return;
  if (!isUserScrolling.value) {
    disableScrollHandler.value = true;
    const container = chatContainer.value;
    const scrollOptions = {
      top: container.scrollHeight,
    };
    container.scrollTo(scrollOptions);
    lastScrollTop.value = container.scrollHeight;

    setTimeout(() => {
      disableScrollHandler.value = false;
    }, 100);
  }
};
/**
 * 供外部调用！
 */
const exportScrollToBottom = () => {
  disableScrollHandler.value = true;
  chatContainer.value.scrollTop = chatContainer.value.scrollHeight;
  lastScrollTop.value = chatContainer.value.scrollTop;
  showScrollButton.value = false;
  isUserScrolling.value = false;
  setTimeout(() => {
    disableScrollHandler.value = false;
  }, 100);
};

const handleScroll = () => {
  if (disableScrollHandler.value) return;

  const container = chatContainer.value;
  const { scrollTop, scrollHeight, clientHeight } = container;

  // 计算距离底部的距离
  const distanceFromBottom = scrollHeight - (scrollTop + clientHeight);

  // 控制按钮显示
  showScrollButton.value = distanceFromBottom > 200;

  // 如果用户向上滚动超过20px，则标记为用户正在滚动
  if (scrollTop < lastScrollTop.value - 20) {
    isUserScrolling.value = true;
  }

  // 如果距离底部小于100px，则自动吸附到底部
  if (distanceFromBottom < 100) {
    isUserScrolling.value = false;
    scrollToBottom();
  }

  lastScrollTop.value = scrollTop;
};

const copyToClipboard = (message, index) => {
  if (navigator.clipboard && navigator.clipboard.writeText) {
    navigator.clipboard.writeText(message.content).then(() => {
      copySelectedBtn.value = index;
      setTimeout(() => {
        copySelectedBtn.value = null;
      }, 1000);
    }).catch(err => {
      console.error('Failed to copy: ', err);
    });
  } else {
    // Fallback method for older browsers
    const textArea = document.createElement('textarea');
    textArea.value = message.content;
    textArea.style.position = 'fixed';
    textArea.style.top = '0';
    textArea.style.left = '0';
    textArea.style.width = '2em';
    textArea.style.height = '2em';
    textArea.style.padding = '0';
    textArea.style.border = 'none';
    textArea.style.outline = 'none';
    textArea.style.boxShadow = 'none';
    textArea.style.background = 'transparent';
    document.body.appendChild(textArea);
    textArea.focus();
    textArea.select();
    try {
      document.execCommand('copy');
      message.copyStatus = '复制成功';
      message.copyIcon = 'copyGouIcon';
      setTimeout(() => {
        message.copyStatus = '复制全文';
        message.copyIcon = 'copyIcon';
      }, 1000);
      console.log("old copy success");
    } catch (err) {
      console.error('Failed to copy: ', err);
    }
    document.body.removeChild(textArea);
  }
};


// 添加新的监听器
watch(() => props.chat, () => {
  if (!isUserScrolling.value) {
    nextTick(() => {
      scrollToBottom();
    });
  }
}, { deep: true });

// 添加重新生成函数
const regenerateResponse = () => {
  if (props.chat.length >= 2) {
    const lastUserMessage = props.chat[props.chat.length - 2];
    if (lastUserMessage && lastUserMessage.role === 'User') {
      // 发出重新生成的事件
      bus.emit('regenerateResponse', lastUserMessage.content);
    }
  }
};

// 添加 markdown-it 实例
const md = new MarkdownIt({
  html: true,
  linkify: true,
  typographer: true
});

const handleShare = (message, index) => {
  shareAsImage(message, props.chat, index);
};

</script>

<style scoped>
.chat-messages {
  height: calc(100% - 50px);
  position: relative;
  overflow-y: auto;
  width: 100%;
  padding-right: 12px;
}

.messages-wrapper {
  padding: 20px 0 20px 0;
  display: flex;
  flex-direction: column;
  gap: 24px;
  width: 100%;
  max-width: 900px;
  margin: 0 auto;
  position: relative;
}

.chat-messages::-webkit-scrollbar {
  width: 6px;
  height: 6px;
}

.chat-messages::-webkit-scrollbar-track {
  background: transparent;
  border-radius: 3px;
}

.chat-messages::-webkit-scrollbar-thumb {
  background: rgba(0, 0, 0, 0.2);
  border-radius: 3px;
  transition: all 0.2s ease;
}

.chat-messages::-webkit-scrollbar-thumb:hover {
  background: rgba(0, 0, 0, 0.3);
}

.message-item {
  display: flex;
  gap: 16px;
  opacity: 0;
  animation: message-fade-in 0.3s ease forwards;
  padding: 0 24px;
  margin: 0;
  width: 100%;
  position: relative;
  z-index: 1;
}

@keyframes message-fade-in {
  from {
    opacity: 0;
    transform: translateY(10px);
  }

  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.message-ai {
  flex-direction: row;
}

.message-user {
  flex-direction: row-reverse;
}

.message-content {
  flex: 0 1 auto;
  max-width: 85%;
  min-width: 100px;
}

.message-header {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 4px;
}

.message-ai .message-header {
  justify-content: flex-start;
}

.message-user .message-header {
  justify-content: flex-end;
}

.message-role {
  font-size: 0.875rem;
  font-weight: 500;
  color: #1a1a1a;
}

.message-time {
  font-size: 0.75rem;
  color: #666;
}

.message-bubble {
  border-radius: 16px;
  padding: 12px 16px;
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.06);
  transition: all 0.2s ease;
  display: inline-block;
  max-width: 100%;
  backdrop-filter: blur(10px);
  border: 1px solid rgba(0, 0, 0, 0.04);
}

.message-ai .message-bubble {
  background: #ffffff;
  border-radius: 4px 16px 16px 16px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.06);
}

.message-user .message-bubble {
  background: rgb(var(--v-theme-primary));
  color: white;
  border-radius: 16px 4px 16px 16px;
  box-shadow: 0 2px 12px rgba(var(--v-theme-primary), 0.2);
  border: none;
}

.message-bubble:hover {
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.08);
  transform: translateY(-1px);
}

/* MdPreview 基础样式重置 */
:deep(.md-editor-preview) {
  background: transparent !important;
  padding: 0 !important;
  margin: 0 !important;
}

:deep(.md-editor-preview-wrapper) {
  background-color: transparent !important;
  padding: 0 !important;
  margin: 0 !important;
}

:deep(.md-editor-preview p) {
  margin: 0 !important;
  padding: 0 !important;
  background-color: transparent !important;
}

:deep(.md-editor-preview *:first-child) {
  margin-top: 0 !important;
}

:deep(.md-editor-preview *:last-child) {
  margin-bottom: 0 !important;
}

/* 用户消息中的 MdPreview 特殊样式 */
.message-user :deep(.md-editor-preview-wrapper),
.message-user :deep(.md-editor-preview),
.message-user :deep(.md-editor-preview p),
.message-user :deep(.md-editor-preview span),
.message-user :deep(.md-editor-preview div) {
  background-color: rgb(var(--v-theme-primary)) !important;
  color: white !important;
  margin: 0 !important;
  padding: 0 !important;
}

/* 代码块样式优化 */
:deep(.md-editor-preview pre) {
  border-radius: 8px;
  margin: 8px 0 !important;
  padding: 12px !important;
}

:deep(.md-editor-preview code) {
  font-size: 0.875rem;
}

/* 内联代码样式 */
:deep(.md-editor-preview code:not(pre code)) {
  background-color: rgba(175, 184, 193, 0.2) !important;
  padding: 0.2em 0.4em !important;
  border-radius: 4px;
  margin: 0 0.2em !important;
}

.error-bubble {
  background: #FFF3F3;
  border: 1px solid #FFE0E0;
  color: #DC3545;
}

.error-bubble::before {
  content: "⚠️";
  margin-right: 8px;
}

.message-text {
  font-size: 0.9375rem;
  line-height: 1.5;
}

.message-actions {
  margin-top: 8px;
  display: flex;
  transition: opacity 0.2s ease;
}

.message-ai .message-actions {
  justify-content: flex-start;
  min-height: 32px;
  /* 添加最小高度，确保即使按钮隐藏也保持空间 */
}

.action-buttons {
  display: flex;
  gap: 8px;
}

.action-btn {
  opacity: 0.7;
  transition: all 0.2s ease;
}

.action-btn:hover {
  opacity: 1;
  transform: translateY(-1px);
}

.copy-btn {
  color: #666;
  font-size: 0.875rem;
  transition: all 0.2s ease;
}

.copy-btn:hover {
  background-color: rgba(0, 0, 0, 0.04);
}

.regenerate-btn {
  font-size: 0.875rem;
}

.scroll-to-bottom-btn {
  position: fixed;
  bottom: 100px;
  right: 24px;
  z-index: 100;
  background: white !important;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1) !important;
}

/* 代码块样式优化 */
:deep(.md-editor-preview) {
  background: transparent !important;
  padding: 0 !important;
}

:deep(.md-editor-preview pre) {
  border-radius: 8px;
  margin: 8px 0;
}

:deep(.md-editor-preview code) {
  font-size: 0.875rem;
}

/* 添加以下样式来处理 MdPreview 的背景 */
:deep(.md-editor-preview-wrapper) {
  background-color: #ffffff !important;
}

:deep(.md-editor-preview p) {
  margin: 0 !important;
  background-color: transparent !important;
}

:deep(.md-editor-preview *) {
  background-color: transparent !important;
}

/* 如果有内联代码，保持其背景色 */
:deep(.md-editor-preview code:not(pre code)) {
  background-color: rgba(175, 184, 193, 0.2) !important;
  padding: 0.2em 0.4em;
  border-radius: 4px;
}

/* 移动端适配 */
@media (max-width: 768px) {
  .chat-messages {
    height: calc(100% - 60px);
    padding-right: 8px;
  }

  .messages-wrapper {
    padding: 12px 0 12px 0;
    max-width: 100%;
  }

  .message-item {
    padding: 0 16px;
  }
}

.share-btn {
  color: #67c23a;
}
</style>
