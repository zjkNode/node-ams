/**
 *  yz_banner controller
 *  createby zjk
 */
var logger = require('../../lib/logger.lib'),
    utils = require('../../lib/utils'),
    fs = require('fs'),
    path = require('path'),
    formidable = require('formidable'),
    CONSTANTS = require('../../config/constants.config'),
    logService = require('../../services/sys/log.service.js'),
    bannerModule = require('../../models/youzhu/banner.model.js'),
    bannerService = require('../../services/youzhu/banner.service.js');
const { ComError, ValidationError} = require('../../models/errors.model');

exports.add = function (req, res) {
    req.checkBody(bannerModule.validation);
    let vErrors = req.validationErrors();
    if(vErrors) {
        logger.error(__filename, '参数验证失败', vErrors);
        return res.status(ValidationError.status).json(vErrors);
    }
    let data = Object.assign({}, req.body);
    bannerModule.auto(data);
    bannerService.add(data, function(err, resId) {
        if(err){
            logService.log(req, '服务器出错，新增Banner失败', data);
            return res.status(err.constructor.status).json(err);
        }
        data.id = resId;
        logService.log(req, '新增Banner成功', data);
        return res.status(200).json({ code: 'SUCCESS', msg:'新增Banner成功'});
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
    bannerService.delete(map, function(err){
        if(err){
            logService.log(req, '服务器出错，删除Banner失败', map);
            return res.status(err.constructor.status).json(err);
        }
        logService.log(req, '删除Banner成功', map);
        return res.status(200).json({code: 'SUCCESS', msg:'删除Banner成功'});
    });
}

exports.update = function(req, res) {
    req.checkParams({
        'id': {
            isNotEmpty: { errorMessage: 'id 不能为空'}
        }
    });
    req.checkBody(bannerModule.validation);
    let vErrors = req.validationErrors();
    if(vErrors) {
        logger.error(__filename, '参数验证失败', vErrors);
        return res.status(ValidationError.status).json(vErrors);
    }
    let map = {
        id: parseInt(req.params.id)
    };
    let data = Object.assign({}, req.body, map);
    bannerModule.auto(data);
    bannerService.update(data, map, function(err){
        if(err){
            logService.log(req, '服务器出错，更新Baner失败', data);
            return res.status(err.constructor.status).json(err);
        }
        logService.log(req, '更新Baner成功', data);
        return res.status(200).json({code: 'SUCCESS', msg:'更新Baner成功'});
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
    bannerService.list(where, page, function(err, result){
        if(err){
            logService.log(req, '服务器出错，获取Banner出错', where);
            return res.status(err.constructor.status).json(err);
        }
        return res.status(200).json({ code: 'SUCCESS', data: result });
    });
}

exports.upload = function(req, res){
    let form = new formidable.IncomingForm();
    let tempDir = path.join(__dirname, '../../../', 'temp');
    form.uploadDir = tempDir;
    form.parse(req, function(error, fields, files) {
        if (error) {
            logger.error(__filename, error);
            return res.status(ComError.status).json(new ComError('UPLOAD_FAILED', '上传参数解析出错'));
        }
        if (!fields.uuid) {
            return res.status(ValidationError.status).json(new ComError('INVALID_UUID', '上传标识uuid验证失败'));
        }
        let  tmpPath = path.join(tempDir, fields.uuid);
        if (!utils.mkdirsSync(tmpPath, 0777)) {
            return res.status(ComError.status).json(new ComError('MKDIR_ERROR', `创建目录失败:${tmpPath}`));
        }

        let file = files.file;
        let time = new Date().getTime();
        let newFileName = file.name.replace(/(.*\/)*([^.]+)/, time);
        let visitPath = path.join('/temp', fields.uuid, newFileName);
        fs.renameSync(file.path, path.join(tmpPath, newFileName));
        return res.status(200).json({
            code: 'SUCCESS',
            file:{
                path: visitPath,
                size: file.size
            }
        });
    });
}