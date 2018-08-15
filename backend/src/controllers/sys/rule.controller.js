/**
 *  rule controller
 *  createby clmama
 */
var async = require('async'),
  _ = require('lodash'),
  utils = require('../../lib/utils'),
  logger = require('../../lib/logger.lib'),
  ruleModel = require('../../models/sys/rule.model'),
  ruleService = require('../../services/sys/rule.service'),
  logService = require('../../services/sys/logs.service');
const { ComError, ValidationError, DBError} = require('../../models/errors.model');

exports.add = function(req,res){
  req.checkBody(ruleModel.validation);
  let vErrors = req.validationErrors();
  if(vErrors) {
      logger.error(__filename, '参数验证失败', vErrors);
      return res.status(ValidationError.status).json(vErrors);
  }
  var datas = req.body;
  ruleModel.auto(datas);

  async.parallel({       
    existChildPath:function(callback){
      ruleService.one({path:datas.path},function(err,row){
        var _row=row && row.length>0;
        return callback(err,_row);
      })
    }
  },function(err,results){
    if(err){
      logService.log(req, '服务器出错，检查类型出现错误，删除类型失败');
      let status = err.constructor.status;
      return res.status(status).json(err);
    }
    let linkErrs = [];
    if(results.existChildPath){
      linkErrs.push({code:'EXIST_CHILD_PATH', msg:'系统功能路径不能重复'});
    }
    if(linkErrs.length > 0){
      return res.status(200).json({ code: 'EXIST_REFERENCE', data: linkErrs, msg: '该系统功能路径不能重复，无法添加'});
    }
    ruleService.add(datas,function(err,result){
      if(err){
        logService.log(req, '服务器出错，新增系统功能失败');
        let status = err.constructor.status;
        return res.status(status).json(err);
      }
      return res.status(200).json({ code: 'SUCCESS', msg:'新增系统功能成功'});
    })
  });
};

exports.update = function(req,res){
  req.checkBody(ruleModel.validation);
  req.checkBody({
    'status': {
      isNotEmpty: { errorMessage: '是否可见不可为空' }
    }
  });
  let vErrors = req.validationErrors();
  if(vErrors) {
      logger.error(__filename, '参数验证失败', vErrors);
      return res.status(ValidationError.status).json(vErrors);
  }
  var params = req.body;
  var data = {
    id:parseInt(req.params.id),
    name:params.name,
    path:params.path,
    pids:params.pids,
    pid:params.pid,
    status:params.status
  };
  ruleModel.auto(data);
  var wheres = {
    id:parseInt(req.params.id)
  };
  async.parallel({
    existChildPath:function(callback){
      ruleService.one({path:data.path},function(err,row){
        var _row=row && row.length>0 && row[0].id !=data.id;
        return callback(err,_row);
      })
    }
  },function(err,results){
    if(err){
      logService.log(req, '服务器出错，更新权限失败');
      let status = err.constructor.status;
        return res.status(status).json(err);
    }
    let linkErrs = [];
    if(results.existChildPath){
      linkErrs.push({code:'EXIST_CHILD_PATH', msg:'系统功能路径不能重复'});
    }
    if(linkErrs.length > 0){
      return res.status(200).json({ code: 'EXIST_REFERENCE', data: linkErrs, msg: '该系统功能路径不能重复，无法更新'});
    }
    ruleService.update(data,wheres,function(err,result){
      if(err){
        logService.log(req, '服务器出错，更新系统功能失败');
        let status = err.constructor.status;
        return res.status(status).json(err);
      }
      return res.status(200).json({code:'SUCCESS', msg:'更新系统功能成功'});
    })
  });
};

exports.delete = function(req,res){
  req.checkParams({
    'id': {
      isNotEmpty: { errorMessage: '系统功能id 不能为空'}
    }
  });
  let vErrors = req.validationErrors();
  if(vErrors) {
      logger.error(__filename, '参数验证失败', vErrors);
      return res.status(ValidationError.status).json(vErrors);
  }
  var where = {
    id: parseInt(req.params.id),

  };
  ruleService.delete(where, function(err,result){
    if(err){
      logService.log(req, '服务器出错，删除系统功能失败');
      let status = err.constructor.status;
      return res.status(status).json(err);
    }
    return res.status(200).json({
      code:'SUCCESS',
      msg:'删除成功'});
  });
};

exports.lists = function(req,res) {
  var where = {
  };
  let searchKey = req.query.keys;
  let curUser = req.session.user;
  if(searchKey) {
    where._complex = {
      _logic: 'or',
      name: ['like', searchKey],
      path: ['like', searchKey]
    };
  }
  if(utils.isAdmin(curUser.id)){
    async.waterfall([
      function(callback){
        ruleService.lists(where,function(err,result){
          callback(err,result)
        })
      },
      function(result,callback){
        let ids=[];
        for(var i=0;i<result.length;i++){
          let item=result[i];
          ids.push(item.id);
          ids=_.union(ids,item.pids.split(',').map((pid)=>{
            return parseInt(pid)
          }))
        }
        ruleService.lists({id:['in',ids]},function(error,resList){
          callback(error, resList);
        });
      }
    ],function(err,resLists){
      if(err){
        logService.log(req, '服务器出错，获取系统功能失败');
        let status = err.constructor.status;
        return res.status(status).json(err);
      }
      let resList = utils.buildTreeTable(resLists);
      return res.status(200).json({
        code: 'SUCCESS',
        data:resList
      });
    })
  }else{
    async.auto({
      getRuleList:function(callback){
        ruleService.lists(where,function(error,ruleList){
          callback(error,ruleList)
        })
      },
      getUserRules:function(callback){
        ruleService.getRulesByRole(curUser.role, function(error,rulesLists){
          callback(error,rulesLists);
        });
      },
      getRules:['getRuleList','getUserRules',function(results,callback){
        if(searchKey){
          let ids=[],_ids=[];
          _.forEach(results.getRuleList, (rule) => {
            ids.push(rule.id);
            ids = _.union(ids,rule.pids.split(',').map((pid)=>{ return parseInt(pid); }))
          });
          _.forEach(results.getUserRules, (rule) => {
            _ids.push(rule.id);
            _ids = _.union(_ids,rule.pids.split(',').map((pid)=>{ return parseInt(pid); }))
          });
          var searchIds=ids.filter((id)=>{
            return _ids.indexOf(id) > -1
          });
          searchIds.length>0 ?  ruleService.lists({id:['in',searchIds]},function(error,resList){
            callback(error, resList);
          }) : callback(null);
        }else{
          callback(null,results.getUserRules);
        }
      }]
    },function(err,results){
      let result = results.getRules;
      if(err){
        logService.log(req, '服务器出错，获取部门列表失败');
        let status = err.constructor.status;
      return res.status(status).json(err);
      }
      let resList = result ? utils.buildTreeTable(result) : [];
      return res.status(200).json({
        code: 'SUCCESS',
        data: resList
      });
    })
  }
};

exports.allLists = function(req,res){
  ruleService.allLists(function(err,result){
    if(err){
      logService.log(req, '服务器出错，获取系统功能失败');
      let status = err.constructor.status;
      return res.status(status).json(err);
    }
    return res.status(200).json({
      code: 'SUCCESS',
      data:utils.buildTree(result,0)
    })
  })
};

// 用户权限 在localStorage 里已经存在，没必要再去取
exports.getUserRules=function(req,res){
  let curUser=req.session.user;
  if(utils.isAdmin(curUser.id)){
    exports.allLists(req, res);
    return;
  }
  ruleService.getRulesByRole(req.session.user.role,function(err,result){
    if(err){
      logService.log(req, '获取用户权限异常:'+ JSON.stringify(req.session.user));
      let status = err.constructor.status;
      return res.status(status).json(err);
    }
    return res.status(200).json({
      code: 'SUCCESS',
      data:utils.buildTree(result,0)
    });
  });
}

