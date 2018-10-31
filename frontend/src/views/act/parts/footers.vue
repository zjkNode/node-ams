<template>
	<div v-popover:footer-pop class="footersWrapper">
        <el-popover ref="footer-pop" placement="right" width="400" trigger="click">
            <el-form label-width="80px">
                <el-form-item label="组件定位">
                    <el-col :span="7">
                        <el-input v-model="comData.wrap.style.height" placeholder="高度"></el-input>
                    </el-col>
                    <el-col :span="7" :offset="1">
                        <el-input v-model="comData.wrap.style['padding-top']" placeholder="顶距"></el-input>
                    </el-col>
                    <el-col :span="7" :offset="1">
                        <el-input v-model="comData.wrap.style['padding-bottom']" placeholder="底距"></el-input>
                    </el-col>
                </el-form-item>
                <el-form-item label="组件背景">
                    <el-col :span="7">
                        <el-input v-model="comData.wrap.style['background-color']" placeholder="背景色"></el-input>
                    </el-col>
                    <el-col :span="7" :offset="1" v-show="comData.wrap.style['background-image']!=''">
                        <el-select placeholder="请选择" v-model="comData.wrap.style['background-repeat']">
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
                            :limit="1"
                            :file-list="bgList"
                            accept="image/gif,image/jpeg,image/png"
                            :on-exceed= "handleBgExceed"
                            :on-remove="handleBgRemove"
                            :on-success = "handleBgSuccess"
                            :multiple = "false"
                            :auto-upload="true"
                            list-type="text">
                        <el-button type="primary">上传背景</el-button>
                        </el-upload>
                    </el-col>
                </el-form-item>
                <el-form-item label="文案颜色">
                    <el-col :span="7">
                        <el-input v-model="tmpColor" placeholder="字体颜色（如 #ffffff)"></el-input>
                    </el-col>
                    <el-col :span="7" :offset="1">
                        <el-input v-model="tmpLineHeight" placeholder="行高"></el-input>
                    </el-col>
                </el-form-item>
                <el-form-item label="内容">
                    <el-row v-for="(item, index) in comData.lines" :key="index">
                        <el-col :span="15">
                            <el-input v-model="item.content" size="small" placeholder="内容"></el-input>
                        </el-col>
                        <el-col :span="5" :offset="1">
                            <el-input v-model="item.style['font-size']" size="small" placeholder="字号"></el-input>
                        </el-col>
                        <el-col v-show="comData.lines.length > 1" :span='1' :offset="1">
                            <i class="el-icon-remove" style="color:#F56C6C;" @click="onDeleteLine(index)"></i>
                        </el-col>
                    </el-row>
                    <el-row>
                        <i class="el-icon-circle-plus" @click="onAddLine"></i>
                    </el-row>
                </el-form-item>
            </el-form>
        </el-popover>
        <div class="mask">
            <el-button icon="el-icon-edit-outline">编辑</el-button>
        </div>

        <div class="footerContainer" :style="comData.wrap.style | formatStyle">
            <p v-if="item.content" v-for="(item, index) in comData.lines" :key="index" :style="item.style | formatStyle">
                {{item.content}}
            </p>
        </div>
    </div>
</template>
<script>
    import { mapGetters } from 'vuex';

    export default {
        name:'footers',
        desc:'底部文案',
        props: ['originData'],
        computed: mapGetters({
            uploadData: 'getUploadData'
        }),
        data(){
            return {
                tmpColor:'',
                tmpLineHeight:'',
                bgList:[],
                comData:{
                    name:"footers",
                    wrap:{
                        style:{
                            'padding-top':'',
                            'background-image':'',
                        }
                    },
                    lines:[
                        { content:'方案内容',  style:{  'font-size':'',  color:'','line-height':''  }}
                    ]
                },
                bgImgOptions:[
                    { label: '适配全屏', value:'no-repeat' },
                    { label: '横向重复', value:'repeat-x' },
                    { label: '纵向重复', value:'repeat-y' },
                ],
            }
        },
        watch:{
            tmpColor(value){
                this.comData.lines.forEach(line => {
                    line.style.color = value;
                });
            },
            tmpLineHeight(value){
                this.comData.lines.forEach(line => {
                    line.style['line-height'] = value;
                });
            }
        },
        mounted(){
            if(!this.originData){
                this.onAddLine();
                return;
            }
            this.comData = Object.assign({}, this.originData);
            let originBg = this.comData.wrap.style['background-image'];//渲染编辑背景
            if(originBg){
                let fileName = originBg.split('/').pop();
                this.bgList.push({ name:fileName, url: originBg });
            }
            if(this.comData.lines.length > 0){
                this.tmpColor = this.comData.lines[0].style.color;
                this.tmpLineHeight = this.comData.lines[0].style['line-height'];
            }
        },
        methods:{
            getData(){
                return this.comData;
            },
            onAddLine(){
                if(!this.comData.lines[this.comData.lines.length-1].content){
                    return;
                }
                this.comData.lines.push({ 
                    content:'', 
                    style:{ 'font-size':'',  color:this.tmpColor, 'line-height': '' }
                });
            },
            onDeleteLine(index){
                this.comData.lines.splice(index, 1);
            },
            handleBgExceed(){
                this.$message.warning(`抱歉，只能上传一张背景图，如需修改，请删除后再操作`);
            },
            handleBgRemove(){
                this.comData.wrap.style['background-image'] = "";
            },
            handleBgSuccess(response){
                this.comData.wrap.style['background-image'] = `url(${response.file.path})`;
            }
        }
    }

</script>
<style lang="scss" scope>
    .footersWrapper{
        max-width:375px;
        text-align:center;
        &:hover .mask{
            display: flex;
        }
    }
    .footerContainer{
        width:100%;
        padding: 10px 0;
        text-align: center;
        overflow: hidden;
        background-size:contain;
        p{
            margin:0;
            padding:0;
            line-height: 25px;
            font-size: 14px;
        }
    }
</style>
