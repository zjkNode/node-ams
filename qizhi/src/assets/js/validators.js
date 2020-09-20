
const isEmail = (value) => { 
  return /^\w+([-+.]\w+)*@\w+([-.]\w+)*\.\w+([-.]\w+)*$/.test(value) 
}

const isPhone = (value) => {
  return /^1\d{10}$/.test(value);
}

const isNumber = (value) => {
  return /^[0-9]*$/.test(value);
}

const isWeight = (value) => {  
  return /^(?!0+(?:\.0+)?$)(?:[1-9]\d*|0)(?:\.\d{1,2})?$/.test(value);
}
const isAddress = (value) => {
    let NAME_REGEXP = new RegExp("^[\-A-Za-z\\d\\u4e00-\\u9fa5]+$");
		if(NAME_REGEXP.test(value)) {
			return true;
		} else {
			return false;
		}
}

const isBankNo = (value) => {
  var reg = new RegExp("^[a-zA-Z0-9]+$");
  if(reg.test(value)) {
    return true;
  } else {
    return false;
  }
}

const isIdCard = (value) => {
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
}

const isIdNo = (value, type) => {
  // { value:'01', name:'居民身份证' },
  //   { value:'03', name:'驾驶证' },
  //   { value:'04', name:'军官证' },
  //   { value:'05', name:'士兵证' },
  //   { value:'06', name:'军官离退休证' },
  //   { value:'07', name:'中国护照' },
  //   { value:'08', name:'异常身份证' },
  //   { value:'21', name:'台胞证' },
  //   { value:'41', name:'港澳通行证' },
  //   { value:'42', name:'台湾通行证' },
  //   { value:'43', name:'回乡证' },
  //   { value:'51', name:'外国护照' },
  //   { value:'52', name:'旅行证' },
  //   { value:'53', name:'居留证件' },
  //   { value:'71', name:'组织机构代码证' },
  //   { value:'72', name:'税务登记证' },
  //   { value:'73', name:'营业执照' },
  //   { value:'99', name:'其他证件' },
  let idTypeRegs = {
      '04': /^[\u4e00-\u9fa5]{3,5}[0-9]{5,12}$/, // 军官证
      '07': /^[a-zA-Z0-9]{7,20}$/, // 中国护照
      '21': /^[a-zA-Z0-9]{8,20}$/, // 台胞证
      '51': /^[a-zA-Z0-9]{7,20}$/, // 外国护照
      '99': /^[a-zA-Z0-9]{7,20}$/, // 其他
  };
  if(type === '01'){
    return isIdCard(value);
  }
  let reg = idTypeRegs[type];
  return reg ? reg.test(value) : true;
}
/* 
  * common validators
  * params:
  * value: 需要验证的值
  * 
  * return boolean 返回验证结果
  *
  */
const isIdName = (name) => {
  // 验证是否中文
  // 中文中间带·•  或英文 中间·空格
  let zhReg = new RegExp('^([\\u4e00-\\u9fa5]{1})[\\u4e00-\\u9fa5·•]{0,13}[\\u4e00-\\u9fa5]{1}$');
  let enReg = new RegExp('^([a-zA-Z]{1})[a-zA-Z·\\s]{0,28}[a-zA-Z]{1}$');
  // 判断特殊字符数量
  let zhCodeMatch = name.match(/[·•]/gi);
  let zhResult = zhReg.test(name) && (!zhCodeMatch || zhCodeMatch.length === 1);
  let enResult = enReg.test(name);
  return zhResult || enResult;
}

const isFrameNo = (val) => {
  //验证是不是车架号不包含I O Q
  var regFrame=/^[A-HJ-NPR-Z0-9]{17}$/;
  return regFrame.test(val);
}
const isLicenseNo = (val) => {
  //验证是不是 车牌号 包括新能源车
  // var regLicense = /^(([京津沪渝冀豫云辽黑湘皖鲁新苏浙赣鄂桂甘晋蒙陕吉闽贵粤青藏川宁琼使领][A-Z][A-HJ-NP-Z0-9]{5})|([京津沪渝冀豫云辽黑湘皖鲁新苏浙赣鄂桂甘晋蒙陕吉闽贵粤青藏川宁琼使领][A-Z][A-HJ-NP-Z0-9]{4}[A-HJ-NP-Z0-9挂学警港澳使领])|([京津沪渝冀豫云辽黑湘皖鲁新苏浙赣鄂桂甘晋蒙陕吉闽贵粤青藏川宁琼使领][A-Z](([0-9]{5}[DF])|([DF]([A-HJ-NP-Z0-9])[0-9]{4})))|([A-HJ-NP-Z]{2}[0-9]{5}))$/;
  var regLicense = /^([\u4E00-\uFA29]|[\uE7C7-\uE7F3]|[A-Z0-9]){1,10}$/;
  return regLicense.test(val);
}
// 自定义验证方法
let _commonValidators = { }

const execute = (rule = {}, sectionCode, itemType) => {
  let validateFn = _commonValidators[rule.validator];
  if(validateFn){
    return validateFn(rule, sectionCode, itemType);
  }
  console.log('自定义验证方法未定义,请检查方法名: '+ rule.validator)
  return false;
}

const extend = (validateObj) => {
  _commonValidators = Object.assign({}, _commonValidators, validateObj);
}
export default {
  isEmail,
  isPhone,
  isIdName,
  isIdCard,
  isNumber,
  isWeight,
  isAddress,
  isBankNo,
  isIdNo,
  extend,
  execute,
  isFrameNo,
  isLicenseNo,
}