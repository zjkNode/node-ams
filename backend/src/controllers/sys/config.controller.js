/**
 *  config controller
 *  createby zjk
 */
var logger = require('../../lib/logger.lib'),
    CONSTANTS = require('../../config/constants.config'),
    configModel = require('../../models/sys/config.model.js'),
    configService = require('../../services/sys/config.service.js');
const { ComError, ValidationError} = require('../../models/errors.model');

exports.add = function (req, res) {
    req.checkBody(configModel.validation);
    let vErrors = req.validationErrors();
    if(vErrors) {
        logger.error(__filename, '参数验证失败', vErrors);
        return res.status(ValidationError.status).json(vErrors);
    }
    let config = Object.assign({}, req.body);
    configModel.auto(config);
    configService.add(config, function(err, resId) {
        if(err){
            logService.log(req, '服务器出错，新增配置失败', config);
            return res.status(err.constructor.status).json(err);
        }
        config.id = resId;
        logService.log(req, '新增配置成功', config);
        return res.status(200).json({ code: 'SUCCESS', msg:'新增配置成功'});
    });
}

exports.delete = function(req, res){
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
    configService.delete(map, function(err){
        if(err){
            logService.log(req, '服务器出错，删除配置失败', map);
            return res.status(err.constructor.status).json(err);
        }
        logService.log(req, '删除配置成功', map);
        return res.status(200).json({code: 'SUCCESS', msg:'删除配置成功'});
    });
}

exports.update = function(req, res) {
    req.checkParams({
        'id': {
            isNotEmpty: { errorMessage: 'id 不能为空'}
        }
    });
    req.checkBody(configModel.validation);
    let vErrors = req.validationErrors();
    if(vErrors) {
        logger.error(__filename, '参数验证失败', vErrors);
        return res.status(ValidationError.status).json(vErrors);
    }
    let map = {
        id: parseInt(req.params.id)
    };
    let config = Object.assign({}, req.body, map);
    config.extend = config.extend && JSON.stringify(config.extend);
    configModel.auto(config);
    configService.update(config, map, function(err){
        if(err){
            logService.log(req, '服务器出错，更新配置失败', config);
            return res.status(err.constructor.status).json(err);
        }
        logService.log(req, '更新配置成功', config);
        return res.status(200).json({code: 'SUCCESS', msg:'更新配置成功'});
    });
}

exports.list = function(req, res) {
    let where = {};
    let searchKey = req.query.keys;
    let page = {
        index: parseInt(req.query.pageIndex),
        size: parseInt(req.query.pageSize)
    }
    if(searchKey){
        where._complex = {
            _logic: 'or',
            name: ['like', searchKey],
            key:['like', searchKey],
            value:['like', searchKey]
        }
    }
    configService.list(where, page, function(err, result){
        if(err){
            logService.log(req, '服务器出错，获取配置出错', where);
            return res.status(err.constructor.status).json(err);
        }
        return res.status(200).json({ code: 'SUCCESS', data: result });
    });
}

exports.listByType = function(req, res){
    req.checkQuery({
        'type': { isNotEmpty: { errorMessage: '系统配置类型不能为空'} }
    });
    let vErrors = req.validationErrors();
    if(vErrors) {
        logger.error(__filename, '参数验证失败', vErrors);
        return res.status(ValidationError.status).json(vErrors);
    }
    let type = req.query.type.trim();
    configService.listByType(type, function(err, configs){
        if(err){
            logService.log(req, '服务器出错，获取配置出错,配置类型: '+ type);
            return res.status(err.constructor.status).json(err);
        }
        let result = {};
        configs.forEach(item => {
            delete item.extend;
            result[item.key] = item;
        });
        return res.status(200).json({ code: 'SUCCESS', data: result });
    });
}