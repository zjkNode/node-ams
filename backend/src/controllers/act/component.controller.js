/**
 *  act controller
 *  createby clmama
 */
var async = require('async'),
    path = require('path'),
    _ = require('lodash'),
    fs = require('fs'),
    unzip = require('unzip2'),
    utils = require('../../lib/utils'),
    CONSTANTS = require('../../config/constants.config'),
    logger = require('../../lib/logger.lib'),
    formidable = require('formidable'),
    child_process = require('child_process'),
    actService = require('../../services/act/act.service');

const { ComError, ValidationError, DBError} = require('../../models/errors.model');

exports.delete = function(req, res, next) {
    let compName = req.params.name;
    let where = `components like '${compName},%' or components like '%,${compName},%' or components like '%,${compName}'`;
    actService.count(where, function(err, cnt){
        if(err){
            logger.error(__filename, error);
            return res.status(err.constructor.status).json(err);
        }
        if(cnt > 0){
            return res.status(200).json({ code: 'DELETE_FAILED', msg:'组件被活动引用，不能删除'});
        }

        let cpsPath = path.join(__dirname, '../../themes', CONSTANTS.ACT_COMPONENTS_PATH);
        // 移除组件目录
        child_process.spawn('rm',['-rf',path.join(cpsPath, compName)]);
        // fs.rmdirSync(cpsPath + '/' + compName);
        return res.status(200).json({ code: 'SUCCESS', msg:'删除组件成功'});
    });
}

exports.list = function(req, res, next) {
    let searchKey = req.query.keys;
    let cpsPath = path.join(__dirname, '../../themes', CONSTANTS.ACT_COMPONENTS_PATH);
    let files = fs.readdirSync(cpsPath);
    let _files = [];
    for(let i = 0, length = files.length; i < length; i++) {
        let file = files[i];
        if((/^\./g.test(file))){
            continue;
        }
        let stat = fs.statSync(path.join(cpsPath, file));
        if(stat.isDirectory() && file.includes(searchKey)){
            _files.push({
                name: file,
                time: stat.mtime
            });
        }
    }
    return res.status(200).json({ code: 'SUCCESS', msg:'获取组件列表成功', data: _files});
}

exports.upload = function(req, res, next){
    let form = new formidable.IncomingForm();
    form.uploadDir = path.join(__dirname, '../../themes', CONSTANTS.ACT_COMPONENTS_PATH);
    form.parse(req, function(error, fields, files) {
        if (error) {
            logger.error(__filename, error);
            return res.status(ValidationError.status).json(new ValidationError('UPLOAD_FAILED','上传组件压缩包无法解析'));
        }
        let file = files.file;
        if(!(/.zip$/g.test(file.name))) {
            logger.error(__filename, '请上传组件zip压缩包');
            removeFile(file.path);
            return res.status(ValidationError.status).json(new ValidationError('UPLOAD_FAILED', '请上传组件zip压缩包'));
        }

        let localFiles = fs.readdirSync(form.uploadDir);
        let fileName = file.name.split('.')[0];
        let _file = localFiles.filter( item => item === fileName);

        if(fields.type === 'add' && _file.length > 0){ // 新增时，组件名称重复
            removeFile(file.path);
            return res.status(ComError.status).json(new ComError('UPLOAD_FAILED', '组件名称重复，请重新命令组件'));
        }
        if(fields.type === 'update'){ // 修改时 
            if(fields.fileName !== fileName){ // 文件名称不致
                removeFile(file.path);
                return res.status(ComError.status).json(new ComError('UPLOAD_FAILED', '组件名不匹配，请重新选择组件更新'));
            }
            if(_file.length === 0){ //附件名称不存在
                removeFile(file.path);
                return res.status(ComError.status).json(new ComError('UPLOAD_FAILED', '组件不存在，请上传直接上传'));
            }
        }
        // unzip file
        let distDir = path.join(form.uploadDir, fileName);
        let extract = unzip.Extract({ path: distDir });
        let stream = fs.createReadStream(file.path).pipe(extract);
        stream.on('close', ()=>{
            removeFile(file.path);
            removeFile(path.join(distDir, file.name));
        });
        return res.status(200).json({ code: 'SUCCESS', msg:'组件上传成功'});
    });
}

function removeFile(filePath){
    fs.unlink(filePath, (err) => {
        err && logger.error(__filename, '删除文件失败: '+ filePath, err);
    });
}