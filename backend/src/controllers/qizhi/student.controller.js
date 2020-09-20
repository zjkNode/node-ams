/**
 *  qizhi student controller
 *  createby zjk
 */
let async = require('async'),
	utils = require('../../lib/utils'),
	logger = require('../../lib/logger.lib'),
	studentModel = require('../../models/qizhi/student.model'),
	studentService = require('../../services/qizhi/student.service'),
	logService = require('../../services/sys/log.service');

const { ComError, ValidationError} = require('../../models/errors.model');


exports.add = function (req, res) {
	req.checkBody(studentModel.validation);
	let vErrors = req.validationErrors();
	if(vErrors) {
		logger.error(__filename, '参数验证失败', vErrors);
		return res.status(ValidationError.status).json(vErrors);
	}

	let student = Object.assign({}, req.body);
	studentModel.auto(student);
	console.log(student);
	studentService.add(student, function(err, resId) {
		if(err){
			logService.log(req, '服务器出错，新增失败', student);
      return res.status(err.constructor.status).json(err);
		}
		// student.id = resId;
		return res.status(200).json({ code: 'SUCCESS', msg:'新增成功'});
	});
}

exports.update = function(req, res) {
	req.checkParams({
	  'id': { isNotEmpty: { options: [true], errorMessage: '学员id 不能为空' }}
	});
	req.checkBody(studentModel.validation);

	let vErrors = req.validationErrors();
	if(vErrors) {
		logger.error(__filename, '参数验证失败', vErrors);
		return res.status(ValidationError.status).json(vErrors);
	}
	let map = {
		id: parseInt(req.params.id)
	};
	let student = Object.assign({}, req.body, map);
	studentModel.auto(student);
	studentService.update(student, map, function(err){
		if(err){
			logService.log(req, '服务器出错，更新失败', user);
      return res.status(err.constructor.status).json(err);
		}
		return res.status(200).json({code:'SUCCESS', msg:'更新成功'});
	});
}

exports.delete = function(req, res){
	req.checkParams({
		'id': { isNotEmpty: { errorMessage: '学员id 不能为空'}}
	});

	let vErrors = req.validationErrors();
	if(vErrors) {
		logger.error(__filename, '参数验证失败', vErrors);
		return res.status(ValidationError.status).json(vErrors);
	}
	let map = {
		id: parseInt(req.params.id)
	};
	studentService.delete(map, function(err){
		if(err){
			logService.log(req, '服务器出错，删除失败', map);
      return res.status(err.constructor.status).json(err);
		}
		return res.status(200).json({code:'SUCCESS', msg:'删除成功'});
	});
}

exports.list = function(req, res) {
	let where = {};
	let searchKey = req.query.keys;
	let page = {
		index: parseInt(req.query.pageIndex),
		size: parseInt(req.query.pageSize)
	};
	if(searchKey){
		where._complex = {
			_logic: 'or',
			name: ['like', searchKey],
			phone: ['like', searchKey],
		};
	}
	studentService.list(where, page, function(error, result){
		if(error){
			logService.log(req, '服务器出错，获取学员列表失败', where);
      return res.status(error.constructor.status).json(error);
		}
		return res.status(200).json({ code: 'SUCCESS', data: result });
	});
}