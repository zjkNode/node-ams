/**
 *  contract_type
 *  createby zjk
 */
let CONSTANTS = require('../../config/constants.config');
let utils = require('../../lib/utils');

let validation = {
    'name': {
        isNotEmpty: {  errorMessage: '产品类型名称 不能为空' },
        isLength: { options: [0,50], errorMessage: '产品类型名称不能超过50个字符'}
    },
    'pid': {
        isNotEmpty: { errorMessage: '产品级别 不能为空' }
    }
};

let auto = function(model) {
    if(!model){
        return ;
    }
    if(!model.id){ // id 不存在，为新增
        model.status = CONSTANTS.PRO_TYPE_STATUS.VALID;
        model.create_time = utils.dateFormat();
    } else { // 修改时，默认字段赋值
        model.update_time = utils.dateFormat();
        delete model.create_time;
    }
};
module.exports = {
    tbname:'product_type',
    pk: 'id',
    validation: validation,
    auto: auto
}
