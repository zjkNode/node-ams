var moment = require('moment');

export function formatDate(value, format){
  format = format || 'YYYY-MM-DD hh:mm:ss';
  var tmpDate = moment();
  if(value){
      tmpDate = moment(value);
  }
  return tmpDate.format(format);
}

export function isNormal(value){
  if(/[`~!@#$%^&*()_\-+=<>?:"{}|,.\/;'\\[\]·~！@#￥%……&*（）——\-+={}|《》？：“”【】、；‘’，。、]/im.test(value)){
    return false;
  }
  return true;
}


export function flatTree(row,value){
	if(row.pid == 0){
        return '+ '+ value;
    }
    let level = row.pids.split(',');
    let suffix = '';
    for(let i = 0; i < level.length; i++){
        suffix += '     ';                                                                                                         
    }
    return suffix +'|— '+ value;
}

export function disableItem(datas,id){
  datas.map(function(item){
      item.disabled = item.id === id;
      if( !item.disabled && item.children){
          disableItem(item.children,id)
      }
  })
}