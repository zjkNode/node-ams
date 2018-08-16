/**
 *  roles controller
 *  createby clmama
 */
var async = require('async'),
  _ = require('lodash'),
  utils = require('../../lib/utils'),
  logger = require('../../lib/logger.lib'),
  roleModel = require('../../models/sys/role.model'),
  roleService = require('../../services/sys/role.service'),
  logService = require('../../services/sys/logs.service'),
  depService = require('../../services/sys/dep.service');
const { ComError, ValidationError, DBError} = require('../../models/errors.model');


exports.one = function(req,res){
  req.checkParams({
    'id': {
      isNotEmpty: { errorMessage: '角色id 不能为空'}
    }
  });
  let vErrors = req.validationErrors();
  if(vErrors) {
      logger.error(__filename, '参数验证失败', vErrors);
      return res.status(ValidationError.status).json(vErrors);
  }
  var map = {
    id: parseInt(req.query.id),
  };
  roleService.one(map,function(err,row) {
    if(err){
      logService.log(req, '服务器出错，获取一条角色错误');
      let status = err.constructor.status;
      return res.status(status).json(err);
    }
    return res.status(200).json({ code: 'SUCCESS',data:row, msg:'获取信息成功'});
  });
};

exports.add = function (req,res) {
  req.checkBody(roleModel.validation);
  let vErrors = req.validationErrors();
  if(vErrors) {
      logger.error(__filename, '参数验证失败', vErrors);
      return res.status(ValidationError.status).json(vErrors);
  }
  var roles = {
    name:req.body.name,
    desc:req.body.desc,
    depid:req.body.depid
  }
  roleModel.auto(roles);

  roleService.add(roles,function(err,resid) {
    if(err){
      logService.log(req, '服务器出错，新增角色失败');
      let status = err.constructor.status;
      return res.status(status).json(err);
    }
    return res.status(200).json({ code: 'SUCCESS', msg:'新增成功'});
  });
}

exports.update = function(req,res) {
  req.checkParams({
    'id': {
      isNotEmpty: { errorMessage: '角色id 不能为空'}
    }
  });
  req.checkBody(roleModel.validation);

  let vErrors = req.validationErrors();
  if(vErrors) {
      logger.error(__filename, '参数验证失败', vErrors);
      return res.status(ValidationError.status).json(vErrors);
  }
  var map = {
    id: parseInt(req.params.id)
  };
  var roles = {
    id: parseInt(req.params.id),
    name:req.body.name,
    desc:req.body.desc,
    depid:req.body.depid
  };
  roleModel.auto(roles);
  roleService.update(roles, map, function(err){
    if(err){
      logService.log(req, '服务器出错，更新角色失败');
      let status = err.constructor.status;
      return res.status(status).json(err);
    }
    return res.status(200).json({code: 'SUCCESS',msg:'更新成功'});
  });
}

exports.updateAuth = function(req,res) {
  req.checkParams({
    'id': {
      isNotEmpty: { errorMessage: '角色id 不能为空'}
    }
  });
  let vErrors = req.validationErrors();
  if(vErrors) {
      logger.error(__filename, '参数验证失败', vErrors);
      return res.status(ValidationError.status).json(vErrors);
  }
  var map = {
    id: parseInt(req.params.id)
  };
  var roles = {
    id: parseInt(req.params.id),
    authorties:req.body.authorties
  };
  roleModel.auto(roles);
  roleService.update(roles, map, function(err){
    if(err){
      logService.log(req, '服务器出错，更新角色权限失败');
      let status = err.constructor.status;
      return res.status(status).json(err);
    }
    return res.status(200).json({code: 'SUCCESS',msg:'更新成功'});
  });
}

exports.delete = function(req,res){
  req.checkParams({
    'id': {
      isNotEmpty: { errorMessage: '角色id 不能为空'}
    }
  });

  let vErrors = req.validationErrors();
  if(vErrors) {
      logger.error(__filename, '参数验证失败', vErrors);
      return res.status(ValidationError.status).json(vErrors);
  }
  let map = {
    id: parseInt(req.params.id)
  };
  roleService.delete(map, function(err){
    if(err){
      logService.log(req, '服务器出错，删除角色失败');
      let status = err.constructor.status;
      return res.status(status).json(err);
    }
    return res.status(200).json({code: 'SUCCESS',msg:'删除成功'});
  });
}

exports.list = function(req,res) {
  let curUser = req.session.user;
  var where = {};
  let searchKey = req.query.keys;
  let page = {
    index: parseInt(req.query.pageIndex),
    size: parseInt(req.query.pageSize)
  }
  if(searchKey){
    where._complex = {
      _logic: 'or',
      name: ['like',searchKey],
      desc:['like',searchKey]
    }
  }
  if(utils.isAdmin(curUser.id)){
    // 超管
    async.waterfall([
      depService.allLists,
      function(depList, callback){
        roleService.list(where, page, function(error, resRoles){
          if(error){
            return callback(error);
          }
          resRoles.lists.map((role) => {
            let dep = depList.filter((dep) => {
              return dep.id === role.depid;
            })[0];
            role.dep = dep || { name: '部门已删除' };
          });
          return callback(null, resRoles);
        });
      }
    ], function(err, result){
      if(err){
        logService.log(req, '服务器出错，获取角色列表失败');
        let status = err.constructor.status;
      return res.status(status).json(err);
      }
      return res.status(200).json({
              code: 'SUCCESS',
              data: result,
              msg:''
            });
    });

  } else {
    // 非超管
    async.waterfall([
      function(callback){
        depService.getChildById(curUser.depid, function(error, depList) {
          return callback(error, depList);  
        });
      },
      function(depList, callback){
        let depIds = _.map(depList,'id');
        where.depid = ['in', depIds];
        roleService.list(where, page, function(error, resRoles) {
          if(error){
            return callback(error);
          }
          resRoles.lists.map((role) => {
            let dep = depList.filter((dep) => {
              return dep.id === role.depid;
            })[0];
            role.dep = dep || { name: '部门已删除' };
          });

          return callback(null, resRoles);
        })
      }
    ], function(err, result){
      if(err){
        logService.log(req, '服务器出错，获取角色列表失败');
        let status = err.constructor.status;
        return res.status(status).json(err);
      }
      return res.status(200).json({
                    code: 'SUCCESS',
                    data: result,
                    msg:''
                  });
    });
  } 
};

//根据部门ID获取该部门下所有的角色
exports.getListByDepId = function(req, res){
  req.checkQuery({
    'depId': {
      isNotEmpty: { errorMessage: '部门id 不能为空'}
    }
  });
  let vErrors = req.validationErrors();
  if(vErrors) {
      logger.error(__filename, '参数验证失败', vErrors);
      return res.status(ValidationError.status).json(vErrors);
  }
  
  let where = {
    depid: parseInt(req.query.depId)
  };
  roleService.getRoleList(where, function(err, roles){
    if(err){
      logService.log(req, '服务器出错，获取部门角色失败，部门id:'+ depId);
      let status = err.constructor.status;
      return res.status(status).json(err);
    }

    return res.status(200).json({ 
      code:'SUCCESS', 
      data: roles, 
      msg: ''});
  });
};
