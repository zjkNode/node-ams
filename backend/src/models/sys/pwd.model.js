/**
 *
 * 修改密码模型
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
	}
};
let auto = function(user) {
	user.update_time = moment().format('YYYY-MM-DD hh:mm:ss');
};
module.exports = {
	tbname:'users',
    pk: 'id',
    auto: auto,
	validation: validation
}