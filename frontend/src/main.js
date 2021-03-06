import Vue from 'vue'
import VueCookie from 'vue-cookie'
Vue.use(VueCookie)


import router from './router'
import './registerServiceWorker'

import ElementUI from 'element-ui'
import 'element-ui/lib/theme-chalk/index.css'
Vue.use(ElementUI)

import * as filters from './filters';
Object.keys(filters).forEach(key => {
  Vue.filter(key, filters[key])
});

import store from './store/'

import mixin from './mixin'
Vue.use(mixin)

Vue.config.productionTip = false

import './vue-axios'

import App from './App.vue'

window.vm = new Vue({
  router,
  store,
  render: h => h(App)
}).$mount('#app')
