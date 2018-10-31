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
  { title:'权限分配', name:'auth', path:'/sys/org/auth', view:'sys/auth'},
  { title:'系统配置', name:'config', path:'/sys/conf', view:'sys/config'},
  { title:'操作日志', name:'log', path:'/sys/log', view:'sys/log'},

  { title:'活动列表', name:'actList', path:'/act/list', view:'act/index'},
  { title:'活动组件', name:'actComponent', path:'/act/component', view:'act/component'},
  { title:'新增活动', name:'actAdd', path:'/act/add', view:'act/add'},
  { title:'编辑活动', name:'actEdit', path:'/act/edit', view:'act/add'},

  { title:'合同类型', name:'contType', path:'/contract/type', view:'contract/type'},
  { title:'占位符', name:'contVm', path:'/contract/vm', view:'contract/vm'},
  { title:'合同列表', name:'contList', path:'/contract/list', view:'contract/list'},
  { title:'新增合同', name:'contAdd', path:'/contract/add', view:'contract/add'},
  { title:'编辑合同', name:'contEdit', path:'/contract/edit', view:'contract/add'},
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