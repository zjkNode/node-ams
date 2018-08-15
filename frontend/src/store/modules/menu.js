import * as types from '../mutation-types'
import Vue from 'vue'

const state = {
	menuData:null,
}


// getters
const getters = {
	getMenuTree: state => {
		console.log('getMenuTree')
		if(state.menuData){
			return state.menuData;
		}
		console.log('http getMenuTree')
        Vue.prototype.$http.get('/api/menu/tree').then( (res) =>{
            if(res.code == 'SUCCESS'){
                state.menuData = res.data;
            }
        });
	},
}

// actions 
const actions = {
	refreshMenuTree({ commit }){
		commit(types.MENU_TREE_DATA, null)
	},
}

const mutations = {
	[types.MENU_TREE_DATA](state, treeData){
		state.menuData = treeData
	},
}

export default {
	state,
	getters,
	actions,
	mutations
}