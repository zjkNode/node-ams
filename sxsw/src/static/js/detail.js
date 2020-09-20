(function() {
    init();
    function init() {
        params();
        initBanner();
        // tab();
    }

    function initBanner() {
        var mySwiper = new Swiper('.swiper-container', {
            'loop': true,
            'autoplay': 1000 * 3,
            // 如果需要分页器
            'pagination': '.swiper-pagination',
            'paginationClickable': true
        });
    }
    function params() {
        var $container = $('#infor_data');
        var infors = $('#infors').html();
        var params = utility.getQueryParams('id');
        var param = params.split("_");
        var groupData = value_data[param[0]].data;
        for (var i = 0; i < groupData.length; i++) {
            var infordata = groupData[i];
            if (infordata.id == params) {
              $container.append(utility.tmplFormat(infors, infordata, itemFormat));
            }
        }
    }

    function itemFormat(itemObj, match) {
        var itemKey = match;
        if (itemKey == "monthly_month") {
            return utility.getPerPay(itemObj.price, 12, 0)
        }

        if(itemKey == 'infor_img'){
            var imgs = itemObj.infor_img;
            var imgArr = [];
            for (var i = 0; i < imgs.length; i++) {
               var img = imgs[i];
               imgArr.push('<img src="'+img+'" alt="" />')
            }
            return imgArr.join('');
        }
    }

    function tab() {
        var $tabTitle = $('.tabs').find('li');
        var $contents = $('.tab-content');
        $tabTitle.click(function () {
            $(this).addClass('on').siblings().removeClass('on');
            var index = $(this).index();
            $contents.eq(index).show().siblings().hide();
        });
    }
})();