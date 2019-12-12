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

import TreeTable from "vue-table-with-tree-grid";
//富文本编辑器
import VueQuillEditor from "vue-quill-editor";
// require styles
import "quill/dist/quill.core.css";
import "quill/dist/quill.snow.css";
import "quill/dist/quill.bubble.css";

//引用axios,配置默认地址
import axios from "axios";
axios.defaults.baseURL = "http://127.0.0.1:8888/api/private/v1/";
//配置拦截器，让每次请求都挂载一个Authorization的属性
axios.interceptors.request.use(config => {
  config.headers.Authorization = window.sessionStorage.getItem("token");
  return config;
});
Vue.prototype.$http = axios;

Vue.config.productionTip = false;

Vue.component("tree-table", TreeTable);
//将富文本编辑器注册到全局
Vue.use(VueQuillEditor);
Vue.filter("dateFormat", function(originVal) {
  const dt = new Date(originVal);
  const y = dt.getFullYear();
  const m = (dt.getMonth() + 1 + "").padStart(2, "0"); //月份是从0开始的
  const d = (dt.getDate() + "").padStart(2, "0");

  const hh = (dt.getHours() + "").padStart(2, "0");
  const mm = (dt.getMinutes() + "").padStart(2, "0");
  const ss = (dt.getSeconds() + "").padStart(2, "0");

  return `${y}-${m}-${d} ${hh}:${mm}:${ss}`;
});
new Vue({
  router,
  store,
  render: h => h(App)
}).$mount("#app");
