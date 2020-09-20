(function(){
	var $container = $('.register');

	var cacheCode;
	init();
	function init(){
		var contH = $('html').height() - $('.header').height() - $('.footer').height()-76;
		$('.content').css('min-height',contH);

		$('.header .right > div').hide();
		$('.header .dirLogin').show();
		$container.find('.button').click(getSmsCode);
		$container.find('.btn').click(register);
		$container.find('input[type!=checkbox]').focus(function(){
			inputFocus($(this));
		});
	}

	function getSmsCode(){
		var $sender = $container.find('.button'),
			$mobile = $container.find('.phone'),
			mobile = $.trim($mobile.find('input').val());

		if($sender.prop('disabled')){
			return;
		}
		if(!mobile){
			$mobile.find('span').text('手机号码不能为空');
			$mobile.addClass('err');
			return;
		}

		if(!utility.isMobile(mobile)){
			$mobile.find('span').text('手机号码格式不正确');
			$mobile.addClass('err');
			return;
		}
		$mobile.addClass('success');
		utility.indicator.open();
		utility.startClock($sender, 60);
		var params = {
			mobile: mobile
		};
		var url = '/loancat/sendCode';
		$.ajax({
          type: 'POST',
          url: url,
          contentType: 'application/json',
          data: JSON.stringify(params),
          dataType: 'json',
          success: function(res){
          	console.log(res);
			utility.indicator.close();
			if(res.code != 200){
				utility.toast(res.message);
				return;
			}
			cacheCode = res.data;
          },
          error: function(err){
			utility.indicator.close();
          }
        });
	}

	function register(){
		var $mobile = $container.find('.phone'),
			$smsCode = $container.find('.smsCode'),
			$pwd1 = $container.find('.pwd1'),
			$pwd2 = $container.find('.pwd2'),
			$chk = $container.find('.mark');

		var mobile = $.trim($mobile.find('input').val()),
			smsCode = $.trim($smsCode.find('input').val()),
			pwd1 = $.trim($pwd1.find('input').val()),
			pwd2 = $.trim($pwd2.find('input').val()),
			chk = $chk.find('input').prop('checked');

		if(!mobile){
			$mobile.find('span').text('手机号码不能为空');
			$mobile.addClass('err');
			return;
		}

		if(!utility.isMobile(mobile)){
			$mobile.find('span').text('手机号码格式不正确');
			$mobile.addClass('err');
			return;
		}
		$mobile.addClass('success');

		if(!smsCode){
			$smsCode.find('span').text('短信验证码不能为空');
			$smsCode.addClass('err');
			return;
		}
		if(smsCode != cacheCode){
			$smsCode.find('span').text('短信验证码不正确');
			$smsCode.addClass('err')
			return;
		}
		$smsCode.addClass('success');

		if(!pwd1){
			$pwd1.find('span').text('密码不能为空');
			$pwd1.addClass('err');
			return;
		}
		if(!utility.pwdValidate(pwd1)){
			$pwd1.find('span').text('密码格式不正确');
			$pwd1.addClass('err');
			return;
		}
		$pwd1.addClass('success');
		if(pwd1 != pwd2){
			$pwd2.find('span').text('两次密码不一致');
			$pwd2.addClass('err');
			return;
		}
		$pwd2.addClass('success');

		if(!chk){
			utility.toast('请先阅读并同意分期猫网站注册协议');
			return;
		}

		var url = '/loancat/registe';
		var params = {
			mobile:mobile,
			name: mobile,
			password:pwd1
		};
		utility.indicator.open();
		$.ajax({
          type: 'POST',
          url: url,
          contentType: 'application/json',
          data: JSON.stringify(params),
          dataType: 'json',
          success: function(res){
			utility.indicator.close();
			if(res.code != 200){
				utility.toast(res.message);
				return;
			}
			$('.jump').show();
			setTimeout(function(){
				location.href = '/login.html';
			}, 1000*3);
          },
          error: function(err){
			utility.indicator.close();
          }
        });
	}

	function inputFocus($sender){
		var $item = $sender.parents('.form-item');
		$item.find('span').html('&nbsp;');
		$item.removeClass('err').removeClass('success');
	}
})();