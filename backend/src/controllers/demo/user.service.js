
// let { baseService } = require('./base.service.js');
let  BaseService  = require('./base.service.js');

class UserService extends BaseService{
	
	get tbname(){
		return 'yz_user';
	}
	constructor(props) {
	  super(props);
	  console.log(' UserService.constructor')
	}

	_beforeAdd(){
		console.log('userService._beforeAdd');
		super._beforeAdd();
	}

}

// exports.UserService = userService;

module.exports = UserService;