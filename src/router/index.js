import Vue from "vue";
import VueRouter from "vue-router";
import Login from "../components/login.vue";
import Home from "../components/home.vue";
import Welcome from "../components/welcome.vue";
import User from "../components/user/users.vue";

Vue.use(VueRouter);

const routes = [
  { path: "/", redirect: "./login" }, //默认就显示登录页面
  { path: "/login", component: Login },
  {
    path: "/home",
    component: Home,
    redirect: "/welcome",
    children: [
      { path: "/welcome", component: Welcome },
      { path: "/users", component: User }
    ]
  }
];

const router = new VueRouter({
  mode: "history",
  base: process.env.BASE_URL,
  routes
});

//路由守卫
router.beforeEach((to, from, next) => {
  //如果用户访问的是登录页，则直接放行
  if (to.path == "/login") return next();
  //取出token值，判断是否存在
  const tokenStr = window.sessionStorage.getItem("token");
  //不存在，则返回到login
  if (!tokenStr) return next("/login");
  next();
});

export default router;
