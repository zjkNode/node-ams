var log4js = require('log4js');
var config = require('../config/log4js.config');

/**
 * 载入配置
 */
log4js.configure(config);

var logSystem = log4js.getLogger('system'),
	logDB = log4js.getLogger('database');

/**
 * 导出日志接口
 */
module.exports = {
  access: function () {
    return log4js.connectLogger(log4js.getLogger('access'), { level: 'auto', format: ':method :url' });
  },
  debug: function(msg){
  	msg = msg || '';
  	logSystem.debug(msg);
  },
  info: function(msg, ...args){
  	msg = msg || '';
  	logSystem.info(msg, args);
  },
  warn: function(msg){
  	msg = msg || '';
  	logSystem.warn(msg);
  },
  error: function(errFile,msg, ...args){
  	logSystem.error(errFile, msg, args);
  },
  fatal: function(msg){
    logSystem.fatal(msg);
  },
  debugDB:function(msg){
  	msg = msg || '';
  	logDB.debug(msg);
  },
  errorDB: function(errFile, msg, ...args){
  	logDB.error(errFile,msg, args);
  }

};