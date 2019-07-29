/*
 Navicat Premium Data Transfer

 Source Server         : localhost
 Source Server Type    : MySQL
 Source Server Version : 50717
 Source Host           : 127.0.0.1
 Source Database       : node_ams

 Target Server Type    : MySQL
 Target Server Version : 50717
 File Encoding         : utf-8

 Date: 10/29/2018 18:28:25 PM
*/

SET FOREIGN_KEY_CHECKS = 0;

-- ----------------------------
--  Table structure for `block_rule`
-- ----------------------------
DROP TABLE IF EXISTS `block_rule`;
CREATE TABLE `block_rule` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `name` varchar(200) NOT NULL COMMENT '规则名称',
  `white_list` varchar(1024) NOT NULL DEFAULT '' COMMENT '白名单： 以,分隔',
  `black_list` varchar(1024) NOT NULL DEFAULT '' COMMENT '黑名单 以,分隔',
  `whiteable` tinyint(1) DEFAULT '0' COMMENT '白名单是否有效',
  `blackable` tinyint(1) DEFAULT '0' COMMENT '黑名单是否有效',
  `status` tinyint(4) NOT NULL DEFAULT '2' COMMENT '当前规则是否生效：1生效 2不生效  一个用户只有一个规则生效',
  `user_id` int(11) NOT NULL COMMENT '用户Id',
  `create_time` datetime DEFAULT NULL COMMENT '规则添加时间',
  `update_time` datetime DEFAULT NULL COMMENT '规则更新时间',
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COMMENT='chrome block 插件 规则 表';

-- ----------------------------
--  Table structure for `block_active`
-- ----------------------------
DROP TABLE IF EXISTS `block_active`;
CREATE TABLE `block_active` (
  `id` int(11) NOT NULL,
  `code` varchar(255) NOT NULL COMMENT '激活码',
  `uid` int(11) NOT NULL COMMENT '用户id',
  `phone` varchar(255) DEFAULT NULL COMMENT '用户手机号，登录帐号',
  `status` tinyint(4) NOT NULL DEFAULT '2' COMMENT '激活码状态：1有效  2未激活 3已失效',
  `client_num` int(11) DEFAULT NULL COMMENT '最大生效终端数',
  `start_time` datetime DEFAULT NULL COMMENT '有效期起始时间',
  `end_time` datetime DEFAULT NULL COMMENT '有效期截止时间',
  `user_id` int(11) NOT NULL COMMENT '添加人Id',
  `create_time` datetime DEFAULT NULL COMMENT '创建时间',
  `update_time` datetime DEFAULT NULL COMMENT '最后一次更新',
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COMMENT='chrome block 插件 激活码 表';

-- ----------------------------
--  Table structure for `block_active_record`
-- ----------------------------
DROP TABLE IF EXISTS `block_active_record`;
CREATE TABLE `block_active_record` (
  `id` int(11) NOT NULL,
  `code` varchar(255) NOT NULL COMMENT '激活码',
  `mac_addr` varchar(255) NOT NULL COMMENT '终端mac地址',
  `create_time` datetime DEFAULT NULL COMMENT '添加时间',
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COMMENT='插件激活记录表';

-- ----------------------------
--  Table structure for `block_pay_record`
-- ----------------------------
DROP TABLE IF EXISTS `block_pay_record`;
CREATE TABLE `block_pay_record` (
  `id` int(11) NOT NULL,
  `code` varchar(255) NOT NULL COMMENT '激活码',
  `payment` varchar(255) DEFAULT NULL COMMENT '支付金额',
  `periods` varchar(255) DEFAULT NULL COMMENT '周期，单位：月',
  `create_time` datetime DEFAULT NULL COMMENT '支付时间',
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

-- ----------------------------
--  Table structure for `act`
-- ----------------------------
DROP TABLE IF EXISTS `act`;
CREATE TABLE `act` (
  `id` int(11) NOT NULL AUTO_INCREMENT COMMENT '活动id',
  `name` varchar(100) NOT NULL COMMENT '活动名称',
  `code` varchar(50) NOT NULL COMMENT '活动代码：不可重复',
  `confid` int(11) DEFAULT NULL COMMENT '活动配置id',
  `uuid` varchar(50) DEFAULT NULL COMMENT '活动uuid',
  `url` varchar(200) DEFAULT NULL COMMENT '活动访问Url',
  `data` text COMMENT '活动页面数据，json 格式',
  `status` tinyint(4) NOT NULL DEFAULT '1' COMMENT '活动: 1草稿 2上线 3修改 4下线, 5测试, 6已删除',
  `components` varchar(100) DEFAULT NULL COMMENT '活动引用组件集合，以逗号分隔',
  `extend` varchar(1024) DEFAULT '' COMMENT '活动扩展属性：json string { abTest:''xxxx''}',
  `user_id` int(11) NOT NULL COMMENT '活动创建者id  当前登录用户id',
  `create_time` datetime NOT NULL COMMENT '活动创建时间',
  `uuser_id` int(11) DEFAULT NULL COMMENT '活动最近一次修改者id',
  `update_time` datetime DEFAULT NULL COMMENT '活动最近一次更新时间',
  `publish_time` datetime DEFAULT NULL COMMENT '活动发布时间',
  PRIMARY KEY (`id`),
  KEY `idx_code` (`code`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COMMENT='活动列表';


-- ----------------------------
--  Table structure for `config`
-- ----------------------------
DROP TABLE IF EXISTS `config`;
CREATE TABLE `config` (
  `id` int(11) NOT NULL AUTO_INCREMENT COMMENT '系统配置Id',
  `name` varchar(50) NOT NULL COMMENT '配置名称',
  `desc` varchar(100) DEFAULT NULL COMMENT '配置描述',
  `type` varchar(50) DEFAULT NULL COMMENT '配置类型：normal:一般类型   authAction:操作权限  authData: 数据权限',
  `key` varchar(100) NOT NULL COMMENT '配置在缓存里的key值',
  `value` varchar(100) DEFAULT NULL COMMENT '配置值: 数组 以换行符\\r\\n区分',
  `status` tinyint(4) NOT NULL COMMENT '状态：1有效 2无效',
  `extend` mediumtext COMMENT '配置扩展属性，type=authData 时 可配置',
  `update_time` datetime DEFAULT NULL COMMENT '最近一次更新时间',
  `create_time` datetime NOT NULL COMMENT '添加时间',
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COMMENT='系统配置表';

-- ----------------------------
--  Records of `config`
-- ----------------------------
BEGIN;
INSERT INTO `config` VALUES ('1', '新增', '', 'authAction', 'add', 'add', '1', null, '2018-09-25 03:44:17', '2018-09-25 03:41:14'), 
('2', '编辑', '', 'authAction', 'edit', 'edit', '1', null, '2018-09-25 03:44:13', '2018-09-25 03:41:27'), 
('3', '删除', '', 'authAction', 'delete', 'delete', '1', null, '2018-10-17 11:19:52', '2018-09-25 03:41:37'), 
('4', '页面功能', '系统菜单--配置页面功能', 'authAction', 'confAction', 'confAction', '1', null, '2018-10-16 02:21:37', '2018-10-16 02:20:26'), 
('5', '权限配置', '角色管理 --- 权限操作', 'authAction', 'auth', 'auth', '1', null, null, '2018-10-16 02:26:12'), 
('6', '预览', '预览页面，查看效果', 'authAction', 'preview', 'preview', '1', null, null, '2018-10-16 02:33:19'), 
('7', '上架', '上架', 'authAction', 'online', 'online', '1', null, null, '2018-10-16 02:33:35'), 
('8', '下架', '下架', 'authAction', 'offline', 'offline', '1', null, null, '2018-10-16 02:33:54'), 
('9', '上传', '活动组件管理 -- 组件上传', 'authAction', 'upload', 'upload', '1', null, null, '2018-10-16 02:35:37'), 
('10', '更新', '活动组件管理 -- 组件更新', 'authAction', 'update', 'update', '1', null, '2018-10-17 11:17:39', '2018-10-16 02:36:07'),
COMMIT;

-- ----------------------------
--  Table structure for `contract`
-- ----------------------------
DROP TABLE IF EXISTS `contract`;
CREATE TABLE `contract` (
  `id` int(11) NOT NULL AUTO_INCREMENT COMMENT '合同id',
  `confid` int(11) DEFAULT NULL COMMENT '系统配置--业务数据类型id  权限类型:authData',
  `title` varchar(50) NOT NULL COMMENT '合同标题',
  `content` mediumtext NOT NULL COMMENT '合同内容',
  `status` tinyint(4) NOT NULL DEFAULT '1' COMMENT '合同内容状态 1测试 2上线 3下线 4已更新',
  `url` varchar(200) DEFAULT NULL COMMENT '合同访问地址',
  `typeids` varchar(200) NOT NULL COMMENT '合同类型ids pid,pid,pid',
  `publish_time` datetime DEFAULT NULL COMMENT '最近一次发布时间',
  `update_time` datetime DEFAULT NULL COMMENT '最近一次更新时间',
  `create_time` datetime NOT NULL COMMENT '添加时间',
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COMMENT='合同表';

-- ----------------------------
--  Table structure for `contract_type`
-- ----------------------------
DROP TABLE IF EXISTS `contract_type`;
CREATE TABLE `contract_type` (
  `id` int(11) NOT NULL AUTO_INCREMENT COMMENT '合同类型Id',
  `confid` int(11) NOT NULL COMMENT '系统配置--业务数据配置id  配置类型为authData',
  `name` varchar(50) NOT NULL COMMENT '合同分类名称',
  `pid` int(11) NOT NULL DEFAULT '0' COMMENT '父级分类id 默认顶级0',
  `pids` varchar(100) NOT NULL DEFAULT '' COMMENT '所有父级Id集合，以逗号分隔',
  `status` tinyint(4) NOT NULL DEFAULT '1' COMMENT '状态：1有效 2无效',
  `update_time` datetime DEFAULT NULL COMMENT '最近一次更新时间',
  `create_time` datetime NOT NULL COMMENT '添加时间，默认当前时间',
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COMMENT='合同类型表';

-- ----------------------------
--  Table structure for `contract_vm`
-- ----------------------------
DROP TABLE IF EXISTS `contract_vm`;
CREATE TABLE `contract_vm` (
  `id` int(11) NOT NULL AUTO_INCREMENT COMMENT '占位符Id',
  `name` varchar(50) NOT NULL COMMENT 'VM占位符名称',
  `placeholder` varchar(20) NOT NULL COMMENT 'VM占位符',
  `typeid` int(11) NOT NULL COMMENT '归属合同id',
  `desc` varchar(100) DEFAULT NULL COMMENT '备注',
  `update_time` datetime DEFAULT NULL COMMENT '最近一次更新时间',
  `create_time` datetime NOT NULL COMMENT '添加时间',
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COMMENT='合同VM模板占位符表';

-- ----------------------------
--  Table structure for `dep`
-- ----------------------------
DROP TABLE IF EXISTS `dep`;
CREATE TABLE `dep` (
  `id` int(11) NOT NULL AUTO_INCREMENT COMMENT '部门Id',
  `name` varchar(50) NOT NULL COMMENT '部门名称',
  `pid` int(11) NOT NULL DEFAULT '0' COMMENT '父级部门id 默认顶级0',
  `pids` varchar(100) NOT NULL DEFAULT '' COMMENT '所有父级Id集合，以逗号分隔',
  `status` tinyint(4) NOT NULL COMMENT '部门状态：1有效 2无效',
  `update_time` datetime DEFAULT NULL COMMENT '最近一次更新时间',
  `create_time` datetime NOT NULL COMMENT '添加时间，默认当前时间',
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COMMENT='部门表';

-- ----------------------------
--  Table structure for `log`
-- ----------------------------
DROP TABLE IF EXISTS `log`;
CREATE TABLE `log` (
  `id` int(11) NOT NULL AUTO_INCREMENT COMMENT '操作日志id ',
  `desc` varchar(200) DEFAULT NULL COMMENT '行为描述',
  `content` varchar(2048) DEFAULT NULL COMMENT '操作内容',
  `api` varchar(100) NOT NULL COMMENT '操作url',
  `ip` varchar(20) DEFAULT NULL COMMENT '用户Ip',
  `user_agent` varchar(200) DEFAULT NULL,
  `uid` int(11) DEFAULT NULL,
  `uname` varchar(20) NOT NULL COMMENT '登录用户名',
  `create_time` datetime NOT NULL COMMENT '添加时间，默认当前时间',
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COMMENT='系统日志表';

-- ----------------------------
--  Table structure for `menu`
-- ----------------------------
DROP TABLE IF EXISTS `menu`;
CREATE TABLE `menu` (
  `id` int(11) NOT NULL AUTO_INCREMENT COMMENT '菜单Id',
  `name` varchar(50) NOT NULL COMMENT '菜单名称',
  `alink` varchar(100) NOT NULL COMMENT '菜单链接地址',
  `pid` int(11) NOT NULL DEFAULT '0' COMMENT '父级菜单Id 默认顶级0',
  `pids` varchar(100) NOT NULL DEFAULT '' COMMENT '所有父级Id集合，以逗号分隔',
  `status` tinyint(4) NOT NULL DEFAULT '1' COMMENT '菜单状态：1有效 2停用',
  `sort` int(11) DEFAULT NULL COMMENT '菜单排序',
  `actions` varchar(1024) DEFAULT NULL COMMENT '菜单功能，叶子结点才可配置： add, edit, delete ....',
  `update_time` datetime DEFAULT NULL COMMENT '最近一次更新时间',
  `create_time` datetime NOT NULL COMMENT '添加时间，默认当前时间',
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COMMENT='系统菜单表';

-- ----------------------------
--  Records of `menu`
-- ----------------------------
BEGIN;
INSERT INTO `menu` VALUES 
('1', '系统管理', '/sys', '0', '0', '1', '1', '', null, '2017-08-15 05:30:16'), 
('2', '系统菜单', '/sys/menu', '1', '1', '1', '1', 'add,edit,delete,confAction', '2018-10-29 18:25:40', '2017-08-15 11:11:27'), 
('3', '日志管理', '/sys/log', '1', '1', '1', '4', '', '2018-10-29 11:24:51', '2017-08-15 10:46:47'), 
('4', '组织架构', '/sys/org', '1', '1', '1', '3', '', '2018-09-25 05:12:42', '2017-08-15 11:11:41'), 
('5', '用户管理', '/sys/org/user', '4', '1,4', '1', '3', 'add,edit,delete', '2018-10-29 18:26:23', '2017-08-15 10:33:50'), 
('6', '部门管理', '/sys/org/dep', '4', '1,4', '1', '1', 'add,edit,delete', '2018-10-29 18:26:05', '2017-08-15 05:39:50'), 
('7', '角色管理', '/sys/org/role', '4', '1,4', '1', '2', 'add,edit,delete,auth', '2018-10-29 18:26:16', '2017-08-15 10:33:37'), 
('8', '系统配置', '/sys/conf', '1', '1', '1', '2', 'add,edit,delete', '2018-10-29 18:25:53', '2017-08-15 10:44:06'), 
('9', '活动管理', '/act', '0', '0', '1', '2', null, null, '2018-09-25 04:15:31'), 
('10', '活动组件', '/act/component', '9', '9', '1', '1', 'delete,upload,update', '2018-10-29 18:26:46', '2018-09-25 04:16:02'), 
('11', '活动列表', '/act/list', '9', '9', '1', '3', 'add,edit,delete,preview,online,offline', '2018-10-29 18:27:04', '2018-09-25 04:16:47'), 
('12', '合同管理', '/contract', '0', '0', '1', '3', null, null, '2018-10-15 10:33:10'), 
('13', '合同类型', '/contract/type', '12', '12', '1', '1', 'add,edit,delete', '2018-10-29 18:27:13', '2018-10-15 10:33:40'), 
('14', '合同列表', '/contract/list', '12', '12', '1', '2', 'add,edit,delete', '2018-10-29 18:27:23', '2018-10-15 10:34:39');
COMMIT;

-- ----------------------------
--  Table structure for `role`
-- ----------------------------
DROP TABLE IF EXISTS `role`;
CREATE TABLE `role` (
  `id` int(11) NOT NULL AUTO_INCREMENT COMMENT '角色id',
  `name` varchar(50) NOT NULL COMMENT '角色名称',
  `desc` varchar(50) DEFAULT NULL COMMENT '角色描述',
  `mids` varchar(200) DEFAULT '' COMMENT '权限菜单Id 以逗号区分',
  `actions` varchar(1024) DEFAULT '' COMMENT '菜单功能权限：{mid1:["add","edit"], mid2:["add", "edit", "delete"]}',
  `datas` varchar(500) DEFAULT '' COMMENT '访问数据权限：config 表中 type为dataAuth的项',
  `update_time` datetime DEFAULT NULL COMMENT '最近更新时间',
  `create_time` datetime DEFAULT NULL COMMENT '角色添加时间',
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COMMENT='系统角色表';

-- ----------------------------
--  Table structure for `user`
-- ----------------------------
DROP TABLE IF EXISTS `user`;
CREATE TABLE `user` (
  `id` int(11) NOT NULL AUTO_INCREMENT COMMENT '用户id',
  `email` varchar(100) NOT NULL COMMENT '登录邮箱',
  `nickname` varchar(20) NOT NULL COMMENT '用户别名',
  `password` varchar(32) NOT NULL COMMENT '登录密码 md5',
  `depids` varchar(50) NOT NULL COMMENT '部门id',
  `roleids` varchar(200) NOT NULL COMMENT '角色ids',
  `phone` varchar(20) DEFAULT '' COMMENT '联系电话',
  `status` tinyint(4) NOT NULL DEFAULT '1' COMMENT '用户状态：1:有效  2:停用',
  `update_time` datetime DEFAULT NULL COMMENT '最近更新时间',
  `create_time` datetime NOT NULL COMMENT '添加时间',
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COMMENT='系统用户表';

-- ----------------------------
--  Records of `user`
-- ----------------------------
BEGIN;
INSERT INTO `user` VALUES ('1', 'admin', 'admin', 'e10adc3949ba59abbe56e057f20f883e', '0', '0', '', '1', '2018-09-18 05:56:28', '2017-08-22 11:34:14');
COMMIT;

SET FOREIGN_KEY_CHECKS = 1;
