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

  { title:'产品类型', name:'proType', path:'/pro/type', view:'product/type'},
  { title:'产品列表', name:'proList', path:'/pro/list', view:'product/list'},
  { title:'新增产品', name:'proAdd', path:'/pro/add', view:'product/add'},
  { title:'编辑产品', name:'proEdit', path:'/pro/edit', view:'product/add'},

  { title:'banner管理', name:'zyBanner', path:'/yz/banner', view:'youzhu/banner'},
  { title:'产品管理', name:'zyProduct', path:'/yz/product', view:'youzhu/product'},
  { title:'消息管理', name:'zyMessage', path:'/yz/message', view:'youzhu/message'},
  { title:'我的收藏', name:'zyStar', path:'/yz/star', view:'youzhu/star'},
  { title:'用户管理', name:'zyUser', path:'/yz/user', view:'youzhu/user'},
  
  { title:'block 规则', name:'pluginBlock', path:'/plugin/block', view:'plugin/block'},
  { title:'block 激活码', name:'pluginActive', path:'/plugin/active', view:'plugin/active'},

  { title:'学员管理', name:'student', path:'/qizhi/student', view:'qizhi/student'},
  { title:'用户管理', name:'qzUser', path:'/qizhi/user', view:'qizhi/user'},
  { title:'学习记录', name:'study', path:'/qizhi/study', view:'qizhi/study'},

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
  document.title = to.meta.title || 'zjk管理系统'
  // next();
  if(Vue.cookie.get('nodesyscookie')){
    next();
    return;
  }

  localStorage.clear();
  Vue.cookie.delete('nodesyscookie');

  if(to.path == '/login'){
    next();
    return;
  }
  next({ path: '/login'});
})

router.afterEach((to, from) => {
  // ...
})

export default router