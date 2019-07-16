/**
 * 权限拦截器
 *
 */

let _ = require('lodash');
const { AuthError } = require('../models/errors.model');

module.exports = function (req, res, next) {
	next();
	return;
 	// 已登录
 	if(req.session.user){
 		next();
 		return;
 	}
 	// 未登录
 	// 请求非数据接口，如预览
 	if(!_.startsWith(req.url,'/api/')){
 		next();
 		return;
 	}

 	// 请求为登录接口
 	if(req.url == '/api/user/signin' || req.url == '/api/user/signout'){
 		next();
 		return;
 	}
 	
 	// 返回登录提示
 	return res.status(AuthError.status).json(new AuthError('用户未登录，请先登录'));
 	// return res.status(401).json({code:'NO_SIGNIN', msg:'用户未登录，请先登录'});
}