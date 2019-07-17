/**
 * block
 * create by zjk
 */
let CONSTANTS = require('../../config/constants.config');
let utils = require('../../lib/utils');

let auto = function(rule) {
	if(!rule){
		return ;
	}
	rule.whiteable = rule.whiteable ? 1 : 0;
	rule.blackable = rule.blackable ? 1 : 0;
	if(!rule.id){ // id 不存在，为新增
		rule.status = CONSTANTS.BLOCK_RULE_STATUS.INVALID; // 1有效  2停用
		rule.create_time = utils.dateFormat();
	} else { // 修改时，默认字段赋值
		rule.update_time = utils.dateFormat();
		delete rule.create_time;
	}
};

module.exports = {
    tbname:'block_rule',
    pk: 'id',
    // validation: validation,
    auto: auto
}