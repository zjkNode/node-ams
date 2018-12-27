<template>
	<div v-popover:shares-pop class="shareWrapper flex-center-v" v-show="wrapShow" ref="shareWrapper">
        <div class="mask"></div>
        <el-popover ref="shares-pop" placement="right" width="400" trigger="click">
            <el-form label-width="70px">
                <el-form-item label="分享标题">
                    <el-col :span="18">
                        <el-input type="textarea" placeholder="请输入需展示的分享标题" v-model="comData.share.title"></el-input>
                    </el-col>
                </el-form-item>
                <el-form-item label="分享描述">
                    <el-col :span="18">
                        <el-input type="textarea" placeholder="请输入需展示的分享描述信息" v-model="comData.share.desc"></el-input>
                    </el-col>
                </el-form-item>
                <el-form-item label="分享链接">
                    <el-col :span="18">
                        <el-input placeholder="请输入跳转的分享链接" v-model="comData.share.url"></el-input>
                    </el-col>
                </el-form-item>
                <el-form-item label="分享小图" >
                    <el-col>
                        <el-upload action="/api/act/upload"
                            :data="uploadData"
                            :file-list="originFileList"
                            :limit="1"
                            :on-exceed= "handleBgExceed"
                            :on-remove="handleRemove"
                            :on-success = "handleSuccess"
                            :auto-upload="true"
                            accept="image/jpeg,image/png"
                            :multiple = "false"
                            list-type="picture">
                            <el-button size="small" type="primary">点击上传</el-button>
                            <div slot="tip" class="el-upload__tip">只能上传jpg/png文件，且不超过500kb</div>
                        </el-upload>
                    </el-col>
                </el-form-item>
            </el-form>
        </el-popover>


        <div class="shareContainer flex-center-v">
            <div class="share_title">{{ comData.share.title || "微信分享标题" }}</div>
            <div class="share_desc">{{ comData.share.desc || "微信分享描述" }}</div>
            <img :src="comData.share.imgUrl || require('../img/share.jpg')" alt=''/>
        </div>

        <div class="showPop flex-center-v">
            <div class="mask">
                <el-button icon="el-icon-edit-outline">编辑</el-button>
            </div>
        </div>
    </div>
</template>
<script>
    import { mapGetters } from 'vuex';

    export default {
        name:'shares',
        desc:'微信分享',
        type:'hidden',
        props: ['originData'],
        computed: mapGetters({
            uploadData: 'getUploadData'
        }),
        data(){
            return {
                wrapShow: false,
                comData:{
                    name:"shares",
                    share:{
                        url:'',
                        title:'',
                        desc:'',
                        imgUrl:''
                    }
                },
                originFileList:[]
            }
            
        },
        mounted(){
            if(!this.originData){
                return;
            }
            this.originFileList = [];
            this.comData = this.originData;
            let imgUrl = this.comData.share.imgUrl;
            if(imgUrl){
                let fileName = imgUrl.split('/').pop();
                let fileObj = { name:fileName, url: imgUrl};
                this.originFileList.push(fileObj);
            }
        },
        methods:{
            getData(){
                return this.comData;
            },
            show(){
                this.wrapShow = true;
                let $mainContainer = this.$refs.shareWrapper.parentNode;
                $mainContainer.style['overflow-y'] = 'hidden';
                this.$refs.shareWrapper.style.top = $mainContainer.scrollTop +'px';
            },
            hide(){
                this.wrapShow = false;
                let $mainContainer = this.$refs.shareWrapper.parentNode;
                $mainContainer.style['overflow-y'] = 'auto';
                this.$refs.shareWrapper.style.top = 0;
            },
            handleBgExceed(){
                this.$message.warning(`抱歉，只能上传一张图片，如需修改，请删除后再操作`);
            },
            handleSuccess(response){
                this.comData.share.imgUrl = response.file.path;
            },
            handleRemove(){
                this.comData.share.imgUrl = '';
            }
        }
    }

</script>
<style lang="scss">
    .shareWrapper{
        position:absolute;
        left:0; top:0; width:100%;height:100%;
        background-color:rgba(0,0,0,0.8);
    }
    .mask{
        overflow: hidden;
        background: rgba(0, 0, 0, 0.7);
        position: absolute;
        top:0;left:0;right:0; bottom: 0;
        z-index:99;
        display: none;
    }
    .showPop{
        min-height: 80px;
        overflow: hidden;
        &:hover .mask{
            display: flex;
        }
        button{
            margin: 0 auto;
        }
    }
    .shareContainer{
        position:relative;
        padding:10px;
        width:300px;
        height:70px;
        margin:0 auto;
        background-color:#fff;
        border-radius:3px;
        

        .share_title{
            font-weight:700;
            color:#000;
            text-overflow:ellipsis;
            white-space: nowrap;
            overflow:hidden;
            height:25px;
            line-height:25px;
            margin-bottom:5px;
        }
        .share_desc{
            font-size:12px;
            color:#b2b2b2;
            width: 240px;
            height:45px;
            line-height:15px;
            display: -webkit-box;  
            display: -moz-box;  
            overflow: hidden;  
            text-overflow: ellipsis;  
            word-break: break-all;  
            -webkit-box-orient: vertical;  
            -webkit-line-clamp:3;
            -webkit-box-orient: vertical;
        }
        img{
            width:40px; 
            height:40px;
            position:absolute;
            right:10px;
            top: 38px;
        }
    }
</style>
