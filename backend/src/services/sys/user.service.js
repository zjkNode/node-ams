var async = require('async'),
	_ = require('lodash'),
	mysql = require('../../lib/mysqldb.lib'),
	logger = require('../../lib/logger.lib'),
	userModel = require('../../models/sys/user.model'),
	depService = require('./dep.service'),
	roleService = require('./role.service');

const { DBError } = require('../../models/errors.model');

/**
 * 根据email查询用户
 */
exports.one = function (params, callback) {
	mysql.where(params).select(userModel.tbname,function(err,rows){
		if(err){
			logger.errorDB(__filename, err);
			return callback(new DBError());
		}
		if(!rows) return callback();
		return callback(null,rows[0]);
	});
}

exports.add = function(user,callback) {
	mysql.insert(userModel.tbname , user, function(err,resId){
		if(err){
			logger.errorDB(__filename, err);
			return callback(new DBError());
		}
		return callback(null, resId);
	});
}

exports.update = function (data, where, callback) {
	mysql.where(where).update(userModel.tbname, data, function(err,res){
		if(err){
			logger.errorDB(__filename, err);
			return callback(new DBError());
		}
		return callback(null);
	});
}

exports.delete = function(where, callback){
	mysql.where(where).remove(userModel.tbname,function(err,res){
		if(err){
			logger.errorDB(__filename, err);
			return callback(new DBError());
		}
		return callback(null);
	});
}

exports.list = function(where, page, callback){
	async.auto({
		total:function(callback){
			mysql.where(where).count(userModel.tbname,function(err,res){
				return callback(err,res); // res 将被赋值 total
			});
		},
		list: function(callback){
			mysql.where(where)
				 .order({id:'desc'})
				 .limit(page.index, page.size)
				 .select(userModel.tbname, function(err,rows){
					return callback(err,rows);
				});
		},
		// depList: ['list', function(results, callback){
		// 	let depIds = _.union(_.map(results.list, 'depid'));
		// 	depService.list({ id:['in', depIds] }, function(error, deps){
		// 		return callback(error, deps);
		// 	});
		// }],
		// roleList: ['list', function(results, callback){
		// 	let roleIds = _.union(_.map(results.list, 'roleid'));
		// 	roleService.getRoleList({ id: ['in', roleIds] }, function(error, roles){
		// 		return callback(error, roles);
		// 	});
		// }]
	},function(error,results){ 
		// 以上并行操作，任何一个出错，就会进error 并终止拉下来的操作
		// results.total,results.list
		if(error){
			logger.errorDB(__filename, error);
			return callback(new DBError());
		}
		// _.forEach(results.list, function(user){
		// 	user.dep = results.depList.filter((dep)=>{
 	// 			return dep.id == user.depid;
 	// 		})[0];
		// 	user.dep = user.dep || { name: '部门不存在' };

 	// 		user.role = results.roleList.filter((role)=>{
 	// 			return role.id == user.roleid;
 	// 		})[0];
		// 	user.role = user.role || { name: '角色不存在' };
		// });

		let resData = {
			total:results.total || 0,
			pageIndex:page.index,
			pageSize: page.size,
			list: results.list || []
		}

		return callback(null,resData);
	});
}


exports.getUsersByDepId = function(depId, callback){
	let where = {
		depid: depId
	};
	mysql.where(where)
		 .select(userModel.tbname,function(err, rows){
		 	if(err){
		 		logger.errorDB(__filename, err);
		 		return callback(new DBError());
		 	}

		 	return callback(null, rows);
		 });
}