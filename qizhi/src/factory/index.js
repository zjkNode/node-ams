import moment from 'moment'

/**
 * 把url中两个$中间的字段用传入对象中的值替换，返回替换后的url
 * u：要替换的url，必填
 * obj：对应对象，必填
 * isThorough：是否进行深度查询，默认false不进行，true进行
 ** **/

export const RUSF = function(u,obj,isThorough){
	if(!u || !obj){return "";}
	let _us = u.match(/\$[a-zA-Z0-9_]*\$/g) || [];
	if(_us.length===0){return u;}
	let findValue = function(v,o){//去obj对象中查找指定的值 v:指定的值，o:目标对象
		if(typeof(o) === "string"){
			return o;
		}else if(o[v] || o[v] === 0){//如果o中有值，则放回
			return o[v];
		}else if(isThorough){//如果o中没有值，则深度查找
			for(let n in o){
				if(typeof(o[n])==="object" && findValue(v,o[n])){
					return findValue(v,o[n]);
				}
			}
		}
		return "";
	}
	for(let i = 0;i < _us.length; i++){
		u = u.replace(_us[i],findValue(_us[i].replace(/\$/g,''),obj));
	}
	return u;
}
/**
 * 存储localStorage
 */
export const setStore = (name, content) => {
	if (!name) return;
	if (typeof content !== 'string') {
		content = JSON.stringify(content);
	}
	window.sessionStorage.setItem(name, content);
}
export const URL = {
	u: window.location.href,
	get: function (name, url) { //获取URL参数
		var r = url || this.u,
			_n = r.indexOf("?") + 1,
			_RP = '';
		var getpraJSON = function () {
			r = r.substring(_n);
			var narray = r.split("&"),
				_rP = {};
			for (var i = 0; i < narray.length; i++) {
				_rP[narray[i].split("=")[0]] = narray[i].split("=")[1] || '';
			}
			return _rP;
		}
		if (_n > 0) {
			if (name === 0) {
				_RP = r.substring(_n); //返回整个参数
			} else if (name) {
				_RP = getpraJSON()[name] || '';
				_RP = _RP ? _RP : ''; //返回指定字符串
			} else {
				_RP = getpraJSON(); //返回参数集合，json格式
			}
		}
		return _RP;
	},
	put: function (ref, value, url) { //添加参，有则修改，无则追加
		url = url || this.u;
		// 如果没有参数
		if (url.indexOf('?') == -1) {
			return url + "?" + ref + "=" + value;
		}
		// 如果不包括此参数
		if (url.indexOf(ref) == -1) {
			return url + "&" + ref + "=" + value;
		}
		var arr_url = url.split('?');
		var base = arr_url[0];
		var arr_param = arr_url[1].split('&');
		for (let i = 0; i < arr_param.length; i++) {
			var paired = arr_param[i].split('=');
			if (paired[0] == ref) {
				paired[1] = value;
				arr_param[i] = paired.join('=');
				break;
			}
		}
		return base + "?" + arr_param.join('&');
	},
	del: function (ref, url) { //删除url参数
		url = url || this.u;
		// 如果不包括此参数
		if (url.indexOf(ref) == -1) {
			return url;
		}
		var arr_url = url.split('?');
		var base = arr_url[0];
		var arr_param = arr_url[1].split('&');
		var index = -1;
		for (let i = 0; i < arr_param.length; i++) {
			var paired = arr_param[i].split('=');
			if (paired[0] == ref) {
				index = i;
				break;
			}
		}
		if (index == -1) {
			return url;
		} else {
			arr_param.splice(index, 1);
			return base + "?" + arr_param.join('&');
		}
	}
};
/**
 * 获取url中的参数
 */

export const getParams = (name) => { ///获取URL中的参数
	return URL.get(name);
}
/**
 * 获取localStorage
 */
export const getStore = name => {
	if (!name) return;
	return window.sessionStorage.getItem(name) ? window.sessionStorage.getItem(name) : '';
}

/**
 * 删除localStorage
 */
export const removeStore = name => {
	if (!name) return;
	window.sessionStorage.removeItem(name);
}
//封装设置localStorage
export const lStorage = {
	//封装过期控制代码
	set: function (key, value) {
		var curTime = new Date().getTime();
		localStorage.setItem(key, JSON.stringify({
			data: value,
			time: curTime
		}));
	},
	get: function (key, exp) {
		var data = localStorage.getItem(key);
		var dataObj = JSON.parse(data);
		if (exp && dataObj && dataObj.time && (new Date().getTime() - dataObj.time > exp)) {
			localStorage.removeItem(key);
			return '';
		} else if (data) {
			var dataObjDatatoJson = dataObj
			return dataObjDatatoJson;
		} else {
			return '';
		}
	},
	del:function(key){
		localStorage.removeItem(key);
	}
}
export function formatDate(date, fmt) {
	if (/(y+)/.test(fmt)) {
		fmt = fmt.replace(RegExp.$1, (date.getFullYear() + '').substr(4 - RegExp.$1.length));
	}
	let o = {
		'M+': date.getMonth() + 1,
		'd+': date.getDate(),
		'h+': date.getHours(),
		'm+': date.getMinutes(),
		's+': date.getSeconds()
	};
	for (let k in o) {
		if (new RegExp(`(${k})`).test(fmt)) {
			let str = o[k] + '';
			fmt = fmt.replace(RegExp.$1, (RegExp.$1.length === 1) ? str : function padLeftZero(str) {
				return ('00' + str).substr(str.length);
			});
		}
	}
	return fmt;
}
/**
 * 从当前对象里面删除目标对象中没有的字段
 * obj1：当前对象
 * obj2：目标对象
 * **/
export const delField = function (obj1, obj2) {
	var _obj = JSON.parse(JSON.stringify(obj1));
	for (let i in obj1) {
		if (obj2[i] === undefined) {
			delete _obj[i];
		}
	}
	return _obj;
}
export const isNumber = function (value) {
	var patrn = /^(-)?\d+(\.\d+)?$/;
	if (patrn.exec(value) == null || value == "") {
		return false
	} else {
		return true
	}
}
/**
 * 从目标对象里面复制对象到当前对象
 * obj1：当前对象
 * obj2：目标对象
 * cover：true：不覆盖，false：覆盖；是否覆盖当前对象，默认覆盖
 * **/
export const copyObject = function () {
	var _obj = JSON.parse(JSON.stringify(arguments[0]));
	var cover = typeof (arguments[arguments.length - 1]) === "boolean" ? arguments[arguments.length - 1] : false;
	for (let n in arguments) {
		if (typeof (arguments[n]) === "object") {
			add(_obj, arguments[n]);
		}
	}

	function add(obj1, obj2) {
		if (!obj1 || !obj2) {
			return false;
		}
		for (let i in obj1) {
			if ((!cover || !obj1[i]) && (obj2[i] !== undefined && obj2[i] !== null)) {
				_obj[i] = obj2[i];
			}
		}
	}
	return _obj;
}
//获取入参的当前时间,addDay:要增加的天数,addMonth：要增加的月数,addYear：要增加的年数
export const getDateNow = (v, addDay = 0, addMonth = 0, addYear = 0) => {
	let nowMoment = moment(v).add(addYear, 'year').add(addMonth, 'month').add(addDay, 'days').format('YYYY-MM-DD');
	return nowMoment
}
export const formCheck = {
	validateTel: function validateTel(tel) { //验证手机号码
		let TEL_REGEXP = /^1\d{10}$/;
		if (TEL_REGEXP.test(tel)) {
			return true;
		} else {
			return false;
		}
	},
	validateCard:function validateCard(card){ //验证银行卡
		let TEL_REGEXP = /^(\d{16}|\d{19})$/;
		if (TEL_REGEXP.test(card)) {
			return true;
		} else {
			return false;
		}
	},
	validateIdentity: function(value) { //验证身份证
		let idNo = value.toUpperCase();
		let city = {11: "北京",12: "天津",13: "河北",14: "山西",15: "内蒙古",21: "辽宁",22: "吉林",23: "黑龙江 ",31: "上海",32: "江苏",33: "浙江",34: "安徽",35: "福建",36: "江西",37: "山东",
								41: "河南",42: "湖北 ",43: "湖南",44: "广东",45: "广西",46: "海南",50: "重庆",51: "四川",52: "贵州",53: "云南",54: "西藏 ",61: "陕西",62: "甘肃",63: "青海",64: "宁夏",
								65: "新疆",71: "台湾",81: "香港",82: "澳门",91: "国外 "};

		if(!idNo || !/^\d{6}(18|19|20)?\d{2}(0[1-9]|1[012])(0[1-9]|[12]\d|3[01])\d{3}(\d|X)$/i.test(idNo)) {
			// if(!idNo || !/^[1-9]\d{5}(18|19|2([0-9]))\d{2}(0[0-9]|10|11|12)([0-2][0-9]|30|31)\d{3}[0-9Xx]$/i.test(idNo)){
			return false;
		} 
		if(!city[idNo.substr(0, 2)]) {
			return false;
		} 
		if(idNo.length !== 18){ // 非18位身份证  不用检验
			return true;
		}
		//18位身份证需要验证最后一位校验位
		let idArr = idNo.split('');
		//∑(ai×Wi)(mod 11)
		let factor = [7, 9, 10, 5, 8, 4, 2, 1, 6, 3, 7, 9, 10, 5, 8, 4, 2],//加权因子
				parity = [1, 0, 'X', 9, 8, 7, 6, 5, 4, 3, 2],//校验位
				sum = 0, ai = 0, wi = 0;
		for(let i = 0; i < 17; i++) {
			ai = idArr[i];
			wi = factor[i];
			sum += ai * wi;
		}
		let lastCode = parity[sum % 11];
		if(lastCode != idArr[17]) {
			console.log("身份证未位出错: 正确值: %s  实际值: %s", lastCode, idArr[17]);
			return false;
		}
		return true;
	},
	validateEmail: function (email) { //验证邮箱
		var reg = new RegExp("^[a-zA-Z0-9]+([._\\-]*[a-zA-Z0-9])*@([a-zA-Z0-9]+[-a-zA-Z0-9]*[a-zA-Z0-9]+.){1,63}[a-zA-Z0-9]+$"); //正则表达式
		if (reg.test(email)) {
			return true;
		} else {
			return false;

		}
	},
	validateNumber: function (name) {
		let NAME_REGEXP = new RegExp("^\\d+$");
		if (NAME_REGEXP.test(name)) {
			return true;
		} else {
			return false;
		}
	},
	validateParseFloat: function (name) {
		let NAME_REGEXP = new RegExp("^(([1-9]{1}\\d*)|([0]{1}))(\\.(\\d){1,2})?$");
		if (NAME_REGEXP.test(name)) {
			return true;
		} else {
			return false;
		}
	},
	validateAddress: function (name) {
		let NAME_REGEXP = new RegExp("^[\\-A-Za-z\\d\\u4e00-\\u9fa5]+$");
		if (NAME_REGEXP.test(name)) {
			return true;
		} else {
			return false;
		}
	},
	validateName: function (name) { //验证是否中文
		// 中文中间带·•  或英文 中间·空格
		let zhReg = new RegExp('^([\\u4e00-\\u9fa5]{1})[\\u4e00-\\u9fa5·•]{0,13}[\\u4e00-\\u9fa5]{1}$');
		let enReg = new RegExp('^([a-zA-Z]{1})[a-zA-Z·\\s]{0,28}[a-zA-Z]{1}$');
		// 判断特殊字符数量
		let zhCodeMatch = name.match(/[·•]/gi);
		let zhResult = zhReg.test(name) && (!zhCodeMatch || zhCodeMatch.length === 1);
		let enResult = enReg.test(name);
		return zhResult || enResult;
		// return (zhReg.test(name) || enReg.test(name)) && (!codeCnt || codeCnt.length === 1);
	},
	// validateName: function (name, indexA, indexB) { //验证是否中文
	// 	indexA = indexA || 2, indexB = indexB || 4;
	// 	let NAME_REGEXP = new RegExp("^[\\u4e00-\\u9fa5]{" + indexA + "," + indexB + "}$");
	// 	if (NAME_REGEXP.test(name)) {
	// 		return true;
	// 	} else {
	// 		return false;
	// 	}
	// },
	validateRate: function (rate) {
		let RATE_REGEXP = new RegExp("^([1-9][0-9]{0,1}|100)$")
		if (RATE_REGEXP.test(rate)) {
			return true;
		} else {
			return false;
		}
	},
	checkBankNo: function (bankno) {
		var reg = new RegExp("^[a-zA-Z0-9]+$"); //正则表达式
		if (reg.test(bankno)) {
			return true;
		} else {
			return false;
		}
	}
}
/**
 * 静止页面
 * open 开始静止
 * close 取消静止
 * */
export const staticPage = function () {
	var $body = document.getElementsByTagName("body")[0];
		// $scrollTop = document.documentElement.scrollTop || document.body.scrollTop;
	return {
		open: function() {
			$body.style.cssText = "overflow: hidden;";
		},
		close: function() {
			$body.style.cssText = "";
		}
	}
}

export const getTxtByCode = function (l, c) { //根据code获取值
	if (l != undefined && c != undefined && c !== "") {
		for (let i in l) {
			if (c == 0 || l[i].key == c) {
				return l[i];
			}
		}
	}
	return {};
}
export const getTxtByCodeBankCode = function (l, c) { //根据Bankcode获取值
	if (l && c) {
		for (let i in l) {
			if (c == 0 || l[i].bankCode == c) {
				return l[i];
			}
		}
	}
	return {};
}

//把小数点数字四舍五入保留两位数字
export const floatvar = function (floatvar) {
	var f_x = parseFloat(floatvar);
	if (isNaN(f_x)) {
		return 0;
	}
	f_x = Math.round(f_x * 100) / 100;
	var s_x = f_x.toString();
	var pos_decimal = s_x.indexOf('.');
	if (pos_decimal < 0) {
		pos_decimal = s_x.length;
		s_x += '.';
	}
	while (s_x.length <= pos_decimal + 2) {
		s_x += '0';
	}
	return s_x;
}
export const computedAge = function (data, startTime) { //根据生日计算年龄
	var age;
	startTime = startTime ? startTime.substr(0, 10) : startTime;
	var noww = startTime ? getDateNow(new Date(startTime), 0, 0, 0) : getDateNow(new Date(), 0, 0, 0);
	var appliNoww = getDateNow(new Date(data), 0, 0, 0);
	if (Number(noww.split("-")[1]) > Number(appliNoww.split("-")[1])) {
		age = Number(noww.split("-")[0]) - Number(appliNoww.split("-")[0]);
	} else if (Number(noww.split("-")[1]) == Number(appliNoww.split("-")[1])) { //02 02
		if (Number(noww.split("-")[2]) >= Number(appliNoww.split("-")[2])) {
			age = Number(noww.split("-")[0]) - Number(appliNoww.split("-")[0]);
		} else {
			//NO
			age = Number(noww.split("-")[0]) - Number(appliNoww.split("-")[0]) - 1
		}
	} else {
		age = Number(noww.split("-")[0]) - Number(appliNoww.split("-")[0]) - 1;
	}
	return age > 0 ? age : 0;
}
//防止组件下面的遮罩层滑动
export const visbleChange = function (val) {
	if (val) {
		document.getElementsByTagName('body')[0].addEventListener('touchmove', this.handler1, {
			passive: false
		}) //阻止默认事件
	} else {
		document.getElementsByTagName('body')[0].removeEventListener('touchmove', this.handler1, {
			passive: false
		}) //打开默认事件
	}

}
/**
 * 根据身份证号码获取身份证号码中的信息，例：性别，年龄，生日
 * */
export const getIdCardInfo = function (v, nowDate) {
	if (!v || !formCheck.validateIdentity(v)) {
		return false;
	}
	let _birthday = v.substring(6, 10) + "-" + v.substring(10, 12) + "-" + v.substring(12, 14),
		_sex = parseInt(v.substr(16, 1)) % 2 == 1 ? 1 : 2;
	return {
		sex: _sex,
		age: computedAge(_birthday, nowDate),
		birthday: _birthday
	};
}