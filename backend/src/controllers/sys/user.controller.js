/**
 *  user controller
 *  createby zjk
 */
let async = require('async'),
	utils = require('../../lib/utils'),
	logger = require('../../lib/logger.lib'),
	CONSTANTS = require('../../config/constants.config'),
	userModel = require('../../models/sys/user.model'),
	userService = require('../../services/sys/user.service'),
	logService = require('../../services/sys/log.service'),
	depService = require('../../services/sys/dep.service'),
	roleService = require('../../services/sys/role.service');

const { ComError, ValidationError, DBError} = require('../../models/errors.model');

exports.signIn = function (req, res) {
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
					return callback(new ComError('NOT_EXIST_USER', '用户名不存在'))
				}
				console.log('输入密码:'+ utils.decrypt(req.body.password))
				if(user.password !== utils.decrypt(req.body.password)){
					return callback(new ComError('ERR_USER_OR_PWD', '用户名或密码不正确'))
				}

				if(user.status === CONSTANTS.USER_STATUS.INVALID){
					return callback(new ComError('INVALID_USER', '用户已停用，请联系管理员激活'))
				}
				user.isAdmin = utils.isAdmin(user);
				return callback(null, user);
			});
		},
		roles:['user', function(results, callback){
			if(results.user.isAdmin){
				results.user.roleids = [];
				return callback(null, [{ id: 0, name: '超管', mids:[], datas: []}]);
			}
			results.user.roleids = results.user.roleids.split(',').map(id => parseInt(id));
			roleService.list({ id: ['in', results.user.roleids]}, function(error, role){
				return callback(error, role);
			});
		}],
		deps:['user', function(results, callback){
			if(results.user.isAdmin){
				results.user.depids = [];
				return callback(null, [{ id: 0, name: '系统管理', pid:0 }]);
			}
			results.user.depids = results.user.depids.split(',').map(id => parseInt(id));
			depService.list({ id: ['in', results.user.depids]}, function(error, deps){
				return callback(error, deps);
			});
		}]
	}, function(err, results) {
		if(err){
			let param = {
				originalUrl: req.originalUrl,
				ip: req.ip,
				headers: req.headers,
				session:{
					user:{
						nickname: req.body.email
					}
				}
			}
			logService.log(param, '登录失败: '+ err.msg);
			return res.status(err.constructor.status).json(err);
		}
		let curUser = results.user;
		curUser.depName = results.deps.map(dep => dep.name).join(',');
		curUser.roleName = results.roles.map(role => role.name).join(',');
		curUser.mids = [];
		
		let tmpActions = {}, tmpAuthDatas = [], tmpMids = [];
		tmpAuthDatas = results.roles.map(role => role.datas);
		curUser.datas = [...new Set([].concat(...tmpAuthDatas))];
		results.roles.forEach(role => {
			for(let mid in role.actions){
				tmpActions[mid] = tmpActions[mid] || [];
				tmpActions[mid] = [...new Set([...tmpActions[mid], ...role.actions[mid]])];
			}
			tmpMids = [...tmpMids, ...role.mids];
		});
		tmpMids = tmpMids.map(id => Math.abs(id)); // 负值在权限分配时代表半选状态，建菜单树时需要转成正值
		curUser.mids = [...new Set(tmpMids)];
		curUser.actions = tmpActions;
		req.session.user = curUser;
		logService.log(req, '登录成功');
		return res.status(200).json({ code:'SUCCESS',  data: curUser });
  });
}

exports.signOut = function(req, res){
	req.session.user = null;
	return res.status(200).json({ code:'SUCCESS', msg:'成功退出系统'});
}

exports.add = function (req, res) {
	req.checkBody(userModel.validation);
	let vErrors = req.validationErrors();
	if(vErrors) {
		logger.error(__filename, '参数验证失败', vErrors);
		return res.status(ValidationError.status).json(vErrors);
	}

	let user = Object.assign({}, req.body);
	user.password = utils.decrypt(user.password);
	userModel.auto(user);

	userService.add(user, function(err, resId) {
		if(err){
			logService.log(req, '服务器出错，新增用户失败', user);
        	return res.status(err.constructor.status).json(err);
		}
		user.id = resId;
		logService.log(req, '新增用户成功', user);
		return res.status(200).json({ code: 'SUCCESS', msg:'新增用户成功'});
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
			email: ['like', searchKey],
			nickname: ['like', searchKey],
			phone: ['like', searchKey],
		};
	}

	async.auto({
		userData: function(callback){
			userService.list(where, page, function(err, result){
				return callback(err, result)
			});
		},
		deps: ['userData', function(results, callback){
			let depids = results.userData.list.map(item => item.depids.split(','));
			depids = [...new Set([].concat(...depids))];// 去重，转为数组
			depService.list({ id:['in', depids] }, function(err, rows){
				return callback(err, rows);
			});
		}]
	}, function(error, results){
		if(error){
			logService.log(req, '服务器出错，获取用户列表失败', where);
        	return res.status(error.constructor.status).json(error);
		}
		let curUser = req.session.user;
		let depid = curUser.depids.slice(-1)[0];
		for (let i = 0; i < results.userData.list.length; i++) {
			let user = results.userData.list[i];
			// 用户是超管
			if(utils.isAdmin(user)){
				user.depids = [];
				user.roleids = [];
				user.depName = '系统管理';
				user.operateAble = curUser.isAdmin;
				user.isAdmin = utils.isAdmin(user);
				continue;
			}

			user.depids = user.depids.split(',').map(id => parseInt(id));
			user.roleids = user.roleids.split(',').map(id => parseInt(id));
			let deps = results.deps.filter(dep => user.depids.includes(dep.id));
			user.depName = deps.map(dep => dep.name).join(' / ');
			let tmpDepId = user.depids.slice(-1)[0];
			// 当前登录用户是超管，或用户所在部门 或用户所在部门子部门时，可操作
			user.operateAble = curUser.isAdmin || user.depids.includes(depid) || tmpDepId === depid;
			user.isAdmin = utils.isAdmin(user);
		}
		return res.status(200).json({ code: 'SUCCESS', data: results.userData });
	});
}