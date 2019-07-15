/**
 *  yz_banner 表
 *  createBy zjk
 */
var async = require('async'),
    mysql = require('../../lib/mysqldb.lib'),
    logger = require('../../lib/logger.lib'),
    model = require('../../models/youzhu/banner.model.js');

const { DBError } = require('../../models/errors.model');

exports.add = function(data, callback) {
    mysql.insert(model.tbname , data, function(err,resId){
        if(err){
            logger.errorDB(__filename, err);
            return callback(new DBError());
        }
        return callback(null, resId);
    });
}

exports.delete = function(where, callback){
    mysql.where(where).remove(model.tbname,function(err,res){
        if(err){
            logger.errorDB(__filename, err);
            return callback(new DBError());
        };
        return callback();
    });
}

exports.update = function (data, where, callback) {
    mysql.where(where).update(model.tbname, data, function(err,res){
        if(err){
            logger.errorDB(__filename, err);
            return callback(new DBError());
        };
        return callback();
    });
}

exports.one = function (where, callback) {
    mysql.where(where).select(model.tbname,function(err,rows){
        if(err){
            logger.errorDB(__filename, err);
            return callback(new DBError());
        }
        if(!rows[0]) return callback();
        return callback(null, rows[0]);
    });
}

exports.list = function(where, page, callback){
    // 并行无关联
    async.parallel({
        total:function(callback){
            mysql.where(where).count(model.tbname,function(err,res){
               return callback(err,res); // res 将被赋值 total
            });
        },
        list:function(callback){
            mysql.where(where)
            .order({id:'desc'})
            .limit(page.index, page.size)
            .select(model.tbname, function(err,rows){
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