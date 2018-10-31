/**
 *  contract 
 *  createby zjk
 */
let CONSTANTS = require('../../config/constants.config');
let utils = require('../../lib/utils');

let validation = {
    'title': {
        isNotEmpty: { errorMessage: '合同标题 不能为空' },
        isLength: { options: [0,50], errorMessage: '新闻标题不能超过50个字符'}},
    'content': {
        isNotEmpty: { errorMessage: '合同内容 不能为空' }
    },
    'typeids': {
        isNotEmpty: { errorMessage: '合同类型 不能为空' },
        isArray: { errorMessage: 'typeids 数据类型有误' }
    }
};

let auto = function(contract) {
    if(!contract){
        return ;
    }
    if(!contract.id){ // id 不存在，为新增
        contract.status = CONSTANTS.CONTRACT_STATUS.TEST;
        contract.create_time = utils.dateFormat();
    } else { // 修改时，默认字段赋值
        contract.update_time = utils.dateFormat();
        //将 上线 的合同编辑之后变成“已更新”状态；未上线的依旧保持“当前状态”状态
        // {TEST: 1, ONLINE: 2, OFFLINE: 3, UPDATE:4},// 合同内容状态 1测试 2上线 3下线 4已更新
        contract.status = 'CASE WHEN `status` = '+ CONSTANTS.CONTRACT_STATUS.ONLINE +' THEN '+CONSTANTS.CONTRACT_STATUS.UPDATE +' ELSE `status` END';
        delete contract.create_time;
        delete contract.publish_time;
    }
};

module.exports = {
    tbname:'contract',
    pk: 'id',
    validation: validation,
    auto: auto
}
