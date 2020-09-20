/**
 * qizhi user
 * create by zjk
 */
let utils = require('../../lib/utils');

let validation = {
	'name': {
		isNotEmpty: { errorMessage: '用户名不能为空' }
	},
	'pwd': {
		isNotEmpty: { errorMessage: '密码不能为空' },
		isLength: { options: [6], errorMessage: '密码不能小于 6 位'}
	},
	'type': {
		isNotEmpty: { errorMessage: '用户类型不能为空' }
	}
};

let auto = function(user) {
	if(!user){
		return ;
	}
	if(!user.id){ // id 不存在，为新增
		user.create_time = utils.dateFormat();
	} else { // 修改时，默认字段赋值
		user.update_time = utils.dateFormat();
		delete user.create_time;
	}
};

module.exports = {
	tbname:'qz_user',
	pk: 'id',
	validation: validation,
	auto: auto
}