/**
 *  配置模型
 *  createby susan
 */
var moment = require('moment'),
    CONSTANTS = require('../../config/constants.config');

let validation = {
    'name': {
        notEmpty: { options: [true], errorMessage: '配置名称 不能为空' }
    },
    'desc': {
        notEmpty: { options: [true], errorMessage: '配置描述 不能为空' }
    },
    'key': {
        notEmpty: { options: [true], errorMessage: '配置关键字 不能为空' }
    },
    'value': {
        notEmpty: { options: [true], errorMessage: '配置value 不能为空' }
    }
};

let auto = function(configs) {
    if(!configs){
        return ;
    }
    if(!configs.id){ // id 不存在，为新增
        configs.status = CONSTANTS.CONFIG_STATUS.VALID;
        configs.create_time = moment().format('YYYY-MM-DD hh:mm:ss');
    } else { // 修改时，默认字段赋值
        configs.update_time = moment().format('YYYY-MM-DD hh:mm:ss');
    }
};
module.exports = {
    tbname:'config',
    pk: 'id',
    validation: validation,
    auto: auto
}
