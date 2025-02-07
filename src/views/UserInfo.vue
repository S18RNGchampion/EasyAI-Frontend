<template>
  <v-dialog
    :width="chatStore.xs?'99%':'70%'"
    :persistent="true"
    v-model="isShow"
    class="d-flex justify-center"
  >
    <v-container class="user-profile d-flex justify-center" style="width: 100%;height: 40rem;position: relative;padding:0 0.2rem">
      <v-btn
        :style="{position: 'absolute', top:'-0.9%',right:getClosePosition(),zIndex:'200'} "
        icon="mdi-close"
        variant="text"
        @click="chatStore.userInfoShow = false"
      ></v-btn>
      <v-card style="background-color: #F0F3F8;width:22rem;height: 40rem;margin: 0 auto;position: relative">
        <v-row
          style="height: 40rem"
          rounded>
          <v-col class="justify-center d-flex flex-column align-center">
            <v-row>
              <v-card elevation="3" style="overflow: visible;width:18rem;height: 13.5rem;margin-top:3rem"
                      rounded="5rem">
                <v-row>
                  <v-col class="text-center">
                    <v-btn color="success" style="position: absolute;top:0.5rem;right:0.5rem;width:4rem;height: 2rem">
                      签到
                    </v-btn>
                    <v-avatar
                      :image="user.currentAvatar"
                      size="70"
                      class="cursor-pointer"
                      style=" margin-top: -20px "
                      @click="isPreviewImage = true"
                    ></v-avatar>
                  </v-col>
                </v-row>

                <v-row>
                  <v-col class="pt-0">
                    <div class="text-center font-weight-bold text-h6">
                      {{ user.name }}
                    </div>
                  </v-col>
                </v-row>
                <v-row>
                  <v-col class="pt-0">
                    <div class="text-center text-xxl-subtitle-1" style="color: #acaaaa;font-size: 13px">
                      {{ user.email }}
                    </div>
                  </v-col>
                </v-row>
                <v-row style="margin-left: 0;margin-right:0 ">
                  <v-divider></v-divider>
                </v-row>

                <v-row class="test" style="margin: 1rem 0 0 0">
                  <v-col class="px-0 d-flex flex-column">
                    <v-card-subtitle class="px-0 d-flex justify-center py-0">签到天数</v-card-subtitle>
                    <v-card-text class="px-0 d-flex justify-center font-weight-bold text-h6  py-1">{{
                        user.signInDay
                      }}
                    </v-card-text>
                  </v-col>
                  <v-col class="px-0 d-flex flex-column">
                    <v-card-subtitle class="px-0 d-flex justify-center py-0">签到天数</v-card-subtitle>
                    <v-card-text class="px-0 d-flex justify-center font-weight-bold text-h6  py-1">{{
                        user.signInDay
                      }}
                    </v-card-text>
                  </v-col>
                  <v-col class="px-0 d-flex flex-column">
                    <v-card-subtitle class="px-0 d-flex justify-center py-0">签到天数</v-card-subtitle>
                    <v-card-text class="px-0 d-flex justify-center font-weight-bold text-h6  py-1">{{
                        user.signInDay
                      }}
                    </v-card-text>
                  </v-col>
                </v-row>
              </v-card>
            </v-row>
            <v-row>
              <v-card elevation="3" width="18rem" class="mt-2">
                <v-card-title>修改密码</v-card-title>
                <v-card-text>
                  <v-form>
                    <v-text-field
                      label="旧密码"
                      placeholder="请输入旧密码"
                      type="password"
                      outlined
                      dense
                    ></v-text-field>
                    <v-text-field
                      label="新密码"
                      placeholder="请输入新密码"
                      type="password"
                      outlined
                      dense
                    ></v-text-field>
                    <v-text-field
                      label="确认新密码"
                      placeholder="再次输入新密码"
                      type="password"
                      outlined
                      dense
                    ></v-text-field>
                  </v-form>
                </v-card-text>
                <v-card-actions>
                  <v-spacer></v-spacer>
                  <v-btn color="primary">保存</v-btn>
                </v-card-actions>
              </v-card>
            </v-row>
          </v-col>
        </v-row>
      </v-card>
    </v-container>
  </v-dialog>
  <v-dialog v-model="isPreviewImage" width="25rem" elevation="24">
    <v-img :src="user.currentAvatar" contain @click="isPreviewImage = !isPreviewImage" width="25rem"
           height="25rem"></v-img>

    <UpLoadFile file-type="image" button-text="修改头像" @completeUpload="snackBar.completeUpload"
                @uploadFileError="snackBar.uploadFileError"></UpLoadFile>

  </v-dialog>
  <header-snack-bar v-model="snackBar.show" :status="snackBar.isUploadSuccess"
                    :title="snackBar.title" :width="snackBar.width"></header-snack-bar>
</template>

<script setup>
import {ref} from 'vue'


import {useChatStore} from "@/js/store";
import UpLoadFile from "@/components/UpLoadFile.vue";
import HeaderSnackBar from "@/components/headerSnackBar.vue";


const chatStore = useChatStore();
const isPreviewImage = ref(false);

const isShow = ref(true);
const user = ref({
  name: "小帅哥",
  email: "1020186668@qq.com",
  currentAvatar: 'https://randomuser.me/api/portraits/women/85.jpg',
  signInDay: 365,
})
const snackBar = ref({
  show: false,
  isUploadSuccess: false,
  title: "",
  width:'',
  completeUpload: (imgUrl) => {
    user.value.currentAvatar = imgUrl;
    snackBar.value.isUploadSuccess = true;
    snackBar.value.title = "头像修改成功";
    snackBar.value.show = true;
    isPreviewImage.value = false;
    snackBar.value.width="7.5rem"
  },
  uploadFileError: (error) => {
    snackBar.value.isUploadSuccess = false;
    snackBar.value.title = error;
    snackBar.value.show = true;
    isPreviewImage.value = false;
    snackBar.value.width="8.5rem"
    snackBar.value.title = "图片类型不支持";
  },
})

function  getClosePosition(){

  return chatStore.xs?'0.5%':'34.5%';
}
</script>

<style scoped>

</style>
