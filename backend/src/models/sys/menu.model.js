/**
 * 菜单模型
 * createby susan
 */
var moment = require('moment'),
	CONSTANTS = require('../../config/constants.config');

let validation = {
	'name': {
		isNotEmpty: { errorMessage: '菜单名称不能为空' }
	},
	'alink': {
		isNotEmpty: { errorMessage: '菜单链接不能为空' }
	},
	'pids': {
		isNotEmpty: { errorMessage: 'pids不能为空' }
	},
	'pid': {
		isNotEmpty: { errorMessage: '菜单级别不能为空' }
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
	tbname:'menu',
	pk: 'id',
	validation: validation,
	auto: auto
}