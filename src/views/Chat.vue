<template>
  <v-layout>
    <!-- 侧边栏 -->
    <v-navigation-drawer v-model="chatStore.sideBarShow" app class="modern-drawer" location="left">
      <div class="drawer-content">
        <!-- 顶部操作区 -->
        <div class="drawer-top">
          <div class="app-title">
            <v-icon icon="mdi-robot" color="primary" size="24" class="mr-2"></v-icon>
            <span>EasyAI</span>
          </div>
          <v-btn icon="mdi-chevron-left" variant="text" size="small" class="collapse-btn"
            @click="chatStore.sideBarShow = false"></v-btn>
        </div>

        <!-- 新建聊天按钮 -->
        <div class="new-chat-section">
          <v-btn class="new-chat-btn" @click="switchNewChat()" prepend-icon="mdi-plus-circle-outline" variant="elevated"
            color="primary" block>
            新建对话
          </v-btn>
        </div>

        <!-- 聊天列表 -->
        <div class="chat-list">
          <div class="list-header">最近对话</div>
          <v-list class="chat-items">
            <v-list-item v-for="(chat, index) in chatList" :key="index"
              :class="{ 'selected-chat': chatStore.selectedSessionId === chat.sessionId }" class="chat-item"
              @click="loadChat(chat.sessionId)" @mouseenter="handleMouseOver(chat.sessionId)"
              @mouseleave="handleMouseLeave">
              <template #prepend>
                <v-icon icon="mdi-message-text-outline" size="18" class="chat-icon"></v-icon>
              </template>
              <v-list-item-title class="sidebar-chat-title">
                {{ chat.title }}
              </v-list-item-title>
              <template #append>
                <div class="action-buttons" v-show="hovered === chat.sessionId">
                  <v-btn icon="mdi-delete-outline" variant="text" density="comfortable" size="small" color="error"
                    @click.stop="deleteModule.showDeleteConfirmation(chat)"></v-btn>
                </div>
              </template>
            </v-list-item>
          </v-list>
        </div>

        <!-- 底部用户区域 -->
        <div class="drawer-footer">
          <v-divider></v-divider>
          <el-dropdown trigger="click" placement="top" @command="handleCommand">
            <div class="user-section">
              <v-avatar size="32" color="primary" class="user-avatar">
                <v-icon icon="mdi-account" color="white"></v-icon>
              </v-avatar>
              <div class="user-info">
                <div class="user-name" style="height: 16px;">个人信息</div>
              </div>
            </div>

            <template #dropdown>
              <el-dropdown-menu style="width: 100%;">
                <el-dropdown-item :disabled="true">
                  <v-icon icon="mdi-email" size="small" class="mr-2"></v-icon>
                  {{ chatStore.userInfo?.username }}
                </el-dropdown-item>
                <el-dropdown-item command="invite" divided>
                  <v-icon icon="mdi-account-plus" size="small" class="mr-2"></v-icon>
                  邀请用户
                </el-dropdown-item>
                <el-dropdown-item command="recharge">
                  <v-icon icon="mdi-cash" size="small" class="mr-2"></v-icon>
                  卡密充值
                </el-dropdown-item>
                <el-dropdown-item command="token">
                  <v-icon icon="mdi-ticket" size="small" class="mr-2"></v-icon>
                  流量明细
                </el-dropdown-item>
                <el-dropdown-item command="code">
                  <v-icon icon="mdi-key" size="small" class="mr-2"></v-icon>
                  输入口令
                </el-dropdown-item>
                <el-dropdown-item command="logout" divided>
                  <v-icon icon="mdi-logout" size="small" class="mr-2"></v-icon>
                  退出登录
                </el-dropdown-item>
              </el-dropdown-menu>
            </template>
          </el-dropdown>
        </div>
      </div>
    </v-navigation-drawer>

    <!-- 收起时的展开按钮 -->
    <v-btn v-show="!chatStore.sideBarShow" icon="mdi-menu" variant="flat" size="small" color="primary"
      class="expand-btn" @click="chatStore.sideBarShow = true"></v-btn>

    <!-- 其他内容保持不变 -->
    <v-main class="chat-main">
      <!-- 将模型选择器移到这里，使其在所有状态下都显示 -->
      <ModelSelector :is-fixed="true" />

      <div class="chat-container">
        <!-- 新建对话页面 -->
        <div v-if="chatStore.isNewChat" class="new-chat-view">
          <NewPage />
          <div class="input-container new-chat-input">
            <InputQuestion @submitConversion="submitConversion" />
          </div>
        </div>

        <!-- 对话内容区域 -->
        <div v-else class="messages-container">
          <!-- 顶部标题栏 -->
          <div class="chat-header">
            <div class="chat-title-container">
              <div class="main-chat-title">{{ chatStore.chatTitle || '新对话' }}</div>
              <v-btn v-show="!chatStore.isNewChat" icon="mdi-pencil" variant="text" size="small" class="edit-title-btn"
                @click="showEditChatTitlePanel(chatStore.chatTitle)"></v-btn>
            </div>
          </div>

          <ChatConversion :chat="chatStore.messageList" />
          <div class="input-container">
            <InputQuestion @submitConversion="submitConversion" />
          </div>
        </div>
      </div>
    </v-main>
    <v-dialog v-model="deleteModule.deleteDialog" max-width="400">
      <v-card>
        <v-card-title class="headline">删除对话</v-card-title>
        <v-card-text>
          确定删除<strong style="color: red">{{ deleteModule.deleteTitle }}</strong>对话吗?
        </v-card-text>
        <v-card-actions>
          <v-btn @click="deleteModule.cancelDelete">取消</v-btn>
          <v-btn color="red" @click="deleteModule.confirmDelete">确定</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
    <!--  退出登录-->
    <v-dialog v-model="logoutModule.logoutDialog" max-width="400">
      <v-card>
        <v-card-title class="headline">退出登录</v-card-title>
        <v-card-text>
          确定<strong style="color: red">退出登录</strong>吗?
        </v-card-text>
        <v-card-actions>
          <v-btn @click="logoutModule.cancelLogout()">取消</v-btn>
          <v-btn color="red" @click="logoutModule.confirmLogout()">确定</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>



    <InvitePeople v-if="chatStore.invitePeopleShow">

    </InvitePeople>
    <RechargeCard v-if="chatStore.rechargeCardShow">

    </RechargeCard>
    <!--  <UserInfo v-if="chatStore.userInfoShow">-->

    <!--  </UserInfo>-->
    <MyOrder v-if="chatStore.myOrderShow">

    </MyOrder>
    <FlowRateDetail v-if="chatStore.flowRateDetailShow">

    </FlowRateDetail>
    <UserInfo v-if="chatStore.userInfoShow">

    </UserInfo>

    <!-- 添加口令输入对话框 -->
    <CodeInputDialog v-model:visible="chatStore.codeInputVisible" @complete="handleCodeComplete" />

    <!-- 添加响应式变量 -->
    <el-dialog v-model="editTitleDialog" title="修改对话标题" width="400px" :close-on-click-modal="false"
      class="edit-title-dialog">
      <div class="edit-title-content">
        <el-input v-model="editTitleForm.title" placeholder="请输入新的对话标题" maxlength="20" show-word-limit clearable
          @keyup.enter="confirmEditTitle">
          <template #prefix>
            <div class="input-icon">✏️</div>
          </template>
        </el-input>
      </div>
      <template #footer>
        <div class="dialog-footer">
          <el-button @click="editTitleDialog = false">取消</el-button>
          <el-button type="primary" @click="confirmEditTitle" :loading="editTitleLoading">
            确认
          </el-button>
        </div>
      </template>
    </el-dialog>
  </v-layout>
  <!--  删除chat-->


</template>

<script setup>
import { mergeProps, nextTick, onMounted, onUnmounted, ref, watch, reactive, computed } from 'vue'
import bus from "@/js/bus";
import { useChatStore, useUserStore } from "@/js/store";
import { useRoute } from 'vue-router';
import { getUserInfo } from "@/js/api/user/user";
import { editChatTitle, getChatList, getMessageList, chat, deleteChatBySessionId } from "@/js/api/chat/chat";
import notification from "@/utils/notification";
import InputQuestion from "@/views/InputQuestion.vue";
import ChatConversion from "@/views/ChatConversation.vue";
import NewPage from "@/views/newPage.vue";
import UserInfo from "@/views/UserInfo.vue";
import InvitePeople from "@/views/InvitePeople.vue";
import MyOrder from "@/views/MyOrder.vue";
import FlowRateDetail from "@/views/FlowRateDetail.vue";
import RechargeCard from "@/views/RechargeCard.vue";
import router from "@/router";
import message from "@/utils/message";
import CodeInputDialog from '@/components/CodeInputDialog.vue'
import { ElLoading } from 'element-plus'
import { Monitor, ArrowDown, Check } from '@element-plus/icons-vue'
import ModelSelector from '@/components/ModelSelector.vue'


const route = useRoute();
const hovered = ref(null);
const chatList = ref();

const chatStore = useChatStore();
const userStore = useUserStore();

const switchNewChat = () => {
  chatStore.isNewChat = true;
  chatStore.selectedSessionId = null;
  chatStore.parentId = null;
  chatStore.inputDisabled = false;
  chatStore.messageList = [];
  chatStore.chatTitle = "新对话";
  router.push(`/chat`);
}
/**
 * 切换列表对话 状态改变
 */
const switchChat = (session_id, title, messageList) => {
  chatStore.messageList = messageList;
  chatStore.chatTitle = title;
  router.push(`/chat/c/${session_id}`); // 动态修改路由地址
  chatStore.isNewChat = false;
  chatStore.selectedSessionId = session_id;
  chatStore.parentId = messageList[messageList.length - 1].messageId;
  chatStore.selectedModel = messageList[messageList.length - 1].modelName;
  chatStore.inputDisabled = false;
}
/**
 * 删除对话时状态改变
 */
const deleteChat = () => {
  router.push('/chat');
  chatStore.selectedSessionId = null;
  chatStore.messageList = [];
  chatStore.isNewChat = true;
  chatStore.chatTitle = "新对话";
}


// 口令状态
const codeInputVisible = ref(false)

// 添加响应式变量
const editTitleDialog = ref(false)
const editTitleForm = reactive({
  title: ''
})
const editTitleLoading = ref(false)

// 添加邮箱格式化的计算属性
const maskedEmail = computed(() => {
  const email = chatStore.userInfo?.username || '';
  if (!email) return '';

  const [localPart, domain] = email.split('@');
  if (!domain) return email;

  let maskedLocal = localPart;
  if (localPart.length > 2) {
    maskedLocal = localPart.charAt(0) + '*'.repeat(localPart.length - 2) + localPart.charAt(localPart.length - 1);
  }

  return `${maskedLocal}@${domain}`;
});

onMounted(async () => {
  const loading = ElLoading.service({
    lock: true,
    text: '加载中...',
    background: 'rgba(255, 255, 255, 0.7)',
  })
  try {
    // 分别处理每个请求
    const getChatListPromise = getChatList().catch(error => {
      if (error.code === 500) {
        notification.error('加载对话列表失败！', error.msg);
      } else if (error.code === 501) {
        notification.networkError();
      }
      return []; // 返回空数组作为默认值
    });

    const getUserInfoPromise = getUserInfo().catch(error => {
      if (error.code === 500) {
        notification.error('加载用户信息失败！', error.msg);
      } else if (error.code === 501) {
        notification.networkError();
      }
      return null; // 返回null作为默认值
    });

    // 同时发起两个请求
    const [chatListData, userInfoData] = await Promise.all([
      getChatListPromise,
      getUserInfoPromise
    ]);

    // 设置数据
    if (chatListData) {
      chatList.value = chatListData;
    }
    if (userInfoData) {
      chatStore.userInfo = userInfoData;
    }
  } finally {
    loading.close()
  }

  bus.on('finishUserRequest', finishUserRequest);
  bus.on('changeAutoScroll', () => {
    console.log("changeAutoScroll");
    chatStore.shouldAutoScroll = !chatStore.shouldAutoScroll;
  });
  bus.on('logout', logoutModule.value.showLogoutConfirmation);
  bus.on('regenerateResponse', (data)=>{
    const {content}=data;
    const {session_id}=data;
    handleRegenerate(content,session_id);
  });
})
onUnmounted(() => {
  bus.off('finishUserRequest');
  bus.off('changeAutoScroll');
  bus.off('logout');
  bus.off('regenerateResponse');
})


const loadChat = async (sessionId) => {
  if (chatStore.isChatting) {
    bus.emit("preventConversion");
  }
  if (chatStore.selectedSessionId === sessionId) {
    return;
  }
  const loading = ElLoading.service({
    lock: true,
    text: '加载对话中...',
    background: 'rgba(255, 255, 255, 0.7)',
  })
  try {
    const temp = await getMessageList(sessionId);
    switchChat(sessionId, temp.title, temp.messageListBodyList)
    nextTick(() => {
      bus.emit('scrollToBottom');
    });
  } catch (error) {
    if (error.code === 500) {
      notification.error('加载对话失败！', error.msg, 3000, 'top-right');
      chatList.value = chatList.value.filter(chat => chat.sessionId !== sessionId);
    } else if (error.code === 501) {
      notification.networkError();
    }
  } finally {
    loading.close()
  }
}

watch(route, () => {
  if (route.params.sessionId) {
    loadChat(route.params.sessionId);
    nextTick(() => {
      bus.emit('scrollToBottom');
    });
  }
}, { immediate: true, once: true });


//删除对话模块
let deleteModule = ref({
  deleteSessionId: null,
  deleteTitle: "",
  deleteDialog: false,
  cancelDelete: () => {
    deleteModule.value.deleteSessionId = null;
    deleteModule.value.deleteDialog = false;
  },
  confirmDelete: () => {
    if (deleteModule.value.deleteSessionId !== null) {
      deleteModule.value.deleteChat();
    }
    deleteModule.value.deleteDialog = false;
  },
  deleteChat: async () => {
    const loading = ElLoading.service({
      lock: true,
      text: '删除中...',
      background: 'rgba(255, 255, 255, 0.7)',
    })
    try {
      await deleteChatBySessionId(deleteModule.value.deleteSessionId);
      chatList.value = chatList.value.filter(chat => chat.sessionId !== deleteModule.value.deleteSessionId);
      if (deleteModule.value.deleteSessionId === chatStore.selectedSessionId) {
        deleteChat();
      }
      deleteModule.value.deleteSessionId = null;
      message.success('对话删除成功');
    } catch (error) {
      if (error.code === 500) {
        message.error(error.msg)
      } else if (error.code === 501) {
        notification.networkError()
      }
    } finally {
      loading.close()
    }
  },
  showDeleteConfirmation: (chat) => {
    deleteModule.value.deleteSessionId = chat.sessionId;
    deleteModule.value.deleteTitle = chat.title;
    deleteModule.value.deleteDialog = true;
  },
})
// 退出登录模块
let logoutModule = ref({
  logoutDialog: false,
  cancelLogout: () => {
    logoutModule.value.logoutDialog = false;
  },
  confirmLogout: async () => {
    const loading = ElLoading.service({
      lock: true,
      text: '退出登录中...',
      background: 'rgba(255, 255, 255, 0.7)',
    })
    try {
      logoutModule.value.logoutDialog = false;
      localStorage.removeItem('token');
      window.location.href = '/login';
    } finally {
      loading.close();
    }
  },
  showLogoutConfirmation: () => {
    logoutModule.value.logoutDialog = true;
  },
})


const sendMessage = async (selectedSessionId, parentId, inputText) => {
  try {
    let first = ref(true);
    await chat(inputText, chatStore.selectedModel, selectedSessionId, parentId, {
      onStart: (session_id, data) => {
        if (data.parent_id == null) {
          chatStore.selectedSessionId = session_id;
          router.push(`/chat/c/${session_id}`);
          chatList.value.unshift({
            title: data.title,
            sessionId: session_id,
          });
          chatStore.chatTitle = data.title;
        }
        chatStore.inputDisabled = false;
        chatStore.lastAiMessage.parent_id = data.user_message_id;
        chatStore.lastAiMessage.messageId = data.ai_message_id;
        chatStore.lastUserMessage.message_id = data.user_message_id;
        chatStore.parentId = data.ai_message_id;

      },
      onMessage: (content) => {
        if (content) {
          if (first.value) {
            first.value = false;
            chatStore.lastAiMessage.content = "";
          }
          chatStore.lastAiMessage.content = chatStore.lastAiMessage.content + content
        }
      },
      onConclude: (session_id, content) => {
        chatStore.isChatting = false;
      },
      onError: (session_id, content) => {
        chatStore.lastAiMessage.content = content;
        chatStore.lastAiMessage.isError = true;
        chatStore.isChatting = false;
        chatStore.inputDisabled = true;
      }
    })
  } catch (error) {
    console.log(error);
    if (error.code === 500) {
      notification.error('发送消息失败！', error.msg);
    } else if (error.code === 501) {
      notification.networkError();
    }
    chatStore.lastAiMessage.content = "网络连接失败！";
    chatStore.lastAiMessage.isError = true;
    chatStore.inputDisabled = true;
    console.error('Chat error:', error)
    chatStore.isChatting = false;
  }
}

const submitConversion = (data) => {
  chatStore.isNewChat = false;
  const { inputText } = data;
  chatStore.isChatting = true;
  chatStore.lastUserMessage = {
    role: 'User',
    content: inputText,
    parentId: null,
    messageId: null,
  }
  chatStore.messageList.push(chatStore.lastUserMessage);
  chatStore.lastAiMessage = {
    role: 'AI',
    content: '模型思考中...',
    parentId: null,
    messageId: null,
  }
  chatStore.messageList.push(chatStore.lastAiMessage);
  nextTick(() => {
    bus.emit('chatStart');
    bus.emit('scrollToBottom');
  });
  chatStore.shouldAutoScroll = true;
  sendMessage(chatStore.selectedSessionId, chatStore.parentId, inputText);

}


const finishUserRequest = () => {
  nextTick(() => {
    bus.emit('scrollToBottom');
  })
  chatStore.isChatting = false;
};


// 修改编辑标题函数
const showEditChatTitlePanel = (title) => {
  editTitleDialog.value = true
}

// 添加确认修改函数
const confirmEditTitle = async () => {
  if (!editTitleForm.title.trim()) {
    message.warning('标题不能为空')
    return
  }
  const loading = ElLoading.service({
    lock: true,
    text: '修改中...',
    background: 'rgba(255, 255, 255, 0.7)',
  })
  editTitleLoading.value = true
  try {
    await editChatTitle(chatStore.selectedSessionId, editTitleForm.title);
    chatStore.chatTitle = editTitleForm.title
    const chatIndex = chatList.value.findIndex(chat => chat.sessionId === chatStore.selectedSessionId)
    if (chatIndex !== -1) {
      chatList.value[chatIndex].title = editTitleForm.title
    }
    message.success('标题修改成功')
    editTitleDialog.value = false
  } catch (error) {
    if (error.code === 500) {
      message.error(error.msg)
    } else if (error.code === 501) {
      notification.networkError()
    }
  } finally {
    editTitleLoading.value = false
    loading.close()
  }
}

const handleMouseOver = (chatId) => {
  hovered.value = chatId;
};

const handleMouseLeave = () => {
  hovered.value = null;
};


const handleRegenerate = (content,session_id) => {
  console.log(content);
  console.log(session_id);
  chatStore.messageList.pop();
  chatStore.messageList.pop();
  if (chatStore.messageList.length === 0) {
    chatList.value = chatList.value.filter(chat => chat.sessionId !== session_id);
    switchNewChat();
  } else {
    chatStore.parentId = chatStore.messageList[chatStore.messageList.length - 1].messageId;
  }
  submitConversion({ inputText: content });
};

const handleCommand = (command) => {
  switch (command) {
    case 'invite':
      chatStore.invitePeopleShow = true;
      break;
    case 'recharge':
      chatStore.rechargeCardShow = true;
      break;
    case 'token':
      chatStore.flowRateDetailShow = true;
      break;
    case 'code':
      chatStore.codeInputVisible = true;  // 显示口令输入对话框
      break;
    case 'logout':
      logoutModule.value.showLogoutConfirmation();
      break;
  }
};

// 添加口令提交处理方法
const handleCodeComplete = async (reward) => {
  try {
    console.log('提交的口令:', reward)
  } catch (error) {
    console.error('处理口令出错:', reward)
  }
}

</script>


<style scoped>
.modern-drawer {
  border: none !important;
  background: #ffffff !important;
  box-shadow: 0 0 20px rgba(0, 0, 0, 0.05) !important;
}

.drawer-content {
  height: 100%;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  /* 防止整个内容滚动 */
}

.drawer-top {
  padding: 16px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  height: 60px;
  flex-shrink: 0;
  /* 防止压缩 */
}

.app-title {
  display: flex;
  align-items: center;
  font-size: 1.1rem;
  font-weight: 600;
  color: #1a1a1a;
}

.new-chat-section {
  padding: 0 16px 16px;
  flex-shrink: 0;
  /* 防止压缩 */
}

.new-chat-btn {
  border-radius: 10px;
  text-transform: none;
  font-weight: 500;
  height: 44px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05) !important;
}

.chat-list {
  flex: 1;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  height: calc(100% - 140px);
}

.list-header {
  font-size: 0.75rem;
  color: #666;
  letter-spacing: 0.5px;
  padding: 12px 16px;
  font-weight: 500;
  flex-shrink: 0;
}

.chat-items {
  flex: 1;
  overflow-y: auto;
  padding: 8px;
  background: transparent;
}

/* 修改 v-list 的默认样式 */
:deep(.v-list) {
  height: 100%;
  overflow-y: auto !important;
  background: transparent;
}

/* 自定义滚动条样式 */
:deep(.v-list)::-webkit-scrollbar {
  width: 6px;
}

:deep(.v-list)::-webkit-scrollbar-track {
  background: transparent;
}

:deep(.v-list)::-webkit-scrollbar-thumb {
  background: #e0e0e0;
  border-radius: 3px;
  transition: background 0.2s ease;
}

:deep(.v-list)::-webkit-scrollbar-thumb:hover {
  background: #bdbdbd;
}

.chat-item {
  border-radius: 8px;
  margin: 2px 0;
  min-height: 44px;
  transition: all 0.2s ease;
}

.chat-icon {
  color: #666;
  opacity: 0.7;
  margin-right: 8px;
}

.sidebar-chat-title {
  font-size: 0.875rem;
  color: #333;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  text-align: left;
  padding-left: 0;
  margin-left: 0;
}

.selected-chat {
  background: rgba(var(--v-theme-primary), 0.08) !important;
}

.selected-chat .sidebar-chat-title {
  color: rgb(var(--v-theme-primary));
  font-weight: 500;
}

.drawer-footer {
  padding: 8px 16px;
  background: #ffffff;
  flex-shrink: 0;
  margin-top: auto;
}

.drawer-footer .v-divider {
  margin: 0 -16px;
  /* 让分割线延伸到边缘 */
  margin-bottom: 8px;
}

/* 添加el-dropdown的样式 */
:deep(.el-dropdown) {
  display: block;
  width: 100%;
}

.user-section {
  cursor: pointer;
  padding: 8px 12px;
  border-radius: 8px;
  transition: all 0.2s ease;
  display: flex;
  align-items: center;
  gap: 12px;
  width: 100%;
}

.user-section:hover {
  background-color: rgba(var(--v-theme-primary), 0.08);
}

/* 修改下拉菜单的样式 */
:deep(.el-dropdown-menu) {
  min-width: 220px !important;
  border-radius: 8px;
  margin-top: 4px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.user-avatar {
  flex-shrink: 0;
}

.user-info {
  flex: 1;
  min-width: 0;
  display: flex;
  flex-direction: column;
}

.user-name {
  font-size: 0.875rem;
  font-weight: 500;
  color: #333;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.user-plan {
  font-size: 0.75rem;
  color: #666;
}

.expand-btn {
  position: fixed;
  left: 20px;
  top: 20px;
  z-index: 100;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1) !important;
}

.chat-main {
  background-color: #f8f9fa;
  height: 100vh;
  overflow: hidden;
  padding: 0;
  margin-left: var(--v-layout-left);
  transition: margin-left 0.3s ease;
}

.chat-container {
  height: 100%;
  display: flex;
  flex-direction: column;
  max-width: none;
  margin: 0;
  padding: 0;
  position: relative;
  background-color: #f8f9fa;
}

.new-chat-view {
  flex: 1;
  overflow-y: auto;
  display: flex;
  flex-direction: column;
  position: relative;
}

.messages-container {
  flex: 1;
  overflow: hidden;
  position: relative;
  width: 100%;
  display: flex;
  flex-direction: column;
}

.chat-header {
  padding: 12px 24px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  background-color: #F8F9FA;
  backdrop-filter: blur(10px);
  position: sticky;
  top: 0;
  z-index: 10;
  height: 52px;
  position: relative;
}

.chat-title-container {
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 100%;
  padding: 0 24px;
}

.main-chat-title {
  font-size: 0.95rem;
  font-weight: 500;
  color: #4a4a4a;
  letter-spacing: 0.3px;
  font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif;
  line-height: 1.2;
  text-align: center;
  display: flex;
  align-items: center;
  gap: 4px;
}

.edit-title-btn {
  opacity: 0;
  transition: opacity 0.2s ease;
  color: #666;
  margin: 0 0 0 20px;
  padding: 0;
  height: 24px;
  width: 24px;
}

.chat-title-container:hover .edit-title-btn {
  opacity: 1;
}

.chat-title-container:hover .edit-title-btn {
  opacity: 1;
}

.header-actions {
  display: flex;
  gap: 8px;
}

.input-container {
  padding: 20px 24px;
  background-color: #f8f9fa;
  backdrop-filter: blur(10px);
  position: sticky;
  bottom: 0;
  z-index: 10;
  transition: all 0.3s ease;
  width: 100%;
}

.input-container.new-chat-input {
  position: absolute;
  left: 50%;
  bottom: 35%;
  transform: translateX(-50%);
  width: 100%;
  max-width: 800px;
  padding: 0;
  background: transparent;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .chat-header {
    padding: 12px 16px;
  }

  .input-container {
    padding: 12px 16px;
  }

  .input-container.new-chat-input {
    padding: 0 16px;
    bottom: 30%;
  }

  .chat-main {
    margin-left: 0;
  }

  .main-chat-title {
    font-size: 0.875rem;
  }
}

/* 修改 v-list-item 的标题样式 */
:deep(.v-list-item-title) {
  text-align: left;
  justify-content: flex-start;
  padding-left: 0;
}

/* 修改 v-list-item 的内容样式 */
:deep(.v-list-item__content) {
  padding: 0;
  min-height: unset !important;
  justify-content: flex-start;
  margin-left: 0;
}

:deep(.v-list-item__prepend) {
  padding-top: 0 !important;
  padding-bottom: 0 !important;
  min-height: unset !important;
  align-self: center;
  margin-right: -25px !important;
}

.el-dropdown-menu {
  min-width: 170px !important;
}

.el-dropdown-menu__item {
  display: flex;
  align-items: center;
  padding: 12px 20px;
  font-size: 0.95rem;
  line-height: 1.4;
}

.el-dropdown-menu__item :deep(.v-icon) {
  font-size: 18px !important;
  margin-right: 12px !important;
}

.el-dropdown-menu__item.is-divided {
  border-top: 1px solid #ebeef5;
  margin-top: 8px;
  padding-top: 8px;
}

.el-dropdown-menu__item:not(.is-disabled):hover {
  background-color: rgba(var(--v-theme-primary), 0.08);
  color: rgb(var(--v-theme-primary));
}

.edit-title-dialog {
  :deep(.el-dialog) {
    border-radius: 16px;
    overflow: hidden;
  }

  :deep(.el-dialog__header) {
    margin: 0;
    padding: 20px 20px 10px;
    text-align: center;
  }

  :deep(.el-dialog__headerbtn) {
    top: 16px;
  }

  :deep(.el-dialog__body) {
    padding: 20px;
  }

  :deep(.el-dialog__footer) {
    padding: 10px 20px 20px;
    border-top: 1px solid #f0f0f0;
  }
}

.edit-title-content {
  padding: 0 20px;
}

.input-icon {
  font-size: 16px;
  display: flex;
  align-items: center;
  opacity: 0.7;
}

:deep(.el-input) {
  .el-input__wrapper {
    box-shadow: 0 2px 12px rgba(0, 0, 0, 0.04);
    border-radius: 8px;
    padding: 8px 12px;
    transition: all 0.3s ease;
  }

  .el-input__wrapper:hover {
    box-shadow: 0 4px 16px rgba(0, 0, 0, 0.08);
  }

  .el-input__wrapper.is-focus {
    box-shadow: 0 4px 16px rgba(var(--el-color-primary-rgb), 0.15) !important;
  }

  .el-input__prefix {
    margin-right: 8px;
  }
}

.dialog-footer {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
}
</style>
