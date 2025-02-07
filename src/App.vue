<template>

  <v-app>
    <router-view v-slot="{ Component }">
      <transition name="fade-slide" mode="out-in">
        <component :is="Component" />
      </transition>
    </router-view>
  </v-app>

</template>

<script setup>
import { onMounted } from 'vue';

onMounted(()=>{
  document.title = "EasyAI";
})

</script>
<style>
html,body{
  overflow: hidden;
}

.fade-slide-enter-active,
.fade-slide-leave-active {
  transition: all 0.3s ease;
}

.fade-slide-enter-from {
  opacity: 0;
  transform: translateX(30px);
}

.fade-slide-leave-to {
  opacity: 0;
  transform: translateX(-30px);
}
</style>
