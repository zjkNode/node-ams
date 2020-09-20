/**
 *  study_log controller
 *  createby zjk
 */
let async = require('async'),
	utils = require('../../lib/utils'),
	logger = require('../../lib/logger.lib'),
	studyModel = require('../../models/qizhi/study.model'),
	studyService = require('../../services/qizhi/study.service'),
	logService = require('../../services/sys/log.service');

const { ComError, ValidationError} = require('../../models/errors.model');

// exports.log = function(req, res) {
// 	req.checkQuery({
// 		'student': {
// 			isNotEmpty: { errorMessage: '学生信息不能为空'}
// 		}
// 	});
// 	let vErrors = req.validationErrors();
// 	if(vErrors) {
// 		logger.error(__filename, '参数验证失败', vErrors);
// 		return res.status(ValidationError.status).json(vErrors);
// 	}
// 	let studentArr = utils.decrypt(req.query.student.trim().replace(new RegExp(" ","gm"), '+')).split('_');
// 	var where = {
// 		student_id: parseInt(studentArr[0]),
// 		create_time: ['like', utils.dateFormat(null, "YYYY-MM-DD")]
// 	};
// 	studyService.one(where, function(err, row) {
// 		if(err){
// 				logService.log(req, '服务器出错，查询学员打卡记录', where);
// 				return res.status(err.constructor.status).end(err);
// 		}
// 		return res.status(200).json({ code: 'SUCCESS', data: row});
// 	});
// }

exports.checkIn = function(req, res){
	req.checkBody({
		'student': {
	    isNotEmpty: { errorMessage: '学生信息不能为空' },
	  }
	});
	let vErrors = req.validationErrors();
	if(vErrors) {
		logger.error(__filename, '参数验证失败', vErrors);
		return res.status(ValidationError.status).json(vErrors);
	}
	let studentArr = utils.decrypt(req.body.student.replace(new RegExp(" ","gm"), '+')).split('_');
	let teacherArr = utils.decrypt(req.headers.authorization.split(' ')[1]).split('_');
	let study = {
		teacher_id: teacherArr[0],
		teacher_name: teacherArr[1],
		student_id: studentArr[0],
		student_name: studentArr[1]
	}
	studyModel.auto(study);

	async.waterfall([
		function(callback){
			let params = {
				student_id: studentArr[0],
				create_time: ['like', utils.dateFormat(null, "YYYY-MM-DD")]
			}
			studyService.one(params, function(error, studyInfo){
				if(error){
					return callback(error);
				}
				if(studyInfo){
					return callback(null, studyInfo);
				}
				return callback(null, null);
			});
		},
		function(studyInfo, callback){
			if(studyInfo){
				return callback(null, studyInfo);
			}
			studyService.add(study, function(err, resId) {
				if(err){
					return callback(err);
				}
				study.id = resId;
				return callback(null, study);
			});
		}
	], function(error, result){
		if(error){
			let param = {
				originalUrl: req.originalUrl,
				ip: req.ip,
				headers: req.headers,
				session:{
					user:{
						nickname: teacherArr[1]
					}
				}
			}
			logService.log(param, '打卡失败: '+ error.msg);
			return res.status(error.constructor.status).json(error);
		}
		return res.status(200).json({ code: 'SUCCESS', msg:'打卡成功', data: result});
	})
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

	studyService.list(where, page, function(error, result){
		if(error){
			logService.log(req, '服务器出错，获取用户列表失败', where);
      return res.status(error.constructor.status).json(error);
		}
		return res.status(200).json({ code: 'SUCCESS', data: result });
	});
}