var async = require('async'),
	mysql = require('../../lib/mysqldb.lib'),
	logger = require('../../lib/logger.lib'),
	depModel = require('../../models/sys/dep.model'),
	CONSTANTS = require('../../config/constants.config'),
	baseService = require('../base.service');

const { DBError } = require('../../models/errors.model');

exports.one = function (where, callback) {
	mysql.where(where).select(depModel.tbname,function(err,rows){
		if(err){
			logger.errorDB(__filename, err);
			return callback(new DBError());
		}
		if(!rows) return callback();
		return callback(null,rows[0]);
	});
}

exports.add = function(dep,callback) {
	mysql.insert(depModel.tbname , dep, function(err,resId){
		if(err){
			logger.errorDB(__filename, err);
			return callback(new DBError());
		}
		return callback(null, resId);
	});
}

exports.update = function (data, where, callback) {
	async.waterfall([
		function(callback){
			let params = {
				tbname: depModel.tbname,
				pids: data.pids == '0' ? '' : data.pids,
				id: data.id
			};
			mysql.execute(baseService.SQL_updateChildPids,params,function(err, res){
				return callback(err, res);
			});
		},
		function(result, callback){
			mysql.where(where).update(depModel.tbname, data, function(err,res){
				return callback(err,res);
			});
		}
	], function(err, result){
		if(err){
			logger.errorDB(__filename, err);
			return callback(new DBError());
		}
		return callback();
	});
}

exports.delete = function(where, callback){
	where.tbname = depModel.tbname;
	mysql.execute(baseService.SQL_deleteCascadeById, where, function(err, res){
		if(err){
			logger.errorDB(__filename, err);
			return callback(new DBError());
		}
		return callback(null);
	});
}

exports.list = function(where, callback){
	mysql.where(where)
		.order({ pids: 'asc' })
		.select(depModel.tbname, function(err,rows){
			if(err){
				logger.errorDB(__filename, err);
				return callback(new DBError());
			}
			return callback(null, rows);
		});
}

// exports.allLists = function(callback){
// 	let where = {
// 		status:CONSTANTS.DEP_STATUS.NORMAL
// 	};

// 	mysql.where(where).select(depModel.tbname,function(err,res){
// 		if(err){
// 		  logger.errorDB(__filename, err);
// 		  return callback(new DBError());
// 		}
// 		return callback(null,res);
// 	});
// }

exports.getChildById = function(depId, callback){
	let params = {
		tbname: depModel.tbname,
		id: depId
	}
	let sql = baseService.SQL_selectChildById;
	mysql.execute(sql, params, function(err, rows){
		if(err){
			logger.errorDB(__filename, err);
			return callback(new DBError());
		}
		return callback(null, rows);
	});
}

exports.getParentsById = function(depId, callback){
	async.waterfall([
		function(callback){
			exports.one({ id: depId }, function(error, dep){
				return callback(error, dep);
			});
		},
		function(dep, callback){
			let pids = dep.pids.split(',').map(id => parseInt(id));
			pids.push(dep.id);
			exports.list({ id: ['in', pids] }, function(error, deps){
				return callback(error, deps);
			})
		}
	], function(err, deps){
		if(err){
			logger.errorDB(__filename, err);
			return callback(new DBError());
		}
		return callback(null, deps);
	});
}	
