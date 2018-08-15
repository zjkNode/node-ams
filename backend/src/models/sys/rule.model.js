/**
 *
 * 新闻分类模型
 */
var moment = require('moment'),
  CONSTANTS = require('../../config/constants.config');

let validation = {
  'name': {
    notEmpty: { options: [true], errorMessage: '类别名称不能为空' },
    isLength: { options: [0,100], errorMessage: '类别名称不能超过100个字符'}
  },
  'pids': {
    notEmpty: { options: [true], errorMessage: '类别父集不能为空' }
  },
  'path': {
    notEmpty: { options: [true], errorMessage: '类别唯一代码不能为空' },
    isLength: { options: [0,100], errorMessage: '类别名称不能超过100个字符'}
  }
};
let auto = function(news) {
  if(!news){
    return ;
  }
  if(!news.id){ // id 不存在，为新增
    news.status = CONSTANTS.RULE_STATUS.VALID; // 1已发布  2待发布
    news.create_time = moment().format('YYYY-MM-DD hh:mm:ss');
  } else { // 修改时，默认字段赋值
    news.update_time = moment().format('YYYY-MM-DD hh:mm:ss');
  }
};
module.exports = {
  tbname:'rule',
  validation:validation,
  auto:auto
};