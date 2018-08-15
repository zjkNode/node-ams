var logger = require('../lib/logger.lib');

exports.error = function (err,req,res,next) {
	if(err && err.status !== 404){
		logger.error(err);
	}

	res.render("error",{});
}