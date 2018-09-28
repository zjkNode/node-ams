var session = require('express-session');
var dbconfig  = require("../config/config").mysqlConfig;

// var mongoStore = require('connect-mongo')(session);
// var mongoose = require('mongoose');

// var FileStore = require('session-file-store')(session);
var MySQLStore = require('express-mysql-session')(session);
var options = {
    host:      dbconfig.host,  
    user:      dbconfig.user,   
    password:  dbconfig.pwd,    
    database:  dbconfig.dbname,    
    port:      dbconfig.port
};


module.exports = {
  secret: 'nodesys', // 用来对session id相关的cookie进行签名
  name: 'nodesyscookie', // cookie的名字
  cookie: {
    httpOnly: false,
    maxAge:1000 * 60 * 60 * 24 * 7 // session 及相应cookie过期时间， 未设置为null 代表每次关闭浏览器时，session会失效
  },
  // store: new mongoStore({
  //   mongooseConnection: mongoose.connection
  // }),
  // store: new FileStore(),  // 本地存储session（文本文件，也可以选择其他store，比如redis的）
  store: new MySQLStore(options),
  resave: false, // 是否每次都重新保存会话，建议false
  saveUninitialized: false // 是否自动保存未初始化的会话，建议false
};




// 使用 session-file-store 
// // 登录接口
// app.post('/login', function(req, res, next){
    
//     var sess = req.session;
//     var user = findUser(req.body.name, req.body.password);

//     if(user){
//         req.session.regenerate(function(err) {
//             if(err){
//                 return res.json({ret_code: 2, ret_msg: '登录失败'});                
//             }
            
//             req.session.loginUser = user.name;
//             res.json({ret_code: 0, ret_msg: '登录成功'});                           
//         });
//     }else{
//         res.json({ret_code: 1, ret_msg: '账号或密码错误'});
//     }   
// });

// // 退出登录
// app.get('/logout', function(req, res, next){
//     // 备注：这里用的 session-file-store 在destroy 方法里，并没有销毁cookie
//     // 所以客户端的 cookie 还是存在，导致的问题 --> 退出登陆后，服务端检测到cookie
//     // 然后去查找对应的 session 文件，报错
//     // session-file-store 本身的bug    

//     req.session.destroy(function(err) {
//         if(err){
//             res.json({ret_code: 2, ret_msg: '退出登录失败'});
//             return;
//         }
        
//         // req.session.loginUser = null;
//         res.clearCookie(identityKey);
//         res.redirect('/');
//     });
// });
