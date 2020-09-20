/**
 *  qz_user controller
 *  createby zjk
 */
let async = require('async'),
	utils = require('../../lib/utils'),
	logger = require('../../lib/logger.lib'),
	userModel = require('../../models/qizhi/user.model'),
	userService = require('../../services/qizhi/user.service'),
	logService = require('../../services/sys/log.service');

const { ComError, ValidationError} = require('../../models/errors.model');

exports.signIn = function (req, res) {
	req.checkBody({
		'phone': {
	    isNotEmpty: { errorMessage: '帐号不能为空' },
	  },
	  'pwd': {
	    isNotEmpty: { errorMessage: '密码不能为空' },
	  }
	});

	let vErrors = req.validationErrors();
	if(vErrors) {
		logger.error(__filename, '参数验证失败', vErrors);
		return res.status(ValidationError.status).json(vErrors);
	}
	let params = {
		phone:req.body.phone
	};

  async.auto({
		user: function(callback) {
			userService.one(params, function(error, user){
				if(error){
					return callback(error);
				}
				if(!user){
					return callback(new ComError('NOT_EXIST_USER', '用户不存在'))
				}
				console.log('输入密码:'+ utils.decrypt(req.body.pwd))
				if(user.pwd !== utils.decrypt(req.body.pwd)){
					return callback(new ComError('ERR_USER_OR_PWD', '用户或密码不正确'))
				}
				return callback(null, user);
			});
		},
	}, function(err, results) {
		if(err){
			let param = {
				originalUrl: req.originalUrl,
				ip: req.ip,
				headers: req.headers,
				session:{
					user:{
						nickname: req.body.phone
					}
				}
			}
			logService.log(param, '启智用户 登录失败: '+ err.msg);
			return res.status(err.constructor.status).json(err);
		}
		let curUser = results.user;
		curUser.token = utils.encrypt(`${curUser.id}_${curUser.name}`);
		return res.status(200).json({ code:'SUCCESS',  data: curUser });
  });
}


exports.add = function (req, res) {
	req.checkBody(userModel.validation);
	let vErrors = req.validationErrors();
	if(vErrors) {
		logger.error(__filename, '参数验证失败', vErrors);
		return res.status(ValidationError.status).json(vErrors);
	}

	let user = Object.assign({}, req.body);
	user.pwd = utils.decrypt(user.pwd);
	userModel.auto(user);

	userService.add(user, function(err, resId) {
		if(err){
			logService.log(req, '服务器出错，新增失败', user);
      return res.status(err.constructor.status).json(err);
		}
		user.id = resId;
		return res.status(200).json({ code: 'SUCCESS', msg:'新增成功'});
	});
}

exports.update = function(req, res) {
	req.checkParams({
	    'id': { isNotEmpty: { options: [true], errorMessage: '用户id 不能为空' }
	  }
	});
	req.checkBody(userModel.validation);

	let vErrors = req.validationErrors();
	if(vErrors) {
		logger.error(__filename, '参数验证失败', vErrors);
		return res.status(ValidationError.status).json(vErrors);
	}
	let map = {
		id: parseInt(req.params.id)
	};
	let user = Object.assign({}, req.body, map);
	delete user.password;
	if(user.newPwd){
		user.password = utils.decrypt(user.newPwd);
	}
	delete user.newPwd;
	userModel.auto(user);
	userService.update(user, map, function(err){
		if(err){
			logService.log(req, '服务器出错，更新用户信息失败', user);
        	return res.status(err.constructor.status).json(err);
		}
		logService.log(req, '更新用户信息成功', user);
		return res.status(200).json({code:'SUCCESS', msg:'更新用户信息成功'});
	});
}

exports.delete = function(req, res){
	req.checkParams({
			'id': { isNotEmpty: { errorMessage: '用户id 不能为空'}
	  }
	});

	let vErrors = req.validationErrors();
	if(vErrors) {
		logger.error(__filename, '参数验证失败', vErrors);
		return res.status(ValidationError.status).json(vErrors);
	}
	let map = {
		id: parseInt(req.params.id)
	};
	userService.delete(map, function(err){
		if(err){
			logService.log(req, '服务器出错，删除用户失败', map);
        	return res.status(err.constructor.status).json(err);
		}
		logService.log(req, '删除用户成功', map);
		return res.status(200).json({code:'SUCCESS', msg:'删除用户成功'});
	});
}

exports.list = function(req, res) {
	let where = {};
	let searchKey = req.query.keys;
	let page = {
		index: parseInt(req.query.pageIndex),
		size: parseInt(req.query.pageSize)
	};
	if(searchKey){
		where._complex = {
			_logic: 'or',
			name: ['like', searchKey],
			phone: ['like', searchKey],
		};
	}

	userService.list(where, page, function(error, result){
		if(error){
			logService.log(req, '服务器出错，获取用户列表失败', where);
      return res.status(error.constructor.status).json(error);
		}
		return res.status(200).json({ code: 'SUCCESS', data: result });
	});
}