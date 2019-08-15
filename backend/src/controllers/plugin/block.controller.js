var async = require('async'),
    utils = require('../../lib/utils'),
    moment = require("moment"),
    blockModel = require('../../models/plugin/block.model.js'),
    blockService = require('../../services/plugin/block.service.js');
    activeService = require('../../services/plugin/active.service.js');
    logService = require('../../services/sys/log.service');

let CONSTANTS = require('../../config/constants.config');
const { ComError, ValidationError} = require('../../models/errors.model');

exports.rules = function (req, res) {
    let curUser = req.session.user;
    blockService.rules({ user_id: curUser.id }, function(err, rows){
        return res.status(200).json({ code: 'SUCCESS', data: rows, msg:'' });
    });
}

exports.add = function(req, res){
    let rule = Object.assign({}, req.body);
    rule.user_id = req.session.user.id;
    blockModel.auto(rule);
    async.waterfall([
        function(callback){
            let where = {
                user_id: req.session.user.id,
                name: rule.name
            };
            blockService.one(where, function(err, row){
                return callback(err, !!row);
            })
        },
        function(isExist, callback){
            if(isExist){
                return callback(new ComError('RULE_EXIST_ERROR', '规则名称已存在'))
            }
            blockService.add(rule, function(err, resId) {
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
    blockModel.auto(rule);

    async.waterfall([function(callback){
        let cond = {
            user_id: req.session.user.id
        }
        let param = {
            status: CONSTANTS.BLOCK_RULE_STATUS.INVALID
        }
        blockService.update(param,cond, function(err, resId){
            return callback(err)
        })
    },function(callback){
        blockService.update(rule, where, function(err, resId) {
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
	blockService.delete(where, function(err, callback){
		if(err){
			logService.log(req, '服务器出错，删除规则失败: '+ err.msg, where);
    		return res.status(err.constructor.status).json(err);
		}
		logService.log(req, '删除规则成功', where);
		return res.status(200).json({code:'SUCCESS', msg:'删除规则成功'});
	});
}

exports.one = function(req, res){
    console.log(req.body.token)
    let tokenStr = utils.decrypt(req.body.token);
    console.log(tokenStr)
    if(!tokenStr){
        return res.status(ComError.status).json({code:'FAILED', msg:'token 为空'});
    }
    let [phone, code] = tokenStr.split('_');

    async.waterfall([
        function(callback){
            let where = {
                phone: phone,
                code: code
            }
            activeService.one(where, function(err, row){
                if(err){
                    return callback(err);
                }
                if(row.status === CONSTANTS.BLOCK_ACTIVE_STATUS.INVAILD || moment() > moment(row.end_time)){
                    return callback(new ComError('CODE_INVAILD','激活码已失效'));
                }
                return callback(null, row);
            })
        },
        function(activeData, callback){
            let where = {
                user_id:activeData.uid,
                status: CONSTANTS.BLOCK_RULE_STATUS.VALID
            }
            blockService.one(where, function(err, row){
                return callback(err, row);
            })
        }
    ], function(error, result){
        if(error){
			logService.log(req, '服务器出错，获取规则失败: '+ error.msg);
    		return res.status(error.constructor.status).json(error);
        }
        logService.log(req, '获取规则成功');
		return res.status(200).json({code:'SUCCESS', data: result, msg:'获取规则成功'});
    })
}