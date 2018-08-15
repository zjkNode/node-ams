/**
 *  活动初始化环境：
 *  主要是创建活动模板存放路径的软连接
 *  原因：1、服务器每次发布backend 会把所有不在 git 里的文件及文件夹删除
 *       2、模板引擎 nunjucks 系统设置默认模板目录为： src/themes 包含jdjk官网 合同模板 活动母板
 *
 */

let path = require('path'),
	fs = require('fs'),
	util = require('../lib/utils'),
    CONSTANTS = require('../config/constants.config');

module.exports.init = function() {
	tempDirLink();
	actCompDirLink();
	
}

// 组件因为每次发布会从Git上拉取代码，组件会丢失，所以软连接到某个公共目录
let actCompDirLink = function(){
	let actCompDist = path.join(__dirname, '../../src/themes', CONSTANTS.ACT_COMPONENTS_PATH);
	let actCompSrc = '/www/nodecms/static-act-comps';
	if(process.env.NODE_ENV == 'dev'){
		actCompSrc = path.join(__dirname, '../../', actCompSrc);
	}
	util.mkdirsSync(actCompSrc);
	// 异步操作，不影响程序执行时间
	fs.access(actCompDist,(err) => {
		if(err){
			if(err.code == 'ENOENT'){
				fs.symlinkSync(actCompSrc,actCompDist);
				return;
			}
			console.log(err);
		}
	});
	// 同步操作
	// if(!fs.existsSync(actTplDist)){
	// 	console.log(`ln -s ${actTplSrc} ${actTplDist}`);	
	// 	child_process.spawn('ln', ['-s', actTplSrc, actTplDist]);
	// }
}

let tempDirLink = function(){
	let tempDist = path.join(__dirname, '../../temp');
	let tempSrc = '/www/nodecms/static-temp';
	if(process.env.NODE_ENV == 'dev'){
		tempSrc = path.join(__dirname, '../../', tempSrc);
	}
	util.mkdirsSync(tempSrc);
	// 异步操作，不影响程序执行时间
	fs.access(tempDist,(err) => {
		if(err){
			if(err.code == 'ENOENT'){
				fs.symlinkSync(tempSrc,tempDist);
				return;
			}
			console.log(err);
		}
	});
}