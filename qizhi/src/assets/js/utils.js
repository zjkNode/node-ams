 /* eslint-disable */
 var jsencrypt = require('jsencrypt'),
    md5 = require('md5');
const toDecimal = (value, n) => {
  if(!value){
    return '0.00';
  }
  n = n || 2;
	if(!value || isNaN(parseInt(value))){
		return parseInt(0).toFixed(n);
	}

	let result = parseFloat(value).toFixed(n);
	return result;
	// return result.toString().replace(/(\d)(?=(\d{3})+\.)/g);
}

const trim = (str) => {
	if(!str) return '';
	return str.replace(/^\s+|\s+$/gm,'');
}

const moblieFormat = (mobile) => {
	if(!mobile || this.trim(mobile).length === 0){
		return '';
	}
	mobile = mobile.replace(/\s+/g,'');
	let reg = /(\d{3})(\d{0,4})(\d{0,4})/;
	let m = mobile.match(reg);
	if(m == null){
		return mobile;
	}
	let res = m[1];
	m[2] && (res += ' '+ m[2])
	m[3] && (res += ' '+ m[3])
	return res;
}

const getQueryParam = (name) => {
	var r = new RegExp("(\\?|#|&)" + name + "=([^&#]*)(&|#|$)");
	var m = location.href.match(r);
	if(!m){
			r=new RegExp("(/)" + name + "/([^&#/]*)(/)");
			m=location.href.match(r);
	}
	return decodeURIComponent(!m ? "" : m[2]);
}

const encrypt = (plainText) => {
	var pk = `-----BEGIN PUBLIC KEY-----
			MFwwDQYJKoZIhvcNAQEBBQADSwAwSAJBAIY9/ZRirUo7bcnjr939dpJu3yjh+TNe
			Jhjn1Y4LMWhaNalE7A95pNLRupvQfEVAHAFGwJeJtmXcJcmPN+xuvP8CAwEAAQ==
			-----END PUBLIC KEY-----`;
	var encrypt = new jsencrypt.JSEncrypt();
	encrypt.setPublicKey(pk);
	var encrypted = encrypt.encrypt(md5(plainText));
	return encrypted;
}

const env = {
  isWXWork(){
    let ua = window.navigator.userAgent;
    return /MicroMessenger/i.test(ua) && /wxwork/i.test(ua);
  },
  isWX(){ // 包含企业微信
    let ua = window.navigator.userAgent;
    return /MicroMessenger/i.test(ua);
  },
  isIOS(){
    var ua = window.navigator.userAgent;
    return /iPhone|iPad|iPod/i.test(ua);
  },
  isAndroid(){
    var ua = window.navigator.userAgent;
    return /Android/i.test(ua) || /Linux/i.test(window.navigator.platform + "");
  },
  isWap(){
    return (env.isAndroid() || env.isIOS()) && !env.isWX();
  }
}

export default {
	trim,
	toDecimal,
	moblieFormat,
	getQueryParam,
	encrypt,

	env
};