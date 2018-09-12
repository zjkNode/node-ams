
/**
 * 系统常量定义
 *
 **/
module.exports = {
	// 系统管理
	ADMINISTRATOR_USERS:[1], // 超级管理员Id集合，此集合的用户，具有系统所有权限
	CONFIG_STATUS: { VALID: 1, INVALID: 2 },   // 配置状态 1有效  2无效
	CONFIG_TYPES: { NORMAL: 'normal', AUTH_DATA:'authData', AUTH_ACTION:'authAction' },
	RULE_STATUS: { VALID: 1, INVALID: 2 },   // 系统功能配置状态 1有效  2无效
	USER_STATUS: { AVAILABLE:1, DISABLED:2 }, // 用户状态：1有效   2停用
	DEP_STATUS: { NORMAL: 1, DISABLED: 2 }, // 部门状态：1正常 2停用
	MENUS_STATUS: { VALID:1, INVAILD:2 }, // 菜单状态 1可见  2不可见
	
}