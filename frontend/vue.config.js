module.exports = {
	devServer: {
		port:8070,
		proxy: {
			'/api': {
				target: 'http://127.0.0.1:8071',
				changeOrigin: true
			}
		}
	}
}