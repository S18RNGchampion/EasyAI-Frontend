import {defineStore} from 'pinia'
import {ref, reactive} from 'vue'
import {useDisplay} from "vuetify";


//记住要return出去！！！！！！！！！！！！
export const useChatStore = defineStore('chat', () => {
  //发送请求的chat
  const messageList = ref([]);
  //用户看到的chat

  const aiMessage = ref(null);
  const shouldAutoScroll = ref(false);
  const isGeneration = ref(false);
  const inputIsLoading = ref(false);
  const inputText = ref("");



  const invitePeopleShow = ref(false);
  const basicInfoShow = ref(false);
  const myOrderShow = ref(false);
  const flowRateDetailShow = ref(false);
  const userInfoShow = ref(false);
  const scrollToButtonVisual=ref(false);
  const {xs} = useDisplay();
  const sideBarShow = ref(!xs.value);


  const isChatting = ref(false);   //是否正在对话
  const inputRow=ref(1)   //输入组件当前行数

  const codeInputVisible=ref(false);

  const selectedSessionId = ref(null);
  const selectedModel = ref(null);

  const parentId=ref(null);
  const messageId=ref(null);
  const streamCompleteInfo=ref();
  const lastUserMessage=ref(null);
  const lastAiMessage=ref(null);
  const isNewChat=ref(true);
  const remainingTokens=ref(0);
  const userInfo = ref(null);
  const chatTitle=ref(null);
  const rechargeCardShow=ref(false);
  function toggleAutoScroll() {
    shouldAutoScroll.value = !shouldAutoScroll.value
  }


  return {
    messageList,
    aiMessage,
    shouldAutoScroll,
    isGeneration,
    inputIsLoading,
    inputText,


    myOrderShow,
    flowRateDetailShow,
    sideBarShow,
    invitePeopleShow,
    basicInfoShow,
    userInfoShow,
    xs,
    toggleAutoScroll,




    isChatting,
    inputRow,
    scrollToButtonVisual,


    selectedSessionId,
    selectedModel,

    parentId,
    messageId,
    lastUserMessage,
    lastAiMessage,
    streamCompleteInfo,
    isNewChat,
    remainingTokens,
    userInfo,
    chatTitle,
    rechargeCardShow,
    codeInputVisible,

  }
})

export const useUserStore = defineStore('user', () => {



})
