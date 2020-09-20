(function(){
	var personal = {};
	personal.goodsInfor = {
		'id': utility.getQueryParams('goodsId'),
		'select': utility.getQueryParams('select'),
		'dataPay': utility.getQueryParams('datapay')
	};
	personal.goodsData = {};
	personal.addrsssData = areas;
	personal.addressInfor = {
		'shengfen':'',
		'chengshi':'',
		'diqu':'',
		'detail':'',
		'name':'',
		'mobile':''
	};
	personal.chengshiData = [];
	personal.diquData = [];
	personal.isHasAddress = false;
	personal.init = function(){
		this.paramesData()
		this.calcPayment()
		this.payChange()
		this.addAddress()

	}
	personal.addAddress = function(){
		var _this = this;
		$('.addAddress').click(function(){
			var hg= parseInt($('body').css('height'));
			console.log(hg)
			$('.modelAddress').css({'height':hg+'px','display':'block'})
			//渲染地址select
			_this.addressSelect()
		})
		$('.close').click(function(){
			$('.modelAddress').css('display','none')
		})
		$('.phone>input').blur(function(){
			var val = $(this).val()
			var reg=/^(\+86)?\s*1[34578]\d{9}$/;
    	if(val.toString().match(reg)){
        _this.addressInfor.mobile = val;
    	}else{
    		$(this).val("")
        _this.addressInfor.mobile = '';
    	}
		})
		//保存信息：
		$('.btnSave').click(function(){
			_this.addressInfor.detail = $('.addressDetail').val().trim();
			_this.addressInfor.name = $('.consignee').val().trim();
			var str = ''
			for(var key in _this.addressInfor){
				if(key != 'mobile' &&  _this.addressInfor[key] == ''){
					return
				}	
				str += _this.addressInfor[key]+ '  '
				
			}
			$('.modelAddress').css('display','none');
			$('.addressNo').html(str)
			_this.isHasAddress = true;
	
		})	
	}
	personal.addressSelect = function(){
		//先渲染省份
		var _this =this;
		var $shengfen =$('#shengfen')
		var $chengshi = $('#chengshi')
		var $diqu = $('#diqu')
		_this.ergodicAddress($shengfen,_this.addrsssData)
		$shengfen.change(function(){
			var $this =$(this);
			var index = $shengfen.children('option:contains('+$this.val()+')').index()-1;
			if(index>-1){
				_this.addressInfor.shengfen = $this.val();
				_this.addressInfor.chengshi = '';
				_this.addressInfor.diqu = ''
				_this.chengshiData = _this.addrsssData[index].children;
				_this.ergodicAddress($chengshi,_this.chengshiData)
				
			}else{
				_this.addressInfor.shengfen = '';
			}
			console.log(_this.addressInfor);
		})
		//选择城市
		$chengshi.change(function(){
			var $this =$(this);
			var index = $chengshi.children('option:contains('+$this.val()+')').index()-1;
			if(index>-1){
				_this.addressInfor.chengshi = $this.val();
				_this.addressInfor.diqu = ''
				_this.diquData = _this.chengshiData[index].children;
				_this.ergodicAddress($diqu,_this.diquData)
			}else {
				_this.addressInfor.chengshi = '';
			}
			console.log(_this.addressInfor);
		})
		//选择地区
		$diqu.change(function(){
			var $this =$(this);
			_this.addressInfor.diqu = $this.val();
			var index = $diqu.children('option:contains('+$this.val()+')').index()-1;
			_this.addressInfor.diqu = index>-1? $this.val(): '';
			console.log(_this.addressInfor);
		})	
	}
	personal.ergodicAddress = function($selector,data){
		var _this = this;
		var str = '';
		$selector.html('<option value="请选择">请选择</option>');
		for(var i = 0;i<data.length;i++){
			str += `<option value=${data[i].name}>${data[i].name}</option>`
		}
		$selector.append(str)
	}
	personal.paramesData = function(){
		var _this = this;
		console.log(_this.goodsInfor)
		$('select').val(_this.goodsInfor.select);
		$('.details_time>span[data-value='+_this.goodsInfor.dataPay+']').addClass('active')
		var param = _this.goodsInfor.id.split("_");
    _this.goodsData = value_data[param[0]].data[param[1]-1];
    $('.listImg>img').attr('src',_this.goodsData.img)
    $('.listIntro').html(_this.goodsData.describe_1);
    $('.infor').html(_this.goodsData.describe_2);
	}
	personal.payChange = function(){
		var _this = this;
		//切换首付比例
    $('.details_pay>select').change(function () {
      _this.goodsInfor.select = $(this).val();
      _this.calcPayment()
    })
    //切换分期月数
    $('.details_time').on('click','span',function(){
    	var $this =$(this);
    	$this.addClass('active');
    	$this.siblings().removeClass('active');
    	_this.goodsInfor.dataPay = $this.data('value')
    	_this.calcPayment()
    });
    //点击立即支付：
    $('.btnPay').click(function(){
    	if(_this.isHasAddress == true){
    		//去获取订单号：
    		utility.indicator.open();
		    var url = '/loancat/order';
				var params = {
					uid: Global.user.mobile,
					id: _this.goodsData.id,
	  			img: _this.goodsData.img,
	  			describe_1: _this.goodsData.describe_1,
	    		describe_2: _this.goodsData.describe_2,
	        number:'1',
	        payMent:_this.goodsInfor.payment
				};
				$.ajax({
		      type: 'POST',
		      url: url,
		      contentType: 'application/json',
		      data: JSON.stringify(params),
		      dataType: 'json',
		      success: function(res){
						utility.indicator.close();
						if(res.code != 200){
							utility.toast(res.message);
							return;
						}
						$('.orderNum').html(res.data.oid)
						$('.realPay').html(_this.goodsInfor.payment)
    				var hg= parseInt($('body').css('height'));
						$('.modelPay').css({'height':hg+'px','display':'block'})
		     	},
		      error: function(err){
						utility.indicator.close();
		      }
		    });	
    	}else {
    		utility.toast('请先添加地址')
    	}
    })
    $('.btnPayNo').click(function(){
    	$('.modelPay').css('display','none')
    	window.location.href='/myOrder.html'
    })
    $('.btnPayYes').click(function(){
    	$('.modelPay').css('display','none')
    	utility.toast('今天份额已售完')
    })

	}
	personal.calcPayment =function(){
		var _this = this;
		var select = _this.goodsInfor.select;
		var dataPay = _this.goodsInfor.dataPay;
		var price = _this.goodsData.price
		if(dataPay == 0){
			_this.goodsInfor.payment = price;
		}else {
			//月付+支付比例
			var payM = utility.getPerPay(price, dataPay, select);
			var payR = (parseFloat(price) * select );
			_this.goodsInfor.payment = (parseFloat(payM) + payR).toFixed(2);
		}
		console.log(_this.goodsInfor.payment);
		$('.listPrice,.payNum').text('¥ '+_this.goodsInfor.payment)
	}
	personal.init()
})()