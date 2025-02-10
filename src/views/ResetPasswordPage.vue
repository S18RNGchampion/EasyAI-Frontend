<template>
  <div class="reset-password-container">
    <div class="background-shapes">
      <div class="shape shape-1"></div>
      <div class="shape shape-2"></div>
      <div class="shape shape-3"></div>
    </div>
    <v-card class="reset-card mx-auto pa-8" elevation="5" rounded="lg" max-width="600" style="position: relative; z-index: 1; background: rgba(255, 255, 255, 0.95);">
      <div class="text-center mb-8">
        <h2 class="text-h4 font-weight-bold gradient-text">重置密码</h2>
        <span class="text-subtitle-1 text-medium-emphasis">请完成邮箱验证后设置新密码</span>
      </div>
      
      <!-- 进度条 -->
      <v-stepper v-model="currentStep" class="mb-6 custom-stepper">
        <v-stepper-header>
          <v-stepper-item 
            value="1" 
            :complete="currentStep === '2'"
            class="custom-stepper-item"
          >
            邮箱验证
          </v-stepper-item>

          <v-divider></v-divider>

          <v-stepper-item 
            value="2"
            class="custom-stepper-item"
          >
            设置密码
          </v-stepper-item>
        </v-stepper-header>

        <v-stepper-window>
          <!-- 步骤1：邮箱验证 -->
          <v-stepper-window-item value="1">
            <v-form ref="emailFormRef">
              <v-text-field
                class="mb-8"
                label="邮箱"
                color="#2F94F1"
                density="compact"
                prepend-inner-icon="mdi-email-outline"
                variant="outlined"
                v-model="email"
                :error="emailError"
                @click="emailError=false"
                :error-messages="emailError ? ['请输入有效的邮箱地址'] : []"
                style="margin-top: 12px;"
              />

              <div class="code-input-container">
                <v-text-field
                  class="verification-input"
                  density="compact"
                  label="验证码"
                  color="#2F94F1"
                  prepend-inner-icon="mdi-shield-key-outline"
                  variant="outlined"
                  v-model="emailCode"
                  :style="{ marginBottom: 0 }"
                />

                <el-button
                  :disabled="isCountingDown"
                  :loading="isSendingEmail"
                  class="send-code-btn"
                  :class="{ 'counting-down': isCountingDown }"
                  type="primary"
                  @click="sendEmailCode"
                  style="height: 40px !important; margin: 0;"
                >
                  {{ isCountingDown ? `${countdown}s 后重试` : '发送验证码' }}
                </el-button>
              </div>

              <v-btn
                block
                color="#2F94F1"
                class="gradient-btn mt-10"
                :loading="verifyLoading"
                @click="verifyEmail"
              >
                下一步
              </v-btn>
            </v-form>
          </v-stepper-window-item>

          <!-- 步骤2：设置新密码 -->
          <v-stepper-window-item value="2">
            <v-form ref="passwordFormRef">
              <v-text-field
                class="mb-8"
                style="margin-top: 12px;"
                label="新密码"
                color="#2F94F1"
                density="compact"
                prepend-inner-icon="mdi-lock-outline"
                type="password"
                variant="outlined"
                v-model="newPassword"
                :error="passwordError"
                @click="passwordError=false"
                :error-messages="passwordError ? passwordErrorMessage : []"
                :style="{ height: '40px' }"
              />

              <v-text-field
                class="mb-10"
                label="确认新密码"
                color="#2F94F1"
                density="compact"
                prepend-inner-icon="mdi-lock-check-outline"
                type="password"
                variant="outlined"
                v-model="confirmPassword"
                :error="confirmPasswordError"
                @click="confirmPasswordError=false"
                :error-messages="confirmPasswordError ? ['两次输入的密码不一致'] : []"
                :style="{ height: '40px' }"
              />

              <v-btn
                block
                color="#2F94F1"
                class="gradient-btn mt-10"
                :loading="resetLoading"
                @click="handleResetPassword"
              >
                确认修改密码
              </v-btn>
            </v-form>
          </v-stepper-window-item>
        </v-stepper-window>
      </v-stepper>

      <div class="text-center mt-4">
        <router-link to="/login" class="text-decoration-none back-link">
          <v-icon size="small" class="me-1">mdi-arrow-left</v-icon>
          返回登录
        </router-link>
      </div>
    </v-card>
  </div>
</template>

<script setup>
import { ref } from 'vue';
import { useRouter } from 'vue-router';
import { sendEmail, resetPassword, verifyEmailCode } from '@/js/api/user/user';
import { ElNotification } from 'element-plus';

const router = useRouter();
const currentStep = ref('1');

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

function validateEmail(email) {
  const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return re.test(email);
}

function verifyPasswordInputs() {
  // 密码格式校验正则
  const passwordRegex = /^(?=.*[0-9])(?=.*[a-zA-Z])[0-9a-zA-Z]{6,}$/;
  
  if (!newPassword.value) {
    passwordError.value = true;
    passwordErrorMessage.value = '密码不能为空';
    return false;
  }
  
  if (!passwordRegex.test(newPassword.value)) {
    passwordError.value = true;
    passwordErrorMessage.value = '密码必须包含数字和字母，且长度不少于6位';
    return false;
  }

  if (newPassword.value !== confirmPassword.value) {
    confirmPasswordError.value = true;
    return false;
  }

  return true;
}

async function sendEmailCode() {
  if (isCountingDown.value || !validateEmail(email.value)) {
    emailError.value = !validateEmail(email.value);
    return;
  }

  try {
    isSendingEmail.value = true;
    await sendEmail(email.value, 3);
    showTag('success', '成功', '验证码发送成功');
    startCountdown();
  } catch (error) {
    if (error.response && error.response.data) {
      showTag('error', '发送失败', error.response.data.msg);
    } else {
      showTag('error', '发送失败', '验证码发送失败，请重试');
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
    await verifyEmailCode(email.value, emailCode.value);
    currentStep.value = '2';
    const stepIcon = document.querySelector('.v-stepper-item--complete .v-stepper__step__step');
    if (stepIcon) {
      stepIcon.style.backgroundColor = '#2F94F1';
      stepIcon.innerHTML = '<i class="mdi mdi-check" style="color: white;"></i>';
    }
    showTag('success', '验证成功', '请设置新密码');
  } catch (error) {
    if (error.response && error.response.data) {
      showTag('error', '验证失败', error.response.data.msg);
    } else {
      showTag('error', '验证失败', '验证失败，请重试');
    }
  } finally {
    verifyLoading.value = false;
  }
}

async function handleResetPassword() {
  if (!verifyPasswordInputs()) return;

  try {
    resetLoading.value = true;
    const data = await resetPassword(email.value, emailCode.value, newPassword.value);
    showTag('success', '成功', '密码重置成功，请重新登录');
    setTimeout(() => {
      router.push('/login');
    }, 1500);
  } catch (error) {
    if (error.response && error.response.data) {
      // 处理链接超时的情况
      if (error.response.data.msg.includes('超时')) {
        showTag('error', '重置失败', '链接已超时，请重新获取验证码');
      } else {
        showTag('error', '重置失败', error.response.data.msg);
      }
    } else {
      showTag('error', '重置失败', '密码重置失败，请重试');
    }
  } finally {
    resetLoading.value = false;
  }
}

function showTag(type, title, message) {
  ElNotification({
    title,
    message,
    type,
    duration: 1500,
  });
}
</script>

<style scoped>
.reset-password-container {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%);
  padding: 20px;
  position: relative;
  overflow: hidden;
  animation: fadeIn 0.4s ease-out;
}

@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.background-shapes {
  position: absolute;
  width: 100%;
  height: 100%;
  overflow: hidden;
}

.shape {
  position: absolute;
  background: linear-gradient(45deg, #4481eb, #04befe);
  border-radius: 50%;
  opacity: 0.1;
}

.shape-1 {
  width: 300px;
  height: 300px;
  top: -150px;
  left: -150px;
  animation: float 6s infinite;
}

.shape-2 {
  width: 200px;
  height: 200px;
  top: 60%;
  right: -100px;
  animation: float 8s infinite;
}

.shape-3 {
  width: 150px;
  height: 150px;
  bottom: -75px;
  left: 50%;
  animation: float 7s infinite;
}

@keyframes float {
  0% { transform: translate(0, 0) rotate(0deg); }
  50% { transform: translate(20px, 20px) rotate(180deg); }
  100% { transform: translate(0, 0) rotate(360deg); }
}

.reset-card {
  width: 100%;
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.2);
  animation: slideUp 0.4s ease-out;
}

@keyframes slideUp {
  from {
    opacity: 0;
    transform: translateY(40px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.gradient-text {
  background: linear-gradient(45deg, #4481eb, #04befe);
  background-clip: text;
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  margin-bottom: 8px;
}

.gradient-btn {
  background: linear-gradient(45deg, #4481eb, #04befe) !important;
  color: white !important;
  transition: all 0.3s ease;
}

.gradient-btn:hover {
  opacity: 0.9;
  transform: translateY(-1px);
  box-shadow: 0 4px 15px rgba(68, 129, 235, 0.35) !important;
}

.send-code-btn {
  width: 120px;
  height: 40px;
  transition: all 0.3s ease;
}

.send-code-btn.counting-down {
  background-color: #e0e0e0;
  border-color: #e0e0e0;
  color: #666;
}

.prev-btn {
  border-color: #4481eb;
  color: #4481eb;
}

.prev-btn:hover {
  background-color: rgba(68, 129, 235, 0.05);
}

.back-link {
  color: #666;
  display: inline-flex;
  align-items: center;
  transition: all 0.3s ease;
}

.back-link:hover {
  color: #4481eb;
}

:deep(.v-stepper) {
  box-shadow: none;
  background: transparent;
}

:deep(.v-stepper__header) {
  box-shadow: none;
  border-bottom: 1px solid rgba(0, 0, 0, 0.1);
}

:deep(.custom-stepper-item) {
  .v-stepper__step__step {
    background-color: #4481eb !important;
  }
}

.code-input-container {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 40px;
  height: 40px;
}

.verification-input {
  flex: 1;
  margin: 0;
  height: 40px;
}

.send-code-btn {
  white-space: nowrap;
  min-width: 120px;
}

:deep(.v-field) {
  min-height: 40px !important;
  height: 40px !important;
}

:deep(.v-input) {
  margin: 0;
  height: 40px;
}

:deep(.v-text-field) {
  margin: 0;
  padding: 0;
  height: 40px;
}

:deep(.v-input__control) {
  height: 40px !important;
}

:deep(.v-field__input) {
  height: 40px !important;
  padding: 0 12px;
}

:deep(.v-stepper-item--complete) {
  .v-stepper__step__step {
    background-color: #2F94F1 !important;
  }
  
  .mdi-check {
    font-size: 16px;
    line-height: 20px;
  }
}
</style> 