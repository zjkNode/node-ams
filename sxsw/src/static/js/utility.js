var utility = {
	isMobile: function(mobile) {
        var mobileRegex = /^[1][3-8]\d{9}$/;
        return mobileRegex.test(mobile);
    },
    pwdValidate: function(password) {
        var passwordRegex = /[a-z0-9]{6,16}/;
        return passwordRegex.test(password);
    },
    getQueryParams: function(name) {
        var r = new RegExp("(\\?|#|&)" + name + "=([^&#]*)(&|#|$)");
        var m = location.href.match(r);
        if (!m) {
            r = new RegExp("(/)" + name + "/([^&#/]*)(/)");
            m = location.href.match(r);
        }
        return decodeURIComponent(!m ? "" : m[2]);
    },
    startClock: function(obj, limt) {
        var $sender = $(obj);
        var currentTime = limt;
        $sender.addClass("disabled");
        var timeInterval = setInterval(function () {
            if (currentTime <= 0) {
                $sender.html('重新获取');
                currentTime = limt;
                clearInterval(timeInterval);
                $sender.removeClass("disabled");
                return;
            }
            currentTime--;
            $sender.html('重新获取('+ currentTime + 's)');
        }, 1000);
    },
    indicator: new function(){
        var tmpl = '<div class="indicator"><div class="indicator-wrapper"><span class="indicator-spin"><div class="spinner-snake" style=""></div></span> <span class="indicator-text"></span></div> <div class="indicator-mask"></div></div>';

        this.open = function(msg){
        	var $indicator = $('body').find('.indicator');
	        if($indicator.length == 0){
	            $indicator = $(tmpl);
	            $('body').append($indicator);
	        }
	        if(msg){
            	$indicator.find('.indicator-text').html(msg).css('display', 'block');
	        }
            $indicator.show();
        }

        this.close = function(){
            var $indicator = $('body').find('.indicator');
            $indicator.hide();
        }
    }(),
    toast: function(msg){
        var $toast = $('body').find('.toast');
        if($toast.length === 0){
            $toast = $('<div class="toast"><span></span></div>')
            $('body').append($toast);
        }
        $toast.find('span').html(msg);
        $toast.show();
        setTimeout(function(){
            $toast.hide();
        }, 1000 * 1.5);
    },
    setCookie: function(name,value){
		var Days = 1;
		var exp = new Date();
		exp.setTime(exp.getTime() + Days*24*60*60*1000);
		document.cookie = name + "="+ escape (value) + ";expires=" + exp.toGMTString();
	},
	getCookie: function(name){
		var arr,reg = new RegExp("(^| )"+name+"=([^;]*)(;|$)");
		if(arr = document.cookie.match(reg)){
			return unescape(arr[2]);
		}
		return null;
	},
	removeCookie: function(name){
		var exp = new Date();
		exp.setTime(exp.getTime() - 1);
		var cval= utility.getCookie(name);
		if(cval!=null)
		document.cookie = name + "="+ cval +";expires="+ exp.toGMTString();
	},
    tmplFormat: function(tmpl,data,formatHandler){
        return t_f(tmpl,data,-1,-1,formatHandler);

        function _f(d,c,k1,k2,l){
            var q = c.match(/(first:|last:)(\"|\'*)([^\"\']*)(\"|\'*)/);
            if(!q) return "";
            if(q[1]==k1){
                if(q[2]=='\"'||q[2]=='\''){
                    return q[3];
                }
                else
                    return d[q[3]];
            }
            else if(q[1]==k2 && l>1){
                return "";  
            }
            return "";
        }

        function t_f(t,d,i,l,fn){
            return t.replace( /\$\{([^\}]*)\}/g,function(m,c){
                if(c.match(/index:/)){ 
                    return i;
                }
                if(c.match(/fn:/) && fn){
                    return fn(d,c.match(/fn:(.*)/)[1]);
                }
                if(i==0){
                    var s=_f(d,c,"first:","last:",l);
                    if(s) return s;
                }
                if(i==(l-1)){
                    var s= _f(d,c,"last:","first:",l);
                    if(s) return s;
                }
                var ar=c.split('.');
                var res=d;
                for(var key in ar)
                    res=res[ar[key]];
                return res||"";
            });
        }
    },
    getPerPay: function(price, month, ratio){
        price = parseInt(price);
        month = parseInt(month);
        if(isNaN(month)|| month === 0){
            return price;
        }
        var monthRatio = 0.015;
        var loan = price - price * ratio;
        var a = loan * monthRatio * Math.pow(1+ monthRatio,month);
        var b = Math.pow(1+monthRatio,month) -1;
        return (a/b).toFixed(2);
    }
}