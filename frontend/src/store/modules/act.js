import * as types from '../mutation-types'

// init state
const state = {
	btnConfig: null, // 活动按钮组件配置
	alertContentConfig: null, //活动弹框内容配置
	curActBtnRes:null, // 当前鼠标所以的按钮响应功能
	actParts: [], // 活动配置的组件集合，如：弹框，分享 [{ name: partname vlaue: part_index, label:partDesc, type:''}]
	uploadData:{
		uuid:'' 
	}
}


// getters
const getters = {
	getCurActBtnRes: state => state.curActBtnRes,
	getActParts: state => state.actParts,
	getActBtnConfig: state => state.btnConfig,
	getActAlertContentConfig: state => state.alertContentConfig,
	getUploadData: state => state.uploadData
}

// actions 
const actions = {
	setCurActBtnRes({commit}, itemKey){
		commit(types.ACT_COMP_BTN_RES, itemKey);
	},
	setActParts({commit}, actParts){
		commit(types.ACT_PARTS, actParts);
	},
	setButtonConfig({commit}, btnConfig){
		commit(types.ACT_BTN_CONFIGED, btnConfig);
	},
	setActAlertContentConfig({commit}, alertContentConfig){
		commit(types.ACT_ALERT_CONTENT_CONFIGED, alertContentConfig);
	},
	setUploadData({commit}, uploadData){
		commit(types.ACT_UPLOAD_DATA, uploadData);
	}
}

const mutations = {
	[types.ACT_COMP_BTN_RES](state, itemKey){
		state.curActBtnRes = itemKey;
	},
	[types.ACT_PARTS](state, actParts){
		state.actParts = actParts;
	},
	[types.ACT_BTN_CONFIGED](state, btnConfig){
		state.btnConfig = null;
		state.btnConfig = btnConfig;
	},
	[types.ACT_ALERT_CONTENT_CONFIGED](state, alertContentConfig){
		state.alertContentConfig = null;
		state.alertContentConfig = alertContentConfig;
	},
	[types.ACT_UPLOAD_DATA](state,uploadData){
		state.uploadData = uploadData;
	}
}

export default {
	state,
	getters,
	actions,
	mutations
}