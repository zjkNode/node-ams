/**
 *  conifg 表
 *  createBy susan
 */
var async = require('async'),
    _ = require('lodash'),
    mysql = require('../../lib/mysqldb.lib'),
    logger = require('../../lib/logger.lib'),
    cache = require('../../lib/cache.lib'),
    CONSTANTS = require('../../config/constants.config'),
    configModel = require('../../models/sys/config.model.js');

const { DBError } = require('../../models/errors.model');

exports.add = function(configs,callback) {
    mysql.insert(configModel.tbname , configs, function(err,resId){
        if(err){
            logger.errorDB(__filename, err);
            return callback(new DBError());
        }
        cache.del('cacheConfigs');
        return callback(null, resId);
    });
};

exports.delete = function(where, callback){
    mysql.where(where).remove(configModel.tbname,function(err,res){
        if(err){
            logger.errorDB(__filename, err);
            return callback(new DBError());
        };
        cache.del('cacheConfigs');
        return callback();
    });
};

exports.update = function (data, where, callback) {
    mysql.where(where).update(configModel.tbname, data, function(err,res){
        if(err){
            logger.errorDB(__filename, err);
            return callback(new DBError());
        };
        cache.del('cacheConfigs');
        return callback();
    });
};

exports.list = function(where, page, callback){
    // 并行无关联
    async.parallel({
        total:function(callback){
            mysql.where(where).count(configModel.tbname,function(err,res){
               return callback(err,res); // res 将被赋值 total
            });
        },
        list:function(callback){
            mysql.where(where)
            .order({id:'desc'})
            .limit(page.index, page.size)
            .select(configModel.tbname, function(err,rows){
               return callback(err,rows);
            });
        }
    },function(error,results){
        // 以上并行操作，任何一个出错，就会进error 并终止拉下来的操作
        // results.total,results.list
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

exports.listByType = function(type, callback){
    let where = {
        type: type,
        status: CONSTANTS.CONFIG_STATUS.VALID
    };
    mysql.where(where).select(configModel.tbname, function(err, rows){
        if(err){
            logger.errorDB(__filename, err);
            return callback(new DBError());
        }
        return callback(null, rows);
    });
}
