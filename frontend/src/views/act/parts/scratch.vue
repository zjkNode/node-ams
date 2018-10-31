<template>
	<div v-popover:scratch-pop class="scratchWrapper">
        <el-popover ref="scratch-pop" placement="right" width="400" trigger="click">
            <el-form label-width="70px" class="scratchForm">
                <el-form-item label="组件定位" >
                    <el-col :span="7">
                        <el-input v-model="comData.wrap.style.height" placeholder="高px"></el-input>
                    </el-col>
                    <el-col :span="7" :offset='1'>
                        <el-input v-model="comData.wrap.style['padding-top']" placeholder="顶距px"></el-input>
                    </el-col>
                </el-form-item>
                <el-form-item label="组件背景">
                    <el-col :span="7">
                        <el-input v-model="comData.wrap.style['background-color']" placeholder="背景色"></el-input>
                    </el-col>
                     <el-col :span="7" :offset="1" v-show="comData.wrap.style['background-image']">
                        <el-select v-model="comData.wrap.style['background-repeat']" placeholder="请选择">
                            <el-option v-for="item in bgImgOptions"
                                        :key="item.value"
                                        :label="item.label"
                                        :value="item.value">
                            </el-option>
                        </el-select>
                    </el-col>
                    <el-col :span="7" :offset="1">
                        <el-upload action="/api/act/upload"
                            :data="uploadData"
                            :file-list="bgList"
                            :limit="1"
                            accept="image/jpeg,image/png"
                            :on-exceed= "handleExceed"
                            :on-remove="handleBgRemove"
                            :on-success="handleBgSuccess"
                            :multiple="false"
                            :auto-upload="true"
                            list-type="text">
                            <el-button type="primary" size="small">上传</el-button>
                        </el-upload>
                    </el-col>
                </el-form-item>
                <el-form-item label="内容蒙层">
                    <el-upload
                        class="btn-uploader"
                        action="/api/act/upload"
                        accept="image/gif,image/jpeg,image/png"
                        :data="uploadData"
                        :show-file-list="false"
                        :on-success="handleMaskSuccess">
                        <img v-if="comData.mask.img" :src="comData.mask.img" class="btn_img" />
                        <i v-else class="el-icon-plus btn-uploader-icon"></i>
                    </el-upload>
                </el-form-item>
                <el-form-item label="内容背景">
                    <el-col :span="7">
                        <el-input v-model="comData.box.style['margin-top']" placeholder="外顶距"></el-input>
                    </el-col>
                    <el-col :span="7" :offset="1">
                        <el-input v-model="comData.box.style['padding-top']" placeholder="内顶距"></el-input>
                    </el-col>
                    <el-col :span="7" :offset="1">
                        <el-upload action="/api/act/upload"
                                :data="uploadData"
                                :file-list="boxBgList"
                                :limit="1"
                                accept="image/jpeg,image/png"
                                :on-exceed= "handleExceed"
                                :on-remove="handleBoxRemove"
                                :on-success = "handleBoxSuccess"
                                :multiple = "false"
                                :auto-upload="true"
                                list-type="text">
                                <el-button type="primary" size="small">上传</el-button>
                            </el-upload>
                    </el-col>
                </el-form-item>
                
                <el-form-item label="奖品列表">
                    <el-button type="text" size="small" plain icon="el-icon-circle-plus" @click="addPrize">添加</el-button>
                </el-form-item>
                <el-row>
                    <el-col class='pcard' :span="7" v-for="(item, index) in tmpPrizes" :key="index" :offset="1">
                        <el-card :body-style="{ 'padding': '0px', position:'relative' }" >
                            <div class="ptag" @click="onPrizeClick(item)" @mouseover="onPrizeOver(item)">
                                <el-row>
                                    <el-col :span="10">
                                        <el-upload
                                          action="/api/act/upload"
                                          :data="uploadData"
                                          :show-file-list="false"
                                          :on-success="handlePrizeSuccess">
                                          <div class='img' v-if="item.style['background-image']" :style="'background-image:'+ item.style['background-image']"></div>
                                          <i v-else class="el-icon-plus pcard-icon"></i>
                                        </el-upload>
                                    </el-col>
                                    <el-col :span="10" :offset="2">
                                        <el-button type="text" size="mini" disabled>奖品Id</el-button>
                                        <el-input size="mini" placeholder="id" v-model="item.id"></el-input> 
                                    </el-col>
                                </el-row>
                                <el-select size="mini" placeholder="选择弹框" v-model="item.alert" :ref="'pAlters_'+ index">
                                   <el-option v-for="opt in alertsOptions"
                                              :data-key="opt.name"
                                              :key="opt.value + index"
                                              :label="opt.label"
                                              :value="opt.name">
                                   </el-option>
                                </el-select>
                                <rmable_button :ref="'rmableBtn_'+ index" :originData="item.button" ></rmable_button>

                            </div>
                            <i class="el-icon-circle-close" @click="removePrize(index)"></i>
                        </el-card>
                    </el-col>
                </el-row>
            </el-form>
        </el-popover>
        
        <div class="mask">
            <el-button icon="el-icon-edit-outline">编辑</el-button>
        </div>

        <div class='scratchContainer' ref='scratchContainer' :style="comData.wrap.style | formatStyle">
            <div class="sbox" :style="comData.box.style | formatStyle">
                <img class='smask' :src="comData.mask.img || require('../img/mask_ggl.png')" :style="comData.mask.style | formatStyle"/>
                <div v-if="curPrize.style && curPrize.style['background-image']" class="sprize" :style="curPrize.style | formatStyle">
                    <img v-if="curPrize.button" :src="curPrize.button.imageUrl || require('../img/button.jpg')" :data-uuid="curPrize.button.uuid" alt="" :style="curPrize.button.style | formatStyle"/>
                </div>
            </div>
        </div>
    </div>
</template>
<script>
    import util from '@/assets/js/util';
    import { mapGetters } from 'vuex';
    import rmable_button from './_rmable_button.vue';

     export default {
        name:'scratch',
        desc:'刮刮乐',
        props: ['originData'], //'uploadData',
        components:{ rmable_button },
        computed: mapGetters({
            cacheActParts: 'getActParts',
            btnConfig: 'getActBtnConfig',
            uploadData: 'getUploadData'
        }),
        watch: {
            btnConfig(val, oldVal){
                if(!val) return;
                this.comData.buttons.items.forEach(item => {
                    if(item.uuid === val.uuid){
                        item = val;
                        return;
                    }
                });
            },
            cacheActParts:'bindAlertOptions'
        },
        data(){
            return {
                alertsOptions:[],
                comData:{
                    name:"scratch",
                    wrap:{
                        style: {
                            height: '',
                            'background-image': '',
                            'background-color': ''
                        }
                    },
                    box:{
                        style:{
                            'background-image': '',
                            'margin-top':'',
                            'padding-top':'',
                        }
                    },
                    mask:{
                        style:{
                            width:600,
                            height:300,
                            visibility:'visible', // 显示遮罩层
                            'z-index': 1 // 遮罩层在最上
                        },
                        img:''
                    },
                    prizes:[],
                    buttons:{
                        items:[]
                    }
                },
                tmpPrizes:[],
                bgList:[],
                boxBgList:[],
                bgImgOptions:[
                    { label: '适配全屏', value:'no-repeat' },
                    { label: '横向重复', value:'repeat-x' },
                    { label: '纵向重复', value:'repeat-y' },
                ],
                curPrize:{},
            }
            
        },
        mounted(){
            this.bindAlertOptions();
            if(!this.originData){
                this.addPrize();
                return;
            }
            this.comData = this.originData;
            for (let i = 0; i < this.comData.prizes.length; i++) {
                let prize = this.comData.prizes[i];
                prize.button = this.comData.buttons.items[i];
                this.tmpPrizes.push(prize);
            }
            let wrapBgImg = this.comData.wrap.style['background-image'],
                boxBgImg = this.comData.box.style['background-image'],
                maskBgImg = this.comData.mask.img;
            if(wrapBgImg){
                this.bgList.push({ name: wrapBgImg.split('/').pop(), url: wrapBgImg });
            }
            if(boxBgImg){
                this.boxBgList.push({ name: boxBgImg.split('/').pop(), url: boxBgImg })
            }
        },
        methods:{
            getData(){
                this.comData.buttons = { items:[] };
                this.comData.prizes = [];
                for (let i = 0; i < this.tmpPrizes.length; i++) {
                   let prize = Object.assign({}, this.tmpPrizes[i]); // 下面有delete 操作，防止影响页面展示
                   this.comData.buttons.items.push(prize.button);
                   delete prize.button;
                   this.comData.prizes.push(prize);
                }
                return this.comData;
            },
            bindAlertOptions(){
                this.alertsOptions = this.cacheActParts.filter(part => part.type === 'hidden');
                if(this.alertsOptions.length === 0){
                    return;
                }
                let _this = this;
                this.$nextTick(() => {
                    for(let j = 0; j < this.tmpPrizes.length; j++){
                        let $dlContainer = _this.$refs['pAlters_'+ j][0].popperElm;
                        let $dlItems = $dlContainer.getElementsByTagName('li');
                        for (let i = 0; i < $dlItems.length; i++) {
                            // 当这个方法多次调用时，会绑定多个事件
                            $dlItems[i].addEventListener('mouseenter',function(){
                                let alertKey = _this.alertsOptions[i].value;
                                _this.$store.dispatch("setCurActBtnRes",alertKey);
                            });
                            $dlItems[i].addEventListener('mouseleave',function(){
                                _this.$store.dispatch("setCurActBtnRes",null);
                            });
                        }
                   }
                });
            },
            handleBgSuccess(response){
                this.comData.wrap.style['background-image'] = `url(${response.file.path})`;
                util.getImageWH(response.file.path).then(res => {
                    this.comData.wrap.style.height = this.comData.wrap.style.height || res.height;
                });
            },
            handleBgRemove(){
                this.comData.wrap.style['background-image'] = '';
                this.comData.wrap.style.height = '';
            },
            handleMaskSuccess(response){
                this.comData.mask.img = response.file.path;
                util.getImageWH(response.file.path).then(res => {
                    this.comData.mask.style.width = res.width;
                    this.comData.mask.style.height = res.height;
                    this.syncPrize();
                });
            },
            handleBoxSuccess(response){
                this.comData.box.style['background-image'] = `url(${response.file.path})`;
                util.getImageWH(response.file.path).then(res => {
                    this.comData.box.style.width = res.width;
                    this.comData.box.style.height = res.height;
                });
            },
            handleBoxRemove(){
                this.comData.box.style['background-image'] = '';
                this.comData.box.style.width = '';
                this.comData.box.style.height = '';
            },
            handleExceed(){
                this.$message.warning(`抱歉，只能上传一张图片，如需修改，请删除后再操作`);
            },
            onPrizeClick(prize){
                this.curPrize = prize;
            },
            onPrizeOver(prize){
                if(this.curPrize == prize){
                    return;
                }
                this.curPrize = prize;
                this.syncPrize();
            },
            handlePrizeSuccess(response){
                this.curPrize.style['background-image'] = `url(${response.file.path})`;
                this.syncPrize();
            },
            syncPrize(){
                if(this.curPrize.style && this.curPrize.style['background-image']){
                    this.curPrize.style['margin-top'] = -this.comData.mask.style.height;
                    this.curPrize.style.width = this.comData.mask.style.width;
                    this.curPrize.style.height = this.comData.mask.style.height;
                    
                    this.comData.mask.style['z-index'] = 0;
                    this.comData.mask.style.visibility = 'hidden';
                    return;
                }

                this.comData.mask.style['z-index'] = 1;
                this.comData.mask.style.visibility = 'visible';
            },
            addPrize(){
                this.tmpPrizes.push({ id: '', img:'', alert:'', button: null, style:{ 'background-image': '' } })
            },
            removePrize(index){
                let rmPrize = this.tmpPrizes.splice(index,1)[0];
                if(rmPrize === this.curPrize || this.tmpPrizes.length == 0){
                    this.curPrize = {};
                    this.syncPrize();
                }
            }
        }
    }
</script>
<style lang='scss' scope>
.scratchWrapper{
    position: relative;
    &:hover .mask{
        display: flex;
    }
    .prizeList{
        float:left;
    }
    .btn-uploader{
        .el-upload {
            border: 1px dashed #d9d9d9;
            border-radius: 6px;
            cursor: pointer;
            position: relative;
            overflow: hidden;
            line-height:28px;
            &:hover{
                border-color: #409EFF;
            }
        }
    }
    .btn-uploader-icon {
        font-size: 28px;
        color: #8c939d;
        width: 100px;
        line-height: 40px;
        text-align: center;
    }
    .btn_img {
        width: 100px;
        max-height:40px;
    }
}
.scratchForm{
    .el-form-item{
        margin-bottom:10px;
    }
    .el-icon-circle-close{
        position:absolute;
        top:0px; right:0px;
        z-index:1;
    }
}


.scratchContainer{
    position: relative;
    background-size: contain;
    background-repeat: no-repeat;
    background-position: top;
    overflow:hidden;
    .sbox{
        position: relative;
        height:150px;
        width:300px;
        margin:0 auto;
        background-size: contain;
        background-repeat: no-repeat;
        background-position:center;
    }
    .sprize{
        position:relative;
        background-size: contain;
        background-repeat: no-repeat;
        background-position:center;
        text-align:center;
        margin: 0 auto;
        img{
            display:inline-block;
        }
    }
    .smask{
        position:relative;
        display:block;
        margin: 0 auto;
        height:100%;
    }
}
</style>