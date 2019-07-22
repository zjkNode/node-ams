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
		rule.create_time = utils.dateFormat();
	} else { // 修改时，默认字段赋值
		rule.update_time = utils.dateFormat();
		delete rule.create_time;
	}
};

module.exports = {
    tbname:'block_active',
    pk: 'id',
    // validation: validation,
    auto: auto
}