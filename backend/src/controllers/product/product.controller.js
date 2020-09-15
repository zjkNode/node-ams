/**
 *  product controller
 *  createby zjk
 */
var async = require('async'),
    _ = require('lodash'),
    path = require('path'),
    fs = require('fs'),
    logger = require('../../lib/logger.lib'),
    aliOSS = require('../../lib/ali-oss.lib'),
    util = require('../../lib/utils.js'),
    nunjucks = require('nunjucks'),
    formidable = require('formidable'),
    CONSTANTS = require('../../config/constants.config'),
    proModel = require('../../models/product/product.model'),
    configService = require('../../services/sys/config.service');
    proService = require('../../services/product/product.service'),
    proTypeService = require('../../services/product/type.service'),
    logService = require('../../services/sys/log.service');

const { ComError, ValidationError, DBError} = require('../../models/errors.model');

exports.add = function(req,res){
    req.checkBody(proModel.validation);
    let vErrors = req.validationErrors();
    if(vErrors) {
        logger.error(__filename, '参数验证失败', vErrors);
        return res.status(ValidationError.status).json(vErrors);
    }

    let product = Object.assign({}, req.body);
    proModel.auto(product);
    proService.add(product, function(error, resId) {
      if(error){
        logService.log(req, '服务器出错，新增产品失败');
        return res.status(error.constructor.status).json(error);
      }
        return res.status(200).json({ code: 'SUCCESS', msg:'新增产品成功'});
      });

    // async.waterfall([
    //     function(callback){
    //         // confid 跟随类型，且添加后不能修改，
    //         let absoluteDir = path.join('/product', `${product.confid || ''}`, '/');
    //         let publishPath = util.getPublishPath();
    //         if(!util.mkdirsSync(path.join(publishPath, absoluteDir), 0777)){
    //             return callback(new ComError('MKDIR_ERROR', '创建目录失败:'+ publishPath));
    //         }
    //         let content = nunjucks.render('product/template.html', product);
    //         let fileName = util.uuid();
    //         product.url = path.join(absoluteDir, `${fileName}.html`);
    //         fs.writeFileSync(path.join(publishPath, product.url), content, 'utf-8');

    //         return callback(null, product);
    //     }, 
    //     upload2TestOSS,
    //     function(product, callback){
    //         proService.add(product, function(err, resId) {
    //             return callback(err, resId);
    //         });
    //     }
    // ], function(error, result){
    //     if(error){
    //         logService.log(req, '服务器出错，新增合同失败');
    //         return res.status(error.constructor.status).json(error);
    //     }
    //     logService.log(req, '服务器出错，新增合同失败');
    //     return res.status(200).json({ code: 'SUCCESS', msg:'新增合同成功'});
    // });
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
            proService.one(map, function(err, row){
                if(err){
                    return callback(err);
                }
                if(row.status === CONSTANTS.PRO_STATUS.ONLINE ||
                   row.status === CONSTANTS.PRO_STATUS.UPDATE){
                    return callback(new ComError('CAN_NOT_DELETE', '线上合同，请先下架后再删除'));
                }
                let publishPath = util.getPublishPath();
                let filePath = path.join(publishPath, row.url);
                fs.existsSync(filePath) && fs.unlink(filePath);
                return callback()
            });
        },
        function(callback){
            proService.delete(map, function(err){
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
          isNotEmpty: { errorMessage: '产品id 不能为空'}
        }
    });
    req.checkBody(proModel.validation);
    let vErrors = req.validationErrors();
    if(vErrors) {
        logger.error(__filename, '参数验证失败', vErrors);
        return res.status(ValidationError.status).json(vErrors);
    }
    let map = {
        id: parseInt(req.params.id)
    };
    let product = Object.assign({}, req.body, map);
    proModel.auto(product);

    proService.update(product, map, function(error, row) {
      if(error){
        logService.log(req, '服务器出错，编辑产品失败');
        return res.status(error.constructor.status).json(error);
      }
      return res.status(200).json({ code: 'SUCCESS', msg:'编辑产品成功'});
    });
    // async.waterfall([
    //     function(callback){
    //         let content = nunjucks.render('product/template.html', product);
    //         product.url = product.url.substring(product.url.indexOf('/product/'));
    //         fs.writeFileSync(path.join(util.getPublishPath(), product.url), content, 'utf-8');
    //         return callback(null, product);
    //     }, 
    //     upload2TestOSS,
    //     function(cid, callback){
    //         proService.update(product, map, function(err, row) {
    //             return callback(err, row);
    //         });
    //     }
    // ], function(error){
    //     if(error){
    //         logService.log(req, '服务器出错，编辑合同失败');
    //         return res.status(error.constructor.status).json(error);
    //     }
    //     return res.status(200).json({ code: 'SUCCESS', msg:'编辑合同成功'});
    // });
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
            proService.list(where, page, function(err, result){
                return callback(err, result);
            });
        },
        cTypes:['cList', function(results, callback){
            let idArray = results.cList.list.map(item => item.typeids.split(','));
            let typeids = [...new Set([].concat(...idArray))];
            proTypeService.list({ id: ['in', typeids]}, function(err, rows){
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
            isNotEmpty: { errorMessage: '产品id 不能为空'}
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
    proService.one(where, function(err, row){
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
            proService.one(where, function(err, row){
                return callback(err, row);
            });
        },
        function(product, callback){
            configService.one({ id: product.confid }, function(err, row){
                if(err){
                    return callback(err)
                }
                if(!row){
                    return callback(new ComError('INVALID_CONFIG', '无效的业务类型'));
                }
                if(!row.extend){
                    return callback(new ComError('EXTEND_CONFIG_NO_EXIST', `系统配置 -- ${row.name} 未配置扩展属性`));
                }
                product.buConfig = row;
                return callback(err, product);
            });
        },
        function(product, callback){ // 上传oss
            // 开发环境，上传到开发OSS上  测试环境，上架时，上传生产OSS上
            let ossConf = process.env.NODE_ENV === 'dev' ? 
                        product.buConfig.extend.oss.dev : 
                        product.buConfig.extend.oss.pro;
            if(!ossConf.accessKeyId || !ossConf.accessKeySecret || !ossConf.bucket){
                return callback(new ComError('OSS_CONFIG_FAILED', `请完善业务数据OSS生产环境相关配置：系统配置--${product.buConfig.name}`));
            } 
            let tmpUrl = product.url.substring(product.url.indexOf('/product/'));
            product.url = product.buConfig.value + tmpUrl;

            let ossClient = new aliOSS.Client(ossConf);
            let localFile = path.join(util.getPublishPath(), tmpUrl);
            ossClient.upload(tmpUrl, localFile);
            
            return callback(null, product)
        },
        function(product, callback){
            let data = {
                url: product.url,
                status: CONSTANTS.PRO_STATUS.ONLINE,
                update_time: util.dateFormat(),
                publish_time: util.dateFormat()
            }
            proService.update(data, where, function(err){
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
            proService.one(where, function(err, row){
                return callback(err, row);
            });
        },
        function(product, callback){
            configService.one({ id: product.confid }, function(err, row){
                if(err){
                    return callback(err)
                }
                if(!row){
                    return callback(new ComError('INVALID_CONFIG', '无效的业务类型'));
                }
                if(!row.extend){
                    return callback(new ComError('EXTEND_CONFIG_NO_EXIST', `系统配置 -- ${row.name} 未配置扩展属性`));
                }
                product.buConfig = row;
                return callback(err, product);
            });
        },
        function(product, callback){ // 上传oss
            // 开发环境，上传到开发OSS上  测试环境，上架时，上传生产OSS上
            let ossConf = process.env.NODE_ENV === 'dev' ? 
                        product.buConfig.extend.oss.dev : 
                        product.buConfig.extend.oss.pro;
            if(!ossConf.accessKeyId || !ossConf.accessKeySecret || !ossConf.bucket){
                return callback(new ComError('OSS_CONFIG_FAILED', `请完善业务数据OSS生产环境相关配置：系统配置--${product.buConfig.name}`));
            }
            let tmpUrl = product.url.substring(product.url.indexOf('/product/'));
            product.url = path.join('/preview', tmpUrl);

            let ossClient = new aliOSS.Client(ossConf);
            ossClient.delete(tmpUrl);
            return callback(null, product)
        },
        function(product, callback){
            let data = {
                id: product.id,
                url: product.url,
                status: CONSTANTS.product_STATUS.OFFLINE,
                update_time: util.dateFormat()
            }
            proService.update(data, where, function(err){
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

exports.upload = function(req, res, next) {
  let form = new formidable.IncomingForm();
  let actTempDir = path.join(__dirname, '../../../', 'temp');
  form.uploadDir = actTempDir;
  form.parse(req, function(error, fields, files) {
      if (error) {
          logger.error(__filename, error);
          return res.status(ComError.status).json(new ComError('UPLOAD_FAILED', '上传参数解析出错'));
      }
      if (!fields.uuid) {
          return res.status(ValidationError.status).json(new ComError('INVALID_UUID', 'uuid验证失败'));
      }
      let  actTempPath = path.join(actTempDir, fields.uuid);
      if (!util.mkdirsSync(actTempPath, 0777)) {
          return res.status(ComError.status).json(new ComError('MKDIR_ERROR', `创建目录失败:${actTempPath}`));
      }
      let file = files.file;
      let time = new Date().getTime();
      let newFileName = (file.name || '').replace(/(.*\/)*([^.]+)/, time);
      let visitPath = path.join('/temp', fields.uuid, newFileName);
      fs.renameSync(file.path, path.join(actTempPath, newFileName));
      return res.status(200).json({
          code: 'SUCCESS',
          file:{
              path: visitPath,
              size: file.size
          }
      });
  });
}

function upload2TestOSS(product, callback) {
    if(process.env.NODE_ENV === 'dev'){ // 开发环境，只保存在本地
        product.url = path.join('/preview', product.url);
        return callback(null, product);
    }
    let where = {
        id: product.confid
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
        let localFile = path.join(util.getPublishPath(), product.url);
        ossClient.upload(product.url, localFile);
        let tmpDomain = config.value.replace(/(http(s?):\/\/)(.*?)/, '$1test-$3');
        product.url = tmpDomain + product.url;
        return callback(null, product);
    });
}
