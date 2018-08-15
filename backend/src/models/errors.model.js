
const ComError = function(code, message){
	this.code = code;
	this.msg = message;
}
ComError.status = 400;


const ValidationError = function(param, message, value){
	ComError.call(this, 'VALIDATE_FAILED', message);
	this.param = param;
	this.value = value;
	return this;
}
ValidationError.status = 430;


const DBError = function(){
	ComError.call(this, 'SQL_EXEC_FAILED', '数据操作异常');
	return this;
}
DBError.status = 440;

const AuthError = function(message){
	ComError.call(this, 'NO_AUTH', message || '你没有权限使用此功能');
	return this;
}
AuthError.status = 401; 

module.exports = {
	 ComError, ValidationError, DBError, AuthError
}