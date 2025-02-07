<template>
  <el-button @click="startRequest">
    Start Request
  </el-button>
  <el-button @click="cancelRequest">
    Cancel Request
  </el-button>
</template>

<script setup>
import {ref} from "vue";

// 定义 AbortController
const controller = ref(null);

function startRequest() {
  // 创建新的 AbortController
  controller.value = new AbortController();

  fetch("/api/postChatTokenSteam", {method:'post',signal: controller.value.signal})
    .then(response => response.text())
    .then(data => console.log(data))
    .catch(err => {
      if (err.name === "AbortError") {
        console.log("Request canceled");
      } else {
        console.error("Request failed:", err);
      }
    });
}

function cancelRequest() {
  if (controller.value) {
    controller.value.abort(); // 触发取消请求
    console.log("Request canceled by user");
  } else {
    console.log("No ongoing request to cancel");
  }
}
</script>
