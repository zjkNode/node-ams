import './assets/css/reset.css'//引用样式
import MintUI from 'mint-ui'
import 'mint-ui/lib/style.css'//引用样式

import Vue from 'vue'
import store from './store'
import router from './router'
import './vue-axios'


Vue.config.productionTip = false
Vue.use(MintUI);

import * as filters from '@/filters';
Object.keys(filters).forEach(key => {
  Vue.filter(key, filters[key])
});

import App from './App.vue'

new Vue({
  router,
  store,
  render: h => h(App)
}).$mount('#app')
