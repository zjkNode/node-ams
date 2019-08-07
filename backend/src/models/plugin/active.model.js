/**
 * block
 * create by zjk
 */
let CONSTANTS = require('../../config/constants.config');
let utils = require('../../lib/utils');

let auto = function(model) {
	if(!model){
		return ;
	}
	if(!model.id){ // id 不存在，为新增
		model.create_time = utils.dateFormat();
	} else { // 修改时，默认字段赋值
		model.update_time = utils.dateFormat();
		delete model.create_time;
	}
	!model.start_time && delete model.start_time;
	!model.end_time && delete model.end_time;
};

module.exports = {
    tbname:'block_active',
    pk: 'id',
    // validation: validation,
    auto: auto
}