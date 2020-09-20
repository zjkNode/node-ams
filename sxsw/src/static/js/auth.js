(function(){
    var validate = {
        isMobile: function(mobile) {
            var mobileRegex = /^[1][3-8]\d{9}$/;
            return mobileRegex.test(mobile);
        },
        isNull: function(val) {
            return !!val
        },
        isCardNo: function(card) {
            var reg = /(^\d{15}$)|(^\d{18}$)|(^\d{17}(\d|X|x)$)/;
            return reg.test(card);
        }
    };
    var auth = {
        opts: {
            mask: $('.auth-mask'),
            nameId: '',
            cardNo: '',
            mobile: '',
            address: '',
            married: '',
            files: [],
            user: ''
        },
        init: function() {
            var contH = $('html').height() - $('.header').height() - $('.footer').height()-76;
            $('.content').css('min-height',contH);
            if(!Global.user) {
                window.location.href = '/';
                return;
            }
            this.opts.user = Global.user;
            $('.auth-header').html(this.opts.user.mobile);
            if(!!this.opts.user.step1  ) {
                $("#jb-store").text('认证失败');
                $("button[data-for='jb-infor-mask']").addClass('disabled').attr('disabled',true);
            } else {
                $("#jb-store").text('未认证');
            }
            if(!!this.opts.user.step2  ) {
                $("#sf-store").text('认证失败');
                $("button[data-for='sf-infor-mask']").addClass('disabled').attr('disabled',true);
            } else {
                $("#sf-store").text('未认证');
            }
            this.goToAuth();
            this.closeMask();
            this.focusInput();
            this.submitInfor();
            this.uploadFile();
            this.submitFiles();
            this.checkMarriedBox();
        },
        checkMarriedBox: function() {
            var me = this;
            var inputs = $(".auth-jb-content input[type='checkbox']");
            inputs.on('click', function() {
                me.opts.married = $(this).val();
                inputs.not(this).attr('checked', false);
            })
        },
        goToAuth: function() {
            var me = this;
            $(".auth-infor").delegate('li button', 'click', function() {
                var content = $('#' + $(this).attr('data-for'));
                var input = $("input[name = 'mobile']");
                me.opts.mask.show();
                content.show();
                input.val(Global.user.mobile);
                me.opts.mobile =  input.val();
            })
        },
        closeMask: function () {
            var me = this;
            $(".auth-close").on('click', function() {
                $(this).parent().hide();
                me.opts.mask.hide();
            })
        },
        focusInput: function() {
            var me = this;
            $(".auth-jb-content input").on('focus', function() {
                $(this).addClass('focus')
            }).on('blur', function() {
                var inputName = $(this).attr('name');
                $(this).removeClass('focus');
                me.opts[inputName]= $(this).val();
            })
        },
        submitInfor: function() {
            var me = this.opts;
            $(".auth-input-btn").on('click', function() {
                if(!me.nameId) {
                    $("input[name='nameId']").addClass('focus');
                    utility.toast('姓名不能为空');
                    return;
                }
                if(!validate.isCardNo(me.cardNo)) {
                    $("input[name='cardNo']").addClass('focus');
                    utility.toast('身份证号码填写不对');
                    return;
                }
                if(!validate.isMobile(me.mobile)) {
                    $("input[name='mobile']").addClass('focus');
                    utility.toast('电话号码填写不对');
                    return;
                }
                if(!me.address) {
                    $("input[name='address']").addClass('focus');
                    utility.toast('家庭住址填写不对');
                    return;
                }
                if(!me.married) {
                    utility.toast('请选择婚姻状态');
                    return;
                }
                var data = JSON.stringify({
                    userId: Global.user.userId,
                    step: 1
                });
                utility.indicator.open('正在提交');
                $.ajax({
                    url: '/loancat/submitRisk',
                    data: data,
                    dataType: 'JSON',
                    method: 'post',
                    contentType: 'application/json',
                    success: function(res) {
                        if(res.code == 200) {
                            window.setTimeout(
                                function() {
                                    utility.indicator.close();
                                    $("#jb-infor-mask").hide();
                                    me.mask.hide();
                                    $("#jb-store").text('认证失败');
                                    $("button[data-for='jb-infor-mask']").addClass('disabled').attr('disabled',true);
                                    var user = JSON.parse(utility.getCookie('user'));
                                    user.step1 = true;
                                    utility.setCookie('user',JSON.stringify(user));
                                },
                                3000);
                        }else {
                            utility.toast(res.message);
                        }
                    },
                    error: function(err) {
                        utility.indicator.close();
                        utility.toast(err);
                    }
                })
            })
        },
        submitFiles: function() {
            var me = this.opts;
            $(".auth-sf-btn").on('click', function() {
                if(me.files.length <= 1) {
                    utility.toast('请上传身份证正反两面');
                    return;
                }
                var data = JSON.stringify({
                    userId: Global.user.userId,
                    step: 2
                });
                utility.indicator.open('正在提交');
                $.ajax({
                    url: '/loancat/submitRisk',
                    data: data,
                    dataType: 'JSON',
                    method: 'post',
                    contentType: 'application/json',
                    success: function(res) {
                        if(res.code == 200) {
                            window.setTimeout(
                                function() {
                                    utility.indicator.close();
                                    $("#sf-infor-mask").hide();
                                    me.mask.hide();
                                    $("#sf-store").text('认证失败');
                                    $("button[data-for='sf-infor-mask']").addClass('disabled').attr('disabled',true);
                                    var user = JSON.parse(utility.getCookie('user'));
                                    user.step2 = true;
                                    utility.setCookie('user',JSON.stringify(user));
                                },
                                3000);
                        }else {
                            utility.toast(res.message);
                        }
                    },
                    error: function(err) {
                        utility.indicator.close();
                        utility.toast(err);
                    }
                })
            })

        },
        uploadFile: function() {
            var me = this;
            $("input[type='file']").on('change', function(e) {
                var val = e.target.name;
                var files = this.files;
                var file = files[0];
                var index = $(this).index();
                if (window.FileReader) {
                    var reader = new FileReader();
                    reader.readAsDataURL(file);
                    //监听文件读取结束后事件
                    reader.onload = function (e) {
                        var fileImg = $($('.file-img')[index]).find('img')[0];
                        fileImg.src = e.target.result;//e.target.result就是最后的路径地址
                        $(fileImg).css('display', 'block');
                        if(!(me.opts.files.indexOf(val) > -1)) {
                            me.opts.files.push(val);
                        }
                    };
                }
            })
        }
    };
    auth.init()
})();