/**
 *
 * 新闻分类模型
 */
var moment = require('moment');

let validation = {
  'name': {
    isNotEmpty: { errorMessage: '类别名称不能为空' },
    isLength: { options: [0,100], errorMessage: '类别名称不能超过100个字符'}
  },
  'desc':{
    isLength: { options: [0,100], errorMessage: '类别名称不能超过100个字符'}
  }
};
let auto = function(role) {
  if(!role){
    return ;
  }
  if(!role.id){ // id 不存在，为新增
    role.create_time = moment().format('YYYY-MM-DD hh:mm:ss');
  } else { // 修改时，默认字段赋值
    role.update_time = moment().format('YYYY-MM-DD hh:mm:ss');
    delete role.create_time;
  }
};
module.exports = {
  tbname:'role',
  validation:validation,
  auto:auto
};