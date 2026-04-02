export default {
	project: {
		name: '',
		appId: '',
		logo: '',
		style: {

		}
	},
	//接口地址 
	basePath: 'http://127.0.0.1:8000', 
	// basePath: 'https://dingshui.59156.cn',
	//支付回调地址
	redirectPath: '',
	// redirectPath:'http://localhost:8085',
	/**
	 * 租户ID；
	 * 仅供APP端使用
	 */
	tenantId: '1',
	/**
	 * 分享链接、海报二维码链接域名，即移动端H5的访问域名
	 * 供app端和h5端生成分享链接、海报二维码链接时使用【最后不需要加斜杠】
	 */
	h5HostUrl: '',
	/**
	 * 公众号appId；
	 * 供app端和h5端生成分享链接、海报二维码链接时使用
	 */
	wxAppId: '',
	/**
	 * 版本更新地址，取的是后台（joolun-plus-ui/public）下的一个json文件，App启动时会自动请求该文件然后判断是否需要更新，json格式请查看 /public/APPUpdate/APPUpdate.md；
	 * 仅供APP端使用
	 */
	appUpdateUrl: '',
	/**
	 * 是否显示 隐私政策、用户协议 相关功能。目前所有app上架到应用宝，苹果等各个商店平台需要隐私政策信息。因为上架手续繁琐，如有需要请查看文档进行修改。
	 * 仅供APP端使用
	 */
	showPrivacyPolicy: true,
	/**
	 * 隐私政策网络地址
	 * 仅供APP端使用
	 */
	privacyPolicyUrl: '',
	/**
	 * 用户协议网络地址
	 * 仅供APP端使用
	 */
	protocolUrl: '',
};