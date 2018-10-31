/**
 *  act Model
 *  createby zjk
 */
let CONSTANTS = require('../../config/constants.config');
let utils = require('../../lib/utils');

let validation = {
    'name': {
        isNotEmpty: { errorMessage: '活动名称不能为空' },
        isLength: { options: [0,50], errorMessage: '活动名称不能超过50个字符'}
    },
    'code': {
        isNotEmpty: { errorMessage: '活动代码不能为空' }
    },
    'confid':{
        isNotEmpty: { errorMessage: '请指定发布环境' }
    }
};

let auto = function(act) {
    if(!act) return;

    if(!act.id) {
        act.create_time = utils.dateFormat();
        return;
    }
    act.status = 'CASE WHEN `status` = '+ CONSTANTS.ACT_STATUS.ONLINE +' THEN '+ CONSTANTS.ACT_STATUS.MODIFY +' ELSE `status` END';
    act.update_time = utils.dateFormat();
    delete act.create_time;
    delete act.publish_time;
};

module.exports = {
    tbname: 'act',
    pk: 'id',//主键,
    validation: validation,
    auto: auto,
};
