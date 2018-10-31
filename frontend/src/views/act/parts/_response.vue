<template>
    <el-row ref="curResponse">
        <el-col :span="8">
            <el-input size="small" placeholder="后台状态码" v-model="response.code"></el-input>
        </el-col>
        <el-col :span="10" :push="1">
            <el-cascader 
                ref="curResUsage"
                size="small" 
                :options="resOptions" 
                v-model="response.usages"
                @active-item-change="onItemChange"
                placeholder="选择对应功能"></el-cascader>
        </el-col>
        <el-col :span="13" v-if="response.usages == 'goOthers'">
            <el-input size="small" v-model="response.href" placeholder="请输入要跳转H5链接地址"></el-input>
        </el-col>
        <el-col :span="1" :push="1">
            <el-button type="text" size="small" plain icon="el-icon-delete" style="color: #F56C6C;" @click="delBackEndStatus(index)"></el-button>
        </el-col>
    </el-row>
</template>
<script>
    import { mapGetters } from 'vuex';

    export default {
        props: ['originData','index'],
        computed: mapGetters({
            cacheActParts: 'getActParts'
        }),
        data() {
            return {
                resOptions:[
                    { value: 'download', label: '去下载' }, 
                    { value: 'goApp', label: '去app', children:[
                            { value: 'goAppIndex', label: '首页' },
                            { value: 'goAppAccount', label: '帐户页' },
                            { value: 'goAppCoupons', label: '优惠券页' },
                            { value: 'goAppCredit', label: '认证中心页' },
                            { value: 'goAppCard', label: '会员卡页' },
                            { value: 'goAppMarket', label: '贷款超市' }
                    ]},
                    { value: 'goAlerts', label: '去弹框'},
                    { value: 'goAlertClose', label: '去关闭弹框' },
                    { value: 'goOthers', label: '去其他H5链接' }
                ],
                response:{
                    code:'',
                    usages:[],
                    href:''
                }
            }
        },
        watch:{
            cacheActParts:'bindResOptions'
        },
        mounted(){
            this.bindResOptions();
            if(this.originData){
                this.response = this.originData;
            }
        },
        methods:{
            getData(){
                return this.response;
                // let obj = {};
                // obj[this.status] = this.handle;
                // return obj;
            },
            delBackEndStatus(index){
                let $curEl = this.$refs.curResponse.$el;
                $curEl.parentNode.removeChild($curEl);
                this.$emit('delBackEndFn',index);
            },
            bindResOptions(){
                // let alters = [];
                // for(let i = 0; i < this.cacheActParts.length; i++){
                //     let item = this.cacheActParts[i];
                //     if(item.type === 'hidden'){
                //         alters.push({ value: item.name, label: item.desc });
                //     }
                // }
                // let conf = { value: 'goAlerts', label: '去弹框', children:alters };
                // this.resOptions.splice(2,1,conf);

                if(!this.cacheActParts){
                    return;
                }
                let alters = this.cacheActParts.filter(item => item.type === 'hidden');
                this.resOptions[2].children = alters;

                // let _this = this;
                // this.$nextTick(()=>{
                //     let $curResUsage = $(this.$refs.curResUsage.$el);
                //     $curResUsage.find('.el-select-dropdown__item').hover(function(){
                //         _this.$store.dispatch("setCurActBtnRes",$(this).data('key'));
                //    }, function(){
                //         _this.$store.dispatch("setCurActBtnRes",null);
                //    });
                // });
            },
            onItemChange(value){
                let _this = this;
                this.$nextTick(() => {
                    let $casMenus = document.getElementsByClassName("el-cascader-menu");
                    let $alertContainer = $casMenus[$casMenus.length - 1];
                    let $alerts = $alertContainer.getElementsByTagName('li');

                    if(value[0] !== 'goAlerts'){
                        for (let i = 0; i < $alerts.length; i++) {
                            $alerts[i].removeEventListener('mouseenter', _this.onItemEnter);
                            $alerts[i].removeEventListener('mouseleave', _this.onItemLeave);
                        }
                        return;
                    }
                    for (let i = 0; i < $alerts.length; i++) {
                        $alerts[i].addEventListener('mouseenter', _this.onItemEnter);
                        $alerts[i].addEventListener('mouseleave', _this.onItemLeave);
                    }
                });
            },
            onItemEnter(e){
                let index = [].indexOf.call(e.target.parentNode.children, e.target);
                let curAlert = this.resOptions[2].children[index];
                this.$store.dispatch("setCurActBtnRes",curAlert.value);
            },
            onItemLeave(){
                this.$store.dispatch("setCurActBtnRes",null);
            },
            // handleItemChange(val){
            //     var _this = this;
            //     // this.$nextTick(()=>{
            //     //     let $alerts = $('.el-cascader-menus:visible').find('ul:last li');
            //     //     if(val != 'goAlerts'){
            //     //         $alerts.unbind('mouseenter').unbind('mouseleave');
            //     //         return;
            //     //     }
                    
            //     //     $alerts.hover(function(){
            //     //         let $sender = $(this);
            //     //         let index = $alerts.index($sender);
            //     //         let curAlert = _this.resOptions[2].children[index];
            //     //         _this.$store.dispatch("setCurActBtnRes",curAlert.value);
            //     //     }, function(){
            //     //         _this.$store.dispatch("setCurActBtnRes",null);
            //     //     });
            //     // });
            // }
        }
    }
</script>
