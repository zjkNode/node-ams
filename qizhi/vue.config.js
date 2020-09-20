module.exports = {
    productionSourceMap: false,
    devServer: {
			port: 8072,
			proxy: {
				'/qizhi': {
					target: 'http://127.0.0.1:8071',
					changeOrigin: true,
					// pathRewrite: {
					// 	'^/hk-insurance-shop': '/hk-insurance-shop'
					// }
				},
      }
    }
}
