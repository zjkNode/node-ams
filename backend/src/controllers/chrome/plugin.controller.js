var async = require('async'),
    contractModel = require('../../models/chrome/plugin.model.js'),
    configService = require('../../services/chrome/plugin.service.js');
    logService = require('../../services/sys/log.service');

exports.list = function (req, res) {
    let curUser = req.session.user;
    configService.list({ }, function(err, rows){
        return res.status(200).json({ code: 'SUCCESS', data:rows, msg:'' });
    });
}