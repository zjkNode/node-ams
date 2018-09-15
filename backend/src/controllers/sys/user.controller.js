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
	var params = {
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
    role:['user', function(results, callback){
      roleService.one({ id: results.user.roleid }, function(error, role){
        	return callback(error, role);
      });
    }],
    deps:['user', function(results, callback){
      depService.getParentsById(results.user.depid, function(error, deps){
        return callback(error, deps);
      })
    }],
    actions:['user', function(results, callback){
      // 超管 所有权限
      if(utils.isAdmin(results.user)){
        return callback(null, ['ALL']);
      }
      confService.listByType(CONSTANTS.CONFIG_TYPES.AUTH_ACTION, function(error, configs){
      	return callback(error, configs);
      });
      // ruleService.getRulesByRole(results.role, function(error, rules){
      //   if(error){
      //     logService.log(req, '获取用户权限异常: ', results.user);
      //     return callback(error);
      //   }
      //   let rulesArr = _.map(rules, 'path');
      //   return callback(error, rulesArr);
      // });
    }]
  }, function(err, results) {
      if(err){
      	logService.log(req,'登录失败:'+ err.msg);
        return res.status(err.constructor.status).json(err);
      }
      let curUser = results.user;
      curUser.role = results.role;
      curUser.deps = results.deps;
      curUser.actions = results.actions;

      req.session.user = curUser;
      logService.log(req,'登录成功:'+ curUser.nickname);
      return res.status(200).json({ code:'SUCCESS', data: curUser });
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
	let depid = parseInt(req.body.depids[req.body.depids.length - 1]);
	let user = {
		email:req.body.email,
		nickname:req.body.nickname,
		password:utils.decrypt(req.body.password),
		depid: depid,
		roleid: parseInt(req.body.roleid),
		phone:req.body.phone || ''
	}
	userModel.auto(user);

	userService.add(user,function(err,resId) {
		if(err){
			logService.log(req, '服务器出错，新增用户失败');
			let status = err.constructor.status;
        	return res.status(status).json(err);
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
	let depid = parseInt(req.body.depids[req.body.depids.length - 1]);
	let user = {
		id: parseInt(req.params.id),
		email:req.body.email,
		nickname:req.body.nickname,
		password:utils.decrypt(req.body.password),
		depid: depid,
		roleid: parseInt(req.body.roleid),
		status: parseInt(req.body.status),
		phone:req.body.phone || ''
	}
	userModel.auto(user);
	userService.update(user, map, function(err){
		if(err){
			logService.log(req, '服务器出错，更新用户信息失败');
			let status = err.constructor.status;
        	return res.status(status).json(err);
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

	userService.lists(where, page, function(err, result){
		if(err){
			logService.log(req, '服务器出错，获取用户列表失败');
			let status = err.constructor.status;
        	return res.status(status).json(err);
		}
		return res.status(200).json({
			code: 'SUCCESS',
			data: result,
			msg:''
		});
	});
}