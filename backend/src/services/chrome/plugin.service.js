var async = require('async'),
    mysql = require('../../lib/mysqldb.lib'),
    logger = require('../../lib/logger.lib'),
    pluginModel = require('../../models/chrome/plugin.model.js');

const { DBError } = require('../../models/errors.model');

exports.add = function(config,callback) {
    mysql.insert(pluginModel.tbname , config, function(err,resId){
        if(err){
            logger.errorDB(__filename, err);
            return callback(new DBError());
        }
        return callback(null, resId);
    });
}

exports.delete = function(where, callback){
    mysql.where(where).remove(pluginModel.tbname,function(err,res){
        if(err){
            logger.errorDB(__filename, err);
            return callback(new DBError());
        }
        return callback();
    });
}

exports.update = function (data, where, callback) {
    mysql.where(where).update(pluginModel.tbname, data, function(err,res){
        if(err){
            logger.errorDB(__filename, err);
            return callback(new DBError());
        }
        return callback();
    });
}

exports.list = function(where, callback){
    mysql.where(where)
        .select(pluginModel.tbname, function(err,rows){
            return callback(err,rows);
        });
}