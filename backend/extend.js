function extend(subClass, superClass){
	// 1、子类原型类属性 等于 父类原型类属性
	// 初始化一个中间空对象，以转换主父类关系
	var F = function() {};
	F.prototype = superClass.prototype;

	// 2、让子类集成F
	subClass.prototype = new F();
	subClass.prototype.constructor = subClass;

	// 3、为子类添加superClass 属性
	subClass.superClass = superClass.prototype;

	// 4、增加一个保险，即使你的原型类是超类(Object),也要把你的构造函数的级别降下来
	if(superClass.prototype.constructor === Object.prototype.constructor){
		superClass.prototype.constructor = superClass;
	}
}