var baseNameSpace = {

};

var Global = {
	actCode:'',
	actData:null
};



(function(){
	 function getData(objKey){
		if(!objKey){
			return null;
		}
		var comKey = objKey.split('-')[0],
			itemKey = objKey.split('-')[1];

		if(itemKey){
			// 兼容处理
			return Global.actData[comKey][itemKey] || Global.actData[comKey].buttons[itemKey] || Global.actData[comKey].buttons.items[itemKey] ;
		}

		return Global.actData[comKey];

		// {
		// 	href:'',
		// 	usages:{
		// 		to:'download',
		// 		option:{
		// 			{ href:'native://membership_card', label:'app会员卡页', value:'card' }
		// 		}
		// 	},
		// 	responses:[
		// 		{1001:'alert_1'}
		// 	]
		// }
	}
	Global.Handle = HandleFn;

	function HandleFn(sender, dataConfig){
		var utility = Global.utility;

		var _sender = sender;
		var _conf = dataConfig || getData(_sender.data('key'));
		var handles = {};

		function _init(){
			if(!_conf.usages){
				throw new Error('usages is empty!');
				return;
			}
			
			if(!handles[_conf.usages.to]){
				return handles.undefinedFn;
			}
			return handles[_conf.usages.to];
		}
		handles.undefinedFn = function(){
			console.log('undefined key:'+ _conf.usages.to);
		}
		// 下载
		handles.download = function(){
			_hmt.push(['_trackEvent', Global.code +'_download', 'click', Global.code +'_下载app']);
            utility.download();
		}

		// 打开原生app
		handles.goApp = function(){
			var option = _conf.usages.option;
			_hmt.push(['_trackEvent', Global.code + "_" + option.label, 'click', Global.code +'_btn_'+ option.value ]);
            if(utility.isAppEmbed()){
                window.location.href = option.href;
                return;
            }
            utility.download();
		}

		// 打开其他h5页面
		handles.goOthers = function() {
			_hmt.push(['_trackEvent', Global.code +'_other_link', 'click', Global.code +'_跳转H5链接']);
            window.location.href = _conf.href;
            // window.location.href = btnUsage.href + (btnUsage.href.indexOf('?') > -1 ? '&' : '?') + 'hetrone_webview=true';
		}

		handles.goAlerts = function(callback){
			if(callback){
				callback(_sender, _conf.usages);
			} else {
				// $('#'+ _conf.usages.option.value).css({ display:'flex' });
				var $wrap = $('#'+ _conf.usages.option.value);
		        $wrap.show();
		        var $dialog = $wrap.find('.alertWrap');
		        var w = $dialog.width()/2;
		        var h = $dialog.height()/2 || 100;
		        $dialog.css({'margin-left':-w+'px','margin-top': -h+'px'});
			}
			// $('#'+ _conf.usages.option.value).css({ display:'flex' });
		}
		
		handles.goAlertClose = function(){
			$('.mask').hide();
		}

		handles.goResponse = function(callback){
			if(!callback || typeof(callback) != 'function'){
				throw new Error("callback is undefined");
			}
			callback(_sender, _conf.responses);
		}

		return _init();
	}
})();