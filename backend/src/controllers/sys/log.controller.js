/**
 *  log controller
 *  createby zjk
 */
var async = require('async'),
    logModel = require('../../models/sys/log.model'),
    logService = require('../../services/sys/log.service');

exports.list = function (req, res) {
    let where = {};
    let searchKey = req.query.keys;
    let page = {
        index: parseInt(req.query.pageIndex),
        size: parseInt(req.query.pageSize)
    }
    if (searchKey) {
        where._complex = {
            _logic: 'or',
            url: ['like', searchKey],
            username: ['like', searchKey],
        }
    }
    logService.list(where, page, function (err, result) {
        if(err){
            logService.log(req, '服务器出错，更新配置失败');
            return res.status(err.constructor.status).json(err);
        }
        return res.status(200).json({ code: 'SUCCESS', data: result });
    });
}
