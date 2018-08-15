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

exports.lists = function(where, page, callback){
	async.auto({
		total:function(callback){
			mysql.where(where).count(userModel.tbname,function(err,res){
				callback(err,res); // res 将被赋值 total
			});
		},
		lists: function(callback){
			mysql.where(where)
				 .order({id:'desc'})
				 .limit(page.index, page.size)
				 .select(userModel.tbname, function(err,rows){
					callback(err,rows);
				});
		},
		depList: ['lists', function(results, callback){
			let depIds = _.union(_.map(results.lists, 'depid'));
			depService.lists({ id:['in', depIds] }, function(error, deps){
				return callback(error, deps);
			});
		}],
		roleList: ['lists', function(results, callback){
			let roleIds = _.union(_.map(results.lists, 'roleid'));
			roleService.getRoleLists({ id: ['in', roleIds] }, function(error, roles){
				return callback(error, roles);
			});
		}]
	},function(error,results){ 
		// 以上并行操作，任何一个出错，就会进error 并终止拉下来的操作
		// results.total,results.lists
		if(error){
			logger.errorDB(__filename, error);
			return callback(new DBError());
		}
		_.forEach(results.lists, function(user){
			user.dep = results.depList.filter((dep)=>{
 				return dep.id == user.depid;
 			})[0];
			user.dep = user.dep || { name: '部门不存在' };

 			user.role = results.roleList.filter((role)=>{
 				return role.id == user.roleid;
 			})[0];
			user.role = user.role || { name: '角色不存在' };
		});

		let resData = {
			total:results.total || 0,
			pageIndex:page.index,
			pageSize: page.size,
			lists: results.lists || []
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