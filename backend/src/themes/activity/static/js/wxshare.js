/**
 * Created by mac on 16/10/17.
 */
var wxShare = {
    getWeChatConfig :function(url,activityCode){
        $.ajax({
            url:url,
            dataType:"json",
            async:true,
            type:"POST",
            beforeSend: function(request) {
                request.setRequestHeader('activityCode', activityCode);
            },
            success:function(res){
                if(res.code === 200){
                    wx.config({
                        debug: false,
                        appId: res.data.appId,
                        timestamp: res.data.timestamp,
                        nonceStr: res.data.nonceStr,
                        signature: res.data.signature,
                        jsApiList: ['onMenuShareTimeline','onMenuShareAppMessage','onMenuShareQQ','onMenuShareWeibo','onMenuShareQZone']
                    });
                }
            },
            complete: function(res) {
                //
            },
            error: function(err) {
                console.log(err);
            }
        });
    },
    configWechat:function (title,desc,link,imgUrl,type){
        wx.ready(function(){
            wx.onMenuShareAppMessage({
                title: title,
                desc: desc,
                link: link,
                imgUrl: imgUrl,
                type: '',
                dataUrl: ''
            });
            wx.onMenuShareTimeline({
                title: title,
                link: link,
                imgUrl: imgUrl,
                success: function () {
                },
                cancel: function () {
                }
            });
            wx.onMenuShareQQ({
                title: title,
                desc: desc,
                link: link,
                imgUrl: imgUrl
            });
            wx.onMenuShareWeibo({
                title: title,
                desc: desc,
                link: link,
                imgUrl: imgUrl
            });
            wx.onMenuShareQZone({
                title: title,
                desc: desc,
                link: link,
                imgUrl: imgUrl
            });
        });
    }

};

