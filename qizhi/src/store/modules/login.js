import * as types from '../mutation_types';

const state = {
	userInfo: null,
}

const getters = {
	getUserInfo: state => {
		state.userInfo = state.userInfo || JSON.parse(localStorage.getItem(types.USER_INFO) || null);
    return state.userInfo || {};
	},
}


const actions = {
	setUserInfo({commit}, userInfo){
		commit(types.USER_INFO, userInfo);
	},
}
const mutations = {
	[types.USER_INFO](state, userInfo){
		if(userInfo){
			state.userInfo = userInfo;
			localStorage.setItem(types.USER_INFO, JSON.stringify(userInfo));
			return;
		}
		localStorage.removeItem(types.USER_INFO);
	},
}


export default {
	state,
	getters,
	actions,
	mutations
}