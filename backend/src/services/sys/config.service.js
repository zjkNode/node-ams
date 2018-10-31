/**
 *  conifg 表
 *  createBy zjk
 */
var async = require('async'),
    _ = require('lodash'),
    mysql = require('../../lib/mysqldb.lib'),
    logger = require('../../lib/logger.lib'),
    cache = require('../../lib/cache.lib'),
    CONSTANTS = require('../../config/constants.config'),
    configModel = require('../../models/sys/config.model.js');

const { DBError } = require('../../models/errors.model');

exports.add = function(config,callback) {
    mysql.insert(configModel.tbname , config, function(err,resId){
        if(err){
            logger.errorDB(__filename, err);
            return callback(new DBError());
        }
        cache.del('sysConfig');
        return callback(null, resId);
    });
}

exports.delete = function(where, callback){
    mysql.where(where).remove(configModel.tbname,function(err,res){
        if(err){
            logger.errorDB(__filename, err);
            return callback(new DBError());
        };
        cache.del('sysConfig');
        return callback();
    });
}

exports.update = function (data, where, callback) {
    mysql.where(where).update(configModel.tbname, data, function(err,res){
        if(err){
            logger.errorDB(__filename, err);
            return callback(new DBError());
        };
        cache.del('sysConfig');
        return callback();
    });
}

exports.one = function (where, callback) {
    mysql.where(where).select(configModel.tbname,function(err,rows){
        if(err){
            logger.errorDB(__filename, err);
            return callback(new DBError());
        }
        if(!rows[0]) return callback();
        let row = rows[0];
        row.extend = row.extend && JSON.parse(_.unescape(row.extend));      
        return callback(null, row);
    });
}

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
        results.list.forEach(item => item.extend = item.extend && JSON.parse(_.unescape(item.extend)));
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
    let sysConfig = cache.get('sysConfig');
    if(sysConfig && sysConfig[type]){
        return callback(null, _.cloneDeep(sysConfig[type]));
    }
    let where = {
        type: type,
        status: CONSTANTS.CONFIG_STATUS.VALID
    };
    mysql.where(where).select(configModel.tbname, function(err, rows){
        if(err){
            logger.errorDB(__filename, err);
            return callback(new DBError());
        }
        rows.forEach(item => item.extend = item.extend && JSON.parse(_.unescape(item.extend)));
        cache.set('sysConfig', { [type]: rows });
        return callback(null, rows);
    });
}
