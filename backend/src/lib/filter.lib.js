/*
 * nunjucks filters
 * author zjk
 * date 2017-12-06
*/

var styleFilter = function(styleObj,callback) {
	var styleArr = [];
	var exceptArr = ['font-size','border'];
	for(var key in styleObj){
		let value = styleObj[key];
		if(!value){
			continue;
		}
		var str = value;
		if( exceptArr.indexOf(key) == -1){
			let reg = /\d+(px)/g;
			str = value.replace(reg,function(px){
				var fix2 = (parseInt(px)/108*1).toFixed(2);
				return fix2 +'rem';
			});
		}
		if(key === 'background-image'){
			styleArr.push(`${key}:url(${str})`);// key + ':"'+ styleObj[key] +'"'
		} else {
			styleArr.push(`${key}:${str}`);// key + ':"'+ styleObj[key] +'"'
		}
	}

	return callback(null, styleArr.join(';') + (styleArr.length > 0 ? ';' : ''));
}

var comFilter = function(compObjs){
	let comData = {};
	for (let i = 0; i < compObjs.length; i++) {
		let comKey = compObjs[i].name +'_'+ i;
		comData[comKey] = convertObj(compObjs[i]);
	}
	return JSON.stringify(comData);
}

function convertObj(obj){
	if(typeof(obj) == 'string'){
		return obj;
	}

	let expectProps = ['style','imageUrl','uuid','wrap','name'];
	let resObj = {};
	for(let key in obj){
		if(expectProps.indexOf(key) > -1){
			continue;
		}

		let objValue = obj[key];
		if(key == 'usages'){
			resObj[key] = convertUsages(objValue);
			continue;
		}
		if(key == 'responses' && objValue.length > 0){
			resObj[key] = convertResponse(objValue);
			continue;
		}

		if(Object.prototype.toString.call(objValue) == "[object Object]"){
			resObj[key] = convertObj(objValue);
			continue;
		} 
		if(Object.prototype.toString.call(objValue) == "[object Array]"){
			// for (var i = 0; i < objValue.length; i++) {
			// 	resObj[i] = convertObj(objValue[i]);
			// }
			let items = [];
			for (var i = 0; i < objValue.length; i++) {
				items.push(convertObj(objValue[i]));
			}
			resObj[key] = items;
			continue;
		} 
		resObj[key] = obj[key];
	}

	return resObj;
}

function convertUsages(usages){
	if(usages[0] == 'goApp'){
		let appConfig = {
			goAppIndex:{ href:'native://home', label:'app首页', value:'index' },
			goAppAccount:{ href:'native://account', label:'app帐户页', value:'account' },
			goAppCoupons:{ href:'native://mine_coupons', label:'app优惠券页', value:'coupons' },
			goAppCredit:{ href:'native://credit_home', label:'app认证中心页', value:'credit' },
			goAppCard:{ href:'native://membership_card', label:'app会员卡页', value:'card' }
		};
		return {
			to:usages[0],
			option: appConfig[usages[usages.length-1]]
		};
	}

	if(usages[0] == 'goAlerts' || usages[0] == 'goAlertClose'){
		return {
			to: usages[0],
			option:{
				value: usages[usages.length-1]
			}
		}
	}

	return {
		to: usages[0]
	};
}
function convertResponse(responses){
	var res = {};
	for (var i = 0; i < responses.length; i++) {
		var item = responses[i];
		res[item.code] = item;
		res[item.code].usages = convertUsages(item.usages);
	}
	return res;
}

exports.styleFilter = styleFilter;
exports.comFilter = comFilter;
