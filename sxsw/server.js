#!/usr/bin/env node
var http = require('http');
var app = require('./app');

/**
 * 设置端口
 */
var port = process.env.PORT || '8031';
app.set('port', port);

/**
 * 启动服务器
 */

  //创建 HTTP 服务器
  var server = http.createServer(app);

  //监听端口
  server.listen(port);

  server.on('error', function (error) {
    if (error.syscall !== 'listen') throw error;

    var bind = typeof port === 'string' ? 'pipe ' + port : 'port ' + port;

    // handle specific listen errors with friendly messages
    switch (error.code) {
      case 'EACCES':
        console.log(bind + ' 需要有更高的权限');
        process.exit(1);

        break;
      case 'EADDRINUSE':
        console.log(bind + ' 已被使用');
        process.exit(1);

        break;
      default:
        throw error;
    }
  });

  server.on('listening', function () {
    var addr = server.address();
    var bind = typeof addr === 'string' ? 'pipe ' + addr : 'port ' + addr.port;

    console.log('正在监听 ' + bind);
  });