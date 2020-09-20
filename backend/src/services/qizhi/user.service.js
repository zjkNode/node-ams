/**
 *  user 表
 *  createBy zjk
 */
var async = require('async'),
	_ = require('lodash'),
	mysql = require('../../lib/mysqldb.lib'),
	logger = require('../../lib/logger.lib'),
	userModel = require('../../models/qizhi/user.model');

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
	},function(error,results){ 
		// 以上并行操作，任何一个出错，就会进error 并终止拉下来的操作
		if(error){
			logger.errorDB(__filename, error);
			return callback(new DBError());
		}
		let resData = {
			total:results.total || 0,
			pageIndex:page.index,
			pageSize: page.size,
			list: results.list || []
		}
		return callback(null,resData);
	});
}