/**
 *
 * 用户模型
 */
var moment = require('moment'),
	CONSTANTS = require('../../config/constants.config');

let validation = {
	'email': {
		notEmpty: { options: [true], errorMessage: 'email 不能为空' },
		isEmail: { errorMessage: 'email 格式不正确' }
	},
	'nickname': {
		notEmpty: { options: [true], errorMessage: '用户别名 不能为空' }
	},
	'password': {
		notEmpty: { options: [true], errorMessage: '密码 不能为空' },
		isLength: { options: [6], errorMessage: '密码 不能小于 6 位'}
	},
	'depids': {
		notEmpty: { options: [true], errorMessage: '部门 不能为空' }
	},
	'roleid': {
		notEmpty: { options: [true], errorMessage: '角色 不能为空'}
	}
};

let auto = function(user) {
	if(!user){
		return ;
	}
	if(!user.id){ // id 不存在，为新增
		user.status = CONSTANTS.USER_STATUS.AVAILABLE; // 1有效  2停用
		user.create_time = moment().format('YYYY-MM-DD hh:mm:ss');
	} else { // 修改时，默认字段赋值
		user.update_time = moment().format('YYYY-MM-DD hh:mm:ss');
	}
};

module.exports = {
	tbname:'users',
	pk: 'id',
	validation: validation,
	auto: auto
}