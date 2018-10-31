/**
 *  log 表
 *  createBy zjk
 */
var async = require('async'),
    _ = require('lodash'),
    mysql = require('../../lib/mysqldb.lib.js'),
    logger = require('../../lib/logger.lib'),
    logModel = require('../../models/sys/log.model');

const { DBError } = require('../../models/errors.model');

//添加;
exports.log = function (req, msg, content) {
    let curUser = req.session.user;
    let log = {
        desc: msg || '',
        content: _.isString(content) ? content : JSON.stringify(content),
        'user_agent': req.headers['user_agent'],
        api: req.originalUrl,
        ip: req.ip.substring(7),
        uid: curUser.id || -1,
        uname: curUser.nickname
    }
    logModel.auto(log);
    
    mysql.insert(logModel.tbname, log, function (err, resId) {
        if (err) {
            logger.errorDB(__filename, err);
        }
    });
}

exports.list = function (where, page, callback) {
    // 并行无关联
    async.parallel({
        total: function (callback) {
            mysql.where(where).count(logModel.tbname, function (err, res) {
                return callback(err, res); // res 将被赋值 total
            });
        },
        list: function (callback) {
            mysql.where(where)
                .order({id: 'desc'})
                .limit(page.index, page.size)
                .select(logModel.tbname, function (err, rows) {
                    rows.forEach(row => {
                        row.url = _.unescape(row.url);
                        row.content = _.unescape(row.content);
                    });
                    return callback(err, rows);
                });
        }
    }, function (error, results) {
        // 以上并行操作，任何一个出错，就会进error 并终止拉下来的操作
        // results.total,results.list
        if (error) {
            logger.errorDB(__filename, error);
            return callback(new DBError());
        }
        let resData = {
            total: results.total || 0,
            pageIndex: page.index,
            pageSize: page.size,
            list: results.list || []
        }

        return callback(null, resData);
    });
}