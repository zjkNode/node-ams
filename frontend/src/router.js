/* eslint-disable */

import Vue from 'vue'
import Router from 'vue-router'

Vue.use(Router)

var routes = [
  { title:'首页', name:'home', path:'/', view:'Home'},
  { title:'菜单管理', name:'menu', path:'/sys/menus', view:'menu/index'},
  { title:'用户管理', name:'user', path:'/sys/org/user', view:'user/index'},
  { title:'角色管理', name:'role', path:'/sys/org/role', view:'org/role'},
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