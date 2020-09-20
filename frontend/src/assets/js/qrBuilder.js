import QRCode from 'qrcode'
export function qrBuilder(text, options, callback) {
	let _config = {
			text: '', // 要生成二维码的字符串
			errorCorrectionLevel: 'M', //`low, medium, quartile, high` or `L, M, Q, H`.Error resistance ~7% ~15% ~25% ~30%
			margin: 2, // qr margin 白边
			width: 200, // qr 大小
			x: 0, // qr 相对原始背景图位置 x
			y: 0, // qr 相对原始背景图位置 y
			logo: '', // qr 中间logo 默认尺寸: _config.width / 5
			bgImg: '', // 背景图 默认：body 长宽,
			bgAuto: true // 背景是否自适配
		},
		canvas,
		ctx,
		isDrawed = false,
		_callBack,
		_imgBg,
		_imgQR,
		_imgLogo;

	// let create = function(text, options, callback){
	if(!text) {
		console.warn('缺少要生成二维码的字符串');
		return;
	}
	_callBack = callback;
	if(typeof(options) === 'function') {
		_callBack = options;
	} else {
		_config = Object.assign({}, _config, options);
	}
	isDrawed = false;
	canvas = document.createElement("canvas");
	canvas.style.display = 'none';
	document.body.appendChild(canvas);
	canvas.width = canvas.height = _config.width; // 默认为二维码的尺寸
	ctx = canvas.getContext('2d');

	let qrOptions = {
		errorCorrectionLevel: _config.errorCorrectionLevel,
		margin: _config.margin,
		width: _config.width
	};
	QRCode.toCanvas(text, qrOptions, function(err, canv) {
		if(err) throw err
		_imgQR = new Image();
		_imgQR.src = canv.toDataURL('image/png');
		_imgQR.onload = onDrawImage;
	});
	if(_config.bgImg) { // 背景图
		_imgBg = new Image();
		_imgBg.src = _config.bgImg;
		_imgBg.onload = onDrawImage;
	}

	if(_config.logo) { // logo 
		_imgLogo = new Image();
		_imgLogo.crossOrigin = "Anonymous"; // 跨域图片 使用canvas.toDataURL
		_imgLogo.src = _config.logo;
		_imgLogo.onload = onDrawImage;
	}
	// }

	function onDrawImage() {
		if(isDrawed) {
			return;
		}

		if((_imgQR && !_imgQR.complete) ||
			(_imgBg && !_imgBg.complete) ||
			(_imgLogo && !_imgLogo.complete)) {
			return;
		}
		if(_imgBg) {
			// 有背景图，按背景尺寸生成 合成图片
			canvas.width = _imgBg.width;
			canvas.height = _imgBg.height;
			ctx.drawImage(_imgBg, 0, 0, _imgBg.width, _imgBg.height, 0, 0, _imgBg.width, _imgBg.height);
		}
		let qrX = _config.x,
			qrY = _config.y,
			qrW = _config.width;
		if(_imgQR) {
			ctx.drawImage(_imgQR, 0, 0, qrW, qrW, qrX, qrY, qrW, qrW);
		}
		if(_imgLogo) {
			let logoW = qrW / 5;
			let logoX = (qrW - logoW) / 2 + qrX;
			let logoY = (qrW - logoW) / 2 + qrY;

			let lm = 6; // logo margin 
			roundRect(logoX - lm, logoY - lm, logoW + lm * 2, logoW + lm * 2, 6);
			ctx.drawImage(_imgLogo, 0, 0, _imgLogo.width, _imgLogo.height, logoX, logoY, logoW, logoW);
		}
		isDrawed = true;
		let imgBase64 = canvas.toDataURL('image/png');
		// 无背景图，直接输出 二维码图
		if(!_imgBg) {
			canvas.parentNode.removeChild(canvas);
			_callBack(imgBase64);
			return;
		}

		let resImg = new Image();
		resImg.src = imgBase64;
		resImg.onload = function() {
			// 所有手机 高100% 宽自动裁剪
			let resW = resImg.width;
			let resH = resImg.height;
			let sx = 0;
			if(_config.bgAuto) {
				let br = document.body.clientWidth / document.body.clientHeight;
				resW = resImg.height * br;
				sx = (resImg.width - resW) / 2;

			}

			// canvas 重置宽高时，画布内容会被清空
			canvas.width = resW;
			canvas.height = resH;
			// console.log(`bw:${document.body.clientWidth} bh:${document.body.clientHeight} iw:${resImg.width} ih:${resImg.height} resW:${resW} sx:${sx}`)

			ctx.drawImage(resImg, sx, 0, resW, resH, 0, 0, resW, resH);
			if(_callBack) {
				let imgBase64 = canvas.toDataURL('image/png');
//				canvas.parentNode.removeChild(canvas);
				_callBack(imgBase64);
			}
		};

	}

	// x,y是矩形的起点;w,h是矩形的宽高;r是圆角矩形的半径.
	function roundRect(x, y, w, h, r) {
		if(w < 2 * r) r = w / 2;
		if(h < 2 * r) r = h / 2;
		ctx.beginPath();
		ctx.moveTo(x + r, y);
		ctx.arcTo(x + w, y, x + w, y + h, r);
		ctx.arcTo(x + w, y + h, x, y + h, r);
		ctx.arcTo(x, y + h, x, y, r);
		ctx.arcTo(x, y, x + w, y, r);
		ctx.closePath();
		ctx.strokeStyle = 'transparent';
		ctx.fillStyle = "#fff";
		ctx.fill();
		ctx.stroke();
	}
}