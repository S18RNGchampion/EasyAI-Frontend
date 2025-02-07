import instance from "@/js/GlobalConfigAxios";
import notification from "@/utils/notification";
import CustomError from "@/js/error/CustomError";
// import messageEncryptUtil from "@/utils/encrypt";

async function deleteChatBySessionId(session_id) {
  const response = await instance.delete('/easyai/conversation/' + session_id);
  return response.data;
}

async function getChatList() {
  const response = await instance.get('/easyai/conversation/list')
  return response.data;
}

async function getMessageList(sessionId) {
  const response = await instance.get('/easyai/message/list?session_id=' + sessionId)
  return response.data;
}

async function getModelList(){
  const response = await instance.get('/easyai/auth/model/list')
  return response.data;
}

async function getModelUsage() {
  const response = await instance.get('/easyai/usage/summary')
  return response.data;
}

// 未使用axios封装 请求地址要添加/api
async function chat(userMessage, modelName, session_id = null, parent_id = null, options = {}) {
  try {
    // const encryptMessage = messageEncryptUtil.encrypt(userMessage);
    const response = await fetch('/api/easyai/conversation', {
      method: 'POST',
      headers: {
        'Authorization': localStorage.getItem("token"),
        'Content-Type': 'application/json',
        'Accept': '*/*'
      },
      body: JSON.stringify({
        userMessage: userMessage,
        modelName:  modelName,
        ...(session_id && { session_id }),
        parent_id: parent_id
      })
    })

    if (!response.ok) {
      throw new CustomError(501, "连接服务器失败,请稍后再试");
    }

    // 获取可读流
    const reader = response.body.getReader()
    const decoder = new TextDecoder()

    // 读取流数据
    while (true) {
      const { value, done } = await reader.read()
      if (done) break

      // 解码二进制数据
      const chunk = decoder.decode(value)

      // 按data:分割获取每个消息
      const messages = chunk.split('data:').filter(msg => msg.trim())

      for (const msg of messages) {
        try {
          const data = JSON.parse(msg.trim())
          // 检查是否返回错误状态码
          if (data.code === 500) {
            throw new CustomError(data.code, data.msg);
          }
          // 根据消息类型处理
          switch (data.phase) {
            case 'start':
              options.onStart?.(data.session_id, data.content)
              break
            case 'chat':
              options.onMessage?.(data.content)
              break
            case 'conclude':
              options.onConclude?.(data.session_id, data.content)
              break
            case 'error':
              options.onError?.(data.session_id, data.content)
              break
          }
        } catch (error) {
          if (error instanceof CustomError) {
            throw error;
          }
          console.error('Error parsing message:', error)
        }
      }
    }
  } catch (error) {
    console.error('Stream request failed:', error)
    throw error
  }
}


async function stopGTPStream() {
  const response = await fetch("/api/stop", {
    method: 'POST',
  });
  return await response.json();
}

async function editChatTitle(session_id, title) {
  const response = await instance.patch('/easyai/conversation', {
    session_id,
    title
  })
  return response.data
}


export { deleteChatBySessionId, getChatList, getMessageList, chat, stopGTPStream, editChatTitle, getModelList, getModelUsage }
