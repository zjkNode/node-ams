/**
 *  contract controller
 *  createby zjk
 */
var async = require('async'),
    _ = require('lodash'),
    path = require('path'),
    fs = require('fs'),
    // nodePDF = require('nodepdf'),
    logger = require('../../lib/logger.lib'),
    aliOSS = require('../../lib/ali-oss.lib'),
    util = require('../../lib/utils.js'),
    nunjucks = require('nunjucks'),
    CONSTANTS = require('../../config/constants.config'),
    contractModel = require('../../models/contract/contract.model.js'),
    configService = require('../../services/sys/config.service.js');
    contractService = require('../../services/contract/contract.service.js'),
    cTypeService = require('../../services/contract/type.service'),
    logService = require('../../services/sys/log.service');

const { ComError, ValidationError, DBError} = require('../../models/errors.model');

exports.add = function(req,res){
    req.checkBody(contractModel.validation);
    let vErrors = req.validationErrors();
    if(vErrors) {
        logger.error(__filename, '参数验证失败', vErrors);
        return res.status(ValidationError.status).json(vErrors);
    }

    let contract = Object.assign({}, req.body);
    contractModel.auto(contract);
    
    async.waterfall([
        function(callback){
            // confid 跟随类型，且添加后不能修改，
            let absoluteDir = path.join('/contract', `${contract.confid || ''}`, '/');
            let publishPath = util.getPublishPath();
            if(!util.mkdirsSync(path.join(publishPath, absoluteDir), 0777)){
                return callback(new ComError('MKDIR_ERROR', '创建目录失败:'+ publishPath));
            }
            let content = nunjucks.render('contract/template.html', contract);
            let fileName = util.uuid();
            contract.url = path.join(absoluteDir, `${fileName}.html`);
            fs.writeFileSync(path.join(publishPath, contract.url), content, 'utf-8');

            return callback(null, contract);
        }, 
        upload2TestOSS,
        function(contract, callback){
            contractService.add(contract, function(err, resId) {
                return callback(err, resId);
            });
        }
    ], function(error, result){
        if(error){
            logService.log(req, '服务器出错，新增合同失败');
            return res.status(error.constructor.status).json(error);
        }
        logService.log(req, '服务器出错，新增合同失败');
        return res.status(200).json({ code: 'SUCCESS', msg:'新增合同成功'});
    });
}

exports.delete = function(req,res){
    req.checkParams({
        'id': {
            isNotEmpty: { errorMessage: '合同id 不能为空'}
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
    async.waterfall([
        function(callback){
            contractService.one(map, function(err, row){
                if(err){
                    return callback(err);
                }
                if(row.status === CONSTANTS.CONTRACT_STATUS.ONLINE ||
                   row.status === CONSTANTS.CONTRACT_STATUS.UPDATE){
                    return callback(new ComError('CAN_NOT_DELETE', '线上合同，请先下架后再删除'));
                }
                let publishPath = util.getPublishPath();
                let filePath = path.join(publishPath, row.url);
                fs.existsSync(filePath) && fs.unlink(filePath);
                return callback()
            });
        },
        function(callback){
            contractService.delete(map, function(err){
                return callback(err);
            });
        }
    ], function(error, result){
        if(error){
            logService.log(req, '服务器出错，删除合同内容失败', map);
            return res.status(error.constructor.status).json(error);
        }
        return res.status(200).json({ code:'SUCCESS', msg:'删除合同内容成功' });
    });
}

exports.update = function(req,res) {
    req.checkParams({
        'id': {
            isNotEmpty: { errorMessage: '合同id 不能为空'}
        }
    });
    req.checkBody(contractModel.validation);
    let vErrors = req.validationErrors();
    if(vErrors) {
        logger.error(__filename, '参数验证失败', vErrors);
        return res.status(ValidationError.status).json(vErrors);
    }
    let map = {
        id: parseInt(req.params.id)
    };
    let contract = Object.assign({}, req.body, map);
    contractModel.auto(contract);

    async.waterfall([
        function(callback){
            let content = nunjucks.render('contract/template.html', contract);
            contract.url = contract.url.substring(contract.url.indexOf('/contract/'));
            fs.writeFileSync(path.join(util.getPublishPath(), contract.url), content, 'utf-8');
            return callback(null, contract);
        }, 
        upload2TestOSS,
        function(cid, callback){
            contractService.update(contract, map, function(err, row) {
                return callback(err, row);
            });
        }
    ], function(error){
        if(error){
            logService.log(req, '服务器出错，编辑合同失败');
            return res.status(error.constructor.status).json(error);
        }
        return res.status(200).json({ code: 'SUCCESS', msg:'编辑合同成功'});
    });
}

exports.list = function(req,res) {
    var where = {};
    let searchKey = req.query.keys;
    let page = {
		index: parseInt(req.query.pageIndex),
		size: parseInt(req.query.pageSize)
    };
    if(searchKey){
        where._complex = {
            _logic: 'or',
            title: ['like',searchKey]
        };
    }
    let curUser = req.session.user;
    if(!curUser.isAdmin){
        where.confid = ['in', curUser.datas.length === 0 ? [-1] : curUser.datas ];// datas 包含数据业务权限的Id集合
    }
    async.auto({
        buConfigs: function(callback){
            configService.listByType('authData', function(error, rows){
                return callback(error, rows);
            });
        },
        cList: function(callback){
            contractService.list(where, page, function(err, result){
                return callback(err, result);
            });
        },
        cTypes:['cList', function(results, callback){
            let idArray = results.cList.list.map(item => item.typeids.split(','));
            let typeids = [...new Set([].concat(...idArray))];
            cTypeService.list({ id: ['in', typeids]}, function(err, rows){
                return callback(err, rows);
            });
        }]
    }, function(error, results){
        if(error){
            logService.log(req, '服务器出错，获取合同内容列表失败', where);
            return res.status(error.constructor.status).json(error);
        }
        results.cList.list.forEach(item => {
            item.title = _.unescape(item.title);
            item.content = _.unescape(item.content);
            item.typeids = item.typeids.split(',').map(id => parseInt(id));
            item.typeName = results.cTypes.filter(type => item.typeids.includes(type.id)).map(type => type.name).join(' / ');
            item.typeName = item.typeName || "类型已删除";
            let config = results.buConfigs.find(row => row.id === item.confid);
            delete config.extend; // 删除敏感信息
            item.buConfig = config || { status: CONSTANTS.CONFIG_STATUS.INVALID, name:'无效业务' }
        });
        return res.status(200).json({ code: 'SUCCESS', data: results.cList, msg:'' });

    });
}

exports.one = function(req,res){
    req.checkParams({
        'id': {
            isNotEmpty: { errorMessage: '合同id 不能为空'}
        }
    });
    let vErrors = req.validationErrors();
    if(vErrors) {
        logger.error(__filename, '参数验证失败', vErrors);
        return res.status(ValidationError.status).json(vErrors);
    }
    let where = {
        id: parseInt(req.params.id)
    };
    contractService.one(where, function(err, row){
        if(err){
            logger.errorDB(__filename, err);
            return res.status(err.constructor.status).json(err);
        }
        return res.status(200).json({code:'SUCCESS', data:row, msg:''});
    });
}

exports.online = function(req, res){
    req.checkBody({
        'id': {
            isNotEmpty: { errorMessage: '合同id 不能为空'}
        }
    });
    let vErrors = req.validationErrors();
    if(vErrors) {
        logger.error(__filename, '参数验证失败', vErrors);
        return res.status(ValidationError.status).json(vErrors);
    }
    let where = {
        id: parseInt(req.body.id)
    };
    async.waterfall([
        function(callback){
            contractService.one(where, function(err, row){
                return callback(err, row);
            });
        },
        function(contract, callback){
            configService.one({ id: contract.confid }, function(err, row){
                if(err){
                    return callback(err)
                }
                if(!row){
                    return callback(new ComError('INVALID_CONFIG', '无效的业务类型'));
                }
                if(!row.extend){
                    return callback(new ComError('EXTEND_CONFIG_NO_EXIST', `系统配置 -- ${row.name} 未配置扩展属性`));
                }
                contract.buConfig = row;
                return callback(err, contract);
            });
        },
        function(contract, callback){ // 上传oss
            // 开发环境，上传到开发OSS上  测试环境，上架时，上传生产OSS上
            let ossConf = process.env.NODE_ENV === 'dev' ? 
                        contract.buConfig.extend.oss.dev : 
                        contract.buConfig.extend.oss.pro;
            if(!ossConf.accessKeyId || !ossConf.accessKeySecret || !ossConf.bucket){
                return callback(new ComError('OSS_CONFIG_FAILED', `请完善业务数据OSS生产环境相关配置：系统配置--${contract.buConfig.name}`));
            } 
            let tmpUrl = contract.url.substring(contract.url.indexOf('/contract/'));
            contract.url = contract.buConfig.value + tmpUrl;

            let ossClient = new aliOSS.Client(ossConf);
            let localFile = path.join(util.getPublishPath(), tmpUrl);
            ossClient.upload(tmpUrl, localFile);
            
            return callback(null, contract)
        },
        function(contract, callback){
            let data = {
                url: contract.url,
                status: CONSTANTS.CONTRACT_STATUS.ONLINE,
                update_time: util.dateFormat(),
                publish_time: util.dateFormat()
            }
            contractService.update(data, where, function(err){
                return callback(err);
            });
        }
    ], function(error, result){
        if(error){
            logger.error(__filename, '合同上架失败', error);
            return res.status(error.constructor.status).json(error);
        }
        return res.status(200).json({code:'SUCCESS', data:'', msg:'合同上架成功'});
    });
}

exports.offline = function(req, res){
    req.checkBody({
        'id': {
            isNotEmpty: { errorMessage: '合同id 不能为空'}
        }
    });
    let vErrors = req.validationErrors();
    if(vErrors) {
        logger.error(__filename, '参数验证失败', vErrors);
        return res.status(ValidationError.status).json(vErrors);
    }
    let where = {
        id: parseInt(req.body.id)
    };
    async.waterfall([
        function(callback){
            contractService.one(where, function(err, row){
                return callback(err, row);
            });
        },
        function(contract, callback){
            configService.one({ id: contract.confid }, function(err, row){
                if(err){
                    return callback(err)
                }
                if(!row){
                    return callback(new ComError('INVALID_CONFIG', '无效的业务类型'));
                }
                if(!row.extend){
                    return callback(new ComError('EXTEND_CONFIG_NO_EXIST', `系统配置 -- ${row.name} 未配置扩展属性`));
                }
                contract.buConfig = row;
                return callback(err, contract);
            });
        },
        function(contract, callback){ // 上传oss
            // 开发环境，上传到开发OSS上  测试环境，上架时，上传生产OSS上
            let ossConf = process.env.NODE_ENV === 'dev' ? 
                        contract.buConfig.extend.oss.dev : 
                        contract.buConfig.extend.oss.pro;
            if(!ossConf.accessKeyId || !ossConf.accessKeySecret || !ossConf.bucket){
                return callback(new ComError('OSS_CONFIG_FAILED', `请完善业务数据OSS生产环境相关配置：系统配置--${contract.buConfig.name}`));
            }
            let tmpUrl = contract.url.substring(contract.url.indexOf('/contract/'));
            contract.url = path.join('/preview', tmpUrl);

            let ossClient = new aliOSS.Client(ossConf);
            ossClient.delete(tmpUrl);
            return callback(null, contract)
        },
        function(contract, callback){
            let data = {
                id: contract.id,
                url: contract.url,
                status: CONSTANTS.CONTRACT_STATUS.OFFLINE,
                update_time: util.dateFormat()
            }
            contractService.update(data, where, function(err){
                return callback(err);
            });
        }
    ], function(error, result){
        if(error){
            logger.error(__filename, '合同下架架失败:', error);
            return res.status(error.constructor.status).json(error);
        }
        return res.status(200).json({code:'SUCCESS', data:'', msg:'合同下架成功'});
    });
}

exports.download = function(req, res){

}

function upload2TestOSS(contract, callback) {
    if(process.env.NODE_ENV === 'dev'){ // 开发环境，只保存在本地
        contract.url = path.join('/preview', contract.url);
        return callback(null, contract);
    }
    let where = {
        id: contract.confid
    };
    configService.one(where, function(err, config){
        if(err){
            return callback(err);
        }
        if(!config.extend){
            return callback(new ComError('EXTEND_CONFIG_NO_EXIST', `${config.name} 未配置扩展属性`));
        }
        let ossConf = config.extend.oss.test;
        if(!ossConf.accessKeyId || !ossConf.accessKeySecret || !ossConf.bucket){
            return callback(new ComError('OSS_CONFIG_FAILED', `请完善业务数据OSS测试环境相关配置：系统配置--${config.name}`));
        }
        let ossClient = new aliOSS.Client(ossConf);
        let localFile = path.join(util.getPublishPath(), contract.url);
        ossClient.upload(contract.url, localFile);
        let tmpDomain = config.value.replace(/(http(s?):\/\/)(.*?)/, '$1test-$3');
        contract.url = tmpDomain + contract.url;
        return callback(null, contract);
    });
}

// exports.previewpdf = function(req,res){
//     let where = {
//         id: parseInt(req.params.id)
//     }
//     contractService.one(where,function(err,row){
//         if(err){
//             logService.log(req, '服务器出错，获取合同失败');
//             return res.status(500).json(err);
//         }
//         row.content = _.unescape(row.content);
//         var pdf = new nodePDF('temp/pdf/contract.pdf', 'temp/pdf/contract.pdf', {
//             'content': row.content,
//             'viewportSize': {
//                 'width': 1440,
//                 'height': 900
//             },
//         });
//         pdf.on('done', function(pathToFile){
//             return res.sendFile(pathToFile);
//         });
//     });
// }