<template>

  <div>
    <v-btn @click="Function">no promise</v-btn>
  </div>
  <div>
    <v-btn @click="test">test</v-btn>
  </div>

</template>

<script setup>
import {computed, ref} from 'vue'
import {useChatStore, useUserStore} from "@/js/store";
import axios from "axios";


async function asyncFunction() {
  return "异步操作完成";
}

async function test(){
  console.log(await asyncFunction())
}

async function Function() {
  try {
    let response = await axios.get('/api/test'); // 等待请求完成
    console.log(response); // 打印响应结果
  } catch (error) {
    console.log('Error:', error); // 捕获并处理错误
  }
}


</script>
