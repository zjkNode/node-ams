<template>
	<div v-popover:roll-pop class="rollWrapper">
        <el-popover ref="roll-pop" placement="right" width="400" trigger="click">
            <el-form label-width="70px">
                <el-form-item label="组件高度">
                    <el-col :span="7">
                        <el-input v-model="comData.wrap.style.height" placeholder="组件高度"></el-input>
                    </el-col>
                    <el-col :span="7" :offset="1">
                        <el-input v-model="comData.wrap.style['padding-top']" placeholder="内顶距"></el-input>
                    </el-col>
                </el-form-item>
                <el-form-item label="组件背景">
                    <el-col :span="7">
                        <el-input v-model="comData.wrap.style['background-color']" placeholder="背景色"></el-input>
                    </el-col>
                     <el-col :span="7" :offset="1" v-show="comData.wrap.style['background-image']">
                        <el-select v-model="comData.wrap.style['background-repeat']" placeholder="请选择" >
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
                <el-form-item label="内容背景">
                    <el-col :span="7">
                        <el-input v-model="comData.box.style['background-color']" placeholder="背景色"></el-input>
                    </el-col>
                    <el-col :span="7" :offset="1" v-show="comData.box.style['background-image']">
                        <el-select v-model="comData.box.style['background-repeat']" placeholder="请选择">
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
                            :file-list="boxBgList"
                            :limit="1"
                            accept="image/jpeg,image/png"
                            :on-exceed= "handleExceed"
                            :on-remove="handleBoxRemove"
                            :on-success = "handleBoxSuccess"
                            :multiple = "false"
                            :auto-upload="true"
                            list-type="text">
                            <el-button type="primary" size="small">上传背景图</el-button>
                        </el-upload>
                    </el-col>
                </el-form-item>
                <el-form-item label="内容设置">
                    <el-col :span="7">
                        <el-input v-model="comData.content.style.color" placeholder="文本颜色"></el-input>
                    </el-col>
                    <el-col :span="7" :offset="1">
                        <el-input v-model="comData.content.style['line-height']" placeholder="行高"></el-input>
                    </el-col>
                    <el-col :span="7" :offset="1">
                        <el-input v-model="conEdge" placeholder="边距"></el-input>
                    </el-col>
                </el-form-item>
                <el-form-item label="滚动方向">
                    <el-radio-group size="small" v-model="comData.content.orient" @change="onOrientChange">
                      <el-radio-button label="orientH">横向</el-radio-button>
                      <el-radio-button label="orientV">纵向</el-radio-button>
                    </el-radio-group>
                </el-form-item>
                <el-form-item label="滚动文本">
                    <el-input type="textarea" :rows='8' v-model="content" placeholder="文本内容"></el-input>
                </el-form-item>
            </el-form>
        </el-popover>
        
        <div class="mask">
            <el-button icon="el-icon-edit-outline">编辑</el-button>
        </div>

        <div class='rollContainer' ref='rollContainer' :style="comData.wrap.style | formatStyle">
            <div class="rbox" :style="comData.box.style | formatStyle">
                <div class="rcontent" :style="comData.content.style | formatStyle">
                    <template v-if="comData.content.orient == 'orientH'">
                    {{ content || '滚动文本' }}
                    </template>
                    <template v-else v-for="(item, index) in content.split('\n')">
                        <p :key="index">{{ item || '滚动文本'}}</p>
                    </template>
                </div>
            </div>
        </div>
    </div>
</template>
<script>
    import util from '@/assets/js/util';
    import { mapGetters } from 'vuex';
     export default {
        name:'rolling',
        desc:'滚动文本',
        props: ['originData'], 
        computed: mapGetters({
            uploadData: 'getUploadData'
        }),
        data(){
            return {
                comData:{
                    name:"rolling",
                    wrap:{
                        style: {
                            height: '',
                            'background-image': '',
                            'background-color': '',
                            'padding-top':''
                        }
                    },
                    box:{
                        style:{
                            'background-image': '',
                            'background-color': '',
                            width:'',
                            height:''
                        }
                    },
                    content:{
                        style:{
                            width:'',
                            height:'',
                            padding:'',
                            'line-height':''
                        },
                        text:'',
                        orient:'orientH' // orientH   orientV
                    }
                },
                content:'',
                bgList:[],
                bgImgOptions:[
                    { label: '适配全屏', value:'no-repeat' },
                    { label: '横向重复', value:'repeat-x' },
                    { label: '纵向重复', value:'repeat-y' },
                ],
                boxBgList:[],
                conEdge:'',
            }
        },
        watch: {
            conEdge:'onOrientChange'
        },
        mounted(){
            if(!this.originData){
                return;
            }
            this.comData = this.originData;
            // this.content = this.comData.content.text.replace(/\u0001/g,'\n');
            let wrapBgImg = this.comData.wrap.style['background-image'],
                boxBgImg = this.comData.box.style['background-image'];

            if(wrapBgImg){
                this.bgList.push({ name: wrapBgImg.split('/').pop(), url: wrapBgImg });
            }
            if(boxBgImg){
                this.boxBgList.push({ name: boxBgImg.split('/').pop(), url: boxBgImg });
            }
            let pdArr = this.comData.box.style.padding.split(' ');
            if(pdArr.length > 0){
                this.conEdge = parseInt(pdArr[0]) || parseInt(pdArr[1]);
            }
        },
        methods:{
            getData(){
                this.comData.content.text = this.content.replace(/\n/g,'\\u0001');
                return this.comData;
            },
            onOrientChange(){
                let padding = this.comData.content.style.orientH ? `${this.conEdge || 0} 0` : `0 ${this.conEdge || 0}`;
                this.comData.content.style.padding = padding;
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
        }
    }
</script>
<style lang='scss' scope>
.rollWrapper{
    position: relative;
    &:hover .mask{
        display: flex;
    }
}

.rollContainer{
    position: relative;
    background-size: contain;
    background-repeat: no-repeat;
    background-position: top;
    .rbox{
        position: relative;
        width:70%;
        margin:0 auto;
        line-height:45px;
        background-image: url('../img/bg_roll.png');
        background-size: contain;
        background-repeat: no-repeat;
        background-position:center;
    }
    .rcontent{
        position:relative;
        text-align:center;
        white-space:nowrap;
        overflow:hidden;        
    }
}
</style>