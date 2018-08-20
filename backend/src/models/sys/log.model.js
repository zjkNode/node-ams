/**
 *
 * 用户模型
 */
var moment = require('moment');

let validation = {

};

let auto = function(log) {
    if(!log){
        return ;
    }
    if(!log.id){ // id 不存在，为新增
        log.create_time = moment().format('YYYY-MM-DD hh:mm:ss');
    } else { // 修改时，默认字段赋值

    }
};



module.exports = {
    tbname:'logs',
    validation:validation,
    auto: auto

};
