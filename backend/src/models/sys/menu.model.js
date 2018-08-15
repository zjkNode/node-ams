/**
 * 菜单模型
 * createby susan
 */
var moment = require('moment'),
	CONSTANTS = require('../../config/constants.config');

let validation = {
	'name': {
		notEmpty: { options: [true], errorMessage: '菜单名称不能为空' }
	},
	'alink': {
		notEmpty: { options: [true], errorMessage: '菜单链接不能为空' }
	},
	'pids': {
		notEmpty: { options: [true], errorMessage: 'pids不能为空' }
	},
	'pid': {
		notEmpty: { options: [true], errorMessage: '菜单级别不能为空' }
	}
};

let auto = function(menu) {
	if(!menu){
		return ;
	}
	menu.sort = menu.sort || 1;
	if(!menu.id){ // id 不存在，为新增
		menu.status = CONSTANTS.MENUS_STATUS.VALID;
		menu.create_time = moment().format('YYYY-MM-DD hh:mm:ss');
	} else {
		menu.update_time = moment().format('YYYY-MM-DD hh:mm:ss');
	}
	
	
};

module.exports = {
	tbname:'menus',
	pk: 'id',
	validation: validation,
	auto: auto
}