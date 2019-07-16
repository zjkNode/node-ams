
const logger = require('../../lib/logger.lib'),
			mysql = require('../../lib/mysqldb.lib'),
	 		{ ComError, ValidationError} = require('../../models/errors.model');

class BaseController {

	constructor(props) {
		// BaseController 只能被继承之后调用
		if(new.target === BaseController){
			throw new Error("BaseController can't be new")
		}
	}

	// 简单单例模式 接口，必须实现的
	get service() {
		let controllerName = this.constructor.name;
		console.log( controllerName +' attribute "service" is not implement');
		return null;
	}

	// get bodyValidation(){
	// 	return {};
	// }


	add(req, res){
		req.checkBody(this.bodyValidation);
    let vErrors = req.validationErrors();
    if(vErrors) {
        logger.error(__filename, '参数验证失败', vErrors);
        return res.status(ValidationError.status).json(vErrors);
    }
    let data = Object.assign({}, req.body);
    // this._before_add(data);
    // mysql.insert(this.tbname, data, function(err, resData){
    // 	if(err){
    // 		logger.errorDB(__filename, err);
    //     return callback(new DBError());
    // 	}
    // });



		this.service.add(req.body).then(response => {
    	console.log(response);
    	return res.status(200).json(response);
    }).catch(err => {
    	console.log(err);
    	return res.status(500).json(err);
    });
	}


	// 静态方法，修改 方法内this指向
	// 效果等同于在 contructor 中：this.add = this.add.bind(this);
	static selfish (target) {
	  const cache = new WeakMap();
	  const handler = {
	    get (target, key) {
	      const value = Reflect.get(target, key);
	      if (typeof value !== 'function') {
	        return value;
	      }
	      if (!cache.has(value)) {
	        cache.set(value, value.bind(target));
	      }
	      return cache.get(value);
	    }
	  };
	  const proxy = new Proxy(target, handler);
	  return proxy;
	}
}


module.exports = BaseController;