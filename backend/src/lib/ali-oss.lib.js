let OSS = require('ali-oss'),
    path = require('path'),
    util = require('./utils'),
    logger = require('./logger.lib'),
    config = require('../config/config');

function OSSClient(ossConf, bucketKey){
    // ossConf = {
    //     region: 'oss-cn-beijing',
    //     accessKeyId: 'I72OyW8Akz0jqSf1',
    //     accessKeySecret: 'Y7zVRneL6coe94zjReki0HR3UZ28nO',
    //     bucket: 'static-act-test'
    // }
    let defaultConf = {
        region: 'oss-cn-beijing'
    };
    let client = new OSS(Object.assign({}, defaultConf, ossConf));
    
    this.upload = function(ossObjKey, localFile){
        client.put(ossObjKey, localFile).then(res => {
            // logger.info(localFile +' ====> '+ ossObjKey);
            // logger.info(res.url);
        }).catch( err => {
            logger.error(__filename, '上传oss文件失败: '+localFile, err);
        });
    }

    this.delete = function(ossObjKey){
        client.delete(ossObjKey).then(res => {
            // logger.info('oss delete success: '+ ossObjKey);
            // logger.info(res);
        }).catch(err => {
            logger.error(__filename, '删除oss文件失败', ossObjKey)
        });
    }

    this.list = function(qus,callback){
        client.list({
            prefix: 'hetrone'
        }).then(res => {
       //      res.objects = [{ name: 'xxz/test/1/img/01.png',
       // url: 'http://static-act-test.oss-cn-beijing.aliyuncs.com/xxz/test/1/img/01.png',
       // lastModified: '2018-03-22T09:34:54.000Z',
       // etag: '"D0554829C12CC0CEE4D86C6DE3F76C83"',
       // type: 'Normal',
       // size: 153790,
       // storageClass: 'Standard',
       // owner: [Object] }]

            // res.objects.forEach(item => {
            //     this.delete(item.name);
            // });
            console.log('oss list');
            // console.log(res);
            callback(res)
        }).catch( err => {
            console.log('oss err')
            console.log(err)
        })
    }
}

exports.Client = OSSClient;