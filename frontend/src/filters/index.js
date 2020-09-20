import util from '@/assets/js/util';
export function dateFormat(value, format){
  return util.dateFormat(value, format);
}

export function isNormal(value){
  // eslint-disable-next-line
  if(/[`~!@#$%^&*()_\-+=<>?:"{}|,.\/;'\\[\]·~！@#￥%……&*（）——\-+={}|《》？：“”【】、；‘’，。、]/im.test(value)){
    return false;
  }
  return true;
}


export function flatTree(row,value){
	if(row.pid == 0){
        return '+ '+ value;
    }
    let level = typeof(row.pids) === 'string' ? row.pids.split(',') : row.pids;
    let suffix = '';
    for(let i = 0; i < level.length; i++){
        suffix += '     ';                                                                                                         
    }
    return suffix +'|— '+ value;
}

export function disableItem(datas, ids){
  ids = ids || [];
  datas.forEach((item) => {
      item.disabled = ids.includes(item.id);
      if(item.children){
          disableItem(item.children, ids)
      }
  })
}

export function formatStyle(styleObject,defaultConf){
  if(!styleObject){
    return '';
  }
  let styleObj = Object.assign({}, styleObject);
  let bgImg = styleObj['background-image'],
      bgColor = styleObj['background-color'];

  if(bgColor && bgColor.indexOf('background-image') > -1){
    bgImg = bgColor.split(':')[1];
    bgColor = '';
    styleObj['background-image'] = bgImg;
    delete styleObj['background-color'];
  }

  if(!bgImg && !bgColor){
      styleObj['background-image'] = (defaultConf && defaultConf['background-image']);
      delete styleObj['background-size'];
  } 
  if(bgImg && styleObj['background-repeat'] === 'no-repeat'){ // 背景图适配全屏
      styleObj['background-size'] = 'cover';
  }
  let tmpStyle = [];
  let pxAttrs = ['height', 'width', 'left', 'top', 'padding-top','padding-bottom','margin-top','line-height', 'font-size', 'margin', 'padding'];
  for(let key in styleObj){
      let styleValue = styleObj[key];
      if(!styleValue){
        continue;
      }
      if(pxAttrs.indexOf(key) > -1){
          let valArr = (styleValue+'').split(' ');
          valArr = valArr.map(val => {
            val = parseInt(val);
            val = isNaN(val) ? '': `${val/2}px`;
            return val;
          });
          styleValue = valArr.join(' ');
      }
      tmpStyle.push(`${key}:${styleValue};`);
  }
  return tmpStyle.join('');
}