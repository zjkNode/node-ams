/**
 * dep 
 * create by zjk
 */
let CONSTANTS = require('../../config/constants.config');
let utils = require('../../lib/utils');

let validation = {
	'name': {
		isNotEmpty: { errorMessage: '部门名称不能为空' }
	},
	'pids': {
		isNotEmpty: { errorMessage: '父级部门不能为空' },
		isArray: { errorMessage: 'pids 须为数组类型' }
	}
};

let auto = function(dep) {
	if(!dep){
		return ;
	}
	if(!dep.id){ // id 不存在，为新增
		dep.status = CONSTANTS.DEP_STATUS.VALID; // 1有效  2停用
		dep.create_time = utils.dateFormat();
	} else { // 修改时，默认字段赋值
		dep.update_time = utils.dateFormat();
		delete dep.create_time;
	}
};

module.exports = {
	tbname:'dep',
	pk: 'id',
	validation: validation,
	auto: auto
}