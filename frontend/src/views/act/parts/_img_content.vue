<template>
    <div>
        <div class="img_content_wrap" v-if="isPreview" :style=" (previewData.wrap && previewData.wrap.style) | formatStyle">
            <template v-for="item in previewData.image_path">
                <img :src="item" alt="" />
            </template>
        </div>
        <template v-else>
            <el-form label-width="70px">
                <el-form-item label="内容宽高">
                    <el-col :span="10">
                        <el-input size="small" v-model="comData.wrap.style.width" placeholder="宽"></el-input>
                    </el-col>
                    <el-col :span="10" :push="1">
                        <el-input size="small" v-model="comData.wrap.style.height" placeholder="高"></el-input>
                    </el-col>
                </el-form-item>
                <el-form-item label="位置(顶)">
                    <el-input size="small" v-model="comData.wrap.style['padding-top']" placeholder="顶"></el-input>
                </el-form-item>
                <el-form-item label="图片">
                    <el-upload action="/api/act/upload"
                        :data="uploadData"
                        :file-list="contentFileList"
                        :limit="1"
                        accept="image/jpeg,image/png"
                        :on-remove="handleRemove"
                        :on-success = "handleSuccess"
                        :multiple = "false"
                        :auto-upload="true"
                        list-type="text">
                    <el-button type="primary" size="small">上传图片</el-button>
                    </el-upload>
                </el-form-item>
            </el-form>
        </template>
    </div>
</template>
<script>
    import util from '@/assets/js/util';
    import { mapGetters } from 'vuex';

    export default{
        props: ['originData', 'isPreview'],
        data(){
            return {
                uuid: util.uuid(),
                contentFileList:[],
                comData:{
                    image_path:[],// todo 这个地方需要修改，只能包含一个图片的
                    wrap:{
                       style:{
                            width:'',
                            height:'',
                            'padding-top':''
                        } 
                    }
                },
                previewData:{}
            }
        },
        watch:{
            comData:{
                deep:true,
                handler:function(){
                    this.$store.dispatch("setActAlertContentConfig",this.comData);
                }
            }
        },
        computed: mapGetters({
            uploadData: 'getUploadData'
        }),
        mounted(){
            this.comData.uuid = this.uuid;
            if(!this.originData || Object.keys(this.originData).length === 0){
                return;
            }
            this.previewData = this.comData = this.originData;
            this.uuid = this.originData.uuid;
            for (var i = 0; i < this.comData.image_path.length; i++) {
                let imgUrl = this.comData.image_path[i];
                this.contentFileList.push({ 
                    name: imgUrl.split('/').pop(), 
                    url: imgUrl 
                });
            }
                
        },
        methods:{
            getData(){
				return this.comData;
			},
            preview(data){
                this.previewData = data;
            },
            handleSuccess(response, file, filelist){
                this.comData.image_path.push(response.file.path);
                util.getImageWH(response.file.path).then(res => {
                    this.comData.wrap.style.width = res.width;
                });
                // this.$store.dispatch("setActAlertContentConfig",this.comData);
            },
            handleRemove(file, filelist){
                // this.comData.image_path = this.comData.image_path.filter(function(item){
                //     if(file.response){
                //         return item != file.response.file.path;
                //     } else {
                //         return item != file.url;
                //     }
                // });
                this.comData.image_path = [];
                this.comData.wrap.style.width = '';
                // this.$store.dispatch("setActAlertContentConfig",this.comData);
            }
        }
        
    }
</script>
<style lang="scss">
    .img_content_wrap{
        margin:0 auto;
    }
</style>
