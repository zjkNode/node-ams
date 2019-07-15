/**
 *  yz_banner 
 *  createby zjk
 */
let CONSTANTS = require('../../config/constants.config');
let utils = require('../../lib/utils');

let validation = {
    'image_url': {
        isNotEmpty: { errorMessage: '图片不能为空' }
    },
};

let auto = function(data) {
    if(!data){
        return ;
    }
    if(!data.id){ // id 不存在，为新增
        data.status = CONSTANTS.BANNER_STATUS.ONLINE;
        data.ctime = utils.dateFormat();
    } else { // 修改时，默认字段赋值
        data.utime = utils.dateFormat();
        delete data.ctime;
    }
};
module.exports = {
    tbname:'yz_banner',
    pk: 'id',
    validation: validation,
    auto: auto
}
