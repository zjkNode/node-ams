import * as types from '../mutation-types'
import Vue from 'vue'

const state = {
	curUser: null
}

// getters
const getters = {
	getCurUser: state => {
		if(state.curUser){
			return state.curUser;
		}
		state.curUser = JSON.parse(window.localStorage.getItem('curUser'));
		return state.curUser;
	} 
}

// actions 
const actions = {
	setCurUser({ commit }, user){
		commit(types.SET_CUR_USER, user);
	}
}

const mutations = {
	[types.SET_CUR_USER](state, user){
		state.curUser = user;
        window.localStorage.setItem('curUser', JSON.stringify(user));
	}
}

export default {
	state,
	getters,
	actions,
	mutations
}