

class BaseService {

	constructor(props) {

	}

	get tbname() {
		return '';
	}

	_beforeAdd(){
		console.log('baseService._beforeAdd');
	}

	add(data){
		return new Promise((resolve, reject) => {
			this._beforeAdd();
			console.log(data);
			if(data.phone){
				resolve({code:'Success'});

			}

			reject({code:'failed'});
		});
	}

	delete(){

	}

	update(){

	}
}
// exports.BaseService = baseService;
// 等价于：
// module.exports = {
// 	baseService
// }
// 引入 方式：
// let {BaseService} = require('./base.service');

// module.exports 是一个对象
// exports 是指向 module.exports的一个引用

// https://www.imooc.com/article/34483#

module.exports = BaseService;
