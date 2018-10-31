<template>
    <div v-popover:registerForm-pop class="regFormWrapper flex-center-v">
        <el-popover ref="registerForm-pop" placement="right" width="400" trigger="click">
           <el-form label-width="90px" :model="comData">
            <el-form-item label="组件宽高" >
                    <el-col :span="7">
                        <el-input  v-model="comData.wrap.style.width" placeholder="宽px"></el-input>
                    </el-col>
                    <el-col :span="7" :offset="1">
                        <el-input  v-model="comData.wrap.style.height" placeholder="高px"></el-input>
                    </el-col>
                    <el-col :span="6" :offset="1">(单位：px)</el-col>
                </el-form-item>
               <el-form-item label="组件背景">
                    <el-col :span="7">
                       <el-input  placeholder="背景（如#000000）" v-model="comData.wrap.style['background-color']"></el-input>
                    </el-col>
                    <el-col :span="7" :offset="1" v-show="comData.wrap.style['background-image']">
                        <el-select v-model="comData.wrap.style['background-repeat']" placeholder="请选择">
                            <el-option v-for="item in bgImgOptions"
                                        :key="item.value"
                                        :label="item.label"
                                        :value="item">
                            </el-option>
                        </el-select>
                    </el-col>
                    <el-col :span="7" :offset="1">
                        <el-upload action="/api/act/upload"
                            :data="uploadData"
                            :limit="1"
                            :file-list="bgList"
                            accept="image/gif,image/jpeg,image/png"
                            :on-exceed= "handleExceed"
                            :on-remove="handleRemove"
                            :on-success = "handleSuccess"
                            :multiple = "false"
                            :auto-upload="true"
                            list-type="text">
                        <el-button size="small" type="primary">上传</el-button>
                        </el-upload>
                    </el-col>
               </el-form-item>
               <el-form-item label="表单样式" >
                    <el-col :span="9">
                        间隙&nbsp;<el-switch v-model="comData.content.space">
                        </el-switch>
                   </el-col>
                   <el-col :span="9" :offset="1">
                        圆角&nbsp;<el-switch v-model="comData.content.radius">
                        </el-switch>
                   </el-col>
               </el-form-item>
               <el-form-item label="表单定位" >
                    <el-col :span="6">
                        <el-input  v-model="comData.content.style.width" placeholder="宽px"></el-input>
                    </el-col>
                    <el-col :span="6" :offset="1">
                        <el-input  v-model="comData.content.style.height" placeholder="高px"></el-input>
                    </el-col>
                    <el-col :span="6" :offset="1">
                        <el-input  v-model="comData.content.style['margin-top']" placeholder="顶px"></el-input>
                    </el-col>
                </el-form-item>
               <el-form-item label="颜色">
                   <el-col :span="6">
                        <el-input  v-model="tmpBorderColor" placeholder="边框"></el-input>
                    </el-col>
                    <el-col :span="6" :offset="1">
                        <el-input  v-model="comData.btnCode.style.color" placeholder="验证码"></el-input>
                    </el-col>
                    <el-col :span="6" :offset="1">
                        <el-input  v-model="comData.label.style.color" placeholder="协议"></el-input>
                    </el-col>
               </el-form-item>
               <el-form-item label="协议">
                   <el-col :span="10">
                       <el-input placeholder="协议名称" v-model="comData.agreement.name"></el-input>
                   </el-col>
                   <el-col :span="10" :offset="1">
                       <el-input placeholder="协议地址" v-model="comData.agreement.link"></el-input>
                   </el-col>
               </el-form-item>
               <el-form-item label="验证码弹框">
                    <el-col :span="20">
                    <el-select v-model="tempCodeAlert" ref="codeAlert" placeholder="选择弹框">
                       <el-option v-for="item in alertsOptions"
                                  :data-key="item.value"
                                  :key="item.value"
                                  :label="item.label"
                                  :value="item.value">
                       </el-option>
                   </el-select>
                   </el-col>
                </el-form-item>
                <el-form-item label="按钮定位" style="margin-bottom:5px;">
                    <el-col :span="10">
                        <el-input 
                        v-model="btnSpace" 
                        :placeholder="(comData.buttons.orientH ? '左右':'上下')+'(px)'" 
                       ></el-input>
                    </el-col>
                    <el-col :span="10" :offset="1">
                        <el-switch
                        active-text="水平"
                        @change="onBtnsChanged"
                        v-model="comData.buttons.orientH"></el-switch>
                    </el-col>
                </el-form-item>
                <el-form-item>
                    <template v-for="(item, index) in tempBtns">
                        <rmable_button :ref="'rmableBtn_'+ index" :key="index" :originData="comData.buttons.items[index]" :index="index" @onRemove="onBtnRemove"></rmable_button>
                    </template>
                    <el-button type="text" size="small" plain icon="el-icon-circle-plus" @click="addButton" style="margin-left: 10px;">添加</el-button>
                </el-form-item>
           </el-form>
        </el-popover>

        <div class="mask">
            <el-button icon="el-icon-edit-outline">编辑</el-button>
        </div>

        <div class="regFormContainer flex-center-v" :style="comData.wrap.style | formatStyle">
            <div class='formContent' :class="{space:comData.content.space, radius:comData.content.radius}" :style="comData.content.style | formatStyle">
                <p class="first" :style="comData.pItem.style | formatStyle">
                    <input type="tel" placeholder="请输入手机号码" class="reg_tel"/>
                </p>
                <p class="last" :style="comData.pItem.style | formatStyle">
                    <input type="tel" placeholder="请输入验证码" class="reg_code"/>
                    <button class="btn_code" :style="comData.btnCode.style | formatStyle">获取验证码</button>
                </p>
                <label :style="comData.label.style | formatStyle" class="checked">
                    <span class="rd-input">
                        <span class='rd-input-inner'></span>
                    </span>
                    <span class='rd-label'>同意《<a :href="comData.agreement.link">{{comData.agreement.name}}</a>》</span>
                </label>
                <label class='right' :style="comData.label.style | formatStyle">已有帐户，点击登录</label>
            </div>
            <div class="formBottom">
                <ul :class="comData.buttons.orientH ? 'flex' : 'flex-center-v'">
                    <li v-for="(item, index) in comData.buttons.items" :key="index"> 
                        <img class="btn" :src="item.imageUrl || require('../img/button.jpg')" :data-uuid="item.uuid" alt="" :style="item.style | formatStyle"/>
                    </li>
                </ul>
            </div>
        </div>
    </div>
</template>
<script>
    import rmable_button from './_rmable_button.vue';
    import { mapGetters } from 'vuex';

    export default {
        name:'forms_reg',
        desc:'注册表单',
        props: ['originData'],
        components:{ rmable_button },
        computed: mapGetters({
            cacheActParts: 'getActParts',
            btnConfig: 'getActBtnConfig',
            uploadData: 'getUploadData'
        }),
        data(){
            return {
                alertsOptions:[],
                tmpBorderColor:'',
                comData:{
                    name:"forms_reg",
                    agreement:{
                        name:'',
                        link:''
                    },
                    wrap: {
                        style: {
                            width:'',
                            'background-color':'',
                            'background-image':''
                        }
                    },
                    content:{
                        space:false,
                        radius:true,
                        style:{
                            width:'',
                            height:'',
                        }
                    },
                    pItem:{
                        style:{
                            'border-color':''
                        }
                    },
                    btnCode:{
                        style:{
                            color:'',
                            'border-color':''
                        },
                        usages:['goAlerts','']
                    },
                    label:{
                        style:{
                            color:''
                        }
                    },
                    buttons:{
                        orientH:false,
                        items:[]
                    }
                },
                btnSpace:20,
                tempCodeAlert:'',
                tempBtns:[],
                bgList:[],
                bgImgOptions:[
                    { label: '适配全屏', value:'no-repeat' },
                    { label: '横向重复', value:'repeat-x' },
                    { label: '纵向重复', value:'repeat-y' },
                ],
            }
        },
        watch: {
            tmpBorderColor(val){
                this.comData.pItem.style['border-color'] = 
                this.comData.btnCode.style['border-color'] = val;
            },
            btnConfig(val){
                if(!val) return;
                this.comData.buttons.items.forEach(item => {
                    if(item.uuid === val.uuid){
                        item = val;
                        return;
                    }
                });
            },
            btnSpace:'onBtnsChanged',
            cacheActParts:'bindAlertOptions'
        },
        mounted(){
            this.bindAlertOptions();
            if(!this.originData){
                this.addButton();
                return;
            }

            this.comData = this.originData;
            this.tempCodeAlert = this.originData.btnCode.usages[1];
            this.tmpBorderColor = this.comData.pItem.style['border-color'];
            
            for (var i = 0; i < this.comData.buttons.items.length; i++) {
                this.tempBtns.push('');
            }
            let bgImg = this.comData.wrap.style['background-image'];
            if(bgImg){
                this.bgList.push({ name: bgImg.split('/').pop(), url: bgImg });
            }
            // let bgValue = this.comData.wrap.style['background-repeat'] || 
            //             this.comData.wrap.style['background-size'];

            // for (let i = 0; i < this.bgStatus.bgImgStyles.length; i++) {
            //     let item = this.bgStatus.bgImgStyles[i];
            //     if(item.value === bgValue){
            //         this.bgStyle = item;
            //         break;
            //     }
            // }
        },
        methods:{
            getData(){
                this.comData.buttons.items = [];
                for(let key in this.$refs){
                    if(key.indexOf('rmableBtn_') > -1){
                        let itemData = this.$refs[key][0].getData();
                        if(this.comData.buttons.orientH){
                            itemData.style['margin'] = '0 '+ this.comData.buttons.space;
                        } else {
                            itemData.style['margin'] = this.comData.buttons.space + ' 0';
                        }
                        this.comData.buttons.items.push(itemData);
                    }
                }
                this.comData.btnCode.usages[1] = this.tempCodeAlert;
                return this.comData;
            },
            bindAlertOptions(){
                this.alertsOptions = this.cacheActParts.filter(part => part.type === 'hidden');
                let _this = this;
                this.$nextTick(()=>{
                    let $dlContainer = _this.$refs.codeAlert.popperElm;
                    let $dlItems = $dlContainer.getElementsByTagName('li');
                    for (let i = 0; i < $dlItems.length; i++) {
                        $dlItems[i].addEventListener('mouseenter',function(){
                            let alertKey = _this.alertsOptions[i].value;
                            _this.$store.dispatch("setCurActBtnRes",alertKey);
                        });
                        $dlItems[i].addEventListener('mouseleave',function(){
                            _this.$store.dispatch("setCurActBtnRes",null);
                        });
                    }
                });
            },
            onBtnsChanged(){
                let margin = this.comData.buttons.orientH ? `0 ${this.btnSpace}` : `${this.btnSpace} 0`;
                this.comData.buttons.items.forEach(item => {
                    item.style.margin = margin;
                });
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
            handleExceed(){
                this.$message.warning(`抱歉，只能上传一张图片，如需修改，请删除后再操作`);
            },
            handleSuccess(response){
                this.comData.wrap.style['background-image'] = `url(${response.file.path})`;
            },
            handleRemove(){
                this.comData.wrap.style['background-image'] = '';
                
            }
        }
    }

</script>
<style lang="scss" scope>
    .regFormWrapper{
        min-height: 80px;
        max-width: 375px;
        position: relative;
        &:hover .mask{
            display: flex;
        }
    }

    .regFormContainer{
        width: 100%;
        background-size: contain;
        background-repeat:no-repeat;
        overflow:hidden;
        margin:0 auto;
        .formContent{
            margin: 10px auto;
            width: 100%;
            position:relative;
            color:#333;
            line-height:17px;
            &.space{
                height: auto;
                p{ border:none; }
                p+p{
                    margin-top:10px;
                }
                .btn_code{
                    border:none;
                    padding-top:2px;
                    &:before{
                        position:absolute;
                        top:15px;
                        left:0;
                        width:0;
                        height:12px;
                        content:' ';
                        border:1px solid #b2b2b2;
                        border-color:inherit;
                    }
                }
            }
            p{
                border: 1px solid #b2b2b2;
                margin-top: -1px;
                position: relative;
                background-color:#fff;
                margin-bottom:0px;
                overflow:hidden;
            }
            &.radius{
                p.first{
                    border-radius:6px 6px 0 0;;
                }
                p.last{
                    border-radius: 0 0 6px 6px
                }
                .btn_code{ 
                    border-bottom-right-radius: 6px; 
                }

            }
            &.radius.space{
                p{ border-radius:6px; overflow:hidden;}
            }
            input{
                line-height:17px;
                padding: 12px 18px;
                display: inline-block;
                vertical-align: middle;
                font-size: 14px;
                color: #333;
                border: none;
                width:100%;
                box-sizing:border-box;
            }
            .btn_code{
                position:absolute;
                right:0px;top:0px;
                font-size: 14px;
                width:100px;
                line-height:41px;
                border:none;
                border-left:1px solid #b2b2b2;
                background: transparent;
                &[disabled]{
                    color: #ccc !important;
                }
            }
            .icon{
                width: 20%;
                font-size:30px;
                line-height:41px;
            }
            .right{
                position:absolute;
                right:0;
            }
        }
        .formBottom{
            margin:0 auto;
            width:90%;
            text-align: center;
            .btn{
                max-width: 100%;
                line-height:0;
                display:inline-block;
            }
        }
        label{
            line-height:40px;
            font-size: 12px;
            a{
                text-decoration: none;
                color: inherit;
            }
            a:visited{
                color:inherit
            }
            .rd-input{
                white-space: nowrap;
                cursor: pointer;
                outline: none;
                display: inline-block;
                line-height: 1;
                position: relative;
                vertical-align: middle;
                margin-right:5px;
            }
            .rd-input-inner{
                border: 1px solid #b2b2b2;
                border-color:inherit;
                border-radius: 100%;
                width: 14px;
                height: 14px;
                background-color: transparent;
                position: relative;
                cursor: pointer;
                display: inline-block;
                box-sizing: border-box;
            }
            &.checked{
                .rd-input-inner:after{
                    border-radius: 100%;
                    border:3px solid #b2b2b2;
                    border-color:inherit;
                    content: " ";
                    position: absolute;
                    left: 3px;
                    top: 3px;
                }
            }
        }
    }    
</style>