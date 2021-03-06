/**
 *  productType controller
 *  createby zjk
 */
var async = require('async'),
    _ = require('lodash'),
    util = require('../../lib/utils'),
    logger = require('../../lib/logger.lib'),
    CONSTANTS = require('../../config/constants.config'),
    configService = require('../../services/sys/config.service.js');
    proTypeModel = require('../../models/product/type.model'),
    proTypeService = require('../../services/product/type.service'),
    logService = require('../../services/sys/log.service');

const { ComError, ValidationError, DBError} = require('../../models/errors.model');

exports.add = function(req,res){
    req.checkBody(proTypeModel.validation);
    let vErrors = req.validationErrors();
    if(vErrors) {
        logger.error(__filename, '参数验证失败', vErrors);
        return res.status(ValidationError.status).json(vErrors);
    }
    let ctype = Object.assign({}, req.body);
    proTypeModel.auto(ctype);
    proTypeService.add(ctype,function(err,rs) {
        if(err){
			logService.log(req, '服务器出错，新增产品类型失败');
			return res.status(err.constructor.status).json(err);
		}
        return res.status(200).json({ code: 'SUCCESS', msg:'新增产品类型成功'});
    });
}

exports.delete =  function(req,res){
    req.checkParams({
        'id': {
            isNotEmpty: { errorMessage: 'id 不能为空'}
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
    proTypeService.delete(map, function(err){
        if(err){
			logService.log(req, '服务器出错，删除产品类型失败');
			return res.status(err.constructor.status).json(err);
		}
		return res.status(200).json({code:'SUCCESS', msg:'删除产品类型成功'});
    });
}

exports.update = function(req,res) {
    req.checkParams({
        'id': {
            isNotEmpty: { errorMessage: 'id 不能为空'}
        }
    });
    req.checkBody(proTypeModel.validation);
    let vErrors = req.validationErrors();
    if(vErrors) {
        logger.error(__filename, '参数验证失败', vErrors);
        return res.status(ValidationError.status).json(vErrors);
    }
    var map = {
        id: parseInt(req.params.id)
    };
    
    let ctype = Object.assign({}, req.body, map);
    proTypeModel.auto(ctype);
    proTypeService.update(ctype, map, function(err){
        if(err){
			logService.log(req, '服务器出错，更新失败');
			return res.status(err.constructor.status).json(err);
		}
		return res.status(200).json({code:'SUCCESS', msg:'更新成功'});
    });
}

exports.list = function(req,res) {
    let where = {};
    let searchKey = req.query.keys;
    if(searchKey){
        where._complex = {
            _logic: 'or',
            name:['like', searchKey]
        };
    }

    let curUser = req.session.user;
    if(!curUser.isAdmin){
        where.confid = ['in', curUser.datas.length === 0 ? [-1] : curUser.datas ];// datas 包含数据业务权限的Id集合
    }
    
    async.waterfall([
        function(callback){
            proTypeService.list(where, function(error, rows){
                return callback(error, rows);
            });
        },
        function(resList, callback){
            if(!searchKey || !resList || resList.length === 0){
                return callback(null, resList);
            }
            let ids = [];
            resList.forEach(item => {
                ids.push(item.id);
                ids.push(...item.pids.split(','));
            });
            ids = _.union(ids.map(id => parseInt(id)));
            proTypeService.list({ id: ['in', ids] }, function(error, rows){
                return callback(error, rows);
            });
        },
        function(resList, callback){
            configService.listByType('authData', function(error, rows){
                if(error){
                    return callback(error);
                }
                resList.forEach(item => {
                    let config = rows.find(row => row.id === item.confid) || { status: CONSTANTS.CONFIG_STATUS.INVALID, name:'无效业务' };
                    // item.buConfig = config || { status: CONSTANTS.CONFIG_STATUS.INVALID, name:'无效业务' }
                    item.buName = config.name
                });
                return callback(null, resList);
            });
        }
    ], function(err, result){
        if(err){
            logService.log(req, '服务器出错，获取产品类型列表失败');
            return res.status(err.constructor.status).end(err);
        }
        return res.status(200).json({
            code:'SUCCESS',
            data: util.buildTree(result, 0)
        });
    });
}

exports.tree = function(req, res) {
    let where = {
        status: CONSTANTS.PRO_TYPE_STATUS.VALID,
    };
    let curUser = req.session.user;
    if(!curUser.isAdmin){
        where.confid = ['in', curUser.datas.length === 0 ? [-1] : curUser.datas];
    }
    proTypeService.list(where, function(err,row){
        if(err){
            logService.log(req, '服务器出错，获取产品类型列表失败');
            return res.status(err.constructor.status).end(err);
        }
        return res.status(200).json({ 
            code: 'SUCCESS',
            data: util.buildTree(row, 0)
        });
    });
}
