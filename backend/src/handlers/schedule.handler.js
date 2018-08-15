
var schedule = require('node-schedule');
var newsController = require('../controllers/news/news.controller');

module.exports.job = function() {

	// * * * * * *
	// 秒(0-59) 分(0-59) 时(0-23) 日(1-31) 月(1-12) 周(0-7: 0或7为周日)
	// * 代表任意 
	// 每天凌晨24点整执行：0 0 0 * * * 
	schedule.scheduleJob('1 * * * * *',function(){
		newsController.publishHome();
	});
}