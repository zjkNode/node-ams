<template>
    <el-row>
        <div class="v_code_wrap" v-if="isPreview" :style=" (previewData.wrap && previewData.wrap.style) | formatStyle">
            <h3 :style="(previewData.title && previewData.title.style) | formatStyle">请输入图片验证码</h3>
            <p :style=" (previewData.pItem && previewData.pItem.style) | formatStyle">
                <input type="text" placeholder="请输入验证码" class="reg_code"/>
                <img src="" />
                <span class="refresh" :style="(previewData.code && previewData.code.style) | formatStyle">看不清？换一张</span>
            </p>
        </div>
        <template v-else>
            <el-form label-width="70px">
                <el-form-item label="内容宽高">
                    <el-col :span="7">
                        <el-input size="small" v-model="comData.wrap.style.width" placeholder="宽 px"></el-input>
                    </el-col>
                    <el-col :span="7" :offset="1">
                        <el-input size="small" v-model="comData.wrap.style.height" placeholder="高 px"></el-input>
                    </el-col>
                    <el-col :span="7" :offset="1">
                        <el-input size="small" v-model="comData.wrap.style['padding-top']" placeholder="顶距 px"></el-input>
                    </el-col>
                </el-form-item>
                <el-form-item label="颜色">
                    <el-col :span="7">
                        <el-input size="small" v-model="comData.title.style.color" placeholder="标题"></el-input>
                    </el-col>
                    <el-col :span="7" :offset="1">
                        <el-input size="small" v-model="comData.pItem.style['border-color']" placeholder="边框"></el-input>
                    </el-col>
                    <el-col :span="7" :offset="1">
                        <el-input size="small" v-model="comData.code.style.color" placeholder="刷新"></el-input>
                    </el-col>
                </el-form-item>
            </el-form>
        </template>
    </el-row>
</template>
<script>
    import { mapGetters } from 'vuex';
    import util from '@/assets/js/util';
    
    export default {
        props: ['originData', 'isPreview'],
        computed: mapGetters({
            uploadData: 'getUploadData'
        }),
        data() {
            return{
                uuid: util.uuid(),
                comData:{
                    wrap:{
                        style:{
                            width:'',
                            height:'',
                            'padding-top':''
                        }
                    },
                    title:{
                        style:{
                            color:''
                        }
                    },
                    pItem:{
                        style:{
                            'border-color':''
                        }
                    },
                    code:{
                        style:{
                            color:''
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
            }
        }
    }
</script>
<style lang="scss" scope>
    .v_code_wrap{
        margin:0 auto;
        color:#333;
        width: 80%;
        h3{
            text-align:center;
            margin-bottom:10px;
            margin-top:16px;
        }
        p{
            border: 1px solid #b2b2b2;
            border-radius:6px;
            font-size: 14px;
            margin-top: 0;
            margin-right:100px;
            margin-bottom:45px;
            position: relative;
            background-color:#fff;

            input{
                height:40px;
                border-radius:6px;
                display: inline-block;
                vertical-align: middle;
                color: #333;
                border: none;
                padding-left:5%;
                width:95%;
            }
            
            img{
                position:absolute;
                right:-100px;top:0px;
                width:90px;
                height:40px;
            }
            .refresh{
                position:absolute;
                top:40px;
                line-height:40px;
                right:-100px;
                display:inline-block;
            }
        }
    }
</style>