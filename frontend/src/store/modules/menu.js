import * as types from '../mutation-types'
import Vue from 'vue'

const state = {
	menuData:null,
	curMenu: null
}

function getCurMenu(menus){
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
        return getCurMenu(menu.children);
    }
}

// getters
const getters = {
	getMenuTree: state => {
		if(state.menuData){
			return state.menuData;
		}
        Vue.prototype.$http.get('/api/menu/tree').then( (res) =>{
            if(res.code != 'SUCCESS'){
            	Vue.prototype.$message.error(res.msg);
            	return;
            }
            state.menuData = res.data;
            let curMenu = getCurMenu(res.data);
            window.localStorage.setItem('curMenu', JSON.stringify(curMenu));
        });
	},
	getCurMenu: state => {
		if(state.curMenu){
			return state.curMenu;
		}
		state.curMenu = JSON.parse(window.localStorage.getItem('curMenu'));
		return state.curMenu;
	} 
}

// actions 
const actions = {
	refreshMenuTree({ commit }){
		commit(types.MENU_TREE_DATA, null)
	},
	setCurMenu({ commit }, menu){
		commit(types.SET_CUR_MENU, menu);
	}
}

const mutations = {
	[types.MENU_TREE_DATA](state, treeData){
		state.menuData = treeData;
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