let OSS = require('ali-oss'),
    path = require('path'),
    util = require('./utils'),
    config = require('../config/config');



function OSSClient(ossEnv, bucketKey){
    var ossConf = '';
    if(ossEnv.toUpperCase() == 'PRODUCT'){
        ossConf = config.ossConfig;
    } else {
        ossConf = config.ossTestConfig
    }
    let client = new OSS.Wrapper({
        region: ossConf.region,
        accessKeyId: ossConf.accessKeyId,
        accessKeySecret: ossConf.accessKeySecret,
        bucket: ossConf[bucketKey]
    });
    
    this.upload = function(ossObjKey, localFile, callback){
        client.put(ossObjKey, localFile).then(res => {
            console.log(res.url)
            if(callback){
                return callback(res.url);
            }
        }).catch( err => {
            console.log(file);
            console.log('error: %j', err);
        });
    }

    this.delete = function(ossObjKey){
        client.delete(ossObjKey).then(res => {
            // console.log('oss delete')
            // console.log(res)
        }).catch(err => {
            console.log('oss delete error')
            console.log(err);
        })
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



// exports.upload = function (file, callback) {
//     let objKey = util.uuid() + '.jpg';
//     client.put('supermarket/product/' + objKey, file)
//         .then((res)=> {
//             return callback(null, res.url);
//         }).catch((err)=> {
//         console.log('error: %j', err)
//     });
// }

// exports.upload = function(file, callback){
// 	let objKey = util.uuid();
// 	return client.multipartUpload(objKey, file).then(function (res) {
// 	    return callback(null, res.res);
// 	  }).then((err)=>{
// 	  	return callback(err);
// 	  });
// }
