
/**
 * 系统常量定义
 *
 **/
module.exports = {
	// 系统管理
	ADMINISTRATOR_USERS:[1], // 超级管理员Id集合，此集合的用户，具有系统所有权限
	CONFIG_STATUS: { VALID: 1, INVALID: 2 },   // 配置状态 1有效  2无效
	USER_STATUS: { VALID:1, INVALID:2 }, // 用户状态：1正常   2停用
	DEP_STATUS: { VALID: 1, INVALID: 2 }, // 部门状态：1正常 2停用
	MENUS_STATUS: { VALID:1, INVAILD:2 }, // 菜单状态 1可见  2不可见
	
	// 合同管理
	CONTRACT_STATUS: {TEST: 1, ONLINE: 2, OFFLINE: 3, UPDATE:4},// 合同内容状态 1草稿 2上线 3下线 4已更新
	CONTRACT_TYPE_STATUS: {VALID: 1, INVALID: 2},// 合同类型状态 1有效  2无效
	CONTRACTS_VM: {VALID: 1, INVALID: 2},// 合同占位符状态 1有效  2无效

	// 附件管理
	FILE_TYPE_STATUS: { VALID: 1, INVALID: 2 }, // 附件类型状态：1有效 2无效

	// 活动管理
	ACT_STATUS: { DRAFT: 1, ONLINE: 2, MODIFY: 3, OFFLINE: 4, TEST:5, DELETED:6}, //活动: 1草稿 2上线 3修改 4下线, 5测试环境, 6已删除
	
	// banner管理
	BANNER_STATUS:{ONLINE: 1, OFFLINE: 2}, // APP Banner 状态： 1、上架   2、下架

	BLOCK_RULE_STATUS: { VALID: 1, INVALID: 2 }, // chrome屏蔽插件规则状态：1正常 2停用
	BLOCK_ACTIVE_STATUS: { VALID: 1, UNACTIVE: 2, INVAILD: 3}, // 激活码状态：1有效  2未激活 3已失效

	PUBLISH_PATH: '/www/nodesystem', // 相对操作系统根目录路径
	ACT_COMPONENTS_PATH: 'activity/components',
}