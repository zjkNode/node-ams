/**
 *  contract_vm 
 *  createby zjk
 */
let CONSTANTS = require('../../config/constants.config');
let utils = require('../../lib/utils');

let validation = {
    'name': {
        isNotEmpty: { errorMessage: '占位符名称 不能为空' },
        isLength: { options:[0,50], errorMessage:'占位符名称不能超过50个字符'}
    },
    'placeholder': {
        isNotEmpty: { errorMessage: 'VM占位符 不能为空' },
        isLength: { options:[0,20], errorMessage:'VM占位符名称不能超过20个字符'}
    }, 
    'typeid': {
        isNotEmpty: { errorMessage: '合同类型ID 不能为空' }
    }
};

let auto = function(vm) {
    if(!vm){
        return ;
    }
    if(!vm.id){ // id 不存在，为新增
        vm.create_time = utils.dateFormat();
    } else { // 修改时，默认字段赋值
        vm.update_time = utils.dateFormat();
    }
};

module.exports = {
    tbname:'contract_vm',
    pk: 'id',
    validation: validation,
    auto: auto
}
