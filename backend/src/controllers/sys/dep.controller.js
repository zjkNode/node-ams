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

exports.add = function (req,res) {
	req.checkBody(depModel.validation);
	let vErrors = req.validationErrors();
	if(vErrors) {
		logger.error(__filename, '参数验证失败', vErrors);
		return res.status(ValidationError.status).json(vErrors);
	}
	let dep = Object.assign({}, req.body);
	depModel.auto(dep);
	depService.add(dep,function(err,resId) {
		if(err){
			logService.log(req, '服务器出错，新增部门失败: '+ dep.name );
			let status = err.constructor.status;
        	return res.status(status).json(err);
		}
		return res.status(200).json({ code: 'SUCCESS', msg:'新增部门成功'});
	});

}

exports.update = function(req,res) {
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
			logService.log(req, '服务器出错，更新部门信息失败');
			let status = err.constructor.status;
        	return res.status(status).json(err);
		}
		return res.status(200).json({code:'SUCCESS', msg:'更新部门信息成功'});
	});
}

exports.delete = function(req,res){
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
	depService.delete(where, function(error, callback){
		if(error){
			logService.log(req, '服务器出错，删除部门失败');
    		return res.status(err.constructor.status).json(err);
		}
		return res.status(200).json({code:'SUCCESS', msg:'删除部门成功'});
	});
}

exports.list = function(req,res) {
	var where = {};
	let searchKey = req.query.keys;
	if(searchKey){
		where._complex = {
			_logic: 'or',
			name: ['like',searchKey]
		};
	}
	
	let curUser = req.session.user;
	if(curUser.isAdmin){
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
					ids.push(dep.pids.split(',').map(id => parseInt(id)));
				});
				ids = _.union(ids);
				depService.list({ id: ['in', ids]}, function(error,resList){
					callback(error, resList);
				});
			}
		],function(err,result){
			if(err){
				logService.log(req, '服务器出错，获取部门列表失败');
        		return res.status(err.constructor.status).json(err);
			}
			let resList = result ? utils.buildTreeTable(result) : [];
			return res.status(200).json({
				code: 'SUCCESS',
				data: resList
			});
		});
		return;
	}

	// 非超管
	async.auto({
		parents: function(callback){
			let pids = curUser.depids.split(',').map(id => parseInt(id));
			where.id = ['in', pids];
			depService.list(where, function(error, rows){
				return callback(error, rows);
			});
		},
		children: function(callback){
			let id = parseInt(curUser.depids.split(',').pop());
			depService.getChildById(id, function(error, rows){
				if(error || !searchKey){
					return callback(error, rows);
				}
				let children = rows.filter(dep => dep.name.indexOf(searchKey) > -1);
				let tmpIds = [];
				children.forEach(dep => {
					let ids = dep.pids.split(',').map(id => parseInt(id));
					tmpIds = [...tmpIds, ...ids];
				});
				tmpIds = [...new Set(tmpIds)];
				let childrenIds = children.map(dep => dep.id);
				rows.forEach(dep => {
					if(tmpIds.includes(dep.id) && !childrenIds.includes(dep.id)){
						children.push(dep);
					}
				});
				return callback(error, children);
			});
		}
	}, function(err, results){
		if(err){
			logService.log(req, '服务器出错，获取部门失败');
    		return res.status(err.constructor.status).json(err);
		}
		let resList = [...results.parents, ...results.children];
		resList = resList.length > 0 ? utils.buildTreeTable(resList, resList[0].pid) : [];
		return res.status(200).json({ code:'SUCCESS',  data: resList });
	});

	// depService.list(where, function(err, deps){
	// 	if(err){
	// 		logService.log(req, '服务器出错，获取部门列表失败');
 //    		return res.status(err.constructor.status).json(err);
	// 	}
	// 	let resList = deps ? utils.buildTreeTable(deps) : [];
	// 	return res.status(200).json({ code: 'SUCCESS', data: resList });
	// });


	// async.waterfall([
	// 	function(callback){
	// 		depService.getChildById(curUser.depid, function(error,depList){
	// 			return callback(error,depList);
	// 		});
	// 	},
	// 	function(depList, callback){
	// 		let ids = [];
	// 		depList.forEach(dep => {
	// 			ids.push(dep.id);
	// 			ids.push(dep.pids.split(',').map(id => parseInt(id)));
	// 		})
	// 		ids = _.union(ids);

	// 		let idMap = ['in', ids];
	// 		where._complex ? where._complex.id = idMap : where.id = idMap;
	// 		depService.list(where, function(error,resList){
	// 			return callback(error, resList);
	// 		});
	// 	}
	// ],function(err,result){
	// 	if(err){
	// 		logService.log(req, '服务器出错，获取部门列表失败');
 //    		return res.status(err.constructor.status).json(err);
	// 	}
	// 	let resList = result ? utils.buildTreeTable(result) : [];
	// 	return res.status(200).json({
	// 		code: 'SUCCESS',
	// 		data: resList
	// 	});
	// });
}

exports.tree = function(req,res){
	let where = {
		status: CONSTANTS.DEP_STATUS.NORMAL
	};
	let curUser = req.session.user;
	if(curUser.isAdmin){
		depService.list(where, function(err,result){
			if(err){
			  	logService.log(req, '服务器出错，获取部门类型失败');
        		return res.status(err.constructor.status).json(err);
			}
			let resList = result ? utils.buildTree(result,0) : [];
			return res.status(200).json({
			  code: 'SUCCESS',
			  data: resList
			});
		});
		return;
	}
	// 非超管
	async.auto({
		parents: function(callback){
			let pids = curUser.depids.split(',').map(id => parseInt(id));
			where.id = ['in', pids];
			depService.list(where, function(error, rows){
				return callback(error, rows);
			});
		},
		children: function(callback){
			let id = parseInt(curUser.depids.split(',').pop());
			depService.getChildById(id, function(error, rows){
				return callback(error, rows);
			});
		}
	}, function(err, results){
		if(err){
			logService.log(req, '服务器出错，获取部门失败');
    		return res.status(err.constructor.status).json(err);
		}
		let children = results.children.filter(dep => dep.status === CONSTANTS.DEP_STATUS.NORMAL);
		let resList = [...results.parents, ...children];
		return res.status(200).json({  code:'SUCCESS',  data: utils.buildTree(resList, resList[0].pid),});
	});

	// // 非超管
	// depService.getChildById(curUser.depid,function(err,result){
	// 	if(err){
	// 		logService.log(req, '服务器出错，获取部门失败，部门id:'+ curUser.depid);
 //    		return res.status(err.constructor.status).json(err);
	// 	}
	// 	// 过滤状态 状态为正常的部门
	// 	let resList = _.filter(result, 'status', CONSTANTS.DEP_STATUS.NORMAL) || [];
	// 	return res.status(200).json({ 
	// 			code:'SUCCESS', 
	// 			data: utils.buildTree(resList,result[0].pid),
	// 			msg: ''
	// 		});
	// });
}