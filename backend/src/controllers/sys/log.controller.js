var async = require('async'),
    logger = require('../../lib/logger.lib'),
    logModel = require('../../models/sys/log.model'),
    logService = require('../../services/sys/log.service');

exports.list = function (req, res) {
    var where = {
    };
    let searchKey = req.query.keys;
    let page = {
        index: parseInt(req.query.pageIndex),
        size: parseInt(req.query.pageSize)
    }
    if (searchKey) {
        where._complex = {
            _logic: 'or',
            content: ['like', searchKey],
            url: ['like', searchKey],
            username: ['like', searchKey],
        }
    }
    logService.list(where, page, function (err, result) {
        if(err){
            logService.log(req, '服务器出错，更新配置失败');
            let status = err.constructor.status;
            return res.status(status).json(err);
        }
        return res.status(200).json({
            code: 200,
            data: result,
            msg: ''
        });
    });
}
