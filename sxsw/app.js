var path = require('path');
// var _ = require('lodash');
var express = require('express');
var nunjucks = require('nunjucks');
var compression = require('compression');
//var favicon = require('serve-favicon');

var router = require('./routers');
var app = express();

/**
 * 设置模板解析
 */


nunjucks.configure(path.join(__dirname,'src/views'),{
	autoescape:true,
	express: app
});
app.set('view engine','html');
 // app.engine('.html', hbs.express4({
 //    // layoutsDir: 'src/views/partials/',
 //    partialsDir: 'src/views/partials/',
 //    extname: '.html'
 //  }));
 //  app.set('view engine', '.html');
 //  app.set('views', 'src/views');

// app.engine('html',ejs.renderFile);
// //app.engine('html',ejs.__express);
// app.set('view engine','html');
// app.set('views', 'src/views');
/**
 * 中间件
 */
app.use(compression());
//app.use(favicon(__dirname + '/public/favicon.ico'));
app.use('/static', express.static(path.join(__dirname, 'src/static')));

/**
 * 转给 Roter 处理路由
 */
app.use(router);


/**
 * 错误处理程序
 */
// app.use(errors);

/**
 * 导出 APP
 */
module.exports = app;