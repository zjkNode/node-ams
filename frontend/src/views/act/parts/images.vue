<template>
	<div v-popover:image-pop class="imgWrapper flex-center-v">
        <el-popover ref="image-pop" placement="right" width="400" trigger="click">
            <el-form label-width="70px">
                <el-form-item label="内容定位" >
                    <el-col :span="7">
                        <el-input v-model="comData.wrap.style['padding-top']" placeholder="顶距"></el-input>
                    </el-col>
                    <el-col :span="7" :push="1">
                        <el-input v-model="comData.wrap.style['padding-bottom']" placeholder="底距"></el-input>
                    </el-col>
                    <el-col :span="6" :push="2">(单位：px)</el-col>
                </el-form-item>
                <el-form-item label="图片列表">
                    <el-row>
                        <el-col :span="12">
                            <el-upload action="/api/act/upload"
                                :data="uploadData"
                                :file-list="originFileList"
                                :on-remove="handleRemove"
                                :on-success = "handleSuccess"
                                :auto-upload="true"
                                accept="image/gif,image/jpeg,image/png"
                                :multiple = "true"
                                list-type="picture">
                                <el-button size="small" type="primary">点击上传</el-button>
                            </el-upload>
                        </el-col>
                    </el-row>
                </el-form-item>
                
            </el-form>
        </el-popover>
        
        <div class="mask">
            <el-button icon="el-icon-edit-outline">编辑</el-button>
        </div>

        <div class='imgContainer' :style="comData.wrap.style | formatStyle">
            <i class="el-icon-picture" style="font-size:50px" v-if="comData.images.length == 0"></i>
            <template v-for="(item, index) in comData.images" else>
                <img :src="item.url" alt="" :key="index" :style="item.style | formatStyle"/>
            </template>
        </div>
    </div>
</template>
<script>
    import { mapGetters } from 'vuex';
    import util from '@/assets/js/util';

	export default {
        name:'images',
        desc:'图片组件',
        props: ['originData'],
        computed: mapGetters({
            uploadData: 'getUploadData'
        }),
        data(){
            return {
                comData:{
                    name:'images',
                    wrap:{
                        style:{
                            'padding-top':'',
                            'padding-bottom':''
                        }
                    },
                    // image_path:[]
                    images:[]
                },
                originFileList:[]
            }
        },
        mounted(){
            if(!this.originData){
                return;
            }
            this.comData = this.originData;
            this.comData.images.forEach(item => {
                let fileName = item.url.split('/').pop();
                this.originFileList.push({ name: fileName, url: item.url });
            });
        },
        methods:{
            getData(){
                return this.comData;
            },
            handleSuccess(response){
                util.getImageWH(response.file.path).then(res => {
                    this.comData.images.push({
                        url: response.file.path,
                        style:{
                            width:res.width
                        }
                    });
                });
            },
            handleRemove(file){
                let imgUrl = file.response && file.response.file.path || file.url;
                this.comData.images = this.comData.images.filter(item => item.url !== imgUrl);
            }
        }
    }

</script>
<style lang="scss" scope>
    .imgWrapper{
        min-height: 80px;
        max-width: 375px;
        position: relative;
        &:hover .mask{
            display: flex;
        }
    }
    .imgContainer{
        text-align:center;
        font-size:0;
        line-height:0;
        img{
            display:block;
            margin:0 auto;
        }
    }
</style>