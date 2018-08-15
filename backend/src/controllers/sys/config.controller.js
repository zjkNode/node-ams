/**
 *  config controller
 *  createby susan
 */
var logger = require('../../lib/logger.lib'),
    configModel = require('../../models/sys/config.model.js'),
    configService = require('../../services/sys/config.service.js');
const { ComError, ValidationError, DBError} = require('../../models/errors.model');

exports.add = function (req,res) {
    req.checkBody(configModel.validation);
    let vErrors = req.validationErrors();
    if(vErrors) {
        logger.error(__filename, '参数验证失败', vErrors);
        return res.status(ValidationError.status).json(vErrors);
    }
    var configs = {
        name:req.body.name,
        desc:req.body.desc,
        key:req.body.key,
        value:req.body.value,
        status:req.body.status
    }
    configModel.auto(configs);
    configService.add(configs,function(err,resId) {
        if(err){
            logService.log(req, '服务器出错，新增配置失败');
            let status = err.constructor.status;
            return res.status(status).json(err);
        }
        return res.status(200).json({ code: 200, msg:'新增成功'});
    });
}

exports.delete = function(req,res){
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
        id: req.params.id
    };
    configService.delete(map, function(err){
        if(err){
            logService.log(req, '服务器出错，删除配置失败');
            let status = err.constructor.status;
            return res.status(status).json(err);
        }
        return res.status(200).json({code: 200,msg:'删除成功'});
    });
}

exports.update = function(req,res) {
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
    var map = {
        id: req.params.id
    };
    var configs = {
        id: req.params.id,
        name:req.body.name,
        key:req.body.key,
        value:req.body.value,
        status:req.body.status
    };
    configModel.auto(configs);
    configService.update(configs, map, function(err){
        if(err){
            logService.log(req, '服务器出错，更新配置失败');
            let status = err.constructor.status;
            return res.status(status).json(err);
        }
        return res.status(200).json({code: 200,msg:'更新成功'});
    });
}

exports.lists = function(req,res) {
    var where = {
    };
    let searchKey = req.query.keys;
    let page = {
        index: parseInt(req.query.pageIndex),
        size: parseInt(req.query.pageSize)
    }
    if(searchKey){
    where._complex = {
        _logic: 'or',
        name: ['like',searchKey],
        desc:['like',searchKey],
        key:['like',searchKey],
        value:['like',searchKey]
    }
    }
    configService.lists(where, page, function(err, result){
        if(err){
            logService.log(req, '服务器出错，查询配置出错');
            let status = err.constructor.status;
            return res.status(status).json(err);
        }
        return res.status(200).json({
            code: 200,
            data:result,
            msg:'success'
        });
    });
}