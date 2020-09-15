/**
 *  product_type
 *  createBy zjk
 */
var async = require('async'),
    _ = require('lodash'),
    mysql = require('../../lib/mysqldb.lib'),
    logger = require('../../lib/logger.lib'),
    proTypeModel = require('../../models/product/type.model'),
    baseService = require('../base.service');
    
const { DBError } = require('../../models/errors.model');

exports.add = function(where, callback){
    mysql.insert(proTypeModel.tbname , where, function(err,rs){
        if(err){
            logger.errorDB(__filename, err);
            return callback(new DBError());
        }
        return callback(null, rs);
    });
};

exports.delete = function(where, callback){
    let params = {
        tbname: proTypeModel.tbname,
        id: where.id
    };
    let sql = baseService.SQL_deleteCascadeById;
    mysql.execute(sql,params,function(err, rows){
        if(err){
            logger.errorDB(__filename, err);
            return callback(new DBError());
        }
        return callback(null, rows);
    });


    // mysql.where(where).remove(proTypeModel.tbname,function(err,res){
    //     if(err){
    //         logger.errorDB(__filename, err);
    //         return callback(new DBError());
    //     };
    //     return callback(null);
    // });
};

exports.update = function (data, where, callback) {
    async.waterfall([
		function(callback){
			let params = {
				tbname: proTypeModel.tbname,
				pids: data.pids == '0' ? '' : data.pids,
				id: data.id
			};
			mysql.execute(baseService.SQL_updateChildPids,params,function(err, res){
				return callback(err, res);
			});
		},
		function(result, callback){
            mysql.where(where).update(proTypeModel.tbname, data, function(err,res){
                return callback(err,res);
            });
		}
	], function(err, result){
		if(err){
			logger.errorDB(__filename, err);
			return callback(new DBError());
		}
		return callback(null);
	});
    
};

exports.list = function(where,callback){
    mysql.where(where)
         .order({id:'asc'})
         .select(proTypeModel.tbname, function(err,rows){
            if(err){
                logger.errorDB(__filename, err);
                return callback(new DBError());
            };
            return callback(err,rows);
         });
}

// 查询一条数据
exports.one = function(where,callback){
    mysql.where(where).select(proTypeModel.tbname,function(err,rows){
        if(err){
            logger.errorDB(__filename,err);
            return callback(new DBError());
        }
        return callback(null, rows[0]);
    });
}
