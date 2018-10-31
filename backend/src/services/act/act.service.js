/**
 *  act service
 *  createby zjk
 */
var actModel = require('../../models/act/act.model'),
    _ = require('lodash'),
    mysql = require('../../lib/mysqldb.lib'),
    logger = require('../../lib/logger.lib'),
    async = require('async');

const { DBError } = require('../../models/errors.model');

exports.one = function(where,callback){
    mysql.where(where).select(actModel.tbname,function(err,rows){
        if(err){
            logger.errorDB(__filename,err);
            return callback(new DBError());
        }
        if(!rows || rows.length == 0) return callback();
        var row = rows[0];
        // row.data = JSON.parse(_.unescape(row.data));
        row.data = _.unescape(row.data); // data 为字符串，容易修改里面的数据
        row.extend = JSON.parse(_.unescape(row.extend));
        return callback(null,row);
    });
}

exports.add = function(where, callback) {
    mysql.insert(actModel.tbname, where, function(error, resId) {
        if(error) {
            logger.errorDB(__filename,error);
            return callback(new DBError());
        }
        return callback(null, resId)
    })
}

exports.delete = function(where, callback) {
    mysql.where(where).remove(actModel.tbname,function(err,res) {
        if(err){
            logger.errorDB(__filename, err);
            return callback(new DBError());
        }
        return callback(null);
    });
}

exports.update = function(data, where, callback) {
    mysql.where(where).update(actModel.tbname, data, function(err,res) {
        if(err){
            logger.errorDB(__filename, err);
            return callback(new DBError());
        }
        return callback(null);
    });
}

exports.list = function(where, page, callback) {
    async.parallel({
        total:function(callback){
            mysql.where(where).count(actModel.tbname, function(err,res) {
                return callback(err, res); // res 将被赋值 total
            });
        },
        list:function(callback){
            mysql.where(where)
                .order({ id:'desc' })
                .limit(page.index, page.size)
                .select(actModel.tbname, function(err, rows) {
                   return callback(err, rows);
                });
        }
    },function(error,results) {
        // 以上并行操作，任何一个出错，就会进error 并终止拉下来的操作
        // results.total,results.list
        if(error) {
            logger.errorDB(__filename, error);
            return callback(new DBError());
        }
        let resData = {
            total: results.total || 0,
            pageIndex: page.index,
            pageSize: page.size,
            list: results.list || []
        };
        resData.list.forEach(item => {
            item.extend = JSON.parse(_.unescape(item.extend));
        });
        return callback(null, resData);
    });
}

exports.count = function(where, callback){
    mysql.where(where).count(actModel.tbname, function(error, cnt){
        if(error) {
            logger.errorDB(__filename, error);
            return callback(new DBError());
        }
        return callback(null, cnt);
     });
}