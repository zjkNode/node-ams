var async = require('async'),
    logger = require('../../lib/logger.lib'),
    logsModel = require('../../models/sys/logs.model'),
    logsService = require('../../services/sys/logs.service');

exports.getAllLogs = function (req, res) {
    var where = {
        // status:1
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
    logsService.lists(where, page, function (err, result) {
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
