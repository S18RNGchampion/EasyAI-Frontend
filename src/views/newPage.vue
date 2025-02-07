<!--用户问答初始页面-->
<template>
  <v-container class="new-chat-container">
    <div class="welcome-section">
      <div class="logo-container">
        <v-icon icon="mdi-robot" color="primary" size="80" class="mr-2"></v-icon>
      </div>
      <h1 class="welcome-title">我是 EasyAI, 很高兴见到你!</h1>
      <p class="welcome-subtitle">我可以帮你写代码、读文件、写作各种创意内容，请把你的任务交给我吧~</p>
    </div>
  </v-container>
</template>

<script setup>
import openai from "@/assets/openai.svg";
import bus from "@/js/bus";
import {onMounted, onUnmounted, ref} from "vue";
import {useChatStore} from "@/js/store";

const chatStore = useChatStore();

let cards = [
  {
    'prependIcon': "mdi-camera",
    'cardText': " 用于在新城市结交朋友的活动",
    'class': "first",
    'color': "rgb(203, 139, 208)"
  },
  {
    'prependIcon': "mdi-clipboard-check-outline",
    'cardText': " 感谢我的面试官",
    'class': "second",
    'color': "rgb(118, 208, 235)"
  },
  {
    'prependIcon': "mdi-account-question-outline ",
    'cardText': " 挑选一套上镜的服装",
    'class': 'third',
    'color': "rgb(237, 98, 98)"
  },
  {
    'prependIcon': "mdi-lightbulb",
    'cardText': " 为我创建个人网页",
    'class': 'fourth',
    'color': "rgb(226, 197, 65)"
  },
];
let phoneCards=ref([cards[0],cards[1]]);
onMounted(() => {
  bus.on('addNewChat', addNewChat);
});
onUnmounted(() => {
  bus.off('addNewChat', addNewChat);
})

function cardClick(card) {
  chatStore.inputText = card.cardText;
  addNewChat();
}

function addNewChat() {
  bus.emit('loadChat', {chatId: chatStore.chatId, isNewChat: true});
  bus.emit('submitConversion');
  chatStore.chatId++;
}
</script>

<style scoped>
.new-chat-container {
  height: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding-bottom: 35vh;
}

.welcome-section {
  text-align: center;
  max-width: 600px;
}

.logo-container {
  margin-bottom: 24px;
}

.logo {
  width: 48px;
  height: 48px;
}

.welcome-title {
  font-size: 2rem;
  font-weight: 600;
  color: #333;
  margin-bottom: 16px;
}

.welcome-subtitle {
  font-size: 1.1rem;
  color: #666;
  line-height: 1.6;
}

@media (max-width: 768px) {
  .welcome-title {
    font-size: 1.5rem;
  }

  .welcome-subtitle {
    font-size: 1rem;
  }
}

.first {
  border-radius: 1rem;
  border-width: 1px;
}

.second {
  border-radius: 10px;
  border-width: 1px;

}

.third {
  border-radius: 10px;
  border-width: 1px;

}

.fourth {
  border-radius: 10px;
  border-width: 1px;

}

.v-card:hover {
  background-color: #f9f9f9;
  cursor: pointer;
}
</style>
