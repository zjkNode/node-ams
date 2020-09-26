var path = require('path');
// var _ = require('lodash');
var express = require('express');
// var hbs = require('express-hbs');
var nunjucks = require('nunjucks');
// var compression = require('compression');
//var favicon = require('serve-favicon');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var validator = require('./src/lib/validator.lib');
var session = require('./src/lib/session.lib');
var logger = require('./src/lib/logger.lib');
var router = require('./src/lib/route-map.lib');
var filter = require('./src/lib/filter.lib');
var authHandler = require('./src/handlers/auth.handler');
var exceptionHandler = require('./src/handlers/exception.handler');
// // var scheduleJob = require('./handlers/schedule.handler');
var sysHandler = require('./src/handlers/system.handler');
// var errors = require('./src/controllers/errors.controller').error;

var app = express();
var port = process.env.PORT || '8071';

/**
 * 设置模板解析
 */
var env = nunjucks.configure('src/themes',{
	autoescape:true,
	noCache: true, // nunjucks 不缓存模板文件
	express: app
});
env.addFilter('styleFn', filter.styleFilter, true);
env.addFilter('comFilter', filter.comFilter);
app.set('view engine','html');

/**
 * 中间件
 */
// app.use(compression());
// //app.use(favicon(__dirname + '/public/favicon.ico'));
app.use(logger.access());
app.use(bodyParser.json({ limit:'10mb' }));
app.use(bodyParser.urlencoded({ limit:'10mb', extended: true }));
app.use(validator());
app.use(cookieParser());
app.use(session.check(), session.init());
// app.use(express.static(path.join(__dirname, 'temp')));
app.use('/temp', express.static(path.join(__dirname, 'temp'))); // 活动上传图片临时目录访问路径
app.use('/preview', express.static(path.join(__dirname, 'www/nodesystem')));
app.use('/static', express.static(path.join(__dirname, 'www/nodesystem')));


app.use(exceptionHandler); // 异常拦截器
app.use(authHandler);// 权限拦截器
app.use(router); // 转给 Roter 处理路由
// app.use(errors); // 统一错误处理  如 404
sysHandler.init(); // 启动时初始化操作：如：初始化软连接
// app.use(sysJob); // 统计定时任务

// app.set('port', port);

var server = app.listen(port, function () {
	var host = server.address().address;
	var port = server.address().port;

	logger.info(`Example app listening at http://${host}:${port}`);
});

process.on('uncaughtException', function (err) {
    logger.info('程序出现未捕获异常'); 
    logger.info('--------------------------------  uncaught Exception Start: --------------------------------');
    logger.fatal(err); //注意这个错误信息并没有错误发生时的堆栈信息
    logger.info('--------------------------------  uncaught Exception End: --------------------------------');
    logger.info('关闭连接');

    server.close();
    setTimeout(function(){
      server.listen(port);
    }, 0);
});