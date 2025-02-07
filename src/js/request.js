import axios from 'axios';
import OpenAI from "openai";
import bus from "@/js/bus";

const TONGYI_API_URL = '/api/v1/services/aigc/text-generation/generation';
const TONGYI_API_KEY = import.meta.env.VITE_DASHSCOPE_API_KEY;
const LangChain4j_API_URL = "/api/postChatTokenSteam";
const stop_stream = "/api/stop"


export function getGPTStreamResponse(session_id, userMessage, updateCallBack,endCallBack) {
  const data = {
    session_id: session_id,
    userMessage: userMessage
  };

  fetch(LangChain4j_API_URL, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${import.meta.env.VITE_DASHSCOPE_API_KEY}`,
      'Content-Type': 'application/json',
      'X-DashScope-SSE': 'enable'
    },
    body: JSON.stringify(data)
  }).then(response => {
    const reader = response.body.getReader();
    const decoder = new TextDecoder("utf-8");
    let buffer = ""; // 缓存数据流中接收的部分内容

    const readStream = () => {
      reader.read().then(({done, value}) => {
        if (done) {
          return;
        }

        // 将接收到的值解码并追加到缓冲区
        buffer += decoder.decode(value, {stream: true});

        // 按行分割，保留最后一个（可能未结束的）部分
        const messages = buffer.split('\n');

        // 遍历分割出的每一行
        messages.slice(0, -1).forEach(message => { // 忽略未完成的部分
          if (message.trim().startsWith("data:")) {
            try {
              // 去掉 "data:" 前缀并解析 JSON
              const jsonData = JSON.parse(message.replace("data:", "").trim());
              const {content, status} = jsonData;

              if (status === "end") {
                endCallBack();
              } else {
                updateCallBack(content);  // 更新显示内容
              }
            } catch (e) {
              console.error("JSON parse error:", e);
            }
          }
        });

        // 处理未完成的部分，存入缓冲区
        buffer = messages[messages.length - 1];

        // 继续读取流
        readStream();
      });
    };
    // 开始读取流
    readStream();
  })

}




export function stopGTPStream() {
  fetch(stop_stream, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${import.meta.env.VITE_DASHSCOPE_API_KEY}`,
      'Content-Type': 'application/json',
      'X-DashScope-SSE': 'enable'
    }
  }).then(response => {

  })
}


