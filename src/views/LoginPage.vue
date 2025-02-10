<template>
  <div class="container" :class="{ 'sign-up-mode': !loginPageShow }">
    <div class="forms-container">
      <div class="signin-signup" :class="{ 'align-start': chatStore.xs }">
        <v-form ref="loginRef" class="sign-in-form py-4" v-if="!showForgotPasswordForm">
          <v-card elevation="5" class="mx-auto pa-12 pb-8 flip-card pb-3" rounded="lg"
            :width="!chatStore.xs ? '65%' : '100%'">
            <div class="logo-container">
              <v-icon icon="mdi-robot" color="primary" size="48" class="logo-icon"></v-icon>
              <h1 class="logo-text">EasyAI</h1>
            </div>
            <div class="logo-subtitle">AI 助手，让对话更轻松</div>

            <h2 class="text-center login-title">登&nbsp;&nbsp;录</h2>
            <v-text-field class="my-2" label="邮箱" color="#2F94F1" density="compact" variant="outlined" v-model="email"
              :error="emailError" @click="emailError = false" :error-messages="emailError ? [emailErrorMessage] : []"
              @keyup.enter="handleLogin">
            </v-text-field>


            <v-text-field class="my-2" density="compact" label="密码" color="#2F94F1" type="password" variant="outlined"
              v-model="password" :error="passwordError" @click="passwordError = false"
              :error-messages="passwordError ? passwordErrorMessage : []" @keyup.enter="handleLogin">
            </v-text-field>
            <el-button type="primary" :loading="loginLoading" class="login-button" @click="handleLogin">
              {{ loginLoading ? '登录中...' : '登录' }}
            </el-button>
            <div class="text-center mt-2">
              <router-link to="/reset-password" class="text-decoration-none"
                style="text-decoration: #3291F0;">忘记密码？</router-link>
            </div>

          </v-card>

        </v-form>

        <v-form ref="signUpRef" class="sign-up-form py-4" v-if="!showForgotPasswordForm">
          <v-card class="mx-auto pa-12 pb-8 flip-card" elevation="5" rounded="lg"
            :width="!chatStore.xs ? '65%' : '100%'">
            <div class="logo-container">
              <v-icon icon="mdi-robot" color="primary" size="48" class="logo-icon"></v-icon>
              <h1 class="logo-text">EasyAI</h1>
            </div>
            <div class="logo-subtitle">AI 助手，让对话更轻松</div>

            <h2 class="text-center login-title">注&nbsp;&nbsp;册</h2>
            <v-text-field class="my-2" label="邮箱" color="#2F94F1" density="compact" placeholder="邮箱" variant="outlined"
              v-model="email" :error="emailError" @click="emailError = false"
              :error-messages="emailError ? [emailErrorMessage] : []">
            </v-text-field>
            <v-text-field class="my-2" label="密码" color="#2F94F1" density="compact" placeholder="密码" type="password"
              variant="outlined" v-model="password" @click="passwordError = false" :error="passwordError"
              :error-messages="passwordError ? passwordErrorMessage : []">

            </v-text-field>
            <v-text-field class="my-2" label="确定密码" color="#2F94F1" density="compact" placeholder="确定密码" type="password"
              variant="outlined" v-model="confirmPassword" @click="confirmPasswordError = false"
              :error="confirmPasswordError" :error-messages="confirmPasswordError ? ['两次输入的密码不一致'] : []">

            </v-text-field>

            <div style="display: flex;align-items: center;justify-content: flex-end">
              <v-text-field class="my-2" density="compact" placeholder="验证码" color="#2F94F1" variant="outlined"
                hide-details="true" v-model="emailCode" label="验证码"
                :error="emailCodeError"
                :error-messages="emailCodeError ? [emailCodeErrorMessage] : []"
                @click="emailCodeError = false">
              </v-text-field>


              <el-button :disabled="isCountingDown" :loading="isSendingEmail"
                style="margin: 0 0 0 5%; padding: 6% 4% 6% 4%;width:120px" type="primary" @click="sendEmailCode">
                {{ isCountingDown ? `${countdown}s 后重试` : '发送验证码' }} <!-- 倒计时或默认文字 -->
              </el-button>
            </div>

            <v-btn class="mb-8" color="#2F94F1" size="large" block @click="handleRegister" style="margin:6% 0 0 0">
              注册
            </v-btn>
          </v-card>
        </v-form>

        <ForgotPassword v-if="showForgotPasswordForm" @back-to-login="showLogin" class="forgot-password-form" />
      </div>
    </div>

    <div class="panels-container">
      <div class="panel left-panel">
        <div class="content">
          <div class="welcome-content">
            <div class="feature-list">
              <div class="feature-item">
                <v-icon icon="mdi-brain" color="white" size="20" class="feature-icon"></v-icon>
                <span>智能对话，自然流畅</span>
              </div>
              <div class="feature-item">
                <v-icon icon="mdi-lightning-bolt" color="white" size="20" class="feature-icon"></v-icon>
                <span>快速响应，高效助手</span>
              </div>
              <div class="feature-item">
                <v-icon icon="mdi-shield-check" color="white" size="20" class="feature-icon"></v-icon>
                <span>安全可靠，隐私保护</span>
              </div>
            </div>
            <p class="welcome-description">新用户？立即加入我们，开启智能对话之旅</p>
            <v-btn color="white" size="large" block @click="showRegister" class="action-btn">
              <span class="action-btn-text">免费注册</span>
            </v-btn>
          </div>
        </div>
      </div>
      <div class="panel right-panel" :class="{ 'py-2': chatStore.xs, 'align-start': chatStore.xs }">
        <div class="content">
          <div class="welcome-content">
            <v-icon icon="mdi-account-check" color="white" size="64" class="welcome-icon"></v-icon>
            <h3 class="welcome-title">欢迎回来</h3>
            <p class="welcome-description">已有账号？立即登录使用全部功能</p>
            <v-btn color="white" size="large" block @click="showLogin" class="action-btn">
              <span class="action-btn-text">立即登录</span>
            </v-btn>
          </div>
        </div>
      </div>
    </div>

  </div>
</template>

<script setup>
import { ref, watch } from 'vue';
import { useRouter, useRoute } from 'vue-router';
import { register, login, sendEmail } from '@/js/api/user/user'
import ForgotPassword from '@/components/ForgotPassword.vue';
import notification from '@/utils/notification';
import { ElLoading } from 'element-plus'

const router = useRouter();
const route = useRoute();
import { useChatStore, useUserStore } from "@/js/store";


const chatStore = useChatStore();
const userStore = useUserStore();

const loginPageShow = ref(true);
const email = ref('');
const password = ref('');
const confirmPassword = ref('');
const emailError = ref(false);
const emailErrorMessage = ref('');
const passwordError = ref(false);
const passwordErrorMessage = ref('');
const confirmPasswordError = ref(false);
const inviteCode = ref(null);  // 添加邀请码的状态
const emailCode = ref('');
const emailCodeError = ref(false);
const emailCodeErrorMessage = ref('');


const loginLoading = ref(false);
const signUpLoading = ref(false);
const isCountingDown = ref(false); // 控制按钮是否禁用
const isSendingEmail = ref(false);
const countdown = ref(60); // 初始倒计时时间
const showForgotPasswordForm = ref(false);

watch(route, () => {
  if (route.path === '/register') {
    loginPageShow.value = false;
    if (route.query.inviteCode) {
      inviteCode.value = route.query.inviteCode;
    }
  } else {
    loginPageShow.value = true;
  }
}, { immediate: true });

function validateEmail(email) {
  const re = /^[a-zA-Z0-9_+&*-]+(?:\.[a-zA-Z0-9_+&*-]+)*@(?:[a-zA-Z0-9-]+\.)+[a-zA-Z]{2,7}$/;
  return re.test(email);
}

function validatePassword(pwd) {
  const re = /^(?=.*[0-9])(?=.*[a-zA-Z])[0-9a-zA-Z]{6,}$/;
  return re.test(pwd);
}

function verifyLoginInput() {
  emailError.value = !validateEmail(email.value);
  if (!email.value) {
    emailError.value = true;
    emailErrorMessage.value = '邮箱不能为空';
  } else if (!validateEmail(email.value)) {
    emailError.value = true;
    emailErrorMessage.value = '请输入有效的邮箱地址';
  }

  passwordError.value = !validatePassword(password.value);
  if (!password.value) {
    passwordError.value = true;
    passwordErrorMessage.value = '密码不能为空';
  } else if (password.value.length < 6) {
    passwordError.value = true;
    passwordErrorMessage.value = '密码长度必须至少6位';
  } else if (!validatePassword(password.value)) {
    passwordError.value = true;
    passwordErrorMessage.value = '密码必须包含数字和字母';
  }
}

function verifyRegisterInput() {
  emailError.value = !validateEmail(email.value);
  if (!email.value) {
    emailError.value = true;
    emailErrorMessage.value = '邮箱不能为空';
  } else if (!validateEmail(email.value)) {
    emailError.value = true;
    emailErrorMessage.value = '请输入有效的邮箱地址';
  }

  passwordError.value = !validatePassword(password.value);
  if (!password.value) {
    passwordError.value = true;
    passwordErrorMessage.value = '密码不能为空';
  } else if (password.value.length < 6) {
    passwordError.value = true;
    passwordErrorMessage.value = '密码长度必须至少6位';
  } else if (!validatePassword(password.value)) {
    passwordError.value = true;
    passwordErrorMessage.value = '密码必须包含数字和字母';
  }

  confirmPasswordError.value = password.value !== confirmPassword.value;

  emailCodeError.value = !emailCode.value;
  if (!emailCode.value) {
    emailCodeError.value = true;
    emailCodeErrorMessage.value = '请输入验证码';
  }

  return !emailError.value && !passwordError.value && !confirmPasswordError.value && !emailCodeError.value;
}

function verifyInputBeforeSendEmail() {
  emailError.value = !validateEmail(email.value);
}


async function handleLogin() {
  verifyLoginInput();
  if (!emailError.value && !passwordError.value) {
    const loading = ElLoading.service({
      lock: true,
      text: '登录中...',
      background: 'rgba(255, 255, 255, 0.7)',
    })
    try {
      loginLoading.value = true;
      const data = await login(email.value, password.value);
      console.log(data.access_token)
      localStorage.setItem("token", data.access_token);
      notification.success('登录成功！', '登录成功！即将跳转！')
      setTimeout(() => {
        router.push("/chat")
      }, 1000)
    } catch (error) {
      console.log(error)
      if (error.code === 500) {
        notification.error('登录失败！', error.msg, 3000)
      } else if (error.code === 501) {
        notification.networkError();
      }
      loginLoading.value = false;
    } finally {
      loading.close()
    }
  }
}

async function handleRegister() {
  if (!verifyRegisterInput()) {
    return;
  }

  const loading = ElLoading.service({
    lock: true,
    text: '注册中...',
    background: 'rgba(255, 255, 255, 0.7)',
  })
  try {
    const data = await register(email.value, password.value, emailCode.value, inviteCode.value);
    notification.success('注册成功!', "注册成功！快去登录吧！", 3000, 'top-left');
    router.push('/login');
    resetForm();
  } catch (error) {
    if (error.code === 500) {
      notification.error('注册失败!', error.msg, 3000, 'top-left');
    } else if (error.code === 501) {
      notification.networkError();
    }
  } finally {
    loading.close()
  }
}

async function sendEmailCode() {
  if (isCountingDown.value) {
    return;
  }
  verifyInputBeforeSendEmail();
  if (emailError.value) {
    return;
  }

  const loading = ElLoading.service({
    lock: true,
    text: '发送中...',
    background: 'rgba(255, 255, 255, 0.7)',
  })
  try {
    isSendingEmail.value = true;
    const data = await sendEmail(email.value, 1);
    notification.success('成功!', '验证码发送成功！', 1500, 'top-left');
    isCountingDown.value = true;
    countdown.value = 60;
    const timer = setInterval(() => {
      countdown.value -= 1;
      if (countdown.value <= 0) {
        clearInterval(timer);
        isCountingDown.value = false;
      }
    }, 1000);
  } catch (error) {
    if (error.code === 500) {
      notification.error('验证码发送失败！', error.msg, 3000, 'top-left');
    } else if (error.code === 501) {
      notification.networkError();
    }
  } finally {
    isSendingEmail.value = false;
    loading.close()
  }
}


function showRegister() {
  resetForm();
  if (inviteCode.value) {
    router.push('/register?inviteCode=' + inviteCode.value);  // 更新路由
  } else {
    router.push('/register')
  }

}

function showLogin() {
  resetForm();
  showForgotPasswordForm.value = false;
  router.push('/login');  // 更新路由
}

function resetForm() {
  email.value = '';
  password.value = '';
  confirmPassword.value = '';
  emailCode.value = '';
  emailError.value = false;
  emailErrorMessage.value = '';
  passwordError.value = false;
  confirmPasswordError.value = false;
  passwordErrorMessage.value = '';
  emailCodeError.value = false;
  emailCodeErrorMessage.value = '';
}

function showForgotPassword() {
  showForgotPasswordForm.value = true;
  loginPageShow.value = true;
  resetForm();
}

</script>


<style scoped>
@import url("https://fonts.googleapis.com/css2?family=Poppins:wght@200;300;400;500;600;700;800&display=swap");

* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

body,
input {
  font-family: "Poppins", sans-serif;
}

.container {
  position: relative;
  width: 100%;
  background-color: #fff;
  min-height: 100vh;
  overflow: hidden;

  &.leave-active {
    transition: all 0.3s ease;
  }

  &.leave-to {
    opacity: 0;
    transform: translateX(-30px);
  }
}

.forms-container {
  position: absolute;
  width: 100%;
  height: 100%;
  top: 0;
  left: 0;
}

.signin-signup {
  position: absolute;
  top: 50%;
  transform: translate(-50%, -50%);
  left: 75%;
  width: 50%;
  transition: 1s 0.7s ease-in-out;
  display: grid;
  grid-template-columns: 1fr;
  z-index: 5;
}

form {
  display: flex;
  align-items: center;
  justify-content: center;
  flex-direction: column;
  padding: 0rem 5rem;
  transition: all 0.2s 0.7s;
  overflow: hidden;
  grid-column: 1 / 2;
  grid-row: 1 / 2;
}

form.sign-up-form {
  opacity: 0;
  z-index: 1;
}

form.sign-in-form {
  z-index: 2;
}

.title {
  font-size: 2.2rem;
  color: #444;
  margin-bottom: 10px;
}

.input-field {
  max-width: 380px;
  width: 100%;
  background-color: #f0f0f0;
  margin: 10px 0;
  height: 55px;
  border-radius: 55px;
  display: grid;
  grid-template-columns: 15% 85%;
  padding: 0 0.4rem;
  position: relative;
}

.input-field input {
  background: none;
  outline: none;
  border: none;
  line-height: 1;
  font-weight: 600;
  font-size: 1.1rem;
  color: #333;
}

.social-text {
  padding: 0.7rem 0;
  font-size: 1rem;
}

.social-media {
  display: flex;
  justify-content: center;
}

.social-icon {
  height: 46px;
  width: 46px;
  display: flex;
  justify-content: center;
  align-items: center;
  margin: 0 0.45rem;
  color: #333;
  border-radius: 50%;
  border: 1px solid #333;
  text-decoration: none;
  font-size: 1.1rem;
  transition: 0.3s;
}

.social-icon:hover {
  color: #4481eb;
  border-color: #4481eb;
}

.btn {
  width: 150px;
  background-color: #5995fd;
  border: none;
  outline: none;
  height: 49px;
  border-radius: 49px;
  color: #fff;
  text-transform: uppercase;
  font-weight: 600;
  margin: 10px 0;
  cursor: pointer;
  transition: 0.5s;
}

.btn:hover {
  background-color: #4d84e2;
}

.panels-container {
  position: absolute;
  height: 100%;
  width: 100%;
  top: 0;
  left: 0;
  display: grid;
  grid-template-columns: repeat(2, 1fr);
}

.container:before {
  content: "";
  position: absolute;
  height: 2000px;
  width: 2000px;
  top: -10%;
  right: 48%;
  transform: translateY(-50%);
  background-image: linear-gradient(-45deg, #4481eb 0%, #04befe 100%);
  transition: 1.8s ease-in-out;
  border-radius: 50%;
  z-index: 6;
}

.panel {
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  justify-content: space-around;
  align-items: center;
  text-align: center;
  z-index: 6;
}

.left-panel {
  pointer-events: all;
  padding: 3rem 17% 2rem 12%;
}

.right-panel {
  pointer-events: none;
  padding: 3rem 12% 2rem 17%;
}

.panel .content {
  color: #fff;
  transition: transform 0.9s ease-in-out;
  transition-delay: 0.6s;
}

.panel h3 {
  font-weight: 600;
  line-height: 1;
  font-size: 1.5rem;
}

.panel p {
  font-size: 0.95rem;
  padding: 0.7rem 0;
}

.btn.transparent {
  margin: 0;
  background: none;
  border: 2px solid #fff;
  width: 130px;
  height: 41px;
  font-weight: 600;
  font-size: 0.8rem;
}

.btn.transparent:hover {
  background: #fff;
  color: #5995fd;
}

.right-panel .image,
.right-panel .content {
  transform: translateX(800px);
}

/* 动画 */
.container.sign-up-mode:before {
  transform: translate(100%, -50%);
  right: 52%;
}

.container.sign-up-mode .left-panel .image,
.container.sign-up-mode .left-panel .content {
  transform: translateX(-800px);
}

.container.sign-up-mode .signin-signup {
  left: 25%;
}

.container.sign-up-mode form.sign-up-form {
  opacity: 1;
  z-index: 2;
}

.container.sign-up-mode form.sign-in-form {
  opacity: 0;
  z-index: 1;
}

.container.sign-up-mode .right-panel .image,
.container.sign-up-mode .right-panel .content {
  transform: translateX(0%);
}

.container.sign-up-mode .left-panel {
  pointer-events: none;
}

.container.sign-up-mode .right-panel {
  pointer-events: all;
}

@media (max-width: 870px) {
  .container {
    min-height: 800px;
    height: 100vh;
  }

  .signin-signup {
    width: 100%;
    top: 95%;
    transform: translate(-50%, -100%);
    transition: 1s 0.8s ease-in-out;
  }

  .signin-signup,
  .container.sign-up-mode .signin-signup {
    left: 50%;
  }

  .panels-container {
    grid-template-columns: 1fr;
    grid-template-rows: 1fr 2fr 1fr;
  }

  .panel {
    flex-direction: row;
    justify-content: space-around;
    align-items: center;
    padding: 2.5rem 8%;
    grid-column: 1 / 2;
  }

  .right-panel {
    grid-row: 3 / 4;
  }

  .left-panel {
    grid-row: 1 / 2;
  }

  .image {
    width: 200px;
    transition: transform 0.9s ease-in-out;
    transition-delay: 0.6s;
  }

  .panel .content {
    padding-right: 15%;
    transition: transform 0.9s ease-in-out;
    transition-delay: 0.8s;
  }

  .panel h3 {
    font-size: 1.2rem;
  }

  .panel p {
    font-size: 0.7rem;
    padding: 0.5rem 0;
  }

  .btn.transparent {
    width: 110px;
    height: 35px;
    font-size: 0.7rem;
  }

  .container:before {
    width: 1500px;
    height: 1500px;
    transform: translateX(-50%);
    left: 30%;
    bottom: 68%;
    right: initial;
    top: initial;
    transition: 2s ease-in-out;
  }

  .container.sign-up-mode:before {
    transform: translate(-50%, 100%);
    bottom: 32%;
    right: initial;
  }

  .container.sign-up-mode .left-panel .image,
  .container.sign-up-mode .left-panel .content {
    transform: translateY(-300px);
  }

  .container.sign-up-mode .right-panel .image,
  .container.sign-up-mode .right-panel .content {
    transform: translateY(0px);
  }

  .right-panel .image,
  .right-panel .content {
    transform: translateY(300px);
  }

  .container.sign-up-mode .signin-signup {
    top: 5%;
    transform: translate(-50%, 0);
  }
}

@media (max-width: 570px) {
  form {
    padding: 0 1.5rem;
  }

  .image {
    display: none;
  }

  .panel .content {
    padding: 0.5rem 1rem;
  }

  .container {
    padding: 1.5rem;
  }

  .container:before {
    bottom: 72%;
    left: 50%;
  }

  .container.sign-up-mode:before {
    bottom: 28%;
    left: 50%;
  }
}

.forgot-password-form {
  width: 100%;
}

.login-button {
  width: 100%;
  height: 44px;
  font-size: 16px;
  font-weight: 500;
  border-radius: 8px;
  background: #3392F0;
  border: none;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  margin: 10px 0;
}

.login-button:hover {
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(var(--el-color-primary-rgb), 0.3);
}

.login-button:active {
  transform: translateY(1px);
}

.logo-container {
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 8px;
  animation: fadeInDown 0.8s ease;
}

.logo-icon {
  margin-right: 12px;
  animation: float 3s ease-in-out infinite;
}

.logo-text {
  font-size: 2.5rem;
  font-weight: 600;
  background: linear-gradient(45deg, #4481eb, #04befe);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  margin: 0;
}

.logo-subtitle {
  text-align: center;
  color: #666;
  font-size: 0.95rem;
  margin-bottom: 32px;
  animation: fadeIn 1s ease;
}

.login-title {
  margin: 0 0 24px 0;
  font-size: 1.5rem;
  font-weight: 500;
  color: #333;
}

@keyframes float {
  0%, 100% {
    transform: translateY(0);
  }
  50% {
    transform: translateY(-10px);
  }
}

@keyframes fadeInDown {
  from {
    opacity: 0;
    transform: translateY(-20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

@keyframes fadeIn {
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
}

@media (max-width: 768px) {
  .logo-text {
    font-size: 2rem;
  }

  .logo-icon {
    font-size: 36px;
  }

  .logo-subtitle {
    font-size: 0.85rem;
  }
}

.welcome-content {
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
  max-width: 400px;
  animation: fadeIn 1s ease;
}

.welcome-icon {
  margin-bottom: 20px;
  animation: float 3s ease-in-out infinite;
}

.welcome-title {
  font-size: 2rem !important;
  font-weight: 600;
  margin-bottom: 24px !important;
  letter-spacing: 1px;
}

.feature-list {
  display: flex;
  flex-direction: column;
  gap: 16px;
  margin: 24px 0;
  width: 100%;
}

.feature-item {
  display: flex;
  align-items: center;
  gap: 12px;
  font-size: 1rem;
  background: rgba(255, 255, 255, 0.1);
  padding: 12px 20px;
  border-radius: 12px;
  backdrop-filter: blur(10px);
  transition: transform 0.3s ease;
}

.feature-item:hover {
  transform: translateX(10px);
}

.feature-icon {
  opacity: 0.9;
}

.welcome-description {
  font-size: 1rem !important;
  opacity: 0.9;
  margin: 16px 0 24px 0 !important;
  line-height: 1.6;
}

.action-btn {
  background: rgba(255, 255, 255, 0.15) !important;
  backdrop-filter: blur(10px);
  border: 2px solid rgba(255, 255, 255, 0.6) !important;
  height: 48px !important;
  font-size: 1rem !important;
  letter-spacing: 1px;
  transition: all 0.3s ease !important;
  position: relative;
  overflow: hidden;
}

.action-btn::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: linear-gradient(45deg, rgba(255, 255, 255, 0.1), rgba(255, 255, 255, 0.2));
  opacity: 0;
  transition: opacity 0.3s ease;
}

.action-btn:hover {
  background: rgba(255, 255, 255, 0.25) !important;
  transform: translateY(-2px);
  border-color: rgba(255, 255, 255, 0.8) !important;
}

.action-btn:hover::before {
  opacity: 1;
}

.action-btn-text {
  color: rgba(255, 255, 255, 0.95);
  font-weight: 500;
  position: relative;
  z-index: 1;
}

/* 适配移动端 */
@media (max-width: 768px) {
  .welcome-title {
    font-size: 1.5rem !important;
  }

  .feature-item {
    font-size: 0.9rem;
    padding: 10px 16px;
  }

  .welcome-description {
    font-size: 0.9rem !important;
  }

  .feature-list {
    gap: 12px;
  }
}
</style>
