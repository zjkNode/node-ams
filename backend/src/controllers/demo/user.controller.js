
// let  UserService  = require('../../services/youzhu/user.service.js');

// exports.add = function (req, res) {
//     let service = new UserService();
//     service.add(req.body).then(response => {
//     	console.log(response);
//     	return res.status(200).json(response);
//     }).catch(err => {
//     	console.log(err);
//     	return res.status(500).json(err);
//     });
// }



let UserService  = require('./user.service.js');
let BaseController = require('./base.controller');

class UserController extends BaseController {

	constructor(props) {
	  super(props);
	}

	get service(){
		if(!this._service){
			this._service = new UserService();
		}
		return this._service;
	}

	// get bodyValidation(){
	// 	return {
	// 		'phone': {
 //        isNotEmpty: { errorMessage: '手机号不能为空' }
	//     }
	// 	};
	// }
	
}



module.exports = UserController.selfish(new UserController());