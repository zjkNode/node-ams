
/**
 * 系统常量定义
 *
 **/
module.exports = {
	// 系统管理
	ADMINISTRATOR_USERS:[1], // 超级管理员Id集合，此集合的用户，具有系统所有权限
	CONFIG_STATUS: { VALID: 1, INVALID: 2 },   // 配置状态 1有效  2无效
	RULE_STATUS: { VALID: 1, INVALID: 2 },   // 系统功能配置状态 1有效  2无效
	USER_STATUS: { AVAILABLE:1, DISABLED:2 }, // 用户状态：1有效   2停用
	DEP_STATUS: { NORMAL: 1, DISABLED: 2 }, // 部门状态：1正常 2停用

	// 新闻管理
	NEWS_TYPE_STATUS:{ VALID: 1, INVALID: 2 }, // 新闻类型状态 1有效 2无效
	NEWS_STATUS: { PUBLISH: 1, WAITING: 2 },   // 新闻状态 1已发布  2未发布
	MENUS_STATUS: { VALID:1, INVAILD:2 }, // 菜单状态 1可见  2不可见
	
	// 合同管理
	CONTRACTS_STATUS: {PUBLISH: 1, WAITING: 2, RE_EDIT:3},// 合同内容状态 1已发布  2未发布 3编辑后待发布
	CONTRACTS_TYPE_STATUS: {VALID: 1, INVALID: 2},// 合同类型状态 1有效  2无效
	CONTRACTS_VM: {VALID: 1, INVALID: 2},// 合同占位符状态 1有效  2无效

	// 附件管理
	FILE_TYPE_STATUS: { NORMAL: 1, DISABLED: 2 }, // 附件类型状态：1有效 2无效

	// 活动管理
	ACT_STATUS: { DRAFT: 1, ONLINE: 2, MODIFY: 3, OFFLINE: 4, ONTEST:5}, //活动: 1草稿 2上线 3修改 4下线, 5测试环境
	ACT_TPL_STATUS: { VALID: 1, INVALID: 2 },  //活动模版: 1有效 2停用
	ACT_COMPONENTS_PATH: 'activity/components',
}