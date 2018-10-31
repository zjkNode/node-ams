import * as types from '../mutation-types'
import Vue from 'vue'

const state = {
	menuData:null,
	curMenu: null,
	actions:[
		'add', // 新增
		'edit', // 编辑
		'delete', // 删除
		'confAction', // 系统菜单 -- 配置页面功能
		'auth', // 角色管理 -- 权限配置
		'preview', // 预览
		'online', // 上架
		'offline', // 下架,
		'upload', // 活动组件管理 -- 组件上传
		'update', // 活动组件管理 -- 组件更新
	]
}

function _getCurMenu(menus){
    // 页面刷新时，需要根据当前路由，设置当前菜单对象

    let curPath = window.location.pathname;
    for(let i = 0; i < menus.length; i++){
        let menu = menus[i];
        if(menu.alink === curPath){
            return menu;
        }
        if(!menu.children || menu.children.length === 0){
            continue;
        }
        return _getCurMenu(menu.children);
    }
}

// getters
const getters = {
	getMenuTree: state => {
		state.menuData = state.menuData || JSON.parse(window.localStorage.getItem('menuData'));
		if(state.menuData){
			return state.menuData;
		}
		
        Vue.prototype.$http.get('/api/menu/tree').then( res => {
        	if(!res){
        		console.log(11111)
        		return;
        	}
            if(res.code != 'SUCCESS'){
            	Vue.prototype.$message.error(res.msg);
            	return;
            }
            state.menuData = res.data;
            let curMenu = _getCurMenu(res.data);
            window.localStorage.setItem('curMenu', JSON.stringify(curMenu));
            window.localStorage.setItem('menuData', JSON.stringify(res.data));
        });
	},
	getCurMenu: state => {
		if(state.curMenu){
			return state.curMenu;
		}
		state.curMenu = JSON.parse(window.localStorage.getItem('curMenu'));
		return state.curMenu;
	},
	getActions: state => {
		let tempActions = {};
		state.actions.forEach(value => tempActions[value] = value);
		return tempActions;
	}
}

// actions 
const actions = {
	refreshMenuTree({ commit }){
		commit(types.MENU_TREE_DATA)
	},
	setCurMenu({ commit }, menu){
		commit(types.SET_CUR_MENU, menu);
	}
}

const mutations = {
	[types.MENU_TREE_DATA](state){
		state.menuData = null;
        window.localStorage.removeItem('menuData');
	},
	[types.SET_CUR_MENU](state, menu){
		state.curMenu = menu;
        window.localStorage.setItem('curMenu', JSON.stringify(menu));
	}
}

export default {
	state,
	getters,
	actions,
	mutations
}