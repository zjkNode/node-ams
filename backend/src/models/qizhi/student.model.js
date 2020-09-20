/**
 * qizhi 学员表
 * create by zjk
 */
let utils = require('../../lib/utils');

let validation = {
	'name': {
		isNotEmpty: { errorMessage: '学生姓名不能为空' }
	},
	'phone': {
		isNotEmpty: { errorMessage: '学生联系方式不能为空' },
	},
	'subject': {
		isNotEmpty: { errorMessage: '报班类型不能为空' }
	},
	'fee': {
		isNotEmpty: { errorMessage: '学费不能为空' }
	}
};

let auto = function(student) {
	if(!student){
		return ;
	}
	if(!student.id){ // id 不存在，为新增
		student.create_time = utils.dateFormat();
	} else { // 修改时，默认字段赋值
		student.update_time = utils.dateFormat();
		delete student.create_time;
	}
};

module.exports = {
	tbname:'qz_student',
	pk: 'id',
	validation: validation,
	auto: auto
}