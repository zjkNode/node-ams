/**
 * 异常捕获机制 防止process crash
 *
 */

let domain = require('domain');
var logger = require('../lib/logger.lib');

module.exports = function (req, res, next) {
 	// 使用 domain 来捕获大部分异常
 	let reqDomain = domain.create();
 	reqDomain.on('error', function (err) {
        try {
         	// // 强制退出机制
	        // var killTimer = setTimeout(function () {
	        //   process.exit(1);
	        // }, 30000);
	        // killTimer.unref();

          // 自动退出机制，停止接收新链接，等待当前已建立连接的关闭
    			// server.close(function () {
    			// // 此时所有连接均已关闭，此时 Node 会自动退出，不需要再调用 process.exit(1) 来结束进程
    			// });

          logger.error('error in domain', err);
          res.status(500).json({ code: 'SERVER_ERROR', msg: '服务器出错，请稍后重试！'});// 级别客户端输入友好的提示
        } catch (e) {
          logger.error('error in exception handler', e.stack);
        }
    });

    reqDomain.run(next);
}