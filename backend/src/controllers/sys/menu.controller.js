/**
 *  menu controller
 *  createby zjk
 */
var async = require('async'),
	_ = require('lodash'),
	util = require('../../lib/utils'),
	logger = require('../../lib/logger.lib'),
	CONSTANTS = require('../../config/constants.config'),
	menuModel = require('../../models/sys/menu.model'),
	menuService = require('../../services/sys/menu.service'),
	logService = require('../../services/sys/log.service');

const { ComError, ValidationError, DBError} = require('../../models/errors.model');

exports.add = function (req, res) {
	req.checkBody(menuModel.validation);
	let vErrors = req.validationErrors();
	if(vErrors) {
		logger.error(__filename, '参数验证失败', vErrors);
		return res.status(ValidationError.status).json(vErrors);
	}
	
	let menu = Object.assign({}, req.body);
	menuModel.auto(menu);
	menuService.add(menu, function(err, resId) {
		if(err){
			logService.log(req, '服务器出错，新增菜单失败', menu);
        	return res.status(err.constructor.status).json(err);
		}
		menu.id = resId;
		logService.log(req, '新增菜单成功', menu);
		return res.status(200).json({ code: 'SUCCESS', msg:'新增菜单成功'});
	});
}

exports.delete = function(req, res){
	req.checkParams({
		'id': {
      		isNotEmpty: { errorMessage: 'id 不能为空'}
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
	menuService.delete(map, function(err){
		if(err){
			logService.log(req, '服务器出错，删除菜单失败', map);
        	return res.status(err.constructor.status).json(err);
		}
		logService.log(req, '删除菜单成功', map);
		return res.status(200).json({code:'SUCCESS', msg:'删除菜单成功'});
	});
}

exports.update = function(req, res) {
	req.checkParams({
	    'id': {
	    	isNotEmpty: { errorMessage: 'id 不能为空'}
	    }
	});
	req.checkBody(menuModel.validation);
	let vErrors = req.validationErrors();
	if(vErrors) {
		logger.error(__filename, '参数验证失败', vErrors);
		return res.status(ValidationError.status).json(vErrors);
	}
	let map = {
		id: parseInt(req.params.id)
	};
	let menu = Object.assign({}, req.body, map);
	menuModel.auto(menu);
	menuService.update(menu, map, function(err){
		if(err){
			logService.log(req, '服务器出错，更新菜单失败', menu);
        	return res.status(err.constructor.status).json(err);
		}
		logService.log(req, '更新菜单成功', menu);
		return res.status(200).json({code:'SUCCESS', msg:'更新菜单成功'});
	});
}

exports.tree = function(req, res){
    menuService.tree({}, function(err, rows){
		if(err){
			logService.log(req, '服务器出错，获取菜单树失败');
        	return res.status(err.constructor.status).json(err);
		}
		return res.status(200).json({ code: 'SUCCESS', data: util.buildTree(rows, 0), msg: "" });
    });
}

exports.list = function(req, res){
	let where = {};
	let searchKey = req.query.keys;
	if(searchKey){
		where._complex = {
			_logic: 'or',
			name: ['like', searchKey],
			alink: ['like', searchKey]
		};
	}
	
	async.waterfall([
		function(callback){
			menuService.list(where, function(error, resList){
				return callback(error, resList);
			});
  		},
  		function(menus, callback){
  			if(!searchKey){
  				return callback(null, menus);
  			}
			let ids = [];
			menus.forEach(menu => {
				ids.push(menu.id);
				ids.push(menu.pids);
			});
			ids = [...new Set(ids.join(',').split(','))]; 
			menuService.list({ id: ['in', ids]}, function(error, resList){
				return callback(error, resList);
			});
  		}
  	], function(err, result){
		if(err){
			logService.log(req, '服务器出错，获取菜单列表失败', where);
			return res.status(err.constructor.status).json(err);
		}
		return res.status(200).json({ code: 'SUCCESS', data: util.buildTreeTable(result) });
  	});
}