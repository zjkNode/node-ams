/**
 *
 * 部门模型
 */
var moment = require('moment'),
	CONSTANTS = require('../../config/constants.config');

let validation = {
	'name': {
		notEmpty: { options: [true], errorMessage: '部门名称不能为空' }
	},
	'pids': {
		notEmpty: { options: [true], errorMessage: '父级部门不能为空' },
		isArray: { errorMessage: 'pids 须为数组类型' }
	}
};

let auto = function(dep) {
	if(!dep){
		return ;
	}
	if(!dep.id){ // id 不存在，为新增
		dep.status = CONSTANTS.DEP_STATUS.NORMAL; // 1有效  2停用
		dep.create_time = moment().format('YYYY-MM-DD hh:mm:ss');
	} else { // 修改时，默认字段赋值
		dep.update_time = moment().format('YYYY-MM-DD hh:mm:ss');
	}
};

module.exports = {
	tbname:'dep',
	pk: 'id',
	validation: validation,
	auto: auto
}