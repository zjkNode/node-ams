/**
 * role
 * create by zjk
 */
let utils = require('../../lib/utils');

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
  role.actions = role.actions ? JSON.stringify(role.actions) : '';
  if(!role.id){ // id 不存在，为新增
    role.create_time = utils.dateFormat();
  } else { // 修改时，默认字段赋值
    role.update_time = utils.dateFormat();
    delete role.create_time;
  }
};
module.exports = {
  tbname:'role',
  validation:validation,
  auto:auto
};