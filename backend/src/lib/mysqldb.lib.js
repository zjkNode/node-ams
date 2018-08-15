//导入所需模块  
let mysql = require("mysql");
//导入配置文件  
let dbconfig  = require("../config/config").mysqlConfig;
let logger = require('./logger.lib');
let _ = require('lodash');


let pool = mysql.createPool({
    host:      dbconfig.host,  
    user:      dbconfig.user,   
    password:  dbconfig.pwd,    
    database:  dbconfig.dbname,    
    port:      dbconfig.port
});

let _this = this;
let defaultOptions = {
    join:'',// join
    where:'', // where 条件
    fields:[], // 查询字段
    order:'', // 排序
    groupby:[],
    page: -1, // 分页起始位置
    limit: -1 // 每页记录数
};
let _options = _.cloneDeep(defaultOptions);
// require('mysql') 一次，就常驻内存，
// 所以sql执行完之后要重置
function _release(){
    var tmpOptions = _.cloneDeep(_options);
    _options = _.cloneDeep(defaultOptions);
    return tmpOptions;
}
// 执行 sql 语句
function _execute(sql, params, callback){
    pool.getConnection(function(err,conn){
        if(err){    
            callback(err);
            return;   
        }
        conn.config.queryFormat = sql.indexOf(':') > -1 ? _queryFormat : null;
        // conn.config.queryFormat = _queryFormat;
        logger.debugDB(sql);
        conn.query(sql, params, function(qerr,rows,fields){
            //释放连接    
            conn.release();    
            //事件驱动回调 
            callback(qerr,rows,fields);

        }); 
    });    
};

function fields(options){
    if(options){
        for (let i = 0; i < options.length; i++) {
            let field = options[i];
            if(field.indexOf('.') > -1 || field.indexOf('as') > -1){
                _options.fields.push(field);
                continue;
            }
           _options.fields.push('`'+ options[i] +'`');
        }
    }
    return _this;
}

// option {key1:'desc',key2:'asc',key3:'desc'}
function order(options){
    let order = [];
    if(options){
        for(let key in options){
            var value = options[key].toUpperCase();

            if(key.toLowerCase() == 'fn'){
                order.push(value);
                continue;
            }
            if(key.indexOf('.') > -1){
                let k = key.replace('.','`.`');
                order.push('`'+ k +'` '+ value);
                continue;
            }
            order.push('`'+ key +'` '+ value);
        }
        _options.order = ' order by '+ order.join(',');
    }
    return _this;
}

function groupby(options){
    if(options){
        for (let i = 0; i < options.length; i++) {
            let field = options[i];
            if(field.indexOf('.') > -1 || field.indexOf('as') > -1){
                _options.groupby.push(field);
                continue;
            }
           _options.groupby.push('`'+ options[i] +'`');
        }
    }
    return _this;
}

function join(join){
    _options.join = join || '';
    return _this;
}

// function page(page,limit){
//     page = parseInt(page) || 1;
//     limit = parseInt(limit) || 15;
//     _options.page = (page -1)  * limit;
//     _options.limit = limit;
//     return _this;
// }

function limit(page,limit){
    page = parseInt(page) || 1;
    limit = parseInt(limit) || 15;
    _options.page = (page -1)  * limit;
    _options.limit = limit;
    return _this;
}

function count(tbname, callback){
    let tmp_opt = _release();
    let fieldSql = tmp_opt.fields.length === 0 ? '*' : tmp_opt.fields.join(',');
    let sql = 'SELECT count('+ fieldSql +') as tmp_count FROM `'+ tbname +'`' + tmp_opt.join  + tmp_opt.where;
    
    _execute(sql,null,function(qerr,rows){
        if(qerr){
            return callback(qerr);
        }
        return callback(null,rows[0]['tmp_count']);
    });
}

function select(tbname,callback){
    let tmp_opt = _release();
    let fieldSql = tmp_opt.fields.length === 0 ? '*' : tmp_opt.fields.join(',');
    let sql = 'SELECT '+ fieldSql +' FROM `'+ tbname +'` '+ tmp_opt.join +  tmp_opt.where;
    if(tmp_opt.groupby.length > 0){
        sql += ' GROUP BY '+ tmp_opt.groupby.join(',');
    }

    if(tmp_opt.order.length > 0){
        sql += tmp_opt.order;
    }

    if(tmp_opt.page > -1){
        sql += ' LIMIT '+ tmp_opt.page +','+ tmp_opt.limit;
    }
    
    _execute(sql,null,function(qerr,rows){
        if(qerr){
            return callback(qerr);
        }
        return callback(null,rows);
    });
}

function insert(tbname,options,callback){

    _getFields(tbname,function(err,cols){
        if(err){
            return callback(err);
        }
        let fields = [], values = [], errors = [];
        for(let fieldName in cols){
            let field = cols[fieldName];
            if(field.primary) continue;
            if(field.notnull){
                if(!options.hasOwnProperty(fieldName) || options[fieldName] === null){
                    errors.push(fieldName + ' can not be null' + options[fieldName]);
                }
            } else {
                if(!options.hasOwnProperty(fieldName) || options[fieldName] === null){
                    continue;
                }
            }

            fields.push('`'+ fieldName +'`');
            if(cols[fieldName].type.indexOf('int') > -1){
                values.push(':'+ fieldName);
            } else {
                values.push('":'+ fieldName +'"');
            }
        }
        if(errors.length > 0){
            return callback(errors);
        }

        let insql = 'INSERT INTO `'+ tbname +'` ('+ fields.toString() +') VALUES ('+ values.toString() +')';
        _execute(insql,options,function(qerr,res){
            if(qerr){
                return callback(qerr);
            }
            // res = {
            //   fieldCount: 0,
            //   affectedRows: 1,
            //   insertId: 3,
            //   serverStatus: 2,
            //   warningCount: 0,
            //   message: '',
            //   protocol41: true,
            //   changedRows: 0 }
            callback(null,res.insertId);
        });

    });
}

function update(tbname, data, callback){
    let tmp_opt = _release();
    _getFields(tbname,function(err,cols){
        if(err){
            return callback(err);
        }
        var setFields = [];
        for(let key in data){
            if(!cols.hasOwnProperty(key)) continue;
            if(cols[key].primary) continue;

            if(cols[key].type.indexOf('int') > -1){
                setFields.push('`'+ key +'`=:'+ key);
            } else {
                setFields.push('`'+ key +'`=":'+ key +'"');
            }
        }

        let upsql = 'UPDATE `'+ tbname +'` SET ' + setFields.join(',') + tmp_opt.where;
        _execute(upsql,data,function(qerr,res){
            if(qerr){
                return callback(qerr)
            }
            return callback(null,res);
        });
    });
}

function remove(tbname, callback){
    let tmp_opt = _release();
    let rmsql = 'DELETE FROM `'+ tbname +'`'+ tmp_opt.where;
    _execute(rmsql,null,function(qerr,res){
        if(qerr){
            return callback(qerr);
        }
        callback(null,res);
    });
}

// where = string | {key:value,_complex:{key:value,key:[operator,value],_complex:"and|or"}}
function where(where){
    if(_.isString(where)){
        // return where;
        _options.where = ' WHERE '+ where;
        return _this;
    }
    let map = [];
    for(let key in where){
        if(!where.hasOwnProperty(key)) continue;
        
        let k = key;
        if(key.indexOf('.') > -1){
            k = key.replace('.','`.`');
        }
        let value = where[key];
        if(key === "_complex"){
            map.push(_complex(value));
            continue;
        }
        if(_.isArray(value)){
            switch(value[0].toLowerCase()){
                case 'like':
                    map.push(' `'+ k +'` '+ value[0] + ' "%'+ _.escape(value[1]) +'%" ');
                    break;
                case 'in':
                    !value[1] || value[1].length == 0 || map.push(' `'+ k +'` in ('+ value[1] +') ');
                    break;
                default:
                    map.push(' `'+ k +'` '+ value[0] + ' "'+ _.escape(value[1]) +'" ');
            }
            continue;
        }
        if(_.isNumber(value)){
            map.push(' `'+ k +'`='+ value +' ');
        } else {
            map.push(' `'+ k +'`="'+ _.escape(value) +'" ');
        }
    }
    if(map.length > 0){
        // return ' WHERE'+ map.join('AND');
        _options.where = ' WHERE'+ map.join('AND');
    } 
    // return '';
    return _this;
}

// _complex = { logic:"or", email:"zjk@126.com", nickname:["like|=|>=|<=|!=","zjk"]}
function _complex(complex){
    let logic = 'AND', complexMap = [];
    for(let ckey in complex){

        let ck = ckey;
        if(ckey.indexOf('.') > -1){
            ck = ckey.replace('.','`.`');
        }
        let cvalue = complex[ckey];
        if(ckey === '_logic'){
            logic = complex._logic.toUpperCase();
            continue;
        }
        if(_.isArray(cvalue)){
            switch(cvalue[0].toLowerCase()){
                case 'like':
                    complexMap.push(' `'+ ck +'` '+ cvalue[0] +' "%'+ _.escape(cvalue[1]) +'%" ');
                    break;
                case 'in':
                    !cvalue[1] || cvalue[1].length == 0 || complexMap.push(' `'+ ck +'` in ('+ cvalue[1] +') ');
                    break;
                default:
                    complexMap.push(' `'+ ck +'` '+ cvalue[0] +' "'+ _.escape(cvalue[1]) +'" ');
            }

            // if(cvalue[0].toLowerCase() === 'like'){
            //     complexMap.push(' `'+ ck +'` '+ cvalue[0] +' "%'+ _.escape(cvalue[1]) +'%" ');
            // } else {
            //     complexMap.push(' `'+ ck +'` '+ cvalue[0] +' "'+ _.escape(cvalue[1]) +'" ');
            // }
        } else {
            complexMap.push(' `'+ ck + '`="'+ _.escape(cvalue) +'" ');
        }
    }

    return ' ('+ complexMap.join(logic) +')';
}

function _queryFormat(query,params) {
    if(!params) return params;

    let formatQuery = query.replace(/\:(\w+)/g,function(txt,key) {
        if(params.hasOwnProperty(key)){
            return _.escape(params[key]);
        }
        return txt;
    }.bind(this));
    logger.debugDB(formatQuery);
    return formatQuery;
}

// 获取 table 所有列
function _getFields(tableName,callback) {
    let sql = 'SHOW COLUMNS FROM `'+ tableName +'`';
    _execute(sql, null,function(err,rows,fields){
        if(err){
            return callback(err);
        }
        let res = {};
        if(rows){
            for (let i = 0; i < rows.length; i++) {
               let row = rows[i];
               res[row.Field] = {
                name: row.Field,
                type: row.Type.toLowerCase(),
                notnull: row.Null.toLowerCase() === 'no',
                default: row.Default,
                primary: row.Key.toLowerCase() === 'pri',
                autoinc: row.Extra.toLowerCase() === 'auto_increment'
               };
            }
        }
        callback(null,res);
    });
}

exports.fields = fields;
exports.where = where;
exports.join = join;
exports.order = order;
exports.groupby = groupby;
// exports.page = page;
exports.limit = limit;
exports.count = count;
exports.select = select;
exports.insert = insert;
exports.update = update;
exports.remove = remove;
exports.execute = _execute;