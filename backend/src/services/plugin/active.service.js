var async = require('async'),
    mysql = require('../../lib/mysqldb.lib'),
    logger = require('../../lib/logger.lib'),
    activeModel = require('../../models/plugin/active.model.js');

const { DBError } = require('../../models/errors.model');

exports.one = function(where,callback) {
    mysql.where(where)
         .select(activeModel.tbname , function(err,rows){
        if(err){
            logger.errorDB(__filename, err);
            return callback(new DBError());
        }
        if(!rows) return callback();
		return callback(null,rows[0]);
    });
}

exports.add = function(rule,callback) {
    mysql.insert(activeModel.tbname , rule, function(err,resId){
        if(err){
            logger.errorDB(__filename, err);
            return callback(new DBError());
        }
        return callback(null, resId);
    });
}

exports.delete = function(where, callback){
    mysql.where(where).remove(activeModel.tbname,function(err,res){
        if(err){
            logger.errorDB(__filename, err);
            return callback(new DBError());
        }
        return callback();
    });
}

exports.update = function (data, where, callback) {
    mysql.where(where).update(activeModel.tbname, data, function(err,res){
        if(err){
            logger.errorDB(__filename, err);
            return callback(new DBError());
        }
        return callback();
    });
}

exports.list = function(where, callback){
    mysql.where(where)
        .select(activeModel.tbname, function(err,rows){
            return callback(err,rows);
        });
}

exports.addActiveRecord = function(record, callback){
    mysql.insert('block_active_record', record, function(err, resId){
        if(err){
            logger.errorDB(__filename, err);
            return callback(new DBError());
        }
        return callback(null, resId);
    })
}