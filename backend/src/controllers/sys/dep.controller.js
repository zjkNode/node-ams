/**
 *  dep controller
 *  createby zjk
 */
var async = require('async'),
	_ = require('lodash'),
	utils = require('../../lib/utils'),
	logger = require('../../lib/logger.lib'),
	CONSTANTS = require('../../config/constants.config'),
	depModel = require('../../models/sys/dep.model'),
	depService = require('../../services/sys/dep.service'),
	logService = require('../../services/sys/log.service'),
	userService = require('../../services/sys/user.service'),
	roleService = require('../../services/sys/role.service');

const { ComError, ValidationError, DBError} = require('../../models/errors.model');

exports.add = function (req, res) {
	req.checkBody(depModel.validation);
	let vErrors = req.validationErrors();
	if(vErrors) {
		logger.error(__filename, '参数验证失败', vErrors);
		return res.status(ValidationError.status).json(vErrors);
	}
	let dep = Object.assign({}, req.body);
	depModel.auto(dep);
	depService.add(dep, function(err, resId) {
		if(err){
			logService.log(req, '服务器出错，新增部门失败', dep);
        	return res.status(err.constructor.status).json(err);
		}
		dep.id = resId;
		logService.log(req, '新增部门成功', dep);
		return res.status(200).json({ code: 'SUCCESS', msg:'新增部门成功'});
	});

}

exports.update = function(req, res) {
	req.checkParams({
	    'id': { isNotEmpty: { errorMessage: '部门id 不能为空' }
	    	}
	  });
	req.checkBody(depModel.validation);

	let vErrors = req.validationErrors();
	if(vErrors) {
		logger.error(__filename, '参数验证失败', vErrors);
		return res.status(ValidationError.status).json(vErrors);
	}
	let where = {
		id: parseInt(req.params.id)
	};
	let dep = Object.assign({}, req.body, where);
	depModel.auto(dep);
	depService.update(dep, where, function(err){
		if(err){
			logService.log(req, '服务器出错，更新部门失败', dep);
        	return res.status(err.constructor.status).json(err);
		}
		logService.log(req, '更新部门成功', dep);
		return res.status(200).json({code:'SUCCESS', msg:'更新部门成功'});
	});
}

exports.delete = function(req, res){
	req.checkParams({
		'id': { isNotEmpty: {  errorMessage: '部门id 不能为空'}
	    }
	});

	let vErrors = req.validationErrors();
	if(vErrors) {
		logger.error(__filename, '参数验证失败', vErrors);
		return res.status(ValidationError.status).json(vErrors);
	}
	let where = { 
		id: parseInt(req.params.id) 
	};
	depService.delete(where, function(err, callback){
		if(err){
			logService.log(req, '服务器出错，删除部门失败: '+ err.msg, where);
    		return res.status(err.constructor.status).json(err);
		}
		logService.log(req, '删除部门成功', where);
		return res.status(200).json({code:'SUCCESS', msg:'删除部门成功'});
	});
}

exports.list = function(req, res) {
	var where = {};
	let searchKey = req.query.keys;
	if(searchKey){
		where._complex = {
			_logic: 'or',
			name: ['like', searchKey]
		};
	}
	
	async.waterfall([
		function(callback){
			depService.list(where, function(error, resList){
				return callback(error, resList);
			});
		},
		function(resList, callback){
			if(!searchKey){
				return callback(null, resList);
			}

			if(!resList || resList.length == 0){
				return callback(null, null);
			}
			let ids = [];
			resList.forEach(dep => {
				ids.push(dep.id);
				ids.push(...dep.pids);
			});
			ids = [...new Set(ids)];
			depService.list({ id: ['in', ids]}, function(error, resList){
				return callback(error, resList);
			});
		}
	], function(err, result){
		if(err){
			logService.log(req, '服务器出错，获取部门列表失败', where);
    		return res.status(err.constructor.status).json(err);
		}
		let curUser = req.session.user;
		let depid = curUser.depids.slice(-1)[0];
		result.forEach(item => {
			item.operateAble = curUser.isAdmin || item.pids.includes(depid) || item.id === depid;
			item.pids = item.pids.split(',').map(id => parseInt(id))
		});
		return res.status(200).json({ code: 'SUCCESS', data: utils.buildTreeTable(result) });
	});
}

exports.tree = function(req, res){
	let where = {
		status: CONSTANTS.DEP_STATUS.VALID
	};
	let curUser = req.session.user;
	if(curUser.isAdmin){
		depService.list(where, function(err, result){
			if(err){
			  	logService.log(req, '服务器出错，获取部门类型失败', where);
        		return res.status(err.constructor.status).json(err);
			}
			result.forEach(item => item.pids = item.pids.split(',').map(id => parseInt(id)));
			return res.status(200).json({ code: 'SUCCESS', data: utils.buildTree(result, 0) });
		});
		return;
	}
	// 非超管 只能操作本部门及子部门
	async.auto({
		parents: function(callback){
			where.id = ['in', curUser.depids];
			depService.list(where, function(error, rows){
				return callback(error, rows);
			});
		},
		children: function(callback){
			let id = curUser.depids.slice(-1)[0];
			depService.getChildById(id, function(error, rows){
				return callback(error, rows);
			});
		}
	}, function(err, results){
		if(err){
			logService.log(req, '服务器出错，获取部门失败', where);
    		return res.status(err.constructor.status).json(err);
		}
		let children = results.children.filter(dep => dep.status === CONSTANTS.DEP_STATUS.VALID);
		let resList = [...results.parents, ...children];
		resList.forEach(dep => dep.disabled = curUser.depids.includes(dep.id));
		return res.status(200).json({ code:'SUCCESS', data: utils.buildTree(resList, resList[0].pid) });
	});
}