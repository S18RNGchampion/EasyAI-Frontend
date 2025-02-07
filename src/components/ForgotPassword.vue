<template>
  <v-form ref="forgotPasswordRef" class="forgot-password-form py-4">
    <v-card
      elevation="5"
      class="mx-auto pa-12 pb-8 flip-card"
      rounded="lg"
      :width="!chatStore.xs ? '65%' : '100%'"
    >
      <h2 class="text-center" style="margin-bottom:20px">找回密码</h2>
      
      <!-- 第一步：邮箱验证 -->
      <div v-if="!isEmailVerified">
        <v-text-field
          class="my-2"
          label="邮箱"
          color="#2F94F1"
          density="compact"
          variant="outlined"
          v-model="email"
          :error="emailError"
          @click="emailError=false"
          :error-messages="emailError ? ['请输入有效的邮箱地址'] : []"
        >
        </v-text-field>

        <div style="display: flex;align-items: center;justify-content: flex-end">
          <v-text-field
            class="my-2"
            density="compact"
            label="验证码"
            color="#2F94F1"
            variant="outlined"
            hide-details="true"
            v-model="emailCode"
          >
          </v-text-field>

          <el-button
            :disabled="isCountingDown"
            :loading="isSendingEmail"
            style="margin: 0 0 0 5%; padding: 6% 4% 6% 4%;width:120px"
            type="primary"
            @click="sendEmailCode"
          >
            {{ isCountingDown ? `${countdown}s 后重试` : '发送验证码' }}
          </el-button>
        </div>

        <v-btn
          width="100%"
          :loading="verifyLoading"
          color="#2F94F1"
          class="btn form mt-4"
          block
          @click="verifyEmail"
        >
          验证邮箱
        </v-btn>
      </div>

      <!-- 第二步：设置新密码 -->
      <div v-else>
        <v-text-field
          class="my-2"
          label="新密码"
          color="#2F94F1"
          density="compact"
          type="password"
          variant="outlined"
          v-model="newPassword"
          :error="passwordError"
          @click="passwordError=false"
          :error-messages="passwordError ? passwordErrorMessage : []"
        >
        </v-text-field>

        <v-text-field
          class="my-2"
          label="确认新密码"
          color="#2F94F1"
          density="compact"
          type="password"
          variant="outlined"
          v-model="confirmPassword"
          :error="confirmPasswordError"
          @click="confirmPasswordError=false"
          :error-messages="confirmPasswordError ? ['两次输入的密码不一致'] : []"
        >
        </v-text-field>

        <v-btn
          width="100%"
          :loading="resetLoading"
          color="#2F94F1"
          class="btn form mt-4"
          block
          @click="handleResetPassword"
        >
          重置密码
        </v-btn>
      </div>

      <div class="text-center mt-4">
        <a href="#" @click="$emit('back-to-login')" class="text-decoration-none">返回登录</a>
      </div>
    </v-card>
  </v-form>
</template>

<script setup>
import { ref } from 'vue';
import { useChatStore } from "@/js/store";
import { sendEmail, resetPassword } from '@/js/api/user/user';
import { ElNotification } from 'element-plus';

const chatStore = useChatStore();
const emit = defineEmits(['back-to-login']);

const email = ref('');
const emailCode = ref('');
const newPassword = ref('');
const confirmPassword = ref('');
const emailError = ref(false);
const passwordError = ref(false);
const passwordErrorMessage = ref('');
const confirmPasswordError = ref(false);
const resetLoading = ref(false);
const verifyLoading = ref(false);
const isCountingDown = ref(false);
const isSendingEmail = ref(false);
const countdown = ref(60);
const isEmailVerified = ref(false);

function validateEmail(email) {
  const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return re.test(email);
}

function verifyInputs() {
  passwordError.value = !newPassword.value || newPassword.value.length < 8;
  passwordErrorMessage.value = passwordError.value && newPassword.value.length < 8 ? '密码长度必须大于8位' : '密码不能为空';
  confirmPasswordError.value = newPassword.value !== confirmPassword.value;
  return !passwordError.value && !confirmPasswordError.value;
}

async function sendEmailCode() {
  if (isCountingDown.value || !validateEmail(email.value)) {
    emailError.value = !validateEmail(email.value);
    return;
  }

  try {
    isSendingEmail.value = true;
    const data = await sendEmail(email.value, 3); // 使用场景 2 表示重置密码
    showTag('success', '成功', '验证码发送成功', "top-left");
    startCountdown();
  } catch (error) {
    if (error.code === 500) {
      showTag('error', '验证码发送失败', error.msg, "top-left");
    } else if (error.code === 501) {
      showTag('error', '服务器故障', error.msg);
    }
  } finally {
    isSendingEmail.value = false;
  }
}

function startCountdown() {
  isCountingDown.value = true;
  countdown.value = 60;
  const timer = setInterval(() => {
    countdown.value -= 1;
    if (countdown.value <= 0) {
      clearInterval(timer);
      isCountingDown.value = false;
    }
  }, 1000);
}

async function verifyEmail() {
  if (!validateEmail(email.value)) {
    emailError.value = true;
    return;
  }
  if (!emailCode.value) {
    showTag('error', '验证失败', '请输入验证码');
    return;
  }

  try {
    verifyLoading.value = true;
    // 这里需要调用验证邮箱的API
    // const data = await verifyEmailCode(email.value, emailCode.value);
    // 暂时模拟验证成功
    isEmailVerified.value = true;
    showTag('success', '验证成功', '请设置新密码');
  } catch (error) {
    showTag('error', '验证失败', error.msg || '验证码错误');
  } finally {
    verifyLoading.value = false;
  }
}

async function handleResetPassword() {
  if (!verifyInputs()) return;

  try {
    resetLoading.value = true;
    await resetPassword(email.value, emailCode.value, newPassword.value);
    showTag('success', '成功', '密码重置成功，请重新登录');
    setTimeout(() => {
      emit('back-to-login');
    }, 1500);
  } catch (error) {
    if (error.code === 500) {
      showTag('error', '重置失败', error.msg);
    } else if (error.code === 501) {
      showTag('error', '服务器故障', error.msg);
    }
  } finally {
    resetLoading.value = false;
  }
}

function showTag(type, title, message, position = "top-right") {
  ElNotification({
    title,
    message,
    type,
    duration: 1500,
    position,
  });
}
</script>

<style scoped>
.forgot-password-form {
  width: 100%;
}
</style> 