/**
 * Created by zjk on 16/2/23.
 * Recovered by susan on 2017/11/22
 */
Global.utility = {
    isMobile: function(mobile) {
        var mobileRegex = /^[1][3-8]\d{9}$/;
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
    getQueryParams: function(name) {
        var r = new RegExp("(\\?|#|&)" + name + "=([^&#]*)(&|#|$)");
        var m = location.href.match(r);
        if (!m) {
            r = new RegExp("(/)" + name + "/([^&#/]*)(/)");
            m = location.href.match(r);
        }
        return decodeURIComponent(!m ? "" : m[2]);
    },
    getUrlParam: function (name) {
        var reg = new RegExp("(^|&)" + name + "=([^&]*)(&|$)"); //构造一个含有目标参数的正则表达式对象
        var r = window.location.search.substr(1).match(reg);  //匹配目标参数
        if (r != null) return unescape(r[2]); return null; //返回参数值
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
            $sender.html(currentTime + 's');
        }, 1000);
    },
    download: function () {
        var userAgent = window.navigator.userAgent;
        var downUrls = Global.downUrls.split(',');
        var browser = null, platform = null,
            open_android = downUrls[0],
            open_ios = downUrls[1],
            download_android = downUrls[2],
            download_ymb = downUrls[3],
            download_ios = downUrls[4];

        if (userAgent.match(/MicroMessenger/i) == "MicroMessenger") {
            browser = 'MicroMessenger';
            if(!download_ymb){
                Global.utility.showDLTips();
                return;
            }

            window.location.href = download_ymb;
            return;
        }
        if (userAgent.match(/Android/i) == "Android") {
            if(!download_android) return;

            var  t = 1000, hasApp = true;
            setTimeout(function () {
                if (hasApp) {
                    location.href = open_android;
                } else {
                    location.href = download_android;
                }
                document.body.removeChild(ifr);
            }, 2000);

            var t1 = Date.now();
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
        if (userAgent.match(/iPhone/i) == "iPhone") {
            if(!open_ios) return;
            location.href = open_ios;
            setTimeout(function () {
                window.location.href = download_ios;
            }, 2000);
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
            activityCode:Global.actCode,
            channelCode: Global.channelCode
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


