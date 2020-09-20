import Vue from 'vue';
import axios from "axios";
import store from '@/store/';
import { Toast, Indicator } from 'mint-ui';
// import utils from '@/assets/js/utils';
// axios 配置
axios.defaults.timeout = 60000;

axios.interceptors.request.use(
	config => {
		let userInfo = store.getters.getUserInfo;
		if(userInfo.token) config.headers.Authorization = 'Bearer '+ userInfo.token;
		
		return config;
	},
	err => {
		return Promise.reject(err);
	});

// http response 拦截器
axios.interceptors.response.use(response => {
	let resData = response.data;
    return resData
		// response.data = typeof (response.data) === "string" ? JSON.parse(response.data) : response.data;

		// if (response.data.retCode == "200") {
		// 	Toast("数据请求出错，请稍后重试");
		// 	return Promise.reject("数据请求出错，请稍后重试")
		// } 
		// if (response.data.retCode !== "0000") {
		// 	let retMsg = response.data.retDesc || '服务器出错：'+ response.data.retCode;
		// 	let durationTime = retMsg.length <= 10 ? 2000 : (parseInt(retMsg.length / 5 + 1) * 1000);
		// 	Toast({
		// 		message: retMsg,
		// 		duration: durationTime > 3000 ? 3000 : durationTime
		// 	});
		// 	Indicator.close();
		// 	return Promise.reject(retMsg);
		// }
		// return response.data;
	},
	error => {
		Indicator.close();
		if(!error || !error.config) {
			return Promise.reject("服务器错误，请稍后重试！");
		}
		var configData = (error.config && typeof(error.config.data)==="string" && JSON.parse(error.config.data)) || {};
		if(error.code === 'ECONNABORTED' && error.message.indexOf('timeout') !== -1){
			!configData.noMessage && Toast("请求超时，请稍后重试！");
			return Promise.reject("请求超时");
		}
		if(axios.isCancel(error)){//是否为重复请求取消
			return Promise.reject({type:"cancel"});
		}
		// !configData.noMessage && Toast("服务器错误，请稍后重试！");
		return Promise.reject("服务器错误，请稍后重试！");
	}
);

Vue.prototype.$axios = axios;
export default axios;

