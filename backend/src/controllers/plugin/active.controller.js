var async = require('async'),
    utils = require('../../lib/utils'),
    moment = require("moment"),
    activeModel = require('../../models/plugin/active.model.js'),
    activeService = require('../../services/plugin/active.service.js');
    logService = require('../../services/sys/log.service');

let CONSTANTS = require('../../config/constants.config');
const { ComError, ValidationError} = require('../../models/errors.model');

exports.list = function (req, res) {
    let curUser = req.session.user;
    activeService.list({ user_id: curUser.id }, function(err, rows){
        return res.status(200).json({ code: 'SUCCESS', data: rows, msg:'' });
    });
}

exports.add = function(req, res){
    let rule = Object.assign({}, req.body);
    rule.user_id = req.session.user.id;
    activeModel.auto(rule);
    async.waterfall([
        function(callback){
            let where = {
                user_id: req.session.user.id,
                name: rule.name
            };
            activeService.one(where, function(err, row){
                return callback(err, !!row);
            })
        },
        function(isExist, callback){
            if(isExist){
                return callback(new ComError('RULE_EXIST_ERROR', '规则名称已存在'))
            }
            activeService.add(rule, function(err, resId) {
                return callback(err, resId);
            });
        }
    ], function(err,result){
        if(err){
            logService.log(req, '服务器出错，新增chrome屏蔽规则失败', rule);
            return res.status(err.constructor.status).json(err);
        }
        rule.id = result;
        logService.log(req, '新增chrome屏蔽规则成功', rule);
        return res.status(200).json({ code: 'SUCCESS', msg:'新增chrome屏蔽规则成功'});
    })
}

exports.update = function(req, res){
    let where = {
        id: parseInt(req.params.id)
    };
    let rule = Object.assign({}, req.body, where);
    activeModel.auto(rule);

    async.waterfall([function(callback){
        let cond = {
            user_id: req.session.user.id
        }
        let param = {
            status: CONSTANTS.BLOCK_RULE_STATUS.INVALID
        }
        activeService.update(param,cond, function(err, resId){
            return callback(err)
        })
    },function(callback){
        activeService.update(rule, where, function(err, resId) {
            return callback(err);
        });
    }], function(err, result){
        if(err){
			logService.log(req, '服务器出错，更新chrome屏蔽规则失败', rule);
        	return res.status(err.constructor.status).json(err);
		}
		logService.log(req, '更新chrome屏蔽规则成功', rule);
		return res.status(200).json({ code: 'SUCCESS', msg:'更新chrome屏蔽规则成功'});
    })
}

exports.delete = function(req, res){
    req.checkParams({
        'id': { isNotEmpty: {  errorMessage: '规则id 不能为空'}
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
	activeService.delete(where, function(err, callback){
		if(err){
			logService.log(req, '服务器出错，删除规则失败: '+ err.msg, where);
    		return res.status(err.constructor.status).json(err);
		}
		logService.log(req, '删除规则成功', where);
		return res.status(200).json({code:'SUCCESS', msg:'删除规则成功'});
	});
}

exports.one = function(req, res){
    let where = {
        user_id: 1,
        status: CONSTANTS.BLOCK_RULE_STATUS.VALID
    }
    activeService.one(where, function(err, row){
        if(err){
			logService.log(req, '服务器出错，获取规则失败: '+ err.msg, where);
    		return res.status(err.constructor.status).json(err);
		}
		logService.log(req, '获取规则成功', where);
		return res.status(200).json({code:'SUCCESS', data: row, msg:'获取规则成功'});
    })
}

exports.active = function(req, res){
    
    async.auto({
        activeModel: (callback) => {
            // 检查 code 是否存在，
            let where = {
                code: req.body.code
            };
            activeService.one(where, (err, row) => {
                if(err) return callback(err);

                if(row.status === CONSTANTS.BLOCK_ACTIVE_STATUS.UNACTIVE){
                    row
                }
                    
                return callback(err, row);
            })
            // 未激活，更新状态为状态，并生成起止时间，已激活不做处理
        },
        updateStatus:['activeModel', (results,callback) => {
            if(results.activeModel.status !== CONSTANTS.BLOCK_ACTIVE_STATUS.UNACTIVE){
                return callback();
            }
            let data = Object.assign({}, results.activeModel);
            data.status = CONSTANTS.BLOCK_ACTIVE_STATUS.VALID;
            data.start_time = utils.dateFormat(moment());
            data.end_time = utils.dateFormat(moment().add(data.period, 'M'));
            activeModel.auto(data);
            activeService.update(data,{ id: data.id }, (err, resId) => {
                return callback(err,resId)
            })
        }],
        addRecord:['activeModel', (results, callback) => {
            
        }]
    }, (err, results) => {
        if(err){
			logService.log(req, '服务器出错，激活失败: '+ err.msg, where);
    		return res.status(err.constructor.status).json(err);
		}
        logService.log(req, '激活成功', where);
        let tokenStr = results.activeModel.phone + '_' + results.activeModel.code;
		return res.status(200).json({code:'SUCCESS', data:'', msg:'激活成功'});
    })

    return res.status(200).json({ code: 'SUCCESS', data: req.body, msg:'' });
}