/**
 *  contract
 *  createBy zjk
 */
var async = require('async'),
    _ = require('lodash'),
    mysql = require('../../lib/mysqldb.lib'),
    logger = require('../../lib/logger.lib'),
    contractModel = require('../../models/contract/contract.model'),
    cTypeService = require('./type.service'),
    CONSTANTS = require('../../config/constants.config');

const { DBError } = require('../../models/errors.model');

exports.add = function(where,callback) {
    mysql.insert(contractModel.tbname , where, function(err,resId){
        if(err){
            logger.errorDB(__filename, err);
            return callback(new DBError());
        }
        return callback(null, resId);
    });
}

exports.delete = function(where, callback){
	mysql.where(where).remove(contractModel.tbname,function(err,res){
		if(err){
			logger.errorDB(__filename, err);
			return callback(new DBError());
		}
		return callback(null);
	});
}

exports.update = function (data, where, callback) {
	mysql.where(where).update(contractModel.tbname, data, function(err,res){
		if(err){
			logger.errorDB(__filename, err);
			return callback(new DBError());
		}
		return callback(null);
	});
}

exports.list = function(where, page, callback){
    async.parallel({
        total:function(callback){
            mysql.where(where).count(contractModel.tbname, function(err,res) {
                return callback(err, res); // res 将被赋值 total
            });
        },
        list:function(callback){
            mysql.where(where)
                .order({ id:'desc', publish_time:'desc' })
                .limit(page.index, page.size)
                .select(contractModel.tbname, function(err, rows) {
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
        return callback(null, resData);
    });
}

exports.publish = function(contractsId,callback){
	let where = {
		id: parseInt(contractsId)
	};
	let data = {};
	contractModel.pub(data);
	exports.update(data,where,callback);
}



// 查询一条数据
exports.one = function(where,callback){
    mysql.where(where).select(contractModel.tbname,function(err,rows){
        if(err){
            logger.errorDB(__filename,err);
            return callback(new DBError());
        }
        let row = rows[0];
        row.content = _.unescape(row.content);
        row.typeids = row.typeids.split(',').map(id => parseInt(id));
        return callback(null,row);
    });
}
