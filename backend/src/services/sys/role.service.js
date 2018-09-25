var async = require('async'),
  _ = require('lodash'),
  mysql = require('../../lib/mysqldb.lib'),
  logger = require('../../lib/logger.lib'),
  roleModel = require('../../models/sys/role.model'),
  depService=require('../../services/sys/dep.service');

const { DBError } = require('../../models/errors.model');

exports.one = function(where,callback){
  mysql.where(where).select(roleModel.tbname,function(err,rows){
    if(err){
      logger.errorDB(__filename,err);
      return callback(new DBError());
    }
    if(!rows){
      logger.info('role is not exist', where);
      return callback();
    }
    return callback(null,rows[0]);
  });
};
/**
 * 插入数据
 */
exports.add = function(role, callback) {
  mysql.insert(roleModel.tbname , role, function(err,resid){
    if(err){
      logger.errorDB(__filename, err);
      return callback(new DBError());
    }
    return callback(null, resid);
  });
};

/**
 * 更新数据
 */
exports.update = function (data, where, callback) {
  mysql.where(where).update(roleModel.tbname, data, function(err,res){
    if(err){
      logger.errorDB(__filename, err);
      return callback(new DBError());
    }
    return callback();
  });
}
/**
 * 删除数据
 */
exports.delete = function(where, callback){
  mysql.where(where).remove(roleModel.tbname,function(err,res){
    if(err){
      logger.errorDB(__filename, err);
      return callback(new DBError());
    }
    return callback();
  });
};

/**
 * 总数据
 */
 exports.list = function(where, callback){
  mysql.where(where)
        .order({id:'desc'})
        .select(roleModel.tbname, function(err,rows){
          if(err){
            logger.errorDB(__filename, err);
            return callback(new DBError());
          }
          rows.forEach(row => {
            row.actions = row.actions ? JSON.parse(_.unescape(row.actions)) : {};
            row.mids = row.mids ? row.mids.split(',').map(id => parseInt(id)) : [];
            row.datas = row.datas ? row.datas.split(',') : [];
          });
          return callback(null, rows);
        });
}

exports.getRoleList = function(where,callback){
  mysql.where(where)
       .select(roleModel.tbname, function(err, rows){
        if(err){
          logger.errorDB(__filename, err);
          return callback(new DBError());
        }
        return callback(null, rows);
       });
}