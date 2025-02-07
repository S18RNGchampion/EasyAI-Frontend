import instance from "@/js/GlobalConfigAxios";


async function login(username, password) {
  const response = await instance.post('/easyai/auth/login', {
    username, password
  })
  return response.data;

}

async function register(username, password, code, inviteCode = null) {
  let param = inviteCode !== null ? '?invite=' + inviteCode : '';
  const response = await instance.post('/easyai/auth/register' + param, {
    username, password, code
  })
  return response.data;

}

async function sendEmail(email, scene) {
  const response = await instance.post('/easyai/auth/send-email-code', {
    email, scene
  })
  return response.data;
}

async function verifyEmailCode(email, code) {
  const response = await instance.post('/easyai/auth/verify-email-code', {
    email,
    scene: 3,
    code
  });
  return response.data;
}

async function resetPassword(email, code, newPassword) {
  const response = await instance.post('/easyai/auth/reset-password', {
    email,
    code,
    password: newPassword
  })
  return response.data;
}

async function getUserInfo() {
  const response = await instance.get('/easyai/user/getInfo');
  return response.data;
}

export { sendEmail, register, login, resetPassword, verifyEmailCode, getUserInfo };
