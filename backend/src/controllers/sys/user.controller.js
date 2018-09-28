let async = require('async'),
	_ = require('lodash'),
	utils = require('../../lib/utils'),
	logger = require('../../lib/logger.lib'),
	CONSTANTS = require('../../config/constants.config'),
	userModel = require('../../models/sys/user.model'),
	userService = require('../../services/sys/user.service'),
	logService = require('../../services/sys/log.service'),
	depService = require('../../services/sys/dep.service'),
	confService = require('../../services/sys/config.service'),
	roleService = require('../../services/sys/role.service');

const { ComError, ValidationError, DBError} = require('../../models/errors.model');

exports.signIn = function (req,res) {
	req.checkBody({
	'email': {
	    isNotEmpty: { errorMessage: '帐号不能为空' },
	  },
	  'password': {
	    isNotEmpty: { errorMessage: '密码不能为空' },
	  }
	});

	let vErrors = req.validationErrors();
	if(vErrors) {
		logger.error(__filename, '参数验证失败', vErrors);
		return res.status(ValidationError.status).json(vErrors);
	}
	let params = {
		email:req.body.email
	};

  	async.auto({
		user: function(callback) {
			userService.one(params, function(error, user){
				if(error){
					return callback(error);
				}
				if(!user){
					return callback(new ComError('NOT_EXIST_USER','用户名不存在'))
				}
				if(user.password !== utils.decrypt(req.body.password)){
					return callback(new ComError('ERR_USER_OR_PWD','用户名或密码不正确'))
				}
				delete user.password; // 验证完成，移除密码
				return callback(null, user);
			});
		},
		roles:['user', function(results, callback){
			if(utils.isAdmin(results.user)){
				return callback(null, [{ id: 0, name: '超级管理员', mids:[], datas: []}]);
			}
			let roleids = results.user.roleids.split(',').map(id => parseInt(id));
			roleService.list({ id: ['in', roleids]}, function(error, role){
				return callback(error, role);
			});
		}],
		deps:['user', function(results, callback){
			if(utils.isAdmin(results.user)){
				return callback(null, [{ id: 0, name: '系统管理', pid:0 }]);
			}
			let depids = results.user.depids.split(',').map(id => parseInt(id));
			depService.list({ id: ['in', depids]}, function(error, deps){
				return callback(error, deps);
			});
		}]
	}, function(err, results) {
		if(err){
			logService.log(req,'登录失败:'+ err.msg);
			return res.status(err.constructor.status).json(err);
		}

		let curUser = results.user;
		curUser.isAdmin = utils.isAdmin(curUser);
		curUser.mids = [];
		curUser.depName = results.deps.map(dep => dep.name).join(',');
		curUser.roleName = results.roles.map(role => role.name).join(',');
		let tmpActions = {};
		results.roles.forEach(role => {
			for(let mid in role.actions){
				tmpActions[mid] = tmpActions[mid] || [];
				tmpActions[mid] = [...new Set([...tmpActions[mid], ...role.actions[mid]])];
			}
			curUser.mids = [...curUser.mids,...role.mids];
		});
		curUser.actions = tmpActions;
		curUser.mids = [...new Set(curUser.mids)];
		req.session.user = curUser;
		logService.log(req,'登录成功:'+ curUser.nickname);
		return res.status(200).json({ code:'SUCCESS',  data: curUser });
  });
}

exports.signOut = function(req, res){
	req.session.user = null;
	return res.status(200).json({ code:'SUCCESS', msg:'成功退出系统'});
}

exports.add = function (req,res) {
	req.checkBody(userModel.validation);
	let vErrors = req.validationErrors();
	if(vErrors) {
		logger.error(__filename, '参数验证失败', vErrors);
		return res.status(ValidationError.status).json(vErrors);
	}

	let user = Object.assign({}, req.body);
	user.password = utils.decrypt(user.password);
	userModel.auto(user);

	userService.add(user,function(err,resId) {
		if(err){
			logService.log(req, '服务器出错，新增用户失败');
        	return res.status(err.constructor.status).json(err);
		}
		return res.status(200).json({ code: 'SUCCESS', msg:'新增用户成功'});
	});
}

exports.update = function(req,res) {
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
	user.password = utils.decrypt(user.password);
	userModel.auto(user);
	userService.update(user, map, function(err){
		if(err){
			logService.log(req, '服务器出错，更新用户信息失败');
        	return res.status(err.constructor.status).json(err);
		}
		return res.status(200).json({code:'SUCCESS', msg:'更新用户信息成功'});
	});
}

exports.delete = function(req,res){
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
			logService.log(req, '服务器出错，删除用户失败');
			let status = err.constructor.status;
        	return res.status(status).json(err);
		}
		return res.status(200).json({code:'SUCCESS', msg:'删除用户成功'});
	});
}

exports.list = function(req,res) {
	let where = {};
	let searchKey = req.query.keys;
	let page = {
		index: parseInt(req.query.pageIndex),
		size: parseInt(req.query.pageSize)
	};
	if(searchKey){
		where._complex = {
			_logic: 'or',
			email: ['like',searchKey],
			nickname: ['like',searchKey],
			phone: ['like',searchKey],
		};
	}
	// let curUser = req.session.user;

	// if(!utils.isAdmin(curUser.id)){
	// 	where.depid = curUser.depid;
	// }

	async.auto({
		userData: function(callback){
			userService.list(where, page, function(err, result){
				return callback(err, result)
			});
		},
		deps: ['userData', function(results, callback){
			let depids = _.map(results.userData.list, 'depids').join(',');
			depids = _.union(depids.split(','));
			depService.list({ id:['in', depids] }, function(err, rows){
				return callback(err, rows);
			});
		}]
	}, function(error, results){
		if(error){
			logService.log(req, '服务器出错，获取用户列表失败');
        	return res.status(error.constructor.status).json(error);
		}
		results.userData.list.forEach(user => {
			user.depids = user.depids.split(',').map(id => parseInt(id));
			let deps = results.deps.filter(dep => user.depids.includes(dep.id));
			user.depName = _.map(deps, 'name').join(' / ');
			user.roleids = user.roleids.split(',').map(id => parseInt(id));
		});

		return res.status(200).json({ code: 'SUCCESS', data: results.userData });
	});
}