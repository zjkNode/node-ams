/**
 * Created by zjk on 16/2/23.
 * Recovered by susan on 2017/11/22
 */
Global.utility = {
    isMobile: function(mobile) {
        var mobileRegex = /^[1][3-9]\d{9}$/;
        return mobileRegex.test(mobile);
    },
    isPassword: function(password) {
        var passwordRegex = /[a-z0-9]{6,16}/;
        return passwordRegex.test(password);
    },
    isNum: function(val) {
        var numRegex = /[^\d]/g;
        return numRegex.test(val);
    },
    isWeiXin: function () {
        var ua = window.navigator.userAgent.toLowerCase();
        return ua.match(/MicroMessenger/i) == 'micromessenger';
    },
    isJDB: function () { // 借贷宝 android 端走api
        var ua = window.navigator.userAgent.toLowerCase();
        return /JDB/i.test(ua) && /Android/i.test(ua);
    },
    isAppEmbed: function () { // 内嵌我们自己的app里
        var ua = window.navigator.userAgent.toLowerCase();
        return ua.match(/sudaixiong_android/i) == 'sudaixiong_android' ||
            ua.match(/sudaixiong_ios/i) == 'sudaixiong_ios';
    },
    isIOS: function(){
        var userAgent = window.navigator.userAgent;
        return /iPhone|iPad|iPod/i.test(userAgent);
    },
    isAndroid: function(){
        var userAgent = window.navigator.userAgent;
        return /Android|HTC/i.test(userAgent) || /Linux/i.test(window.navigator.platform + "");
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
    toDecimal: function(value) {
        if (!value) {
            return "0";
        }
        return (value / 100).toFixed(2);
    },
    toInt: function(value) {
        if (!value) {
            return "0";
        }
        return parseInt(value / 100);
    },
    startClock: function(obj, limt) {
        var $sender = $(obj);
        var currentTime = limt;
        $sender.prop("disabled", true);
        var timeInterval = setInterval(function () {
            if (currentTime <= 0) {
                $sender.html('重新获取');
                currentTime = limt;
                clearInterval(timeInterval);
                $sender.removeAttr("disabled");
                return;
            }
            currentTime--;
            $sender.html('重新获取('+currentTime + 's)');
        }, 1000);
    },
    scheme: function(e) {
        var t = document.createElement("iframe");
        t.src = e,
        t.style.width = t.style.height = 0,
        t.style.visibility = "hidden",
        document.documentElement.appendChild(t),
        setTimeout(function() {
            t.style.display = "none"
        }, 0),
        t.onload = t.onerror = t.oncancel = function() {
            this.parentNode.removeChild(this)
        }
    },
    download: function () {
        console.log('download')
        Global.downUrl = Global.downUrl || {};
        var userAgent = window.navigator.userAgent;
        var browser = null, platform = null,
            open_android = Global.downUrl.openAndroid,
            open_ios = Global.downUrl.openIos,
            download_android = Global.downUrl.android,
            download_ymb = Global.downUrl.ymb,
            download_ios = Global.downUrl.ios;

        if (userAgent.match(/MicroMessenger/i) == "MicroMessenger") {
            browser = 'MicroMessenger';
            if(!download_ymb){
                Global.utility.showDLTips();
                return;
            }

            window.location.href = download_ymb;
            return;
        }
        if (this.isAndroid()) {
            if(!download_android) return;

            var hasApp = true, dlDelay = 2000;
            if(!open_android){
                hasApp = false;
                dlDelay = 100;
            }
            setTimeout(function () {
                location.href = hasApp ? open_android : download_android +"?t="+ new Date().getTime();
                ifr && document.body.removeChild(ifr);
            }, dlDelay);

            if(!open_android) return;
            var t = 1000, t1 = Date.now();
            var ifr = document.createElement("iframe");
            ifr.setAttribute('src', open_android);
            ifr.setAttribute('style', 'display:none');
            document.body.appendChild(ifr);
            setTimeout(function () {
                var t2 = Date.now();
                if (!t1 || t2 - t1 < t + 100) {
                  hasApp = false;
                }
            }, t);
            return;
        }
        if (this.isIOS()) {
            if(open_ios){
                window.location.href = open_ios;
            }
            if(!download_ios) return;
            var delay = open_ios ? 2000 : 100;
            setTimeout(function () {
                window.location.href = download_ios;
            }, delay);
            return;
        }
    },
    showDLTips:function(){
        var tmpl = '<div class="dl-mask"><img class="dl-tip" src="../img/dl-tip.png" /></div>';
        var $dlTips = $('body').find('.dl-mask');
        if($dlTips.length == 0){
            $dlTips = $(tmpl);
            $('body').append($dlTips);
        }
        $dlTips.show();
    },
    indicator: new function(){
        var tmpl = '<div class="indicator"><div class="indicator-wrapper"><span class="indicator-spin"><div class="spinner-snake" style=""></div></span> <span class="indicator-text"></span></div> <div class="indicator-mask"></div></div>';
        
        var $indicator = $('body').find('.indicator');
        if($indicator.length == 0){
            $indicator = $(tmpl);
            $('body').append($indicator);
        }

        this.open = function(msg){
            $indicator.find('.indicator-text').html(msg).css('display', 'block');
            $indicator.show();
        }

        this.close = function(){
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
    post: function(url, data, success, error){
        $.ajax({
          type: 'POST',
          url: url,
          data: JSON.stringify(data),
          contentType:'application/json',
          dataType: 'json',
          headers: {
            channelNo: Global.channelNo
          },
          success: function(res){
            if(res.code === 999){
                Global.utility.toast(res.message);
                return;
            }
            if(success){
                success(res);
            }
          },
          error: function(err){
            console.log(err);
            if(error){
                error(err);
            }
          }
        });
    }
}


