/**
 *  contract_type
 *  createby zjk
 */
let CONSTANTS = require('../../config/constants.config');
let utils = require('../../lib/utils');

let validation = {
    'name': {
        isNotEmpty: {  errorMessage: '合同类型名称 不能为空' },
        isLength: { options: [0,50], errorMessage: '类别名称不能超过50个字符'}
    },
    'pid': {
        isNotEmpty: { errorMessage: '合同级别 不能为空' }
    }
};

let auto = function(cType) {
    if(!cType){
        return ;
    }
    if(!cType.id){ // id 不存在，为新增
        cType.status = CONSTANTS.CONTRACT_TYPE_STATUS.VALID;
        cType.create_time = utils.dateFormat();
    } else { // 修改时，默认字段赋值
        cType.update_time = utils.dateFormat();
        delete cType.create_time;
    }
};
module.exports = {
    tbname:'contract_type',
    pk: 'id',
    validation: validation,
    auto: auto
}
