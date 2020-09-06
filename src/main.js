import Vue from 'vue'
import App from './App.vue'
import router from "./router";

//组件ElementUI
import ElementUI from 'element-ui'
import 'element-ui/lib/theme-chalk/index.css'

//数据请求axios
import axios from 'axios'

//树形表格插件
import ZKTable from 'vue-table-with-tree-grid'

//富文本编辑器
import VueQuillEditor from 'vue-quill-editor'
import 'quill/dist/quill.core.css' // import styles
import 'quill/dist/quill.snow.css' // for snow theme
import 'quill/dist/quill.bubble.css' // for bubble theme

axios.defaults.baseURL= 'http://timemeetyou.com:8889/api/private/v1/';
    //'http://47.115.124.102:8888/api/private/v1/';
axios.interceptors.request.use(config =>{
  config.headers.Authorization = window.sessionStorage.getItem('token');
  //console.log(config);
  return config;
});
Vue.prototype.$http = axios;

Vue.use(ElementUI);

Vue.use(VueQuillEditor);

Vue.component('tree-table',ZKTable);

Vue.filter('dateFormat', function (date) {
  const newDate = new Date(date);
  const y = newDate.getFullYear();
  const m = (newDate.getMonth() + 1 + '').padStart(2,'0');
  const d = (newDate.getDate() + '').padStart(2,'0');
  const dd = (newDate.getHours() + '').padStart(2,'0');
  const mm = (newDate.getMinutes() + '').padStart(2,'0');
  const ss = (newDate.getSeconds() + '').padStart(2,'0');

  return y + '-' + m + '-' + d + ' ' + dd + ':' + mm + ':' + ss;
});

Vue.config.productionTip = false;

new Vue({
  render: h => h(App),
  router,
}).$mount('#app');
