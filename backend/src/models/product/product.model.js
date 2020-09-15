/**
 *  product 
 *  createby zjk
 */
let CONSTANTS = require('../../config/constants.config');
let utils = require('../../lib/utils');

let validation = {
    'title': {
        isNotEmpty: { errorMessage: '产品名称 不能为空' },
        isLength: { options: [0,50], errorMessage: '产品名称不能超过50个字符'}},
    'content': {
        isNotEmpty: { errorMessage: '产品介绍 不能为空' }
    },
    'typeids': {
        isNotEmpty: { errorMessage: '产品类型 不能为空' },
        isArray: { errorMessage: 'typeids 为产品类型Id集合' }
    }
};

let auto = function(model) {
    if(!model){
        return ;
    }
    if(!model.id){ // id 不存在，为新增
        model.status = CONSTANTS.PRO_STATUS.TEST;
        model.create_time = utils.dateFormat();
    } else { // 修改时，默认字段赋值
        model.update_time = utils.dateFormat();
        //将 上线 的合同编辑之后变成“已更新”状态；未上线的依旧保持“当前状态”状态
        // {TEST: 1, ONLINE: 2, OFFLINE: 3, UPDATE:4},// 合同内容状态 1测试 2上线 3下线 4已更新
        model.status = 'CASE WHEN `status` = '+ CONSTANTS.PRO_STATUS.ONLINE +' THEN '+CONSTANTS.PRO_STATUS.UPDATE +' ELSE `status` END';
        delete model.create_time;
        delete model.publish_time;
    }
};

module.exports = {
    tbname:'product',
    pk: 'id',
    validation: validation,
    auto: auto
}
