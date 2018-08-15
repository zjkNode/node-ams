var async = require('async'),
  _ = require('lodash'),
  mysql = require('../../lib/mysqldb.lib'),
  logger = require('../../lib/logger.lib'),
  cache = require('../../lib/cache.lib'),
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
exports.add = function(roles,callback) {
  mysql.insert(roleModel.tbname , roles, function(err,resid){
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
 exports.lists = function(where, page, callback){
  async.auto({
    total: function(callback){
      mysql.where(where).count(roleModel.tbname,function(err,res){
        return callback(err,res); // res 将被赋值 total
      });
    },
    lists: function(callback){
      mysql.where(where)
        .order({id:'desc'})
        .limit(page.index, page.size)
        .select(roleModel.tbname, function(err,rows){
          return callback(err, rows);
        });
    }
  },function(error,results){
    if(error){
      logger.errorDB(__filename, error);
      return callback(new DBError());
    }
    let resData = {
      total:results.total || 0,
      pageIndex:page.index,
      pageSize: page.size,
      lists: results.lists || []
    }
    return callback(null,resData);
  });
}

exports.getRoleLists = function(where,callback){
  mysql.where(where)
       .select(roleModel.tbname, function(err, rows){
        if(err){
          logger.errorDB(__filename, err);
          return callback(new DBError());
        }
        return callback(null, rows);
       });
}