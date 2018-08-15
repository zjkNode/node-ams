/**
 *
 * 新闻分类模型
 */
var moment = require('moment'),
  CONSTANTS = require('../../config/constants.config');

let validation = {
  'depid':{
    notEmpty: { options: [true], errorMessage: '部门名称不能为空' },
  },
  'name': {
    notEmpty: { options: [true], errorMessage: '类别名称不能为空' },
    isLength: { options: [0,100], errorMessage: '类别名称不能超过100个字符'}
  },
  'desc':{
    isLength: { options: [0,100], errorMessage: '类别名称不能超过100个字符'}
  }
};
let auto = function(news) {
  if(!news){
    return ;
  }
  if(!news.id){ // id 不存在，为新增
    news.create_time = moment().format('YYYY-MM-DD hh:mm:ss');
  } else { // 修改时，默认字段赋值
    news.update_time = moment().format('YYYY-MM-DD hh:mm:ss');
  }
};
module.exports = {
  tbname:'roles',
  validation:validation,
  auto:auto
};