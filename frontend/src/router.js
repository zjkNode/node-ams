/* eslint-disable */

import Vue from 'vue'
import Router from 'vue-router'

Vue.use(Router)

var routes = [
  { title:'首页', name:'home', path:'/', view:'Home'},
  { title:'菜单管理', name:'menu', path:'/sys/menu', view:'sys/menu'},
  { title:'用户管理', name:'user', path:'/sys/org/user', view:'sys/user'},
  { title:'部门管理', name:'dep', path:'/sys/org/dep', view:'sys/dep'},
  { title:'角色管理', name:'role', path:'/sys/org/role', view:'sys/role'},
  { title:'系统配置', name:'config', path:'/sys/conf', view:'sys/config'},
  { title:'操作日志', name:'log', path:'/sys/log', view:'sys/log'},
  { title:'系统功能', name:'rule', path:'/sys/rule', view:'sys/rule'},
];


let childRoutes = [];
routes.forEach(item => {
  childRoutes.push({ 
    path: item.path,
    name: item.name,
    meta: { title: item.title }, 
    component: resolve => { require([`./views/${item.view}.vue`], resolve) }
    // component: resolve =>  require.ensure([], () => resolve(require(`./views/${item.view}.vue`)), item.name)
  })
});

let router =  new Router({
  mode: 'history',
  routes: [
    {
      path: '/login', name: 'login',
      component:  r => require.ensure([], () => r(require('./views/Login.vue')),'login')
    },
    {
      path: '/', name: '',
      component: r => require.ensure([], () => r(require('./views/Layout.vue')),'layout'),
      children: childRoutes
    },
  ]
})

router.beforeEach((to, from, next) => {
  document.title = to.meta.title || '互联网信贷管理系统'
  next();
  // if(Vue.cookie.get('cmsnodessid')){
  //   next();
  //   return;
  // }

  // localStorage.clear();
  // Vue.cookie.delete('cmsnodessid');

  // if(to.path == '/login'){
  //   next();
  //   return;
  // }
  // next({ path: '/login'});
})

router.afterEach((to, from) => {
  // ...
})

export default router