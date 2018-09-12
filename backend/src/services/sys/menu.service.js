var _ = require('lodash'),
    async = require('async'),
	mysql = require('../../lib/mysqldb.lib'),
    logger = require('../../lib/logger.lib'),
    menuModel = require('../../models/sys/menu.model'),
    CONSTANTS = require('../../config/constants.config'),
    cache = require('../../lib/cache.lib'),
	baseService = require('../base.service');

const { DBError } = require('../../models/errors.model');

exports.add = function(newMenu,callback) {
	mysql.insert(menuModel.tbname, newMenu, function(err,resId){
		if(err){
			logger.errorDB(__filename, err);
			return callback(new DBError());
		}
        cache.del('menuTree');
		return callback(null, resId);
	});
}

exports.delete = function(where, callback){
	mysql.where(where).remove(menuModel.tbname,function(err,res){
		if(err){
			logger.errorDB(__filename, err);
			return callback(new DBError());
		}
        cache.del('menuTree');
		return callback(null);
	});
}

exports.update = function (data, where, callback) {
    async.waterfall([
		function(callback){
			let params = {
				tbname: menuModel.tbname,
				pids: data.pids == '0' ? '' : data.pids,
				id: data.id
			};
			mysql.execute(baseService.SQL_updateChildPids,params,function(err, res){
				return callback(err, res);
			});
		},
		function(result, callback){
			mysql.where(where).update(menuModel.tbname, data, function(err,res){
                return callback(err);
            });
		}
	], function(err, result){
		if(err){
			logger.errorDB(__filename, err);
			return callback(new DBError());
		}
        cache.del('menuTree');
		return callback();
    });
};

exports.tree = function(callback){
    let menuTree = cache.get('menuTree');
    if(menuTree){
        return callback(null, _.cloneDeep(menuTree));
    };
    var where= {
		status: CONSTANTS.MENUS_STATUS.VALID
	};
    mysql.where(where).order({sort:'asc'}).select(menuModel.tbname, function(err,res){
        if(err){
			logger.errorDB(__filename, err);
			return callback(new DBError());
		}
        cache.set('menuTree', res);
        return callback(null,res);
    });
};

exports.list = function(where,callback){
    mysql.where(where).order({sort:'asc'}).select(menuModel.tbname, function(err,rs){
        if(err){
			logger.errorDB(__filename, err);
			return callback(new DBError());
		}
        return callback(null,rs);
    });
};