/**
 *  act controller
 *  createby zjk
 */
var async = require('async'),
    path = require('path'),
    _ = require('lodash'),
    cleanCss = require('clean-css'),
    uglifyJs = require('uglify-js'),
    child_process = require('child_process'),
    fs = require('fs'),
    glob = require('glob'),
    unzip = require('unzip2'),
    nunjucks = require('nunjucks'),
    utils = require('../../lib/utils'),
    logger = require('../../lib/logger.lib'),
    aliOSS = require('../../lib/ali-oss.lib'),
    actModel = require('../../models/act/act.model'),
    formidable = require('formidable'),
    configService = require('../../services/sys/config.service'),
    CONSTANTS = require('../../config/constants.config'),
    logService = require('../../services/sys/log.service'),
    actService = require('../../services/act/act.service');

const { ComError, ValidationError, DBError} = require('../../models/errors.model');

exports.one = function(req, res, next) {
    req.checkParams({
        'id': {
            isNotEmpty: { errorMessage: '活动id 不能为空'}
        }
    });
    let vErrors = req.validationErrors();
    if(vErrors) {
        logger.error(__filename, '参数验证失败', vErrors);
        return res.status(ValidationError.status).json(vErrors);
    }
    var where = {
        id: parseInt(req.params.id)
    };
    actService.one(where, function(err, row) {
        if(err){
            logService.log(req, '服务器出错，获取活动详情失败', where);
            return res.status(err.constructor.status).end(err);
        }
        // 修改资源路径，使在编辑时可见
        if(row.url){
            let actAbsPath = row.url.substring(row.url.indexOf('/activity/')+1, row.url.lastIndexOf('/'));
            row.data = row.data.replace(/\.\/img\//gm, `/preview/${actAbsPath}/img/`);
        }
        row.data = JSON.parse(row.data);
        return res.status(200).json({ code: 'SUCCESS', data: row});
    });
}

exports.draft = function(req, res, next) {
    let where = {};
    let actData = Object.assign({}, req.body);
    actData.data = JSON.stringify(req.body.data);
    actData.extend = JSON.stringify(req.body.extend);
    actModel.auto(actData);
    actData.status = CONSTANTS.ACT_STATUS.DRAFT;

    // 新增 
    if(!actData.id){
        actData.user_id = req.session.user.id;
        actService.add(actData, function(err, resId) {
            if(err){
                logService.log(req, '服务器出错，保存活动草稿失败');
                return res.status(err.constructor.status).json(err);
            }
            logService.log(req, '保存活动草稿成功', { id: resId });
            return res.status(200).json({ code: 'SUCCESS', msg:'保存活动草稿成功'});
        });
        return;
    }

    // 编辑
    where.id = actData.id;
    actData.uuser_id = req.session.user.id;
    actService.update(actData, where, function(err, row) {
        if(err){
            logService.log(req, '服务器出错，活动存草稿失败', where);
            return res.status(err.constructor.status).json(err);
        }
            logService.log(req, '更新活动草稿成功', where);
        return res.status(200).json({ code: 'SUCCESS', msg:'更新活动草稿成功'});
    });
}

// 所有发布，都发布到测试环境
exports.publish = function(req, res, next) {
    req.checkBody(actModel.validation);
    let vErrors = req.validationErrors();
    if(vErrors) {
        logger.error(__filename, '参数验证失败', vErrors);
        return res.status(ValidationError.status).json(vErrors);
    }
    let actData = Object.assign({}, req.body);
    actData.extend = JSON.stringify(actData.extend);
   
    let tplData = JSON.stringify(req.body.data);

    let actPublishPath = utils.getPublishPath(),
        actPathCode = `${actData.confid}_${actData.code}`; // confid_actCode

    let rootPath = path.join(__dirname, '../../../');// backend

    async.auto({
        actConfig: function(callback){
            getActConfig(actData.confid, callback);
        },
        actData:['actConfig', function(results, callback){
            let actPath = path.join(actPublishPath, 'activity', actPathCode);
            
            // 1、 准备文件存放的目录，并创建好对应的目录
            // 支持一个活动多个页面, 每个页面，一个文件夹，保证每个活动的资源相对独立
            let pageDir = '1';
            if(!actData.url){ // 不存在url 则为新建
                if(fs.existsSync(actPath)){
                    let files = fs.readdirSync(actPath);
                    let dirs = files.filter((item) => {
                        let stat = fs.statSync(path.join(actPath, item));
                        return stat.isDirectory();
                    });
                    pageDir = (dirs.length + 1) +'';
                }
            } else {
                let urlPaths = actData.url.split('/');
                pageDir = urlPaths[urlPaths.length - 2];
            }

            let actPagePath = path.join(actPath, pageDir, '/');
            let actImgPath = path.join(actPath, pageDir, 'img', '/');
            if(!utils.mkdirsSync(actImgPath, 0777)){
                return callback(new ComError('MKDIR_ERROR', `创建目录失败:${actImgPath}`));
            }

            // 2、 生成页面访问地址
            let actConfig = results.actConfig;
            actConfig.domain = '';
            if(process.env.NODE_ENV === 'dev'){ 
                // 本地环境，生成相对地址
                actConfig.domain = '/preview';
            } else {
                // 测试环境，生产环境，首次发布都发布到测试环境   开发环境，只放到发布目录下即可
                actConfig.domain = actConfig.value.replace(/(http(s?):\/\/)(.*?)/, '$1test-$3');
            }
            // 页面访问路径： ${domain}/activity/${actPathCode}/${pageDir}/index.html
            actData.url = `${actConfig.domain}/activity/${actPathCode}/${pageDir}/index.html`;


            // 3、 copy global static js and css 
            let actTplPath = path.join(rootPath, 'src/themes/activity/static/'); 
            // mac环境 copy static 
            // child_process.spawn('cp', ['-rf', actTplPath, actPath]); 
            // linux 系统需要单独拷贝每个文件夹，
            let tplCssPath = path.join(actTplPath, 'css');
            let tplJsPath = path.join(actTplPath, 'js');
            let tplImgPath = path.join(actTplPath, 'img');
            let cp = child_process.spawn('cp', ['-rf', tplCssPath, tplJsPath, tplImgPath, actPath]); // copy static files
            cp.stderr.on('data', (data) => {
               logger.error(__filename, '拷贝全局 css js img 失败:'+ data);
            });

            // 4、 copy 编辑活动时上传的临时图片  发布成功后，删除临时目录
            var reg = new RegExp("(/temp/.*?[^\"|\)])[\)\"]", "ig");
            while(r = reg.exec(tplData)) {
                let actTempSrc = path.join(rootPath, r[1]);
                if(!fs.existsSync(actTempSrc)){
                    return callback(new ComError('IMG_NOT_EXIST', `图片 ${actTempSrc} 不存在或已被删除`));
                }
                // copy temp files
                child_process.spawn('cp', ['-f', actTempSrc, actImgPath]); 
            }
            // 更新 page data数据 /temp/act.uuid  to  actDomain/pages/actCode/img
            // tplData = tplData.replace(new RegExp(`/temp/${actData.uuid}/`, 'g'), `${actConfig.domain}/${actConfig.oss_proxy}/${actPathCode}/${pageDir}/img/`);
            
            // 5、 更新 page data数据 /temp/act.uuid/ and /preview/activity/${actPathCode}/${pageDir}/img/ to  ./img/
            tplData = tplData.replace(new RegExp(`/temp/${actData.uuid}/`, 'g'), `./img/`);
            // 编辑时，把./img/ 改为相对目录，所以在保存时需要再改回来
            tplData = tplData.replace(new RegExp(`/preview/.*/img/`, 'g'), `./img/`);
            // 用解析后的文件覆盖模板文件
            actData.data = tplData;

            // 6、准备模板引擎的数据，并生成页面
            let contentData = JSON.parse(tplData);
            // {baidu:'', gio:'', abTest:'', ....} 前端直接使用，所以转为对象
            contentData.third_code = actConfig.extend.thirdCode; 
            // {openAndroid:'', openIos:'', .....} 前端先绑定到一个js变量，再使用，所以直接绑定json string
            contentData.download_url = JSON.stringify(actConfig.extend.download);
            let content = nunjucks.render('activity/layout.html', contentData);
            fs.writeFileSync(path.join(actPagePath, 'index.html'), content, 'utf-8');

            // 7、 create min.js
            let jsPaths = filterComps(contentData.components, 'js');
            let jsMin = { code: ''}; // minify 之后的数据结构
            if(jsPaths.length > 0){
                let jsCodes = jsPaths.map(jsItem => fs.readFileSync(jsItem, "utf8"));
                jsMin = uglifyJs.minify(jsCodes.join(';'));
            }
            if(!jsMin.code){
                logger.warn(jsMin);
            }
            fs.writeFileSync(path.join(actPagePath, 'min.js'), jsMin.code || '', 'utf8');

            // 8、 create min.css
            let cssPaths = filterComps(contentData.components, 'css');
            new cleanCss().minify(cssPaths, function(err, output){
                if(err){
                    return callback(err);
                } 
                fs.writeFileSync(path.join(actPagePath, 'min.css'), output.styles || '', 'utf8');
                return callback(null, actData);
            });
        }],
        uploadOSS:['actData', function(results, callback){
            // 开发环境，不上传oss， 开发环境中，上架可上传到开发oss中 
            if(process.env.NODE_ENV === 'dev'){ 
                return callback(null, true);
            }

            let actPath = path.join(actPublishPath, 'activity', actPathCode);
            let ossPrefix = `/activity/${actPathCode}`;

            let ossConf = results.actConfig.extend.oss.test;
            if(!ossConf.accessKeyId || !ossConf.accessKeySecret || !ossConf.bucket){
                return callback(new ComError('OSS_CONFIG_FAILED', `请完善业务数据OSS测试环境相关配置：系统配置--${results.actConfig.name}`));
            }
            let ossClient = new aliOSS.Client(ossConf);

            let pattern = path.join(actPath, '**');
            glob(pattern, {nodir: true}, function(err, files){
                if(err){
                    return callback(err);
                }
                // logger.info(files);
                files.forEach( localFile => {
                    let objKey = localFile.replace(actPath, '');
                    let ossFile = path.join(ossPrefix, objKey);
                    ossClient.upload(ossFile, localFile);
                });
            });

            return callback(null, true);
        }],
        saveAct:['actData', function(results, callback){
            let actData = results.actData;
            actModel.auto(actData);

            actData.status = CONSTANTS.ACT_STATUS.TEST;
            if(!actData.id){
                actData.user_id = req.session.user.id;
                actService.add(actData, function(err, resId) {
                    return callback(err, resId)
                });
                return;
            } 
            actData.uuser_id = req.session.user.id;
            actService.update(actData, { id: actData.id }, function(err) {
               return callback(err, actData.id);
            });
        }]
    }, function(err, results){
        if(err){
            logger.error(__filename, err);
            // 移除发布失败的目录
            actData.id == 0 && child_process.spawn('rm', ['-rf', actPublishPath]); 

            logService.log(req, '服务器出错，发布活动失败', { id: results.saveAct || '' });
            return res.status(err.constructor.status).json(err);
        }
        // 移除临时目录
        child_process.spawn('rm', ['-rf', path.join(rootPath, 'temp', req.body.uuid)]); 
        logService.log(req, '测试环境发布成功', { id: results.saveAct });

        return res.status(200).json({ code: 'SUCCESS', msg:'测试环境发布成功' });
    });
}

exports.delete = function(req, res, next) {
    req.checkParams({
        'id': {
            isNotEmpty: { errorMessage: '活动id 不能为空' }
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
    //删除活动，只删除oss上文件，修改数据库活动记录为删除状态
    async.waterfall([
        function(callback){
            actService.one(where, function(err, actData){
                if(err){
                    return callback(err);
                }
                if(!actData){
                    return callback(new ComError('ACT_NOT_EXIST', '活动不存在或已被删除'))
                }
                if(actData.status == CONSTANTS.ACT_STATUS.ONLINE ||
                   actData.status == CONSTANTS.ACT_STATUS.MODIFY){
                    return callback(new ComError('DELETE_FAILED', '线上活动不允许删除'));
                }
                return callback(null, actData);
            });
        }, 
        function(actData, callback){
            if(actData.status === CONSTANTS.ACT_STATUS.DELETED){
                return callback(null, actData); // 彻底删除
            }
            let actAbsDir = actData.url.split('/').splice(-4, 3).join('/')
            let actPageDir = path.join(utils.getPublishPath(), actAbsDir);
            fs.renameSync(actPageDir, `${actPageDir}_del`);
            // 开发环境，直接移动至已删除文件夹
            if(process.env.NODE_ENV === 'dev'){ 
                return callback(null, actData);
            }
            // 生产环境，删除 测试oss文件
            getActConfig(actData.confid, function(err, actConfig){
                if(err){
                    return callback(err)
                }
                let ossConf = actConfig.extend.oss.test;
                if(!ossConf.accessKeyId || !ossConf.accessKeySecret || !ossConf.bucket){
                    return callback(new ComError('OSS_CONFIG_FAILED', `请完善业务数据OSS测试环境相关配置：系统配置--${actConfig.name}`));
                }
                let ossClient = new aliOSS.Client(ossConf);
                let ossKey = actData.url.substring(actData.url.indexOf('/activity/'));
                ossClient.delete(ossKey);
                return callback(null, actData);
            });
        },
        function(actData, callback){
            if(actData.status === CONSTANTS.ACT_STATUS.DELETED){ // 彻底删除
                actService.delete(where, function(err){
                    return callback(err);
                });
                return;
            }
            let data = {
                status: CONSTANTS.ACT_STATUS.DELETED
            };
            actService.update(data, where, function(err) {
               return callback(err);
            });
        }
    ], function(err, actData){
        if(err){
            logService.log(req, '删除活动失败:'+ err.msg, where);
            return res.status(err.constructor.status).json(err);
        }
        logService.log(req, '删除活动成功', where);
        return res.status(200).json({ code: 'SUCCESS', msg:'删除活动成功'});
    });
}

exports.recover = function(req, res, next){
    if(!req.session.user.isAdmin){
        return res.status(AuthError.status).json(new AuthError());
    }
    req.checkParams({
        'id': {
            isNotEmpty: { errorMessage: '活动id 不能为空' }
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
    //删除活动，只删除oss上文件，修改数据库活动记录为删除状态
    async.waterfall([
        function(callback){
            actService.one(where, function(err, actData){
                if(err){
                    return callback(err);
                }
                if(!actData){
                    return callback(new ComError('ACT_NOT_EXIST', '活动不存在或已被删除'))
                }
                if(actData.status !== CONSTANTS.ACT_STATUS.DELETED ){
                    return callback(new ComError('RECOVER_FAILED', '活动未删除，无须恢复'));
                }
                return callback(null, actData);
            });
        }, 
        function(actData, callback){
            if(!actData){
                return callback(null, null);
            }
            let actAbsDir = actData.url.split('/').splice(-4, 3).join('/')
            let actPageDir = path.join(utils.getPublishPath(), actAbsDir);
            fs.renameSync(`${actPageDir}_del`, actPageDir);
            // 开发环境，直接移动至正常文件夹
            if(process.env.NODE_ENV === 'dev'){ 
                return callback(null, actData);
            }
            // 生产环境，上传到 测试oss文件
            getActConfig(actData.confid, function(err, actConfig){
                if(err){
                    return callback(err)
                }
                let ossConf = actConfig.extend.oss.test;
                if(!ossConf.accessKeyId || !ossConf.accessKeySecret || !ossConf.bucket){
                    return callback(new ComError('OSS_CONFIG_FAILED', `请完善业务数据OSS测试环境相关配置：系统配置--${actConfig.name}`));
                }
                let ossClient = new aliOSS.Client(ossConf);
                let ossPrefix = actData.url.substring(actData.url.indexOf('/activity/'));
                let localFile = path.join(utils.getPublishPath(), ossPrefix);
                ossClient.upload(ossPrefix, localFile);
                return callback(null, actData);
            });
        },
        function(actData, callback){
            let data = {
                status: CONSTANTS.ACT_STATUS.TEST
            };
            actService.update(data, where, function(err) {
               return callback(err);
            });
        }
    ], function(err, result){
        if(err){
            logService.log(req, '恢复活动失败: '+ err.msg, where);
            return res.status(err.constructor.status).json(err);
        }
        logService.log(req, '恢复活动成功: '+ err.msg, where);
        return res.status(200).json({ code: 'SUCCESS', msg:'恢复活动成功'});
    });
}

// 开发环境上线到开发oss ，测试环境，上线到生产oss
exports.online = function(req, res, next){
    req.checkBody({
        'id': {
            isNotEmpty: { errorMessage: '活动id 不能为空'}
        }
    });
    let vErrors = req.validationErrors();
    if(vErrors){
        logger.error(__filename, '活动ID验证失败', vErrors);
        return res.status(ValidationError.status).json(vErrors);
    }
    let where = {
        id: parseInt(req.body.id)
    };
    async.auto({
        actData: function(callback){
            
            actService.one(where, function(err, row){
               return callback(err, row); 
            });
        },
        actConfig:['actData', function(results, callback){
            getActConfig(results.actData.confid, callback);
        }],
        uploadOSS: ['actData', 'actConfig', function(results, callback){
            // update actData
            let actData = results.actData;
            let actPathCode = `${actData.confid}_${actData.code}`;
            actData.url = actData.url.replace(/http(s?):\/\/test.*?\//gm, results.actConfig.value +'/');

            let ossConf = process.env.NODE_ENV === 'dev' ? 
                        results.actConfig.extend.oss.dev : 
                        results.actConfig.extend.oss.pro;
            if(!ossConf.accessKeyId || !ossConf.accessKeySecret || !ossConf.bucket){
                return callback(new ComError('OSS_CONFIG_FAILED', `请完善业务数据OSS生产环境相关配置：系统配置--${results.actConfig.name}`));
            }
            let ossClient = new aliOSS.Client(ossConf);

            let actPath = path.join(utils.getPublishPath(), 'activity', actPathCode);
            let ossPrefix = `/activity/${actPathCode}`;
            let pattern = path.join(actPath, '**');
            glob(pattern, {nodir: true}, function(err, files){
                if(err){
                    return callback(err);
                }
                files.forEach( localFile => {
                    let objKey = localFile.replace(actPath, '');
                    let ossFile = path.join(ossPrefix, objKey);
                    ossClient.upload(ossFile, localFile);
                });
            });

            return callback(null, actData);
        }],
        updateAct: ['uploadOSS', function(results, callback){
            let data = {
                url: results.actData.url,
                status: CONSTANTS.ACT_STATUS.ONLINE,
                uuser_id: req.session.user.id,
                update_time: utils.dateFormat(),
                publish_time: utils.dateFormat()
            }
            actService.update(data, { id: results.actData.id }, function(err, row) {
               return callback(err, row);
            });
        }]
    }, function(error, results){
        if(error){
            logger.error(__filename, error);
            logService.log(req, '活动上架失败: '+ error.msg, where);
            return res.status(error.constructor.status).json(error);
        }
        logService.log(req, '活动上架成功', where);
        return res.status(200).json({ code: 'SUCCESS', msg:'活动上架成功' });
    });
}

exports.offline = function(req, res, next) {
    req.checkBody({
        'id': {
            isNotEmpty: { errorMessage: '活动id 不能为空' }
        }
    });
    let vErrors = req.validationErrors();
    if(vErrors){
        logger.error(__filename, '活动ID验证失败', vErrors);
        return res.status(ValidationError.status).json(vErrors);
    }
    let where = {
        id: parseInt(req.body.id)
    };
    async.waterfall([
        function(callback){
            actService.one(where, function(err, actData){
                if(err){
                    return callback(err);
                }
                if(!actData){
                    return callback(new ComError('NOT_EXIST', '活动不存在或已被删除'));
                }
                return callback(null, actData);
            });
        },
        function(actData, callback){
            getActConfig(actData.confid, function(err, actConfig){
                if(err){
                    return callback(err);
                }
                let ossConf = process.env.NODE_ENV === 'dev' ? 
                        actConfig.extend.oss.dev : 
                        actConfig.extend.oss.pro;
                if(!ossConf.accessKeyId || !ossConf.accessKeySecret || !ossConf.bucket){
                    return callback(new ComError('OSS_CONFIG_FAILED', `请完善业务数据OSS生产环境相关配置：系统配置--${actConfig.name}`));
                }
                let ossClient = new aliOSS.Client(ossConf);

                let ossKey = actData.url.substring(actData.url.indexOf('/activity/'));
                ossClient.delete(ossKey);
                return callback(null, true);
            });
        },
        function(result, callback){
            let params = {
                status: CONSTANTS.ACT_STATUS.OFFLINE
            };
            actService.update(params, where, function(err) {
                return callback(err)
            });
        }], function(error, result){
            if(error){
                logService.log(req,  '服务器出错，下架活动失败: '+ error.msg, where);
                return res.status(error.constructor.status).json(error);
            }
            logService.log(req,  '下架活动成功', where);
            return res.status(200).json({ code: 'SUCCESS', msg:'下架活动成功'});
        });
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
            return res.status(ValidationError.status).json(new ComError('INVALID_UUID', '活动标识uuid验证失败'));
        }
        let  actTempPath = path.join(actTempDir, fields.uuid);
        if (!utils.mkdirsSync(actTempPath, 0777)) {
            return res.status(ComError.status).json(new ComError('MKDIR_ERROR', `创建目录失败:${actTempPath}`));
        }

        let file = files.file;
        let time = new Date().getTime();
        let newFileName = file.name.replace(/(.*\/)*([^.]+)/, time);
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

exports.list = function(req, res, next) {
    let where = {};
    let searchKey = req.query.keys;
    let page = {
        index: parseInt(req.query.pageIndex),
        size: parseInt(req.query.pageSize)
    };
    let curUser = req.session.user;
    if(!curUser.isAdmin){
        where.status = ['!=', CONSTANTS.ACT_STATUS.DELETED];
        where.confid = ['in', curUser.datas];// datas 包含数据业务权限的Id集合
    }
    if(searchKey){
        where._complex = {
            _logic: 'or',
            name: ['like', searchKey],
            code: ['like', searchKey]
        }
    }
    actService.list(where, page, function(err, result){
        if(err){
            logService.log(req, '服务器出错，获取活动列表失败');
            return res.status(err.constructor.status).json(err);
        }
        return res.status(200).json({ code: 'SUCCESS', data: result });
    });
}

/***************** private methods *****************/

function getActConfig(confid, callback){
    let where = {
        id: parseInt(confid)
    };
    configService.one(where, function(err, row) {
        if(err){
            return callback(err);
        }
        if(!row){
            return callback(new ComError('INVALID_CONFIG', '无效的业务类型'));
        }
        if(!row.extend){
            return callback(new ComError('EXTEND_CONFIG_NO_EXIST', `系统配置 -- ${row.name} 未配置扩展属性`));
        }
        return callback(null, row);
    });
}

function filterComps(compObjs, type){
    let targetPaths = []; cachePath = {};
    // let compRootPath = path.join('src/themes', CONSTANTS.ACT_COMPONENTS_PATH);
    let compRootPath = path.join(__dirname, '../../../src/themes', CONSTANTS.ACT_COMPONENTS_PATH);
    for (var i = 0; i < compObjs.length; i++) {
        let item = compObjs[i].name;
        if(cachePath.hasOwnProperty(item)){ // 检查缓存中是否存在引用
            continue;
        }
        cachePath[item] = `${compRootPath}/${item}/${item}.${type}`;
        if(!fs.existsSync(cachePath[item])){
            logger.info('not exist: '+ cachePath[item]);
            continue;
        }
        targetPaths.push(cachePath[item]);
    }
    return targetPaths;
}

// exports.publish = function(req, res, next) {
//     req.checkBody(actModel.validation);
//     if (req.validationErrors()) {
//         logger.error(__filename, '参数验证失败', req.validationErrors());
//         return res.status(400).json(req.validationErrors());
//     }
//     if(!req.body.configId){
//         logger.error(__filename, '参数验证失败:发布到环境不能为空');
//         return res.status(400).json();
//     }

//     let actData = {
//         id: req.body.id ? parseInt(req.body.id) : 0,
//         name: req.body.name,
//         code: req.body.code,
//         components: req.body.parts,
//         url: req.body.url,
//         toProduct: req.body.toProduct,
//         // data: JSON.stringify(req.body.data),
//         uuid: req.body.activityCode,
//         user_id: req.session.user.id
//     };
//     let tplData = JSON.stringify(req.body.data);
//     actModel.auto(actData);
//     actModel.pub(actData);

//     let actPublishPath = '', 
//         actPathCode = actData.code;
//     let rootPath = path.join(__dirname, '../../../');// cms-backend

//     async.auto({
//         actConfig:function(callback){
//             var where = {
//                 id: parseInt(req.body.configId)
//             };
//             actConfigService.one(where, function(err, row) {
//                 if(err){
//                     return callback(new Error('服务器出错，活动配置出错, 配置Id：'+ where.id));
//                 }
//                 return callback(null, row);
//             });
//         },
//         actData:['actConfig', function(results, callback){
//             let actConfig = results.actConfig;
//             actPublishPath = actConfig.publish_path;
//             if(_.startsWith(req.hostname, 'local')){ // 本地环境
//                 actPublishPath = path.join(rootPath, actPublishPath);
//                 actConfig.domain = actConfig.domain.replace(/(http(s?):\/\/)(.*?)/, '$1local_$3');
//             } else if(_.startsWith(req.hostname, 'test')){ // 测试环境
//                 actPathCode = 't'+ actData.code;
//                 actConfig.domain = actConfig.domain.replace(/(http(s?):\/\/)(.*?)/, '$1test-$3');
//             } else if(!actData.toProduct){ // 生产环境，发布到测试环境
//                 actConfig.domain = actConfig.domain.replace(/(http(s?):\/\/)(.*?)/, '$1test-$3');
//             }

//             // actPublishPath = path.join(actPublishPath, actData.code);
//             actPublishPath = path.join(actPublishPath, actPathCode);
//             let actDirPath = actPublishPath;
//             // 支持一个活动多个页面
//             let pageDir = '1';
//             if(!actData.url){ // 不存在url 则为新建
//                 if(fs.existsSync(actPublishPath)){
//                     let files = fs.readdirSync(actPublishPath);
//                     var dirs = files.filter((item) => {
//                         let stat = fs.statSync(actPublishPath +'/'+ item);
//                         return stat.isDirectory();
//                     });
//                     pageDir = (dirs.length + 1) +'';
//                 }
//             } else {
//                 let urlPaths = actData.url.split('/');
//                 pageDir = urlPaths[urlPaths.length - 2];
//             }
//             actPublishPath = path.join(actPublishPath, pageDir + '/');
            
//             if(!utils.mkdirsSync(actPublishPath + 'img', 0777)){
//                 return callback('创建目录失败')
//             }

//             // copy static js and css todo
//             // let actTplPath = path.join(__dirname, '../../../src/themes/activity', 'static/');
//             if(_.startsWith(req.hostname, 'local')){
//                 let actTplPath = path.join(rootPath, 'src/themes/activity/static/'); // mac环境
//                 child_process.spawn('cp', ['-rf', actTplPath, actDirPath]); // mac环境 copy static 
//             } else {
//                 let actCssPath = path.join(rootPath, 'src/themes/activity/static/css/');
//                 let actJsPath = path.join(rootPath, 'src/themes/activity/static/js/');
//                 let cp = child_process.spawn('cp', ['-rf', actCssPath, actJsPath, actDirPath]); // copy static files
//                 cp.stderr.on('data', (data)=>{
//                    logger.error(__filename, '拷贝css js 失败:'+ data);
//                 });
//             }

//             actData.oss_proxy = actConfig.oss_proxy;
//             // actData.baidu_code = actConfig.baidu_code;
//             // pages 需要 actDomain 的nginx 配置location /pages/规则
//             // actData.url = sysConfig.actDomain + path.join('/pages/', actData.code, pageDir, 'index.html');
//             // actData.url = actConfig.domain + path.join('/', actConfig.oss_proxy, actData.code, pageDir, 'index.html');
//             actData.url = actConfig.domain + path.join('/', actConfig.oss_proxy, actPathCode, pageDir, 'index.html');

//             // copy 编辑活动时上传的临时图片  发布成功了，删除临时目录
//             var reg = new RegExp("\"/(temp/.*?[^\"])\"", "ig");
//             while(r = reg.exec(tplData)) {
//                 let actTempSrc = path.join(rootPath, r[1]);
//                 if(!fs.existsSync(actTempSrc)){
//                     return callback(new Error(`图片 ${actTempSrc} 不存在或已被删除`));
//                 }
//                 child_process.spawn('cp', ['-f', actTempSrc, actPublishPath +'img/']); // copy temp files
//             }

//             // 更新 page data数据 /temp/timeid  to  actDomain/pages/actCode/img
//             // actData.data = actData.data.replace(/\/temp\/\d+[^\"]/gm, `/pages/${actData.code}/${pageDir}/img/`);
//             // tplData = tplData.replace(/\/temp\/\d+[^\"]/gm, `${actConfig.domain}/${actConfig.oss_proxy}/${actData.code}/${pageDir}/img/`);
//             tplData = tplData.replace(/\/temp\/\d+[^\"]/gm, `${actConfig.domain}/${actConfig.oss_proxy}/${actPathCode}/${pageDir}/img/`);
//             if(actData.toProduct){ // 发布到生产环境，需要再次替换发布到测试环境的图片https://test-
//                 // cp tPath files to pPath
//                 tplData = tplData.replace(/(http(s?):\/\/test-.*?)\//gm, actConfig.domain);
//             }
//             // 用解析后的文件覆盖模板文件
//             let contentData = JSON.parse(tplData);
//             contentData.baidu_code = actConfig.baidu_code;
//             contentData.download_urls = actConfig.download_urls;
//             actData.data = JSON.stringify(contentData);
//             let content = nunjucks.render('activity/layout.html', contentData);
//             // 2018-3-22 公共的js css 放到活动目录，这样活动可完全独立
//             // replace './static/[js|css]' to 'actDomain/public/static/[js|css]' 
//             // content = content.replace(/\"\.{0, 2}\/static\//ig, `"${sysConfig.actDomain}/public/static/`);
//             fs.writeFileSync(path.join(actPublishPath, 'index.html'), content, 'utf-8');

//             // create min.js
//             let jsPaths = filterComps(contentData.components, 'js');
//             let jsMin = { code: ''};
//             if(jsPaths.length > 0){
//                 jsMin = uglifyJs.minify(jsPaths);
//             }
//             if(!jsMin.code){
//                 logger.warn(jsMin);
//             }
//             fs.writeFileSync(actPublishPath +'min.js', jsMin.code || '', 'utf8');

//             // create min.css
//             let cssPaths = filterComps(contentData.components, 'css');
//             new cleanCss().minify(cssPaths, function(err, output){
//                 if(err){
//                     return callback(err);
//                 } 
//                 fs.writeFileSync(actPublishPath +'min.css', output.styles || '', 'utf8');
//                 return callback(null, actData);
//             });
//         }],
//         uploadOSS:['actConfig', 'actData', function(results, callback){
//             let actData = results.actData;
//             let actConfig = results.actConfig;
//             // if(_.startsWith(req.hostname, 'local')){
//             //     // 本地环境，不上传oss
//             //     return callback(null, results.actData);
//             // }
            
//             // let filesRootPath = path.join(actConfig.publish_path, actData.code);
//             // let ossPrefix = `${actConfig.oss_proxy}/${actData.code}`;
//             let filesRootPath = path.join(actConfig.publish_path, actPathCode);
//             if(_.startsWith(req.hostname, 'local')){
//                 // 完全为了本地调试
//                 filesRootPath = path.join(rootPath, actConfig.publish_path, actPathCode);
//             }
//             let ossPrefix = `${actConfig.oss_proxy}/${actPathCode}`;
//             let pattern = path.join(filesRootPath, '**');
//             let ossConfEnv = (!_.startsWith(req.hostname, 'test') && actData.toProduct) ? 'product' : 'test';
//             let ossClient = new aliOSS.Client(ossConfEnv, 'actBucket');

//             console.log(filesRootPath);
//             glob(pattern, {nodir: true}, function(err, files){
//                 if(err){
//                     return callback(err);
//                 }
//                 console.log(files);
//                 files.forEach( localFile => {
//                     let objKey = localFile.replace(filesRootPath, '');
//                     let ossFile = path.join(ossPrefix, objKey);
//                     ossClient.upload(ossFile, localFile);
//                 });
//             });

//             return callback(null, actData);
//         }],
//         saveAct:['actData', function(results, callback){
//             let actData = results.actData;
//             if(actData.id === 0){
//                 actService.add(actData, function(err, row) {
//                   return  callback(err, row)
//                 });
//             } else {
//                 actService.update(actData, { id: actData.id }, function(err, row) {
//                    return callback(err, row);
//                 });
//             }
//         }]
//     }, function(err, results){
//         if(err){
//             logService.log(req, '服务器出错，发布活动失败:'+ err.message);
//             logger.error(__filename, err);
//             // 移除发布失败的目录
//             actData.id == 0 && child_process.spawn('rm', ['-rf', actPublishPath]); 
//             return res.status(500).end();
//         }

//         // 移除临时目录
//         child_process.spawn('rm', ['-rf', path.join(rootPath, 'temp', req.body.timeId)]); 
//         return res.status(200).json({ code: 'SUCCESS', msg:'发布活动成功' });
//     });

//     // async.waterfall([
//     //     // configService.getAllConfigs,
//     //     function(callback){
//     //         var where = {
//     //             id: parseInt(req.body.id)
//     //         };
//     //         actConfigService.one(where, function(err, row) {
//     //             if(err){
//     //                 return callback(new Error('服务器出错，活动配置出错, 配置Id：'+ where.id));
//     //             }
                
//     //             return callback(row);
//     //         });
//     //     },
//     //     function(actConfig, callback) {
//     //         actPublishPath = actConfig.publish_path;
//     //         if(_.startsWith(req.hostname, 'local')){
//     //             actPublishPath = rootPath + actPublishPath;
//     //             actConfig.domain = 'local_'+ actConfig.domain;
//     //         }
//     //         if(_.startsWith(req.hostname, 'test')){
//     //             actConfig.domain = 'test-'+ actConfig.domain;
//     //         }
//     //         actPublishPath = path.join(actPublishPath, actData.code);

//     //         // copy static js and css todo
//     //         // let actTplPath = path.join(__dirname, '../../../src/themes/activity', 'static/');
//     //         let actTplPath = path.join(rootPath, 'src', CONSTANTS.ACT_COMPONENTS_PATH, 'static/');
//     //         child_process.spawn('cp', ['-rf', actTplPath, actPublishPath]); // copy static files
            
//     //         // 支持一个活动多个页面
//     //         let pageDir = '1';
//     //         if(!actData.url){ // 不存在url 则为新建
//     //             if(fs.existsSync(actPublishPath)){
//     //                 let files = fs.readdirSync(actPublishPath);
//     //                 var dirs = files.filter((item) => {
//     //                     let stat = fs.statSync(actPublishPath +'/'+ item);
//     //                     return stat.isDirectory();
//     //                 });
//     //                 pageDir = (dirs.length + 1) +'';
//     //             }
//     //         } else {
//     //             let urlPaths = actData.url.split('/');
//     //             pageDir = urlPaths[urlPaths.length - 2];
//     //         }
//     //         actPublishPath = path.join(actPublishPath, pageDir + '/');
            


//     //         if(!utils.mkdirsSync(actPublishPath + 'img', 0777)){
//     //             return callback('创建目录失败')
//     //         }

//     //         actData.baidu_code = actConfig.baidu_code;
//     //         // pages 需要 actDomain 的nginx 配置location /pages/规则
//     //         // actData.url = sysConfig.actDomain + path.join('/pages/', actData.code, pageDir, 'index.html');
//     //         actData.url = actConfig.domain + path.join(actConfig.oss_proxy, actData.code, pageDir, 'index.html');

//     //         // copy 编辑活动时上传的临时图片  发布成功了，删除临时目录
//     //         var reg = new RegExp("\"/(temp/.*?[^\"])\"", "ig");
//     //         while(r = reg.exec(actData.data)) {
//     //             let actTempSrc = path.join(rootPath, r[1]);
//     //             if(!fs.existsSync(actTempSrc)){
//     //                 return callback(new Error(`图片 ${actTempSrc} 不存在或已被删除`));
//     //             }
//     //             child_process.spawn('cp', ['-f', actTempSrc, actPublishPath +'img/']); // copy temp files
//     //         }

//     //         // 更新 page data数据 /temp/timeid  to  actDomain/pages/actCode/img
//     //         // actData.data = actData.data.replace(/\/temp\/\d+[^\"]/gm, `/pages/${actData.code}/${pageDir}/img/`);
//     //         actData.data = actData.data.replace(/\/temp\/\d+[^\"]/gm, `/${actConfig.oss_proxy}/${actData.code}/${pageDir}/img/`);
//     //         // 用解析后的文件覆盖模板文件
//     //         let contentData = JSON.parse(actData.data);
//     //         let content = nunjucks.render('activity/layout.html', contentData);
//     //         // 2018-3-22 公共的js css 放到活动目录，这样活动可完全独立
//     //         // replace './static/[js|css]' to 'actDomain/public/static/[js|css]' 
//     //         // content = content.replace(/\"\.{0, 2}\/static\//ig, `"${sysConfig.actDomain}/public/static/`);
//     //         fs.writeFileSync(path.join(actPublishPath, 'index.html'), content, 'utf-8');

//     //         // create min.js
//     //         let jsPaths = filterComps(contentData.components, 'js');
//     //         let jsMin = { code: ''};
//     //         if(jsPaths.length > 0){
//     //             jsMin = uglifyJs.minify(jsPaths);
//     //         }
//     //         if(!jsMin.code){
//     //             logger.warn(jsMin);
//     //         }
//     //         fs.writeFileSync(actPublishPath +'min.js', jsMin.code || '', 'utf8');

//     //         // create min.css
//     //         let cssPaths = filterComps(contentData.components, 'css');
//     //         new cleanCss().minify(cssPaths, function(err, output){
//     //             if(err){
//     //                 return callback(err);
//     //             } 
//     //             fs.writeFileSync(actPublishPath +'min.css', output.styles || '', 'utf8');
//     //             return callback(null, actData);
//     //         });
//     //     },
//     //     function(actData, callback){ // 上传oss
//     //         let rootPath = path.join(rootPath, '/www/static_act', actData.code);
//     //         let ossClient = new aliOSS.Client('actBucket', 'xxz/'+ actData.code, rootPath);
//     //         let pattern = path.join(rootPath, '**');
//     //         glob(pattern, {nodir: true}, function(err, files){
//     //             if(err){
//     //                 return callback(err);
//     //             }

//     //             files.forEach( fileName => {
//     //                 ossClient.upload(fileName);
//     //             });
//     //         });

//     //         return callback(null, actData);
//     //     },
//     //     function(actData, callback){
//     //         if(actData.id === 0){
//     //             actService.add(actData, function(err, row) {
//     //               return  callback(err, row)
//     //             });
//     //         } else {
//     //             actService.update(actData, { id: actData.id }, function(err, row) {
//     //                return callback(err, row);
//     //             });
//     //         }
//     //     }
//     // ], function(err, results) {
//     //     if(err){
//     //         logService.log(req, '服务器出错，发布活动失败:'+ err.message);
//     //         // 移除发布失败的目录
//     //         actData.id == 0 && child_process.spawn('rm', ['-rf', actPublishPath]); 
//     //         return res.status(500).end();
//     //     }

//     //     // 移除临时目录
//     //     child_process.spawn('rm', ['-rf', path.join(__dirname, '../../../temp', req.body.timeId)]); 
//     //     return res.status(200).json({ code: 'SUCCESS', msg:'发布活动成功' });
//     // });
// }