/**
 *  contract_vm 
 *  createBy zjk
 */
var _ = require('lodash'),
    async = require('async'),
    mysql = require('../../lib/mysqldb.lib'),
    logger = require('../../lib/logger.lib'),
    vmModel = require('../../models/contract/vm.model'),
    CONSTANTS = require('../../config/constants.config');

const { DBError } = require('../../models/errors.model');

exports.add = function(vm,callback) {
   mysql.insert(vmModel.tbname , vm, function(err,resId){
        if(err){
            logger.errorDB(__filename, err);
            return callback(new DBError());
        }
        return callback(null, resId);
    });    
}
exports.delete = function( where, callback){
    mysql.where(where).remove(vmModel.tbname, function(err,res){
        if(err){
            logger.errorDB(__filename,err);
            return callback(new DBError());
        }
        return callback(null);
    })
}

exports.update = function (data, where, callback) {
	mysql.where(where).update(vmModel.tbname, data, function(err,res){
		if(err){
			logger.errorDB(__filename, err);
			return callback(new DBError());
		}
		return callback(null);
	});
}
exports.isExist = function(where,callback){
    mysql.where(where).count(vmModel.tbname, function (err, res) {
        if(err){
            logger.errorDB(__filename, err);
            return callback(new DBError());
        }
        return callback(null, res > 0);
    })
}

exports.list = function (where, page, callback) {
    // 并行无关联
    async.parallel({
        total: function (callback) {
            mysql.join('inner join `contracts_type` on `contracts_type`.`id` = `contracts_vm`.`typeid`')
            .where(where).count(vmModel.tbname, function (err, res) {
                callback(err, res); // res 将被赋值 total
            });
        },
        list: function (callback) {
            mysql.join('inner join `contracts_type` on `contracts_type`.`id` = `contracts_vm`.`typeid`')
                .fields(['`contracts_vm`.*','`contracts_type`.`name` as `type`'])
                .where(where)
                .order({create_time: 'desc'})
                .limit(page.index, page.size)
                .select(vmModel.tbname, function (err, rows) {
                    callback(err, rows);
                });
        }
    }, function (err, results) {
        // 以上并行操作，任何一个出错，就会进error 并终止拉下来的操作
        // results.total,results.lists
        if (err) {
            logger.errorDB(__filename, err);
            return callback(new DBError());
        }
        let resData = {
            total: results.total || 0,
            pageIndex: page.index,
            pageSize: page.size,
            list: results.list || []
        }

        return callback(null, resData);
    });
}
