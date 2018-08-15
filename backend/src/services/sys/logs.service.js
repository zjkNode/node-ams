var async = require('async'),
    _ = require('lodash'),
    mysql = require('../../lib/mysqldb.lib.js'),
    logger = require('../../lib/logger.lib'),
    logsModel = require('../../models/sys/logs.model');

const { DBError } = require('../../models/errors.model');

//添加;
exports.log = function (req,content) {
    var userName = req.session.user;
    var logsInfo = {
        content: _.isString(content) ? content : JSON.stringify(content),
        url: req.originalUrl,
        ip: req.ip.substring(7),
        username: userName ? userName.nickname : ''
    }
    logsModel.auto(logsInfo);
    
    mysql.insert(logsModel.tbname, logsInfo, function (err, resId) {
        if (err) {
            logger.errorDB(__filename, err);
        }
    });
};

exports.lists = function (where, page, callback) {
    // 并行无关联
    async.parallel({
        total: function (callback) {
            mysql.where(where).count(logsModel.tbname, function (err, res) {
                callback(err, res); // res 将被赋值 total
            });
        },
        lists: function (callback) {
            mysql.where(where)
                .order({id: 'desc'})
                .limit(page.index, page.size)
                .select(logsModel.tbname, function (err, rows) {
                    callback(err, rows);
                });
        }
    }, function (error, results) {
        // 以上并行操作，任何一个出错，就会进error 并终止拉下来的操作
        // results.total,results.lists
        if (error) {
            logger.errorDB(__filename, error);
            return callback(new DBError());
        }
        let resData = {
            total: results.total || 0,
            pageIndex: page.index,
            pageSize: page.size,
            lists: results.lists || []
        }

        return callback(null, resData);
    });
}