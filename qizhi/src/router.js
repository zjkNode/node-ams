/* eslint-disable */

import Vue from 'vue'
import Router from 'vue-router'
import store from '@/store/';

Vue.use(Router)

let routes = [
  { title: '启智教育', name: 'index', path: '/', view: 'index' },
  { title: '启智教育', name: 'login', path: '/login', view: 'login' },
  { title: '绑定', name: 'bind', path: '/bind', view: 'bind' },
  { title: '学员签到', name: 'checkIn', path: '/checkIn', view: 'checkIn', requireAuth: true},
  { title: '清空缓存', name: '/clear', path: '/clear', view: 'clear' },//清空缓存
];

let _routes = [];
routes.forEach(item => {
  _routes.push({
    path: item.path,
    name: item.name,
    meta: {
      title: item.title,
      requireAuth: item.requireAuth || false
    },
    component: resolve => {
      require([`./views/${item.view}.vue`], resolve)
    }
  })
});

let router = new Router({
  mode: 'history',
  routes:[
    ..._routes,
    {
			path: '**', // 错误路由
			redirect: '/' //重定向
		}
  ]
});

router.beforeEach((to, from, next) => {
  window.scrollTo(0,0);
  document.title = to.meta.title || '加载中...'
  if(!to.meta.requireAuth){
    next();
    return;
  }
  let userInfo = store.getters.getUserInfo;
  if(!userInfo.token){ // 未登录
    if(to.path === '/login'){
      next();
      return;
    }
    next({
      path:'/login',
      query: {redirect: to.fullPath}
    });
    return;
  }
  // 已登录
  if(Object.keys(from.query).length === 0){
    next();
    return;
  }
  let redirect = from.query.redirect;
  if(to.fullPath === redirect){
    next();
    return;
  }
  next({ path: redirect });
});

router.afterEach((to, from) => {
  
})

export default router