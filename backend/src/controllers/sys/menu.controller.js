var async = require('async'),
	_ = require('lodash'),
	util = require('../../lib/utils'),
	logger = require('../../lib/logger.lib'),
	CONSTANTS = require('../../config/constants.config'),
	menuModel = require('../../models/sys/menu.model'),
	menuService = require('../../services/sys/menu.service'),
	logService = require('../../services/sys/log.service');

const { ComError, ValidationError, DBError} = require('../../models/errors.model');

exports.add = function (req,res) {
	req.checkBody(menuModel.validation);
	let vErrors = req.validationErrors();
	if(vErrors) {
		logger.error(__filename, '参数验证失败', vErrors);
		return res.status(ValidationError.status).json(vErrors);
	}
	var newMenu = {
		name:req.body.name,
		alink:req.body.alink,
		pid:parseInt(req.body.pid),
		pids: req.body.pids,
		sort: parseInt(req.body.sort),
		status:parseInt(req.body.status)
	}
	menuModel.auto(newMenu);
	menuService.add(newMenu,function(err,resId) {
		if(err){
			logService.log(req, '服务器出错，新增菜单失败');
			let status = err.constructor.status;
        	return res.status(status).json(err);
		}
		logService.log(req, '新增菜单成功'+ newMenu.name);
		return res.status(200).json({ code: 'SUCCESS', msg:'新增菜单成功'});
	});

}

exports.delete = function(req,res){
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
			logService.log(req, '服务器出错，删除菜单失败');
			let status = err.constructor.status;
        	return res.status(status).json(err);
		}
		return res.status(200).json({code:'SUCCESS', msg:'删除菜单成功'});
	});
}

exports.update = function(req,res) {
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
	var map = {
		id: parseInt(req.params.id)
	};
	var menu = {
		id: parseInt(req.params.id),
		name:req.body.name,
		alink:req.body.alink,
		pid:parseInt(req.body.pid),
		pids:req.body.pids,
		sort:parseInt(req.body.sort),
		status: parseInt(req.body.status)
	}
	menuService.update(menu, map, function(err){
		if(err){
			logService.log(req, '服务器出错，更新失败');
			let status = err.constructor.status;
        	return res.status(status).json(err);
		}
		return res.status(200).json({code:'SUCCESS', msg:'更新成功'});
	});
}

exports.tree = function(req,res){
    menuService.tree(function(err,rs){
		if(err){
			logService.log(req, '服务器出错，获取菜单列表失败');
			let status = err.constructor.status;
        	return res.status(status).json(err);
		}
		// 权限过滤 菜单
		let curUser = req.session.user;
		let menus = [];
		if(util.isAdmin(curUser.id)){
			menus = rs;
		} else {
			menus = _.filter(rs, (item)=>{
				return util.authCheck(curUser, item.alink);
			});
		}
		return res.status(200).json({
            code: 'SUCCESS',
            data: util.buildTree(menus,0),
            msg: ""
        });
    })
};

exports.list = function(req,res){
	var where = {};
	let searchKey = req.query.keys;
    if(searchKey){
		where._complex = {
			_logic: 'or',
			name: ['like',searchKey],
			alink: ['like',searchKey]
		}
		async.waterfall([
			function(callback){
				menuService.list(where,function(error,resList){
					callback(error,resList);
				});
	  		},
	  		function(resList,callback){
				let ids = [];
				for(let i = 0; i < resList.length; i++){
					let item = resList[i];
					ids.push(item.id);
					ids = _.union(ids,item.pids.split(',').map((pid)=>{ return parseInt(pid); }))
				}
				menuService.list({id:['in',ids]},function(error, resList){
					callback(error, resList);
				});
  
	  		}],function(err, result){
				if(err){
					logService.log(req, '服务器出错，获取菜单列表失败');
					let status = err.constructor.status;
        			return res.status(status).json(err);
				}
				let resTable = util.buildTreeTable(result);
				return res.status(200).json({
					code: 'SUCCESS',
					data: resTable
				});
	  		});
	} else {
		menuService.list(where,function(err, result){
			if(err){
				logService.log(req, '服务器出错，获取菜单列表失败');
				let status = err.constructor.status;
        		return res.status(status).json(err);
			}
			let resTable = util.buildTreeTable(result);
			return res.status(200).json({
				code: 'SUCCESS',
				data:resTable
			});
	  	});
	}
}
