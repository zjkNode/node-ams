/**
 * log
 * create by zjk
 */

let utils = require('../../lib/utils');

let auto = function(log) {
    if(!log){
        return ;
    }
    if(!log.id){ // id 不存在，为新增
        log.create_time = utils.dateFormat();
    } else { // 修改时，默认字段赋值

    }
};



module.exports = {
    tbname:'log',
    pk: 'id',
    auto: auto
}
