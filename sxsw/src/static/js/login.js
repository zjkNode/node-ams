(function(){
	var $container = $('.login');

	init();
	function init(){
		var contH = $('html').height() - $('.header').height() - $('.footer').height()-76;
		$('.content').css('min-height',contH);
		$container.find('.btn').click(login);
		$container.find('input').focus(function(){
			inputFocus($(this));
		});
	}
	function login(){
		var $mobile = $container.find('.user'),
			$pwd = $container.find('.pwd'),
			mobile = $.trim($mobile.find('input').val()),
			pwd = $.trim($pwd.find('input').val());

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
		if(!pwd){
			$pwd.find('span').text('密码不能为空');
			$pwd.addClass('err');
			return;
		}

		$pwd.addClass('success');
		utility.indicator.open();
		var url = '/loancat/login';
		var params = {
			mobile: mobile,
			password: pwd
		};
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
				utility.setCookie('user', JSON.stringify(res.data));
				location.href = '/';
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