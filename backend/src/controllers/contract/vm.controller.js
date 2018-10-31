/**
 *  contracts_vm controller
 *  createby zjk
 */
var async = require('async'),
    _ = require('lodash'),
    logger = require('../../lib/logger.lib'),
    vmModel = require('../../models/contract/vm.model'),
    vmService = require('../../services/contract/vm.service'),
    logService = require('../../services/sys/log.service');

const { ComError, ValidationError, DBError} = require('../../models/errors.model');

exports.add = function( req, res){
    req.checkBody(vmModel.validation);
    let vErrors = req.validationErrors();
    if(vErrors) {
        logger.error(__filename, '参数验证失败', vErrors);
        return res.status(ValidationError.status).json(vErrors);
    }
    var vm = {
        name:req.body.name,
        placeholder: req.body.placeholder,
        desc:req.body.desc || '',
        typeid:parseInt(req.body.typeid)
    };
    var where = {
        placeholder:vm.placeholder,
        typeid:vm.typeid
    };
    vmModel.auto(vm);
    async.waterfall([
        function(callback){
            vmService.isExist(where,function(err,isExist){
                callback(err,isExist);
            })
        },
        function(isExist,callback){
            if(isExist){
               return callback(null,{ code: 'RELOAD', msg:'此占位符已经存在'});
            }
            vmService.add(vm,function(err){
                return callback(err,{ code: 'SUCCESS', msg:'新增占位符成功'});
            });
        }
    ],function(err,result){
        if(err){
            logService.log(req, '服务器出错，新增占位符失败');
            return res.status(500).end(err);
        }
        return res.status(200).json(result);

    }) 
}

exports.delete = function(req,res){
    req.checkParams({
        'id': {
            notEmpty: { options: [true], errorMessage: 'id 不能为空'}
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
    vmService.delete(map, function(err){
        if(err){
			logService.log(req, '服务器出错，删除占位符失败');
			return res.status(500).end(err);
		}
		return res.status(200).json({code:'SUCCESS', msg:'删除占位符成功'});
    });
}

exports.update = function(req,res){
    req.checkParams({
        'id': {
            notEmpty: { options: [true], errorMessage: 'id 不能为空'}
        }
    });
    req.checkBody(vmModel.validation);
    let vErrors = req.validationErrors();
    if(vErrors) {
        logger.error(__filename, '参数验证失败', vErrors);
        return res.status(ValidationError.status).json(vErrors);
    }
    var map = {
        id: parseInt(req.params.id)
    };
    var vm = {
        id: parseInt(req.params.id),
        name:req.body.name,
        placeholder: req.body.placeholder,
        desc:req.body.desc || '',
        typeid: parseInt(req.body.typeid)
    };
    vmModel.auto(vm);
    let where = {
        placeholder: vm.placeholder,
        typeid:vm.typeid,
        id :['<>',vm.id]
    };
    vmModel.auto(vm);
    async.waterfall([
        function(callback){
            vmService.isExist(where,function(err,isExist){
               return callback(err,isExist);
            });
        },
        function(isExist,callback){
            console.log(isExist)
            if(isExist){
               return callback(null,{ code: 'RELOAD', msg:'此占位符已经存在'});
            }
            vmService.update(vm,map,function(err){
               return callback(err, { code: 'SUCCESS', msg:'更新成功'});
           });
        }
    ],function(err,result){
        if(err){
            logService.log(req, '服务器出错，更新失败');
            return res.status(500).end(err);
        }
        return res.status(200).json(result);
    })
}
exports.list = function(req,res) {
    var where = {};
    let searchKey = req.query.keys;
    let page = {
		index: parseInt(req.query.pageIndex),
		size: parseInt(req.query.pageSize)
    }
    if(searchKey){
        where._complex = {
            _logic: 'or',
            placeholder: ['like',searchKey],
            [vmModel.tbname+'.name']: ['like',searchKey]
        }
    }
    vmService.list(where,page, function(err, result){
        if(err){
         logService.log(req, '服务器出错，获取占位符列表失败');
         return res.status(500).end(err);
        }
        return res.status(200).json({
            code: 'SUCCESS',
            data: result,
            msg: ""
        });
    }); 
}