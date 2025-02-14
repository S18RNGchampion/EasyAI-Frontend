<!-- App.vue -->
<template>

  <div style="background-color: red;width:400px;height: 400px;margin-top:20px">
    <div style="background-color: green;width: 200px;height: 200px;margin-top: 20px">
      123
      456
      789
    </div>

  </div>
</template>

<script setup>
import message from "@/utils/message";
function test() {
  message.success();
}
</script>
