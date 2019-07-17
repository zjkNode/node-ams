var async = require('async'),
    mysql = require('../../lib/mysqldb.lib'),
    logger = require('../../lib/logger.lib'),
    blockModel = require('../../models/plugin/block.model.js');

const { DBError } = require('../../models/errors.model');

exports.one = function(where,callback) {
    mysql.where(where)
         .select(blockModel.tbname , function(err,rows){
        if(err){
            logger.errorDB(__filename, err);
            return callback(new DBError());
        }
        if(!rows) return callback();
		return callback(null,rows[0]);
    });
}

exports.add = function(rule,callback) {
    mysql.insert(blockModel.tbname , rule, function(err,resId){
        if(err){
            logger.errorDB(__filename, err);
            return callback(new DBError());
        }
        return callback(null, resId);
    });
}

exports.delete = function(where, callback){
    mysql.where(where).remove(blockModel.tbname,function(err,res){
        if(err){
            logger.errorDB(__filename, err);
            return callback(new DBError());
        }
        return callback();
    });
}

exports.update = function (data, where, callback) {
    mysql.where(where).update(blockModel.tbname, data, function(err,res){
        if(err){
            logger.errorDB(__filename, err);
            return callback(new DBError());
        }
        return callback();
    });
}

exports.rules = function(where, callback){
    mysql.where(where)
        .select(blockModel.tbname, function(err,rows){
            return callback(err,rows);
        });
}