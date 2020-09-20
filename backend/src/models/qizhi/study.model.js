/**
 * qizhi 学员学习记录表
 * create by zjk
 */
let utils = require('../../lib/utils');

let validation = {
	
};

let auto = function(model) {
	if(!model){
		return ;
	}
	model.create_time = utils.dateFormat();
};

module.exports = {
	tbname:'qz_study_log',
	pk: 'id',
	validation: validation,
	auto: auto
}