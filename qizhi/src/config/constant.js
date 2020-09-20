
export const constant = {
	SOURCE_BUSINESS:{
		/**
		 * 增加对业务来源的判断  业务来源 1-官网,2-官微,3-M站, 4-企业微信
		 */
		 HK_WEBSITE: 1, 
		 HK_WECHAT: 2,
		 HK_WAP: 3,
		 WORK_WECHAT: 4,
		 CONVENIENCE_STORE:5
	},
	DISPLAY_PLATFORM:{///展示平台
		 HK_WECHAT: 1, //海客官微
		 STORE_WECHAT: 2, //便利店
		 ZS_WECHAT: 4,//智时
		 HK_WECHAT_WHITE: 3,//白名单  
	},
	USER_SOURCE:{
		STAFF: 1, // 捷越：人力提供的员工白名单 
		LOAN_RISK: 2,//借意险
		HK_WEBSITE_PRODUCT: 3,// 海客官网产品二维码 OK 
		HK_WEBSITE_QR: 4,// 海客官网底部二维码 OK 
		HS_CAR: 5, // 花生：花生企业车险
		ZS_WEBSITE_QR: 6, // 智时官网二维码
		HK_WECHAT_QR: 7, // 海客保险官微二维码 
		ZS_WECHAT_QR: 8, // 智时官微二维码
	},
	REGISTER_CHANNEL:{ // 注册来源
		HK_WECHAT: 'WeChat',//	海客官微
		HK_WEBSITE: 'OfficialWeb',// 海客官网
		HK_WAP: 'WebSite', //		M站
		ZS_WECHAT: 'ZS-WeChat', //	智时官微 智时域名时返回
		WORK_WECHAT:	'WorkWeChat' //	企业微信
	},
	PAY_TYPE : {
		WX: 3,//微信页面支付
		WX_PUBLIC:7,//微信公众号支付
		WX_QRCODE:4,//微信扫码支付
		ALIPAY:5,//支付宝移动端支付
		ALIPAY_QRCODE:6,//支付宝二维码支付
		UNIONPAY:1,//银联接口支付
		ECODEPAY:8//易码付
	},
	ENV :{
		WX: 1,//公众号
		WX_WORk:2,//企业微信
		PC:3,//pc浏览器
		MOBILE:4//移动浏览器
	},
	sourceBusiness:{
		PLD:11,
		HS_HC:12,
		HS_JJR:9, // 花生门店经纪人渠道
	}
}
export default constant;



