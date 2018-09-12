var async = require('async'),
  _ = require('lodash'),
  mysql = require('../../lib/mysqldb.lib'),
  logger = require('../../lib/logger.lib'),
  CONSTANTS = require('../../config/constants.config'),
  ruleModel = require('../../models/sys/rule.model'),
  cache = require('../../lib/cache.lib'),
  baseService = require('../base.service'),
  roleService = require('./role.service');

const { DBError } = require('../../models/errors.model');

exports.one = function(where,callback){
  mysql.where(where).select(ruleModel.tbname,function(err,rows){
    if(err){
      logger.errorDB(__filename, err);
      return callback(new DBError());
    }
    if(!rows){
      logger.info('rule is not exist ', where);
      return callback();
    }
    return callback(null,rows);
  });
}
/**
 * 插入数据
 */
exports.add = function(rule,callback) {
  mysql.insert(ruleModel.tbname , rule, function(err,resId) {
    if (err) {
      logger.errorDB(__filename, err);
      return callback(new DBError());
    }
      return callback();
  })
};

/**
 * 更新数据
 */
exports.update = function (data, where, callback) {
  async.waterfall([
    function(callback){
      let params = {
        tbname: ruleModel.tbname,
        pids: data.pids == '0' ? '' : data.pids,
        id: data.id
      };
      mysql.execute(baseService.SQL_updateChildPids,params,function(err, res){
       return callback(err, res);
      });
    },
    function(result, callback){
      mysql.where(where).update(ruleModel.tbname, data, function(err,res){
        return callback(err);
      });
    }
  ], function(err, result){
    if(err){
      logger.errorDB(__filename, err);
      return callback(new DBError());
    }
    return callback();
  });
};
/**
 * 删除数据
 */
exports.delete = function(where, callback){
  let params = {
    tbname: ruleModel.tbname,
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
};
/**
 * 查询数据
 */
exports.list = function(callback){
  mysql.select(ruleModel.tbname, function(err, res){
    if(err){
      logger.errorDB(__filename, err);
      return callback(new DBError());
    }
    return callback(null,res);
  });
}
exports.allLists = function(callback){
  let where ={
    status:CONSTANTS.RULE_STATUS.VALID
  };
  mysql.where(where).select(ruleModel.tbname,function(err,res){
    if(err){
      logger.errorDB(__filename, err);
      return callback(new DBError());
    }
    return callback(null,res);
  })
};

exports.lists = function(where,callback){
  async.auto({
    types: exports.allLists,
    lists:['types',function(result,callback){
      mysql.where(where)
        .select(ruleModel.tbname, function(err,rows){
          if(rows && rows.length){
            rows.map((row)=>{
              var pid = row.pid;
              var nType = result.types.filter((item)=>{
                return item.id === pid;
              })[0];
              row.typeName = nType || { name: '顶级'};
            });
          }
         return callback(err,rows);
        });
    }]
  },function(error,results){
    // 以上并行操作，任何一个出错，就会进error 并终止拉下来的操作
    // results.total,results.lists
    if(error){
      logger.errorDB(__filename, error);
      return callback(new DBError());
    }
    let resData = results.lists || [];
    return callback(null,resData);
  });
};


// 根据用户角色获取取用户分配的权限
exports.getRulesByRole = function(role, callback){
  if(!role || !role.authorties){
    return callback(null, []);
  }

  let ruleIds = role.authorties.split(',').map((id)=>{ return parseInt(id); });
  mysql.where({ id: [ 'in', ruleIds ] })
       .select(ruleModel.tbname, function(error,rows){
        if(error){
          logger.errorDB(__filename, error);
          return callback(new DBError())
        }
        return callback(null, rows);
       });
}
