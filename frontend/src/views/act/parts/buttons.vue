<template>
	<div class="btnWrapper flex-center-v">
        <el-popover ref="button-pop" placement="right" width="400" trigger="click">
            <el-form label-width="70px">
                <el-form-item label="组件高度">
                    <el-col :span="14">
                        <el-input v-model="comData.wrap.style['height']" placeholder="组件高度（如100px）"></el-input>
                    </el-col>
                </el-form-item>
                <el-form-item label="组件背景">
                    <el-col :span="14">
                        <el-input v-model="comData.wrap.style['background-color']" placeholder="背景色（如 #ffffff）"></el-input>
                    </el-col>
                     <el-col :span="10" style="padding-left:10px;">
                        <el-upload action="/api/act/upload"
                            :data="uploadData"
                            :file-list="bgList"
                            :limit="1"
                            accept="image/jpeg,image/png"
                            :on-remove="handleBgRemove"
                            :on-success = "handleBgSuccess"
                            :multiple = "false"
                            :auto-upload="true"
                            list-type="text">
                        <el-button type="primary" size="small">上传背景图</el-button>
                        </el-upload>
                    </el-col>
                </el-form-item>
                <el-form-item label="按钮定位" style="margin-bottom:5px;">
                    <el-col :span="10">
                        <el-input 
                        v-model="btnSpace" 
                        :placeholder="(comData.buttons.orientH ? '左右':'上下')+'(px)'"></el-input>
                    </el-col>
                    <el-col :span="6" :push="2">
                        <el-switch
                        active-text="水平"
                        @change="onBtnsChanged"
                        v-model="comData.buttons.orientH"></el-switch>
                    </el-col>
                </el-form-item>
                <el-form-item>
                    <template v-for="(item, index) in tempBtns">
                        <rmable_button :ref="'rmableBtn_'+ index" :originData="comData.buttons.items[index]" :index="index" @onRemove="onBtnRemove(index)" :key="index"></rmable_button>
                    </template>
                    <el-button type="text" size="small" plain icon="el-icon-circle-plus" @click="addButton" style="margin-left: 10px;">添加</el-button>
                </el-form-item>
            </el-form>
        </el-popover>
        <div class="mask">
            <el-button v-popover:button-pop class="btn_edit" icon="el-icon-edit-outline"> 编辑</el-button>
        </div>
        <div class="btnContainer flex-center-v" ref="btnContainer" :style="comData.wrap.style | formatStyle">
            <ul :class="comData.buttons.orientH ? 'flex' : 'flex-center-v'">
                <li v-for="(item, index) in comData.buttons.items" :key="index">
                    <img :src="item.imageUrl || require('../img/button.jpg')" :data-uuid="item.uuid" alt="" :style="item.style | formatStyle"/>
                </li>
            </ul>
        </div>
    </div>
</template>
<script>
    import rmable_button from "./_rmable_button.vue"
    import { mapGetters } from 'vuex';

    export default {
        name:'buttons',
        desc:'按钮组件',
        props: ['originData'], //'uploadData',
        components:{ rmable_button },
        computed: mapGetters({
            btnConfig: 'getActBtnConfig',
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
            btnSpace:'onBtnsChanged'
        },
        data(){
            return {
                comData:{
                    name:"buttons",
                    buttons:{
                        orientH:false,
                        items:[]
                    },
                    wrap:{
                        style: {
                            height: '',
                            'background-image': '',
                            'background-color': ''
                        }
                    }
                },
                btnSpace:20,
                tempBtns:[],
                bgList:[]
            }
        },
        mounted(){
            if(!this.originData){
                this.addButton();
                return;
            }
            this.tempBtns = [];
            this.comData = this.originData;
            let bgImg = this.originData.wrap.style['background-image'];
            if(bgImg){
                this.bgList.push({ name:bgImg.split('/').pop(), url: bgImg});
            }
            for (var i = 0; i < this.comData.buttons.items.length; i++) {
                this.tempBtns.push('');
            }
        },
        methods:{
            getData(){
                // let btnItems = [];
                // for(let key in this.$refs){
                //     if(key.indexOf('rmableBtn_') > -1){
                //         let itemData = this.$refs[key][0].getData();
                //         if(this.comData.buttons.orientH){
                //             itemData.style['margin'] = '0 '+ this.comData.buttons.space;
                //         } else {
                //             itemData.style['margin'] = this.comData.buttons.space + ' 0';
                //         }
                        
                //         btnItems.push(itemData);
                //     }
                // }
                // this.comData.buttons.items = btnItems;
                return this.comData;
            },
            onBtnsChanged(){
                let margin = this.comData.buttons.orientH ? `0 ${this.btnSpace}` : `${this.btnSpace} 0`;
                this.comData.buttons.items.forEach(item => {
                    item.style.margin = margin;
                });
            },
            handleBgSuccess(response){
                this.comData.wrap.style['background-image'] = `url(${response.file.path})`;
            },
            handleBgRemove(){
                this.comData.wrap.style['background-image'] = '';
            },
            addButton(){
                this.tempBtns.push('');
                this.$nextTick(() => {
                    // 为了在页面中插入一张带有uuid属性的图片
                    let btnItem = this.$refs['rmableBtn_'+ (this.tempBtns.length-1)][0];
                    let itemData = btnItem.getData();
                    itemData.style.margin = `${this.btnSpace} 0`;
                    this.comData.buttons.items.push(itemData);
                });
                
            },
            onBtnRemove(index){
                let btnUuid = this.$refs['rmableBtn_'+ index][0].uuid;
                for (let i = 0; i < this.comData.buttons.items.length; i++) {
                   let btnItem = this.comData.buttons.items[i];
                   if(btnUuid == btnItem.uuid){
                        this.comData.buttons.items.splice(i,1);
                   }
                }
                delete this.$refs['rmableBtn_'+ index];
            },
        }
    }

</script>
<style lang="scss" scope>
    .btnWrapper{
        max-width:375px;
        position: relative;
        &:hover .mask{
            display: flex;
        }
    }
    
    .btnContainer{
        background-size:contain;
        overflow:hidden;
        img{
            display:inline-block;
            margin:0 auto;
        }
        li{
            flex:1;
            float:left;
            text-align:center;
            line-height:0;
        }
    }
</style>
