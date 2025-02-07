import axios from "axios";

const baseURL = 'http://localhost:8080';

const apiClient = axios.create({
  baseURL,
  headers: {
    'Content-Type': 'application/json',
  },
});



// 添加请求拦截器
apiClient.interceptors.request.use(
  config => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers['token'] = token;
    }
    return config;
  },
  error => {
    return Promise.reject(error);
  }
);



export default  apiClient;
