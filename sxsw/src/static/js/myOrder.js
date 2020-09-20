(function(){
	var $box = $('.myOrderBox');
	// 调取个人订单接口：
	utility.indicator.open();
	var url = '/loancat/orderSelect ';
	var params = {
		uid: Global.user.mobile
	};
	$.ajax({
    type: 'POST',
    url: url,
    contentType: 'application/json',
    data: JSON.stringify(params),
    dataType: 'json',
    success: function(res){
			utility.indicator.close();
      if(res.code == 300){
        //没有订单：
        $('.myOrderNo').css('display','block')
      }else if(res.code == 200){
        $box.css('display','block')
        orderHtml (res.data)
      }else{
        utility.toast(res.message);
      }
    },
    error: function(err){
			utility.indicator.close();
    }
  });
	function orderHtml (data){
		console.log(data)
		var str = '';
    for(var i =0;i<data.length;i++){
    	str += `<div class="orderItem">\
          <p class="orderInfor">\
            <span class="orderTime">${data[i].create_date}</span>\
						<span class="orderNum">订单号: <span>${data[i].oid}</span></span>
          </p>\
          <div class="totalList">\
              <div class="listImg">\
                <img  class='' src="${data[i].image}" alt="">\
              </div>\
              <p class='listIntro'>${data[i].describeo}</p>\
              <p class='listIntro infor'>${data[i].describet}</p>\
              <p class="listNum">X ${data[i].number}</p>\
              <p class="listPrice">¥ ${data[i].payment}</p>\
              <div class="btnPay">\
                待支付\
              </div>\
          </div>\
      </div>`
    }
    console.log(str)
    $box.append(str)
	}


})()

