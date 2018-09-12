var async = require('async'),
	_ = require('lodash'),
	utils = require('../../lib/utils'),
	logger = require('../../lib/logger.lib'),
	ruleModel = require('../../models/sys/rule.model'),
	menuService = require('../../services/sys/menu.service'),
	ruleService = require('../../services/sys/rule.service'),
	logService = require('../../services/sys/log.service');

const { ComError, ValidationError, DBError} = require('../../models/errors.model');

exports.add = function(req, res){

}

exports.delete = function(req, res){

}

exports.list = function(req, res){
	var where = {};
	let searchKey = req.query.keys;
	if(searchKey) {
		where._complex = {
			_logic: 'or',
			name: ['like', searchKey],
			path: ['like', searchKey]
		};
	}

	let curUser = req.session.user;
	if(utils.isAdmin(curUser.id)){
		async.auto({
			rules: function(callback){
				ruleService.list(function(err, rules){
					return callback(err, rules);
				});
			},
			menus: function(callback){
				menuService.tree(function(err, menus){
					return callback(err, menus);
				});
			}
		}, function(error, results){
			if(error){
				logService.log(req, '服务器出错，获取系统功能失败');
		        return res.status(error.constructor.status).json(error);
			}

			let resList = [];
			// 过滤叶子菜单，并修改菜单名称为 pmenu / pmenu / menu
			for (let i = 0; i < results.menus.length; i++) {
				let menu = results.menus[i];
				if(!menu.pids.endsWith(`,${menu.pid}`)){
					continue;
				}
				let tmpIds = menu.pids.split(',').map(id => parseInt(id));
				let tmpMenus = results.menus.filter(item => tmpIds.includes(item.id));
				tmpMenus.push(menu);
				let tmpRules = results.rules.filter(item => item.menu_id === menu.id) || [];
				resList.push({
					menu_id: menu.id,
					menu_name: _.map(tmpMenus, 'name').join(' / '),
					actions: _.map(tmpRules, 'action')
				});
			}

			return res.status(200).json({ code: 'SUCCESS', data: resList });
		});
		return;
	} 
	return res.status(200).json({ code: 'SUCCESS', data: [] });
}