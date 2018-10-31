<template>
	<div class="alertsWrapper flex-center-v" v-show="wrapShow" ref="alertsWrapper">
        <div class="mask"></div>
        <el-popover ref="alerts-pop" placement="right" width="400" trigger="click">
            <el-form label-width="70px">
                <el-form-item label="弹框宽高" >
                    <el-col :span="7">
                        <el-input v-model="comData.wrap.style.width" placeholder="宽"></el-input>
                    </el-col>
                    <el-col :span="7" :push="1">
                        <el-input v-model="comData.wrap.style.height" placeholder="高"></el-input>
                    </el-col>
                </el-form-item>
                <el-form-item label="弹框背景">
                    <el-row>
                        <el-col :span="7">
                            <el-input v-model="comData.wrap.style['background-color']" placeholder="色值（以#开头）"></el-input>
                        </el-col>
                        <el-col :span="7" :push="1">
                            <el-select v-model="comData.wrap.style['background-repeat']" placeholder="请选择" v-show="comData.wrap.style['background-image']" style="padding-right:10px;">
                                <el-option v-for="item in bgImgOptions"
                                            :key="item.value"
                                            :label="item.label"
                                            :value="item.value">
                                </el-option>
                            </el-select>
                        </el-col>
                        <el-col :span="7" :push="1">
                            <el-upload action="/api/act/upload"
                                :data="uploadData"
                                :limit="1"
                                :file-list="bgList"
                                accept="image/gif,image/jpeg,image/png"
                                :on-exceed= "handleBgExceed"
                                :on-remove="handleBgRemove"
                                :on-success = "handleBgSuccess"
                                :multiple = "false"
                                :auto-upload="true"
                                list-type="text">
                            <el-button size="small" type="primary">上传背景图</el-button>
                            </el-upload>
                        </el-col>
                    </el-row>
                </el-form-item>
                <el-form-item label="弹框圆角">
                    <el-switch v-model="comData.wrap.radius"></el-switch>
                </el-form-item>
                <el-form-item label="关闭按钮">
                    <el-col :span="7">
                        <el-select clearable size="small" v-model="comData.closeBtn.position" placeholder="位置">
                            <el-option v-for="item in closePosition"
                                        :key="item.value"
                                        :label="item.label"
                                        :value="item.value">
                            </el-option>
                        </el-select>
                    </el-col>
                    <el-col :span="16" :push="1">
                        <el-upload action="/api/act/upload"
                                :data="uploadData"
                                :limit="1"
                                :file-list="closeBtnList"
                                accept="image/gif,image/jpeg,image/png"
                                :on-exceed= "handleBgExceed"
                                :on-remove="handleCloseRemove"
                                :on-success = "handleCloseSuccess"
                                :multiple = "false"
                                :auto-upload="true"
                                list-type="text">
                            <el-button size="small" type="primary">上传图片</el-button>
                        </el-upload>
                    </el-col>
                    
                </el-form-item>
                <el-form-item label="弹框内容" >
                    <el-col :span="15">
                        <el-select v-model="tempContent" placeholder="请选择弹框类型">
                            <el-option v-for="item in contentTypes"
                                        :key="item.value"
                                        :label="item.label"
                                        :value="item">
                            </el-option>
                        </el-select>
                    </el-col>
                    <el-col style="border: 1px solid #d8dce5; margin-top: 10px; padding:10px; border-radius: 6px;">
                        <div v-bind:is="tempContent.key" :ref="tempContent.value+'_'+index" :originData="comData.content"></div>
                    </el-col>
                </el-form-item>
                
                <el-form-item label="弹框按钮" style="margin-bottom:5px;">
                    <el-col :span="10">
                        <el-input 
                        v-model="btnSpace" 
                        :placeholder="(comData.buttons.orientH ? '左右':'上下')+'(px)'"></el-input>
                    </el-col>
                    <el-col :span="10" :push="1">
                        <el-switch
                        active-text="水平"
                        @change="onBtnsChanged"
                        v-model="comData.buttons.orientH"></el-switch>
                    </el-col>
                </el-form-item>
                <el-form-item>
                    <template v-for="(item, index) in tempBtns">
                        <rmable_button :ref="'rmableBtn_'+ index" :originData="comData.buttons.items[index]" :index="index" @onRemove="onBtnRemove" :key="index"></rmable_button>
                    </template>
                    <el-button type="text" size="small" plain icon="el-icon-circle-plus" @click="addButton" style="margin-left: 10px;">添加</el-button>
                </el-form-item>
            </el-form>
        </el-popover>

        <div class="alertsContainer" :class="{radius:comData.wrap.radius}" :style="comData.wrap.style | formatStyle(defalutConf)">
            
            <img v-if="comData.closeBtn.imgUrl" :class="{close: comData.closeBtn.position}" :src="comData.closeBtn.imgUrl" alt="" />
            <i v-else :class="'close el-icon-close '+ (comData.closeBtn.position || '') " ></i>
            
            <div class="alertContent">
                <div v-bind:is="tempContent.key" :isPreview="true" :ref="'preview_'+ tempContent.value +'_'+index"></div>
            </div>
            
            <div class="alertBottom">
                <ul :class="comData.buttons.orientH ? 'flex' : 'flex-center-v'">
                    <li v-for="(item, index) in comData.buttons.items" :key="index"> 
                        <img :src="item.imageUrl || require('../img/button.jpg')"  :data-uuid="item.uuid" alt="" :style="item.style | formatStyle"/>
                    </li>
                </ul>
            </div>
        </div>
        
        <div class="mask" v-popover:alerts-pop>
            <el-button icon="el-icon-edit-outline">编辑</el-button>
        </div>
    </div>
</template>
<script>
    import util from '@/assets/js/util';
    import rmable_button from './_rmable_button.vue';
    import img_content from './_img_content.vue';
    import vcode_content from './_vcode_content.vue';
    import { mapGetters } from 'vuex';

    export default {
        name:'alerts',
        desc:'弹框',
        type:'hidden',
        props: ['originData','index'], //'uploadData',
        components:{ rmable_button,img_content,vcode_content },
        computed: mapGetters({
            btnConfig: 'getActBtnConfig',
            alertContentConfig: 'getActAlertContentConfig',
            uploadData: 'getUploadData'
        }),
        watch: {
            btnConfig(val){
                if(!val) return;
                this.comData.buttons.items.forEach(item => {
                    if(item.uuid === val.uuid){
                        item = val;
                        return;
                    }
                });
            },
            alertContentConfig(val){
                if(!val) return;
                var key = this.tempContent.value +'_'+ this.index;
                if(!this.$refs[key]) return;

                if(this.$refs[key].uuid == val.uuid){
                    this.$refs['preview_'+ key].preview(val);
                }
            },
            btnSpace:'onBtnsChanged'
        },
        data(){
            return {
                wrapShow: false,
                defalutConf:{
                    "background-image": `url(${require('../img/act_bg.jpg')})` 
                },
                comData:{
                    name:"alerts",
                    wrap:{
                        radius: false,
                        style: {
                            width: '',
                            height: '',
                            'background-color':'',
                            'background-image': '',
                            'background-repeat':'',
                            'border-radius':''
                        }
                    },
                    closeBtn: {
                        imgUrl:''
                    },
                    content:{},
                    buttons:{
                        orientH:false,
                        items:[]
                    }
                },
                btnSpace: 20,
                tempContent:{},
                tempBtns:[],
                closeBtnList:[],
                bgList:[],
                bgImgOptions:[
                    { label: '适配全屏', value:'no-repeat' },
                    { label: '横向重复', value:'repeat-x' },
                    { label: '纵向重复', value:'repeat-y' },
                ],
                contentTypes:[
                    { value:'img', label: '图片弹框', key:'img_content' },
                    { value:'vcode', label: '验证码弹框', key:'vcode_content' }
                ],
                closePosition:[
                    {value:'top_right', label:'右上' },
                    {value:'bottom_center', label:'下中' },
                    {value:'bottom_right', label:'右下' },
                ]
            }
            
        },
        mounted(){
            if(!this.originData){
                this.tempContent = this.contentTypes[0];
                this.addButton();
                return;
            }

            this.tempBtns = [];
            this.comData = this.originData;
            let bgImg = this.comData.wrap.style['background-image'];
            let closeBtnImg = this.comData.closeBtn.imgUrl;
            if(bgImg){
                this.bgList.push({ 
                    name: bgImg.split('/').pop(), 
                    url: bgImg 
                });
            }
            if(closeBtnImg){
                this.closeBtnList.push({
                    name: closeBtnImg.split('/').pop(), 
                    url: closeBtnImg 
                });
            }
            for (let i = 0; i < this.contentTypes.length; i++) {
                let ctype =  this.contentTypes[i];
                if(this.comData.content.type == ctype.value){
                    this.tempContent = ctype;
                    break;
                }
            }
            for (let i = 0; i < this.originData.buttons.items.length; i++) {
               this.tempBtns.push('');
            }
        },
        methods:{
            getData(){
                this.comData.buttons.items = [];
                for(let key in this.$refs){
                    if(key.indexOf('rmableBtn_') > -1){
                        let itemData = this.$refs[key][0].getData();
                        if(!this.comData.buttons.orientH){
                            itemData.style['margin-bottom'] = this.comData.buttons.space;
                        }
                        this.comData.buttons.items.push(itemData);
                    }
                }
                // alerts_img | alerts_vcode | alerts_login
                this.comData.name = 'alerts_'+ this.tempContent.value; 
                this.comData.content = this.$refs[this.tempContent.value + '_'+ this.index].getData();
                this.comData.content.type = this.tempContent.value;
                return this.comData;
            },
            onBtnsChanged(){
                let btnSpace = parseInt(this.btnSpace);
                if(isNaN(btnSpace)){
                    this.btnSpace = '';
                    btnSpace = 0;
                } else {
                    this.btnSpace = btnSpace;
                    btnSpace = btnSpace / 2;
                }
                let margin = this.comData.buttons.orientH ? `0 ${btnSpace}px` : `${btnSpace}px 0`;
                this.comData.buttons.items.forEach(item => {
                    item.style.margin = margin;
                });
            },
            show(){
                this.wrapShow = true;
                let $mainContainer = this.$refs.alertsWrapper.parentNode;
                $mainContainer.style['overflow-y'] = 'hidden';
                this.$refs.alertsWrapper.style.top = $mainContainer.scrollTop +'px';
            },
            hide(){
                this.wrapShow = false;
                let $mainContainer = this.$refs.alertsWrapper.parentNode;
                $mainContainer.style['overflow-y'] = 'auto';
                this.$refs.alertsWrapper.style.top = 0;
            },
            onBtnRemove(index){
                let btnUuid = this.$refs['rmableBtn_'+ index][0].uuid;
                for (var i = 0; i < this.comData.buttons.items.length; i++) {
                   let btnItem = this.comData.buttons.items[i];
                   if(btnUuid == btnItem.uuid){
                        this.comData.buttons.items.splice(i,1);
                   }
                }
                delete this.$refs['rmableBtn_'+ index];
            },
            addButton(){
                this.tempBtns.push('');
                this.$nextTick(()=>{
                    let btnItem = this.$refs['rmableBtn_'+ (this.tempBtns.length-1)][0];
                    this.comData.buttons.items.push(btnItem.getData());
                });
            },
            handleCloseRemove(){
                this.comData.closeBtn.imgUrl = '';
            },
            handleCloseSuccess(response){
                this.comData.closeBtn.imgUrl = response.file.path;
            },
            handleBgSuccess(response){
                this.comData.wrap.style['background-image'] = response.file.path;
                util.getImageWH(response.file.path).then(res => {
                    this.comData.wrap.style.width = res.width;
                    this.comData.wrap.style.height = res.height;
                });
            },
            handleBgRemove(){
                this.comData.wrap.style['background-image'] = "";
                this.comData.wrap.style.width = '';
                this.comData.wrap.style.height = '';
            },
            handleBgExceed(){
                this.$message.warning(`抱歉，只能上传一张图片，如需修改，请删除后再操作`);
            }
        }
    }

</script>
<style lang="scss" scope>
    .alertsWrapper{
        position:absolute;
        left:0; top:0;width:100%;height:100%;
        background-color:rgba(0,0,0,0.8);
        z-index:1;
        &:hover .mask{
            display: flex;
        }
    }
    .altBtn{
        position:relative;
        .el-icon-circle-close{
            position:absolute;
            top:-5px;right:-5px; 
            z-index:1;
        }
    }
    
    
    .alertsContainer{
        margin:0 auto;
        width:300px;
        min-height:100px;
        position: relative;
        overflow: hidden;
        &.radius{
            border-radius: 6px;
        }
        .close{
            position:absolute;
            width: 30px;
            font-size:30px;
            top: -15px;
            right: -15px;
            &.bottom_center{
                top: auto;
                bottom:-100px;
                right:170px;
            }
            &.bottom_right{
                top:auto;
                bottom: -30px;
            }
        }
        .alertContent{
            overflow:hidden;
            min-height: 70px;
            // img{
            //     display: block;
            //     width: 100%;
            //     height: auto;
            //     margin:0 auto;
            // }
        }
        .alertBottom{
            align-items: center;
            min-height: 30px;
            line-height:0;
            img{
                display:inline-block;
                margin:0 auto 20px;
                width: 100%;
            }
            li{
                flex:1;
                float:left;
                text-align:center;
            }
        }
    }
    
</style>
