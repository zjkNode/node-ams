/**
 * Created by zjk on 18/8/13.
 * 
 */
 var jsencrypt = require('jsencrypt'),
    md5 = require('md5'),
    moment = require('moment');
export default  {
    px2rem(px){
        px = px +'';
        if(px.indexOf('px') > -1){
            px = px.substring(0, px.indexOf('px'));
        }
        px = parseInt(px);
        if(isNaN(px)){
            return '';
        }
        let baseSize= 108;
        return (px/baseSize*1).toFixed(2) + 'rem';
    },
	isMobile(mobile){
        let mobileRegex = /^[1][3-8]\d{9}$/;
        return mobileRegex.test(mobile);
    },
    isNum(val){
        let numRegex = /[^\d]/g;
        return numRegex.test(val);
    },
    getQueryParams(name) {
        var r = new RegExp("(\\?|#|&)" + name + "=([^&#]*)(&|#|$)");
        var m = location.href.match(r);
        if(!m){
            r=new RegExp("(/)" + name + "/([^&#/]*)(/)");
            m=location.href.match(r);
        }
        return decodeURIComponent(!m ? "" : m[2]);
    },
    toDecimal(value){
        if(!value){
            return "0";
        }
        return (value / 100).toFixed(2);
    },
    getImageWH(imgPath){
        return new Promise(function(resolve, reject){
            let img = new Image();
            img.src = imgPath;
            let timeout = setTimeout(function(){
                clearInterval(checkInterval);
                reject('读取文件属性超时');
            }, 5 * 1000);

            let checkInterval = setInterval(function(){
                if(img.width > 0 || img.height > 0){
                    resolve({width: img.width, height: img.height});
                    clearInterval(checkInterval);
                    clearTimeout(timeout);
                }
            }, 40);
        });
    },
    toInt(value){
        if(!value){
            return "0";
        }
        return parseInt(value / 100);
    },
    conver(limit){
        var size = "";
        if( limit < 0.1 * 1024 ){ //如果小于0.1KB转化成B
            size = limit.toFixed(2) + "B";
        }else if(limit < 0.1 * 1024 * 1024 ){//如果小于0.1MB转化成KB
            size = (limit / 1024).toFixed(2) + "KB";
        }else if(limit < 0.1 * 1024 * 1024 * 1024){ //如果小于0.1GB转化成MB
            size = (limit / (1024 * 1024)).toFixed(2) + "MB";
        }else{ //其他转化成GB
            size = (limit / (1024 * 1024 * 1024)).toFixed(2) + "GB";
        }

        var sizestr = size + "";
        var len = sizestr.indexOf(".");
        var dec = sizestr.substr(len + 1, 2);
        if(dec == "00"){//当小数点后为00时 去掉小数部分
            return sizestr.substring(0,len) + sizestr.substr(len + 3,2);
        }
        return sizestr;
    },
    encrypt(plainText){
        var pk = `-----BEGIN PUBLIC KEY-----
            MFwwDQYJKoZIhvcNAQEBBQADSwAwSAJBAIY9/ZRirUo7bcnjr939dpJu3yjh+TNe
            Jhjn1Y4LMWhaNalE7A95pNLRupvQfEVAHAFGwJeJtmXcJcmPN+xuvP8CAwEAAQ==
            -----END PUBLIC KEY-----`;
        var encrypt = new jsencrypt.JSEncrypt();
        encrypt.setPublicKey(pk);
        var encrypted = encrypt.encrypt(md5(plainText));
        return encrypted;
    },
    uuid(){
        return 'xxxxxxxxxxxx4xxxyxxxxxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
            var r = Math.random()*16|0, v = c == 'x' ? r : (r&0x3|0x8);
            return v.toString(32);
        });
    }
}