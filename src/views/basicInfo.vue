<!--Main 页面header 鼠标悬浮显示用户细节-->
<template>
  <v-card style="width:12rem;overflow: visible" elevation="16">
    <div style="display: flex;justify-content: center;margin: -10% 0 0 0">
      <v-avatar image="https://randomuser.me/api/portraits/women/85.jpg"
                size="70"></v-avatar>
    </div>
    <v-list>
      <v-list-item v-for="(basicInfo,index) in basicInfos" :key="index" :title="basicInfo.title" link rounded
                   @click="loadInfoDetail(basicInfo)">
        <template #prepend>
          <v-icon :icon="basicInfo.icon"></v-icon>
        </template>
      </v-list-item>
    </v-list>
  </v-card>

</template>

<script setup>
import {useChatStore, useUserStore} from "@/js/store";
import router from "@/router";
import {ref} from "vue";

import bus from "@/js/bus";

const chatStore = useChatStore();
const userStore = useUserStore();

const basicInfos = [
  {
    title: "个人信息",
    icon: "mdi-account",
  },
  {
    title: "流量明细",
    icon: "mdi-chart-bar",
  },
  {
    title: "我的订单",
    icon: "mdi-clipboard-search-outline"
  },
  {
    title: '邀请用户',
    icon: "mdi-account-plus",
  },
  {
    title: "退出登录",
    icon: "mdi-exit-to-app",
  },

];

function loadInfoDetail(basicInfo) {
  chatStore.basicInfoShow = false;
  if (basicInfo.title === "个人信息") {
    chatStore.userInfoShow = true;
  } else if (basicInfo.title === "流量明细") {
    chatStore.flowRateDetailShow = true;
  } else if (basicInfo.title === "我的订单") {
    chatStore.myOrderShow = true;
  } else if (basicInfo.title === "邀请用户") {
    chatStore.invitePeopleShow = true;
  } else {
    bus.emit('logout');
  }
}

</script>
