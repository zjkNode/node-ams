import Vue from 'vue'
import Vuex from 'vuex'

import * as actions from './actions'
import act from './modules/act'
import menu from './modules/menu'
import user from './modules/user'

Vue.use(Vuex)

export default new Vuex.Store({
	// actions,
	modules:{
		user,
		act,
		menu
	}
});
