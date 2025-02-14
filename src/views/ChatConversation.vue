<!--用户对话核心组件-->
<template>
  <div class="chat-messages" ref="chatContainer" @scroll="handleScroll">
    <div class="messages-wrapper">
      <div v-for="(message, index) in chat" :key="index"
        :class="['message-item', message.role === 'User' ? 'message-user' : 'message-ai']" :data-message-index="index">
        <!-- 头像 -->
        <div class="avatar-container">
          <v-avatar size="36" :color="message.role === 'User' ? 'primary' : 'white'" class="message-avatar">
            <v-icon v-if="message.role === 'User'" icon="mdi-account" color="white"></v-icon>
            <v-icon v-else icon="mdi-robot" color="primary" size="27"></v-icon>
          </v-avatar>
        </div>

        <!-- 消息内容 -->
        <div class="message-content" @mouseenter="selectedConversion = index" @mouseleave="selectedConversion = null">
          <div class="message-header">
            <span class="message-role">{{ message.role === 'User' ? '你' : 'AI助手' }}</span>
            <span class="message-time">{{ message.time }}</span>
          </div>

          <!-- 用户消息 -->
          <div v-if="message.role === 'User'" :class="['user-message-bubble', { 'error-bubble': message.isError }]">
            <MdPreview :modelValue="message.content" previewTheme="github" :codeFoldable="false" :noImgZoomIn="true" />
          </div>

          <!-- AI消息 -->
          <div v-else :class="['ai-message-bubble', { 'error-bubble': message.isError }]">
            <!-- 思考中状态 -->
            <div v-if="message.content === 'thinking'" class="thinking-container">
              <el-icon class="thinking-icon"><Loading /></el-icon>
              <span class="thinking-text">AI 正在思考</span>
              <span class="thinking-dots"></span>
            </div>
            <!-- 正常消息内容 -->
            <MdPreview v-else :modelValue="message.content" previewTheme="github" :codeFoldable="false" :noImgZoomIn="true" />
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
              <v-btn color="error" variant="tonal" size="small" class="regenerate-btn"
                @click="regenerateResponse(chatStore.selectedSessionId)" :disabled="chatStore.isChatting"
                prepend-icon="mdi-refresh">
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
import { Loading } from '@element-plus/icons-vue'

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

// 修改滚动处理函数
const handleScroll = () => {
  if (disableScrollHandler.value) return;

  const container = chatContainer.value;
  const { scrollTop, scrollHeight, clientHeight } = container;

  // 计算距离底部的距离
  const distanceFromBottom = scrollHeight - (scrollTop + clientHeight);

  // 控制返回底部按钮的显示
  showScrollButton.value = distanceFromBottom > 200;

  // 如果用户向上滚动超过50px，标记为用户正在滚动
  if (Math.abs(scrollTop - lastScrollTop.value) > 50) {
    isUserScrolling.value = true;
  }

  // 如果距离底部很近，重置滚动状态
  if (distanceFromBottom < 10) {
    isUserScrolling.value = false;
  }

  lastScrollTop.value = scrollTop;
};

// 修改滚动到底部的函数
const scrollToBottom = () => {
  if (!chatContainer.value) return;

  // 如果正在对话且用户没有主动滚动，或者强制滚动
  if (chatStore.isChatting && !isUserScrolling.value) {
    disableScrollHandler.value = true;
    const container = chatContainer.value;
    container.scrollTo({
      top: container.scrollHeight,
      behavior: 'smooth'
    });

    setTimeout(() => {
      disableScrollHandler.value = false;
    }, 100);
  }
};

// 导出的滚动到底部函数（用于外部调用）
const exportScrollToBottom = () => {
  disableScrollHandler.value = true;
  const container = chatContainer.value;

  container.scrollTo({
    top: container.scrollHeight,
    behavior: 'smooth'
  });

  lastScrollTop.value = container.scrollHeight;
  showScrollButton.value = false;
  isUserScrolling.value = false;

  setTimeout(() => {
    disableScrollHandler.value = false;
  }, 100);
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
    } catch (err) {
      console.error('Failed to copy: ', err);
    }
    document.body.removeChild(textArea);
  }
};

// 监听消息变化
watch(() => props.chat, () => {
  nextTick(() => {
    // 如果正在对话且用户没有主动滚动，或者是最后一条消息
    if ((chatStore.isChatting && !isUserScrolling.value) ||
        (props.chat.length > 0 && props.chat[props.chat.length - 1].role === 'AI')) {
      scrollToBottom();
    }
  });
}, { deep: true });

// 添加重新生成函数
const regenerateResponse = (session_id) => {
  console.log(session_id)
  if (props.chat.length >= 2) {
    const lastUserMessage = props.chat[props.chat.length - 2];
    if (lastUserMessage && lastUserMessage.role === 'User') {
      // 发出重新生成的事件，传递两个参数
      bus.emit('regenerateResponse', { content: lastUserMessage.content, session_id: session_id });
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

<style>
@import '../assets/styles/chatConversation.css';
</style>
