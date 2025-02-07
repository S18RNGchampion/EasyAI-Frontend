//创建一个路由器并暴露出去

//第一步：引入creatRouter
import {createRouter, createWebHistory} from 'vue-router'
//引入一个一个可能要呈现的组件


// 2. 定义一些路由
// 每个路由都需要映射到一个组件。
// 我们后面再讨论嵌套路由。
const routes = [
  {path: '/', component: () => import("../views/LoginPage.vue")},
  {path: '/login', component: () => import("../views/LoginPage.vue")},
  {path: '/register', component: () => import("../views/LoginPage.vue")},
  {
    path: '/chat',
    name: 'Chat',
    component: () => import("../views/Chat.vue"),
    meta: {
      title: 'EasyAI Chat'
    }
  },
  {path: '/chat/c/:sessionId', component: () => import("../views/Chat.vue")},
  {path: '/hello', component: () => import("../views/InputQuestion.vue")},
  {path: '/flowRateDetail', component: () => import("../views/FlowRateDetail.vue")},
  {path: '/inputQuestion', component: () => import("../views/InputQuestion.vue")},
  {path: '/basicInfo', component: () => import("../views/basicInfo.vue")},
  {path: '/myOrder', component: () => import("../views/MyOrder.vue")},
  {path: '/userInfo', component: () => import("../views/UserInfo.vue")},
  {path: '/chat', component: () => import("../views/ChatConversation.vue")},
  {path: '/newPage', component: () => import("../views/newPage.vue")},
  {path: '/invitePeople', component: () => import("../views/InvitePeople.vue")},
  {path: '/UpLoadFile', component: () => import("../components/UpLoadFile.vue")},

  {path: '/test1', component: () => import("../views/Test1.vue")},
  {path: '/test2', component: () => import("../views/Test2.vue")},
  {path: '/test3', component: () => import("../views/Test3.vue")},
  {
    path: '/reset-password',
    name: 'ResetPassword',
    component: () => import('@/views/ResetPasswordPage.vue'),
    meta: {
      transition: 'fade-slide'
    }
  }
]

// 定义需要登录才能访问的路由
const authRoutes = ['/chat', '/flowRateDetail', '/inputQuestion', '/basicInfo', '/myOrder', '/userInfo', '/newPage', '/invitePeople', '/UpLoadFile'];
// 定义无需登录就能访问的路由
const publicRoutes = ['/', '/login', '/register', '/reset-password'];

const router = createRouter({

  // 4. 内部提供了 history 模式的实现。为了简单起见，我们在这里使用 hash 模式。
  history: createWebHistory(),
  routes, // `routes: routes` 的缩写
})

router.beforeEach(async (to, from, next) => {
  const token = localStorage.getItem('token');

  // 如果已登录
  if (token) {
    // 如果访问登录相关页面，重定向到chat
    if (publicRoutes.includes(to.path)) {
      next('/chat');
    } else {
      next();
    }
  } else {
    // 未登录
    // 如果访问需要认证的页面，重定向到登录
    if (authRoutes.some(route => to.path.startsWith(route))) {
      next('/login');
    } else {
      next();
    }
  }

  document.title = to.meta.title || 'EasyAI';  // 设置默认标题
});


export default router
// 现在，应用已经启动了！
