var async = require('async'),
    utils = require('../../lib/utils'),
    _ = require('lodash'),
    moment = require("moment"),
    activeModel = require('../../models/plugin/active.model.js'),
    activeService = require('../../services/plugin/active.service.js');
	userService = require('../../services/sys/user.service');
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
    let activeInfo = Object.assign(req.body);
    console.log(activeInfo)
    async.waterfall([
        function(callback){
            let where = {
                email: activeInfo.phone
            }
            userService.one(where, function(error, user){
				return callback(error, user);
            });
        },
        function(user, callback){
            if(user){
                return callback(null, user.id);
            }
            let userInfo = {
                email: activeInfo.phone,
                password: utils.decrypt(activeInfo.password),
                nickname: activeInfo.phone,
                depids:'2',
                roleids:'1',
                phone: activeInfo.phone,
                status:CONSTANTS.USER_STATUS.VALID,
                create_time: utils.dateFormat()
            }
            userService.add(userInfo, function(error, resId){
                return callback(error, resId);
            });
        },
        function(userId, callback){
            activeInfo.code = randomCode(5, userId);
            activeInfo.uid = userId;
            activeInfo.user_id = req.session.user.id;
            activeModel.auto(activeInfo);
            activeService.add(activeInfo, function(error, resId){
                activeInfo.id = resId;
                return callback(error, activeInfo);
            })
        }
    ], function(err, result){
        if(err){
            logService.log(req, '服务器出错，新增激活码失败', result);
            return res.status(err.constructor.status).json(err);
        }
        logService.log(req, '新增新增激活码成功', result);
        return res.status(200).json({ code: 'SUCCESS', msg:'新增新增激活码成功'});
    });
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
        'id': { isNotEmpty: {  errorMessage: '激活码id 不能为空'}
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
			logService.log(req, '服务器出错，删除激活码失败: '+ err.msg, where);
    		return res.status(err.constructor.status).json(err);
		}
		logService.log(req, '删除激活码成功', where);
		return res.status(200).json({code:'SUCCESS', msg:'删除激活码成功'});
	});
}

exports.pay = function(req, res){
    return res.status(200).json({code:'SUCCESS', data: 'tokenStr', msg:'激活成功'});
}

exports.one = function(req, res){
    let tokenStr = utils.decrypt(req.body.token);
    let [phone, code] = tokenStr.split('_');

    let where = {
        phone: phone,
        code: code
    }
    activeService.one(where, function(err, row){
        if(err){
			logService.log(req, '服务器出错，获取插件激活状态失败: '+ err.msg, where);
    		return res.status(err.constructor.status).json(err);
        }
        let data = {
            tokenStr: utils.encrypt(row.phone + '_' + row.code),
            start_time: utils.dateFormat(row.start_time, 'YYYY-MM-DD'),
            end_time: utils.dateFormat(row.end_time, 'YYYY-MM-DD'),
            status: row.status,
        };
		return res.status(200).json({code:'SUCCESS', data: data, msg:'获取插件状态成功'});
    })
}

exports.active = function(req, res){
    let recordInfo = Object.assign({}, req.body);
    async.auto({
        activeModel: (callback) => {
            // 检查 code 是否存在，
            let where = {
                code: recordInfo.code
            };
            activeService.one(where, (err, row) => {
                return callback(err, row);
            })
            // 未激活，更新状态为状态，并生成起止时间，已激活不做处理
        },
        updateStatus:['activeModel', (results,callback) => {
            // 已激活 不做处理
            if(results.activeModel.status !== CONSTANTS.BLOCK_ACTIVE_STATUS.UNACTIVE){
                return callback();
            }
            // 未激活 更新激活状态，并生成起止时间
            let data = Object.assign({}, results.activeModel);
            data.status = CONSTANTS.BLOCK_ACTIVE_STATUS.VALID;
            data.start_time = utils.dateFormat(moment());
            data.end_time = utils.dateFormat(moment().add(data.period || 1, 'M'));
            activeModel.auto(data);
            activeService.update(data,{ id: data.id }, (err, resId) => {
                return callback(err,resId)
            })
        }],
        addRecord:['activeModel', (results, callback) => {
            recordInfo.create_time = utils.dateFormat(moment());
            activeService.addActiveRecord(recordInfo, (err, recordId) => {
                return callback(err, recordId)
            })
        }]
    }, (err, results) => {
        if(err){
			logService.log(req, '服务器出错，激活失败: '+ err.msg, where);
    		return res.status(err.constructor.status).json(err);
		}
        logService.log(req, '激活成功');
        let data = {
            tokenStr: utils.encrypt(results.activeModel.phone + '_' + results.activeModel.code),
            start_time: utils.dateFormat(results.activeModel.start_time, 'YYYY-MM-DD'),
            end_time: utils.dateFormat(results.activeModel.end_time, 'YYYY-MM-DD'),
            status: results.activeModel.status,
        };
		return res.status(200).json({code:'SUCCESS', data: data, msg:'激活成功'});
    })
}



// 生成随机码
function randomCode(length = 5, suffix = ''){
    var data = ["0", "1", "2", "3", "4", "5", "6", "7", "8", "9", "A", "B", "C", "D", "E", "F", "G", "H", "I", "J", "K", "L", "M", "N", "O", "P", "Q", "R", "S", "T", "U", "V", "W", "X", "Y", "Z", "a", "b", "c", "d", "e", "f", "g", "h", "i", "j", "k", "l", "m", "n", "o", "p", "q", "r", "s", "t", "u", "v", "w", "x", "y", "z"];
    var nums = "";
    for (var i = 0; i < length; i++) {
        var r = parseInt(Math.random() * 61);
        nums += data[r];
    }
    if(suffix){
        suffix = _.padStart(suffix, 3,'0');
    }
    return nums+suffix;
}

