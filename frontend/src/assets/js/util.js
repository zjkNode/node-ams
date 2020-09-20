/**
 * Created by zjk on 18/8/13.
 * 
 */
 /* eslint-disable */
 var jsencrypt = require('jsencrypt'),
    md5 = require('md5'),
    moment = require('moment');
export default  {
    dateFormat(value, format){
      if(!value){
        return '--';
      }
      format = format || 'YYYY-MM-DD HH:mm:ss';
      return moment(value).format(format);
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
    toCleanHtml(html){
        // 将word格式里面的特殊样式清除，保留基本标签
        html = html.replace(/<\/?\w+:[^>]*>/gi, "") ; // Replace the &nbsp; 
        // Remove Tags with XML namespace declarations: <o:p></o:p> 
        html = html.replace(/<\\?\?xml[^>]*>/gi, "") ; 
        html = html.replace(/<head>[\s\S]*?<\/head>/gi, ""); 
        html = html.replace(/<(script|style).*?[^>]>.*?<\/(script|style)>/img,'');
        html = html.replace(/<!\[if.*?[^>]>.*?<!\[endif\]>/img,'');
        html = html.replace(/<\!--[^>]*>.*?-->/ig, '');// remove <!--[if supportFields]>...<![endif]-->
        //Remove all SPAN div tags 
        html = html.replace(/<\/?(SPAN|DIV)[^>]*>/gi, "" ); 
        html = html.replace(/\n|\t|\r/g,'');
        html = html.replace(/&nbsp;/ig, " " ); 
        // var re = new RegExp("<P[^>]*>(.*?)<\/P>","gi") ;// Different because of a IE 5.0 error 
        html = html.replace(/<P[^>]*>(.*?)<\/P>/gim, "<p>$1</p>" ) ;
        // Remove Class style lang title attributes 
        html = html.replace(/<(\w[^>]*)(class|style|lang|title)=([^ |>]*)([^>]*)/gi, "<$1$4") ; 
        html = html.replace(/<table[^>]*>(.*?)<\/table>/gim, "<table>$1</table>" ) ;
        html = html.replace(/<tr[^>]*>(.*?)<\/tr>/gim, "<tr>$1</tr>" ) ;
        // html = html.replace(/<td[^>]*>(.*?)<\/td>/gim, "<td>$1</td>" ) ;
        return html;
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
    encrypt(plainText, isMD5 = true){
        var pk = `-----BEGIN PUBLIC KEY-----
            MFwwDQYJKoZIhvcNAQEBBQADSwAwSAJBAIY9/ZRirUo7bcnjr939dpJu3yjh+TNe
            Jhjn1Y4LMWhaNalE7A95pNLRupvQfEVAHAFGwJeJtmXcJcmPN+xuvP8CAwEAAQ==
            -----END PUBLIC KEY-----`;
        var encrypt = new jsencrypt.JSEncrypt();
        encrypt.setPublicKey(pk);
        var encrypted = isMD5 ? encrypt.encrypt(md5(plainText)) : encrypt.encrypt(plainText);
        return encrypted;
    },
    uuid(){
        return 'xxxxxxxxxxxx4xxxyxxxxxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
            var r = Math.random()*16|0, v = c == 'x' ? r : (r&0x3|0x8);
            return v.toString(32);
        });
    },
    getRandomCode(length = 32){
        var data = ["0", "1", "2", "3", "4", "5", "6", "7", "8", "9", "A", "B", "C", "D", "E", "F", "G", "H", "I", "J", "K", "L", "M", "N", "O", "P", "Q", "R", "S", "T", "U", "V", "W", "X", "Y", "Z", "a", "b", "c", "d", "e", "f", "g", "h", "i", "j", "k", "l", "m", "n", "o", "p", "q", "r", "s", "t", "u", "v", "w", "x", "y", "z"];
        var nums = "";
        for (var i = 0; i < length; i++) {
            var r = parseInt(Math.random() * 61);
            nums += data[r];
        }
        return nums;
    }
}