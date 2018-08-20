var utils = require('../../lib/utils'),
	pwdModel = require('../../models/sys/pwd.model'),
	userService = require('../../services/sys/user.service'),
	logService = require('../../services/sys/log.service');
const { ComError, ValidationError, DBError} = require('../../models/errors.model');

exports.update = function(req,res) {
	req.checkParams({
	    'id': { isNotEmpty: { errorMessage: '用户id 不能为空' }
	    }
	  });
	req.checkBody(pwdModel.validation);

	let vErrors = req.validationErrors();
    if(vErrors) {
        logger.error(__filename, '参数验证失败', vErrors);
        return res.status(ValidationError.status).json(vErrors);
    }
	var map = {
		id: parseInt(req.params.id)
	};
	var user = {
		id: parseInt(req.params.id),
		email:req.body.email,
		nickname:req.body.nickname,
        password: utils.decrypt(req.body.password),
        depid: req.body.depid,
		roleid: parseInt(req.body.roleid),
		status: parseInt(req.body.status),
        phone:req.body.phone || ''
    }
    pwdModel.auto(user);

	userService.update(user, map, function(err){
		if(err){
			logService.log(req, '服务器出错，修改用户信息失败');
			let status = err.constructor.status;
            return res.status(status).json(err);
		}
        req.session.user = user;
		return res.status(200).json({code:'SUCCESS', msg:'修改用户信息成功'});
	});
};

exports.userInfo = function(req,res){
    return res.status(200).json({ 
        code: 'SUCCESS',
        data:req.session.user, 
        msg:'获取信息成功'
    });
};