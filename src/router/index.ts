import { createWebHistory, createRouter } from 'vue-router'
import { jwtDecode } from 'jwt-decode';
const routes = [
  { path: '/login', component: () => import('@/pages/Auth.vue') },
  { path: '/', component: () => import('@/pages/ImageGenerator.vue') }

]

const router = createRouter({
  history: createWebHistory("/design"),
  routes,
})

router.beforeEach((to, _from, next) => {
  if (to.path === '/login') {
    next()
    return
  }
  const loginfo = localStorage.getItem("Authorization");
  if (!loginfo) {
    next('/login');  // 跳转到登录页
    return;
  }
  const tokenPayload = jwtDecode(loginfo);
  const time=tokenPayload.exp;

  if (time) {  // 确保 exp 存在
    const timestampInSeconds = Math.floor(Date.now() / 1000);
    if (timestampInSeconds < time) {
      next();
    } else {
      next({ path: "/login" });
    }
  } else {
    console.error("Token 的过期时间不存在");
    next({ path: "/login" });
  }

})
export default router