import axios from "axios";
import CustomError from "@/js/error/CustomError";
import router from "@/router";
import message from "@/utils/message";

// 创建统一的处理token过期的函数
const handleTokenExpired = () => {
  localStorage.removeItem('token');
  message.warning('登录已过期，请重新登录');
  // 使用 window.location.href 进行跳转，这样会自动刷新页面
  window.location.href = '/login';
}

const instance = axios.create({
  baseURL: "/api",
  timeout: 10000
});

// 请求拦截器（例如添加 token）
instance.interceptors.request.use(config => {
  const token = localStorage.getItem("token");
  if (token) {
    config.headers.Authorization = token;
  }
  return config;
}, error => Promise.reject(error));

// 响应拦截器（统一处理响应和错误）
instance.interceptors.response.use(
  response => {
    console.log(response)
    // 如果接口有标准的成功标识，例如 `code: 200`
    if (response.data.code === 200) {
      return response.data;
    } else if (response.data.code === 401) {
      // token过期处理
      handleTokenExpired();
      return Promise.reject(new CustomError(401, "登录已过期，请重新登录"));
    } else {
      console.log(response.data.msg)
      return Promise.reject(new CustomError(response.data.code,(response.data.msg || "未知错误")));
    }
  },
  error => {
    console.log(error)
    if (error.response) {
      switch (error.response.status) {
        case 401:
          // token过期处理
          handleTokenExpired();
          return Promise.reject(new CustomError(401, "登录已过期，请重新登录"));
        case 500:
          console.log("服务器故障!")
          break;
      }
    }
    //为防止和业务异常冲突，改为501
    return Promise.reject(new CustomError(501,"服务器繁忙 ! 请稍后再试 !"));
  }
);
export default instance;
