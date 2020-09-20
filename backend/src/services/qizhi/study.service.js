/**
 *  qizhi 学员学习记录表
 *  createBy zjk
 */
var async = require('async'),
	_ = require('lodash'),
	mysql = require('../../lib/mysqldb.lib'),
	logger = require('../../lib/logger.lib'),
	studyModel = require('../../models/qizhi/study.model');

const { DBError } = require('../../models/errors.model');

exports.one = function(where,callback){
	mysql.where(where).select(studyModel.tbname,function(err,rows){
			if(err){
					logger.errorDB(__filename,err);
					return callback(new DBError());
			}
			if(!rows || rows.length == 0) return callback();
			return callback(null,rows[0]);
	});
}

exports.add = function(user,callback) {
	mysql.insert(studyModel.tbname , user, function(err,resId){
		if(err){
			logger.errorDB(__filename, err);
			return callback(new DBError());
		}
		return callback(null, resId);
	});
}

exports.list = function(where, page, callback){
	async.auto({
		total:function(callback){
			mysql.where(where).count(studyModel.tbname,function(err,res){
				return callback(err,res); // res 将被赋值 total
			});
		},
		list: function(callback){
			mysql.where(where)
				 .order({id:'desc'})
				 .limit(page.index, page.size)
				 .select(studyModel.tbname, function(err,rows){
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