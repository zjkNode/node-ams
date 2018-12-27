<template>
    <div>
        <div v-if="isPreview" :style=" (previewData.wrap && previewData.wrap.style) | formatStyle">
            <img :src="previewData.image && previewData.image.url" alt="" :style=" (previewData.image && previewData.image.style) | formatStyle"/>
        </div>
        <template v-else>
            <el-form label-width="40px" size="small">
                <el-form-item label="宽高">
                    <el-col :span="7">
                        <el-input v-model="comData.wrap.style.width" placeholder="宽px"></el-input>
                    </el-col>
                    <el-col :span="7" :offset="1">
                        <el-input v-model="comData.wrap.style.height" placeholder="高px"></el-input>
                    </el-col>
                    <el-col :span="7" :offset="1">
                        <el-input v-model="comData.wrap.style['padding-top']" placeholder="顶px"></el-input>
                    </el-col>
                </el-form-item>
                <el-form-item label="图片">
                    <el-upload
                        class="btn-uploader"
                        action="/api/act/upload"
                        accept="image/gif,image/jpeg,image/png"
                        :data="uploadData"
                        :show-file-list="false"
                        :on-success="handleSuccess">
                        <img v-if="comData.image.url" :src="comData.image.url" class="btn_img" />
                        <i v-else class="el-icon-plus btn-uploader-icon"></i>
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
                comData:{
                    image:{
                        url:'',
                        style:{
                            width:''
                        }
                    },
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
        },
        methods:{
            getData(){
				return this.comData;
			},
            preview(data){
                this.previewData = data;
            },
            handleSuccess(response){
                this.comData.image.url = response.file.path;
                util.getImageWH(response.file.path).then(res => {
                    this.comData.image.style.width = res.width;
                });
            }
        }
    }
</script>