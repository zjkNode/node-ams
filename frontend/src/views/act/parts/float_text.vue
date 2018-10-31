<template>
	<div v-popover:float-pop class="floatWrapper">
        <el-popover ref="float-pop" placement="right" width="400" trigger="click">
            <el-form label-width="70px">
                <el-form-item label="内容宽高">
                    <el-col :span="7">
                        <el-input v-model="comData.content.style.width" placeholder="宽度"></el-input>
                    </el-col>
                    <el-col :span="7" :offset="1">
                        <el-input v-model="comData.content.style.height" placeholder="高度"></el-input>
                    </el-col>
                    <el-col :span="7" :offset="1">
                        <el-input v-model="comData.content.style['padding-top']" placeholder="内顶距"></el-input>
                    </el-col>
                </el-form-item>
                <el-form-item label="内容背景">
                    <el-col :span="7">
                        <el-input v-model="comData.content.style['background-color']" placeholder="背景色"></el-input>
                    </el-col>
                     <el-col :span="7" :offset="1" v-show="comData.content.style['background-image']">
                        <el-select v-model="comData.content.style['background-repeat']" placeholder="请选择">
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
                            :on-success = "handleBgSuccess"
                            :multiple = "false"
                            :auto-upload="true"
                            list-type="text">
                            <el-button type="primary" size="small">上传背景图</el-button>
                        </el-upload>
                    </el-col>
                </el-form-item>
                <el-form-item label="文本定位">
                    <el-col :span="7">
                        <el-input v-model="comData.content.style.top" placeholder="顶距"></el-input>
                    </el-col>
                    <el-col :span="7" :offset="1">
                        <el-input v-model="comData.content.style.left" placeholder="左距"></el-input>
                    </el-col>
                </el-form-item>
                <el-form-item label="文本设置">
                    <el-col :span="7">
                        <el-input v-model="comData.content.style.color" placeholder="颜色"></el-input>
                    </el-col>
                    <el-col :span="7" :offset="1">
                        <el-input v-model="comData.content.style['font-size']" placeholder="大小"></el-input>
                    </el-col>
                    <el-col :span="7" :offset="1">
                        <el-input v-model="comData.content.style['line-height']" placeholder="行高"></el-input>
                    </el-col>
                </el-form-item>
                <el-form-item label="文本内容">
                    <el-input type="textarea" :rows='3' v-model="content" placeholder="${N}次数 | 活动时间"></el-input>
                </el-form-item>
            </el-form>
        </el-popover>

        <div class='floatContainer' :style="{ height: comData.content.style.height } | formatStyle" ref='floatContainer'>
            <div class="fcontent" :style="comData.content.style | formatStyle">
                <div class="mask">
                    <el-button icon="el-icon-edit-outline">编辑</el-button>
                </div>

                <p v-if="content.length > 0" 
                    v-for=" (line, index) in content.split('\n')" 
                    :key="index">{{line}}</p>
                <p v-else>你今天还有 ${N} 次机会</p>
            </div>
        </div>
    </div>
</template>
<script>
    import util from '@/assets/js/util';
    import { mapGetters } from 'vuex';
     export default {
        name:'float_text',
        desc:'浮动文本',
        props: ['originData'],
        computed: mapGetters({
            uploadData: 'getUploadData'
        }),
        data(){
            return {
                comData:{
                    name:"float_text",
                    content:{
                        style:{
                            width:'',
                            height:'',
                            top:'',
                            left:'',
                            'padding-top':'',
                            'line-height':'',
                            'font-size':'',
                            'background-image': '',
                        },
                        text:''
                    }
                },
                content:'',
                bgList:[],
                bgImgOptions:[
                    { label: '适配全屏', value:'no-repeat' },
                    { label: '横向重复', value:'repeat-x' },
                    { label: '纵向重复', value:'repeat-y' },
                ],
            }
            
        },
        mounted(){
            if(!this.originData){
                return;
            }
            this.comData = this.originData;
            // this.content = this.comData.content.text.replace(/\u0001/g,'\n');
            let conBgImg = this.comData.content.style['background-image'];

            if(conBgImg){
                this.bgList.push({ name: conBgImg.split('/').pop(), url: conBgImg });
            }
        },
        methods:{
            getData(){
                this.comData.content.text = this.content.replace(/\n/g,'\\u0001');
                return this.comData;
            },
            handleBgSuccess(response){
                this.comData.content.style['background-image'] = `url(${response.file.path})`;
                util.getImageWH(response.file.path).then(res => {
                    this.comData.content.style.height = this.comData.content.style.height || res.height;
                    this.comData.content.style.width = this.comData.content.style.width || res.width;
                });
            },
            handleBgRemove(){
                this.comData.content.style['background-image'] = '';
                this.comData.content.style.height = '';
                this.comData.content.style.width = '';
            },
            handleExceed(){
                this.$message.warning(`抱歉，只能上传一张图片，如需修改，请删除后再操作`);
            },
        }
    }
</script>
<style lang='scss'>
.floatWrapper{
    position: relative;
}

.floatContainer{
    position: relative;
    height:50px;

    &:hover .mask{
        display: flex;
    }
    .fcontent{
        position:absolute;
        margin:0 auto;
        height:50px;
        background-size: contain;
        background-repeat: no-repeat;
        background-position:center;
        text-align:center;
        overflow:hidden;
        z-index:100;// 在mask 之上，方便编辑
        p{
            margin:0;
        }
    }
}
</style>