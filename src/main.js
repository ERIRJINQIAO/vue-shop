import Vue from "vue";
import App from "./App.vue";
import router from "./router";
import store from "./store";
//导入字体图标
import "./assets/fonts/iconfont.css";
//导入全局样式表
import "./styles/global.scss";
import ElementUI from "element-ui";
import "element-ui/lib/theme-chalk/index.css";
Vue.use(ElementUI);

//引用axios,配置默认地址
import axios from "axios";
axios.defaults.baseURL = "http://127.0.0.1:8888/api/private/v1/";
Vue.prototype.$http = axios;

Vue.config.productionTip = false;

new Vue({
  router,
  store,
  render: h => h(App)
}).$mount("#app");
