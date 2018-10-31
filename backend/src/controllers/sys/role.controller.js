/**
 *  role controller
 *  createby zjk
 */
var async = require('async'),
  _ = require('lodash'),
  utils = require('../../lib/utils'),
  logger = require('../../lib/logger.lib'),
  roleModel = require('../../models/sys/role.model'),
  roleService = require('../../services/sys/role.service'),
  logService = require('../../services/sys/log.service'),
  depService = require('../../services/sys/dep.service');
const { ComError, ValidationError, DBError} = require('../../models/errors.model');


exports.one = function(req, res){
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
  roleService.one(map, function(err, row) {
    if(err){
      logService.log(req, '服务器出错，获取角色出错', map);
      return res.status(err.constructor.status).json(err);
    }
    return res.status(200).json({ code: 'SUCCESS', data:row, msg:'获取信息成功'});
  });
};

exports.add = function (req, res) {
  req.checkBody(roleModel.validation);
  let vErrors = req.validationErrors();
  if(vErrors) {
      logger.error(__filename, '参数验证失败', vErrors);
      return res.status(ValidationError.status).json(vErrors);
  }
  let role = Object.assign({}, req.body);
  roleModel.auto(role);

  roleService.add(role, function(err, resid) {
    if(err){
      logService.log(req, '服务器出错，新增角色失败', role);
      return res.status(err.constructor.status).json(err);
    }
    role.id = resid;
    logService.log(req, '新增角色成功', role);
    return res.status(200).json({ code: 'SUCCESS', msg:'新增角色成功'});
  });
}

exports.update = function(req, res) {
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
  let role = Object.assign({}, req.body, map);
  roleModel.auto(role);
  roleService.update(role, map, function(err){
    if(err){
      logService.log(req, '服务器出错，更新角色失败', role);
      return res.status(err.constructor.status).json(err);
    }
      logService.log(req, '更新角色成功', role);
    return res.status(200).json({code: 'SUCCESS', msg:'更新角色成功'});
  });
}

exports.updateAuth = function(req, res) {
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
  let role = {
    id: parseInt(req.params.id),
    authorties:req.body.authorties
  };
  roleModel.auto(role);
  roleService.update(role, map, function(err){
    if(err){
      logService.log(req, '服务器出错，更新角色权限失败', role);
      return res.status(err.constructor.status).json(err);
    }
    logService.log(req, '更新角色权限成功', role);
    return res.status(200).json({code: 'SUCCESS', msg:'更新角色权限成功'});
  });
}

exports.delete = function(req, res){
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
      logService.log(req, '服务器出错，删除角色失败', map);
      return res.status(err.constructor.status).json(err);
    }
      logService.log(req, '删除角色成功', map);
    return res.status(200).json({code: 'SUCCESS', msg:'删除角色成功'});
  });
}

exports.list = function(req, res) {
  let where = {};
  let searchKey = req.query.keys;
  if(searchKey){
    where._complex = {
      _logic: 'or',
      name: ['like', searchKey],
      desc:['like', searchKey]
    }
  }
  roleService.list(where, function(err, resRoles){
    if(err){
      logService.log(req, '服务器出错，获取角色列表失败', where);
      return res.status(err.constructor.status).json(err);
    }
    return res.status(200).json({ code: 'SUCCESS', data: resRoles });
  });
}