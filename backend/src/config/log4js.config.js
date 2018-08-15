
var logLevel = 'debug';
module.exports = {
  appenders: {
  	console:{ type: 'console' },
  	access:{ type:'dateFile',filename: './logs/access/access',pattern: 'yyMMdd.log',alwaysIncludePattern: true,maxLogSize:2048,backups:3},
  	system:{ type:'dateFile',filename: './logs/system/system',pattern: 'yyMMdd.log',alwaysIncludePattern: true,maxLogSize:2048,backups:3},
  	database:{ type:'dateFile',filename: './logs/database/database',pattern: 'yyMMdd.log',alwaysIncludePattern: true,maxLogSize:2048,backups:3},
  	error:{ type: 'dateFile',filename: './logs/errors/error',pattern: 'yyMMdd.log',alwaysIncludePattern: true},
    'just-errors':{ type:'logLevelFilter',appender:'error',level:'error'}
  },
  categories:{
    default:{
      appenders:['console','system','just-errors'],
      level:logLevel
    },
    access:{ 
      appenders:['console','access'],
      level:logLevel 
    },
    system:{
      appenders:['console','system','just-errors'],
      level:logLevel
    },
    database:{
      appenders:['console','database','just-errors'],
      level:logLevel
    }
  },
  replaceConsole: true,
  // pm2 相关配置, 否则log4js 在pm2环境下不记录日志
  pm2: true,
  disableClustering: true
};