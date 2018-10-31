/**
 * user
 * create by zjk
 */
let CONSTANTS = require('../../config/constants.config');
let utils = require('../../lib/utils');

let validation = {
	'email': {
		isNotEmpty: { errorMessage: '帐户不能为空' },
	},
	'nickname': {
		isNotEmpty: { errorMessage: '用户别名不能为空' }
	},
	'password': {
		isNotEmpty: { errorMessage: '密码不能为空' },
		isLength: { options: [6], errorMessage: '密码不能小于 6 位'}
	},
	'depids': {
		isNotEmpty: { errorMessage: '部门不能为空' }
	},
	'roleids': {
		isNotEmpty: { errorMessage: '角色不能为空'}
	}
};

let auto = function(user) {
	if(!user){
		return ;
	}
	if(!user.id){ // id 不存在，为新增
		user.status = CONSTANTS.USER_STATUS.VALID; // 1有效  2停用
		user.create_time = utils.dateFormat();
	} else { // 修改时，默认字段赋值
		user.update_time = utils.dateFormat();
		delete user.create_time;
	}
};

module.exports = {
	tbname:'user',
	pk: 'id',
	validation: validation,
	auto: auto
}