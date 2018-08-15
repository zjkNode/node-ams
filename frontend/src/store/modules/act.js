import * as types from '../mutation-types'

// init state
const state = {
	btnConfig: null, // 活动按钮组件配置
	alertContentConfig: null, //活动弹框内容配置
	curActBtnRes:null, // 当前鼠标所以的按钮响应功能
	actData: { // 当前活动的数据
		parts: [], // 活动配置的组件集合，如：弹框，分享 [{ name: part_index, desc:partDesc, type:''}]
	}, 
	uploadData:{
		timeId:'' // 上传图片时的时间戳
	}
}


// getters
const getters = {
	getCurActBtnRes: state => state.curActBtnRes,
	getActData: state => state.actData,
	getActBtnConfig: state => state.btnConfig,
	getActAlertContentConfig: state => state.alertContentConfig,
	getUploadData: state => state.uploadData
}

// actions 
const actions = {
	setCurActBtnRes({commit}, itemKey){
		commit(types.ACT_COMP_BTN_RES, itemKey);
	},
	setActData({commit}, actData){
		commit(types.ACT_DATA, actData);
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
	[types.ACT_DATA](state, actData){
		state.actData = actData;
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