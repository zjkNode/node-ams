/**
 * 工具模块
 * @type {Object}
 */
var util = require("util"),
    moment = require("moment"),
    fs = require('fs'),
    path = require('path'),
    _ = require('lodash'),
    rsa = require('node-rsa'),
    CONSTANTS = require('../config/constants.config');

function flatTree(treeData){
    let resArr = [];
    if(!treeData || treeData.length ===0){return resArr;}
    for(let i = 0; i < treeData.length; i++){
        let item = treeData[i];
        resArr.push(item);
        if(item.children && item.children.length > 0){
            resArr = resArr.concat(flatTree(item.children));
        }
    }
    return resArr;
}
module.exports = {
    unix: function(str) {
        return moment(str).unix();
    },
    dateFormat: function(date, format = 'YYYY-MM-DD hh:mm:ss') {
        var tmpDate = moment();
        if(date){
            tmpDate = moment(date);
        }
        return tmpDate.format(format);
    },
    getHost: function(req){

    },
    firstUper:function(str) {
        str = str.toLowerCase();
        return str.replace(/\b(\w)|\s(\w)/g, function(m) {
            return m.toUpperCase();
        });
    },
    buildTree:function(data,pid){
        var _this = this;
        var resData = data.filter(function(item,index,arr){
            return item.pid === pid;
        });
        if(!resData || resData.length ===0){
            return null;
        }
        resData.map(function(item){
            item.children = _this.buildTree(data,item.id);
        });

        return resData;
    },
    buildTreeTable(data){
        let _this = this;
        let treeData = _this.buildTree(data,0);
        
        return flatTree(treeData);
    },
    authCheck(user, action){
        if(_.includes(CONSTANTS.ADMINISTRATOR_USERS, user.id)){
            return true;
        }
        return _.includes(user.rules, action);
    },
    isAdmin(userId){
        return _.includes(CONSTANTS.ADMINISTRATOR_USERS, userId);
    },
    mkdirsSync(dirpath, mode){
        try{   
            if(!fs.existsSync(dirpath)){
                let pathtmp = '/';
                //这里指用/ 或\ 都可以分隔目录  如  linux的/usr/local/services   和windows的 d:\temp\aaaa
                // _.forEach(dirpath.split(/[/\\]/), function(dirname){
                dirpath.split(/[/\\]/).forEach(function (dirname) {
                    dirname = _.trim(dirname);
                    if (pathtmp != null) {
                        pathtmp = path.join(pathtmp, dirname);
                    } else {
                        pathtmp = dirname;
                    }
                    if (!fs.existsSync(pathtmp)) {
                        if (!fs.mkdirSync(pathtmp, mode)) {
                            return false;
                        }
                    }
                });
            }
            return true; 
        } catch(e) {
            console.log("create director fail! path=" + dirpath +" errorMsg:" + e);        
            return false;
        }
    },
    // encrypt(plainText){ 
    //     // RSA加密
    //     var pubKey = "";
    //     var encrypt = new jsencrypt.JSEncrypt();
    //     encrypt.setPublicKey(pubKey);
    //     var encrypted = encrypt.encrypt(plainText);
    //     // rsa 解密
    //     var privkey = ''
    //     var decrypt = new JSEncrypt();
    //     decrypt.setPrivateKey(privkey);
    //     var uncrypted = decrypt.decrypt(encrypted);
    //     return uncrypted;
    // },
    encrypt(plainText){
        // jsencrypt使用的是pkcs1，node-rsa使用的是KCS1_OAEP
        // private_key.setOptions({encryptionScheme: ‘pkcs1’});
        // RSA加密
        var pubKey = `-----BEGIN PUBLIC KEY-----
                MFwwDQYJKoZIhvcNAQEBBQADSwAwSAJBAIY9/ZRirUo7bcnjr939dpJu3yjh+TNe
                Jhjn1Y4LMWhaNalE7A95pNLRupvQfEVAHAFGwJeJtmXcJcmPN+xuvP8CAwEAAQ==
                -----END PUBLIC KEY-----`;
        var rsaPub = new rsa(pubKey);
        rsaPub.setOptions({ encryptionScheme: 'pkcs1'});
        var encrypted = rsaPub.encrypt(plainText, 'base64');
        return encrypted;
    },
    decrypt(encrypted){ 
        // jsencrypt使用的是pkcs1，node-rsa使用的是KCS1_OAEP
        // private_key.setOptions({encryptionScheme: ‘pkcs1’});
        // RSA解密
        var privkey = `-----BEGIN RSA PRIVATE KEY-----
                    MIIBOwIBAAJBAIY9/ZRirUo7bcnjr939dpJu3yjh+TNeJhjn1Y4LMWhaNalE7A95
                    pNLRupvQfEVAHAFGwJeJtmXcJcmPN+xuvP8CAwEAAQJAFRy8u9CFFm6gRqcjapNJ
                    SaBcQm6/pX+CGFqlsHA8Nf/3kjQlBOcnTK5yAGfcIcmg7Deszu7MVnRyhlVBboqY
                    sQIhAMVENtzWxcN8ASVKqu5E2xIHrKetqmjwu/PTt8+TNr9ZAiEArjYFEBCV+Iqb
                    driMcWwe7g+9/KImwNihTQnkB+jabBcCIQCJQY1q24V/Hyks6WdFomNLiEt54DxS
                    CC6+2PFsXOIbAQIgDo8bKzWHowbKaUiRDCWSDCkqooNWo8U27b5G3VZbcq8CIQC1
                    bphodlYL0wKXUkmu2xn5xAWe7LlRezheEXAyDrqGxQ==
                    -----END RSA PRIVATE KEY-----`;
        var rsaEncrypt = new rsa(privkey);
        rsaEncrypt.setOptions({ encryptionScheme: 'pkcs1'});
        var decrypted = rsaEncrypt.decrypt(encrypted, 'utf-8');
        return decrypted;
    },
    uuid(){
        return 'xxxxxxxxxxxx4xxxyxxxxxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
            var r = Math.random()*16|0, v = c == 'x' ? r : (r&0x3|0x8);
            return v.toString(32);
        });
    }
};