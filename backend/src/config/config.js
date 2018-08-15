// dev DB
exports.mysqlConfig = {
    host: '127.0.0.1'
    , user: 'root'
    , pwd: '1qaz@WSX'
    , dbname: 'cms_system'
    , port: 3306
};

//oss 
exports.ossConfig = {
    region: 'oss-cn-beijing',
    accessKeyId: 'I72OyW8Akz0jqSf1',
    accessKeySecret: 'Y7zVRneL6coe94zjReki0HR3UZ28nO',
    imgBucket: 'hetrone-img-test',
    actBucket: 'static-act-test',
};

//test  
exports.ossTestConfig = {
    region: 'oss-cn-beijing',
    accessKeyId: 'I72OyW8Akz0jqSf1',
    accessKeySecret: 'Y7zVRneL6coe94zjReki0HR3UZ28nO',
    imgBucket: 'hetrone-img-test',
    actBucket: 'static-act-test'
};

// dev API
// exports.loanApiConfig = {
// 	host: '172.16.51.36',
//     port: '8165'
// };

exports.loanApiConfig = {
    host: 'test-admin-nb.hetrone.com'
};
