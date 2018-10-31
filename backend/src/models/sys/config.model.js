/**
 *  config 
 *  createby zjk
 */
let CONSTANTS = require('../../config/constants.config');
let utils = require('../../lib/utils');

let validation = {
    'name': {
        isNotEmpty: { errorMessage: '配置名称 不能为空' }
    },
    'key': {
        isNotEmpty: { errorMessage: '配置关键字 不能为空' }
    },
    'value': {
        isNotEmpty: { errorMessage: '配置value 不能为空' }
    }
};

let auto = function(config) {
    if(!config){
        return ;
    }
    if(!config.id){ // id 不存在，为新增
        config.status = CONSTANTS.CONFIG_STATUS.VALID;
        config.create_time = utils.dateFormat();
    } else { // 修改时，默认字段赋值
        config.update_time = utils.dateFormat();
        delete config.create_time;
    }
};
module.exports = {
    tbname:'config',
    pk: 'id',
    validation: validation,
    auto: auto
}
