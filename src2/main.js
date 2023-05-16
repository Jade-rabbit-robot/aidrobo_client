import Vue from 'vue'
import router from './router'
import store from './store'
import ElementUI from 'element-ui';
import Sortable from 'sortablejs';
import axios from 'axios';
import "@/assets/global.less"

// Vue.use(iView);
Vue.prototype.$http = axios
import {panstart,panmove,panend,pinchstart,pinchmove,pinchend}  from './assets/touchvue.js'
import 'element-ui/lib/theme-chalk/index.css';
import App from './App'
Vue.use(ElementUI);
new Vue({
  el: '#app',
  router,
  store,
  render: h => h(App)
})
