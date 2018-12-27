<template>
    <div class="act_edit">
        <h2>活动 — {{title}}</h2>
        <el-row class='parts'>
            <div v-for="(part, index) in allParts" :key="index" @click="onPartClick(part)" >{{ part.desc }}</div>
        </el-row>
        <el-row>
            <el-form label-width="90px" :model="formData" ref="formData" :rules="rules" :show-message="true" style="width:470px;">
                <el-form-item label="活动名称" prop="name">
                    <el-input size="small" v-model="formData.name" placeholder="请输入活动名称"></el-input>
                </el-form-item>
                <el-form-item label="活动代码" prop="code">
                    <el-input size="small" v-model="formData.code" placeholder="请输入活动代码 (如 act_20)"></el-input>
                </el-form-item>
                <el-form-item label="背景">
                    <el-col :span="10">
                        <el-input size="small" v-model="formData.data.style['background-color']" placeholder="背景色"></el-input>
                    </el-col>
                    <el-col :span="7" :offset="1" v-show="formData.data.style['background-image']!=''">
                        <el-select size="small" v-model="formData.data.style['background-repeat']" placeholder="请选择">
                            <el-option v-for="item in bgImgOptions"
                                        :key="item.value"
                                        :label="item.label"
                                        :value="item.value">
                            </el-option>
                        </el-select>
                    </el-col>
                    <el-col :span="6" style="padding-left:10px;">
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
                            <el-button size="small" type="primary">上传背景图</el-button>
                        </el-upload>
                    </el-col>
                </el-form-item>
                <el-form-item label="扩展属性" style="margin-bottom:0;">
                    <template v-for="(value, key) in extendConfig">
                        <el-tooltip v-if="formData.extend[key]" :key="key" class="item" effect="dark" :content="formData.extend[key]" placement="bottom-start">
                          <el-button class='btn-tag' type="primary" plain @click="onExtendClick(key)">{{ value }}</el-button>
                        </el-tooltip>
                        <el-button v-else :key="key" class="btn-tag" @click="onExtendClick(key)">{{ value }}</el-button>
                    </template>
                </el-form-item>
                <el-form-item>
                    <el-input type="text" size="small" autosize clearable placeholder="请输入扩展属性值" v-model="tmpExtendValue">
                        <template slot="prepend">{{extendConfig[curExtendKey]}}</template>
                    </el-input>
                </el-form-item>
                <el-form-item label="模板内容" prop="data">
                    <el-row class="contentWrapper" :style="formData.data.style | formatStyle(defalutConf)">
                        <div class="part_item" :class="part.value" v-for="(part, index ) in parts" v-if="part.type !== 'hidden'" :key="index">
                            <div v-bind:is="part.name" :ref="part.value" :originData=" originData[index]"></div> 
                            <div class="modify">
                                <i class="el-icon-caret-top" @click="onMoveUp(part)"></i>
                                <i class="el-icon-caret-bottom" @click="onMoveDown(part)"></i>
                                <i class="el-icon-delete" @click="onDelete(part)"></i>
                            </div>
                        </div>


                        <template v-for="(part, index ) in parts">
                            <div v-bind:is="part.name" :ref="part.value" :key="index" :originData="originData[index]" :index="index" v-if="part.type === 'hidden'"></div>
                        </template>
                    </el-row>
                    <ul class="parts_hidden">
                        <template v-for="(part, index ) in parts">
                            <li v-if="part.type === 'hidden'" class="flex-center-v" :class="tempAlertKey == part.value ? 'selected' : '' " :key="index">
                                {{ part.label }}
                                <div class='mask' @click="showPartsFn(part)">
                                    <i class="el-icon-delete" @click.stop="onDelete(part)"></i>
                                </div>
                            </li>
                        </template>
                    </ul>
                </el-form-item>
            </el-form>
        </el-row>
        <el-row class="footer">
            <el-button v-if="curUser.isAdmin" size="small" @click="checkJsonFn">查JSON</el-button>
            <el-button size="small" @click="saveDraftsFn" :loading="isDrafing">存草稿</el-button>
            <el-button v-if="curDomain.id" size="small" type="primary" :disabled="curDomain.disabled" @click="onPublish(curDomain)">
                发布到 {{ curDomain.name }}
            </el-button>
            <el-dropdown v-else size="small" @command="onPublish">
              <el-button size="small" type="primary">
                去发布<i class="el-icon-arrow-down el-icon--right"></i>
              </el-button>
              <el-dropdown-menu slot="dropdown">
                <el-dropdown-item 
                    v-for="(item, index) in domains" 
                    :key="index" 
                    :command="item" 
                    :disabled="item.disabled">{{item.name}}</el-dropdown-item>
              </el-dropdown-menu>
            </el-dropdown>
        </el-row>
    </div>
</template>
<script>
    import { mapGetters } from 'vuex';
    import allParts from './parts/index';
    import util from '@/assets/js/util';

    export default{
        components: allParts,
        computed: mapGetters({
            curBtnRes:'getCurActBtnRes',
            cacheActParts: 'getActParts',
            uploadData:'getUploadData'
        }),
        watch: {
            curBtnRes(value, oldValue){
                if(oldValue || this.selectedAlertKey){
                    this.$refs[oldValue || this.selectedAlertKey][0].hide();
                }
                if(value){
                    this.$refs[value][0].show();
                    this.tempAlertKey = value;
                    return;
                }
                if(this.selectedAlertKey){
                    this.tempAlertKey = this.selectedAlertKey;
                    this.$refs[this.selectedAlertKey][0].show();
                    return;
                } 
                this.tempAlertKey = '';
            },
            cacheActParts(value){
                this.parts = value;
            },
            tmpExtendValue(value){
                this.formData.extend[this.curExtendKey] = value;
            }
        },
        data(){
            return {
                title:'新增',
                isDrafing: false,
                allParts: allParts,
                parts:[],
                curDomain:{},
                domains:[],
                tempAlertKey:'',
                selectedAlertKey:'',
                defalutConf:{
                    "background-image": `url(${require('./img/act_bg.jpg')})` 
                },
                originData:[],
                bgList:[],
                formData:{
                    id:'',
                    uuid:'',
                    name:'',
                    confid: 0,
                    code:'',
                    extend:{},
                    data:{
                        title:'',
                        style:{
                            "background-color":"",
                            "background-repeat":"",
                            "background-image": ""
                        },
                        components:[]
                    }
                },
                rules:{
                    name: [
                        {required:true,message: '请输入活动名称', trigger: 'blur'},
                        { min: 1, max: 49, message: '长度在 1 到 49 个字符', trigger: 'blur' }
                    ],
                    code: [
                        {required:true,message: '请输入活动代码', trigger: 'change'},
                        { min: 1, max: 49, message: '长度在 1 到 49 个字符', trigger: 'blur' }
                    ],
                    data: [
                        {required:true,message: '请输入填充模板内容'},
                    ]
                },
                bgImgOptions:[
                    { label: '适配全屏', value:'no-repeat' },
                    { label: '横向重复', value:'repeat-x' },
                    { label: '纵向重复', value:'repeat-y' },
                ],
                canLeave: false,
                tplContent: false,
                curExtendKey:'abTest',
                tmpExtendValue:'',
                extendConfig:{
                    abTest: 'abTest'
                }
            }
        },
        beforeRouteLeave(to, from, next){
            if(this.canLeave){
                next();
                return;
            }
            this.$confirm('您尚未提交，确定离开吗？', '友情提示', {type: 'warning'}).then(() => {
                next();
            }).catch(() => {});
        },
        mounted(){
            this.onMainScroll();
            this.getDomains();
            let id = util.getQueryParams("id");
            if(!id){ // 新增
                this.formData.uuid = util.uuid();
                this.$store.dispatch('setUploadData',{ uuid: this.formData.uuid });
                this.$store.dispatch("setActParts",[]);
                return;
            }

            // 修改
            this.title = '编辑'
            this.loadActData(id);
        },
        methods:{
            onExtendClick(key){
                this.curExtendKey = key;
                this.tmpExtendValue = this.formData.extend[key];
            },
            onMoveUp(part){
                let index = this.cacheActParts.findIndex((item) => {
                    return item.value === part.value;
                });
                if(index === 0){
                    return;
                }
                let preIndex = index - 1;
                [this.cacheActParts[preIndex], this.cacheActParts[index]] = [this.cacheActParts[index], this.cacheActParts[preIndex]];
                [this.originData[preIndex], this.originData[index]] = [this.originData[index], this.originData[preIndex]];

                let $partItem = document.getElementsByClassName(part.value)[0];
                $partItem.parentNode.insertBefore($partItem, $partItem.previousElementSibling);
            },
            onMoveDown(part){
                let index = this.cacheActParts.findIndex((item) => {
                    return item.value === part.value;
                });
                let nextIndex = index + 1;
                if(nextIndex === this.cacheActParts.length){
                    return;
                }
                [this.cacheActParts[index], this.cacheActParts[nextIndex]] = [this.cacheActParts[nextIndex], this.cacheActParts[index]];
                [this.originData[index], this.originData[nextIndex]] = [this.originData[nextIndex], this.originData[index]];
                let $partItem = document.getElementsByClassName(part.value)[0];
                $partItem.parentNode.insertBefore($partItem.nextElementSibling,$partItem);
            },
            onDelete(part){
                let index = this.cacheActParts.findIndex((item) => {
                    return item.value === part.value;
                });
                this.cacheActParts.splice(index,1);
                this.originData.splice(index, 1);
            },
            onMainScroll(){
                let $mainContainer = document.getElementsByClassName('main')[0],
                    $pContainer = document.getElementsByClassName('parts')[0],
                    $footer = document.getElementsByClassName('footer')[0];

                $pContainer.style.width = $mainContainer.clientWidth +'px';
                $footer.style.width = $mainContainer.clientWidth +'px';
                $mainContainer.addEventListener('scroll', function(){
                    let scrollTop = $mainContainer.scrollTop;
                    if(scrollTop < 65){
                        $pContainer.className = $pContainer.className.replace(' fixed', '');
                        $pContainer.nextElementSibling.style['margin-top'] = '';
                        return;
                    }

                    if($pContainer.className.indexOf('fixed') === -1){
                        $pContainer.className += ' fixed';
                        $pContainer.nextElementSibling.style['margin-top'] = '75px';
                    }
                });
                window.addEventListener('resize', function(){
                    $pContainer.style.width = $mainContainer.clientWidth +'px';
                    $footer.style.width = $mainContainer.clientWidth +'px';
                });
            },
            onPartClick(part){
                let tmpActParts = Object.assign([], this.cacheActParts);
                let i = this.cacheActParts.length;
                tmpActParts.push( {
                    name: part.name,
                    value: part.name +'_'+ i, 
                    label: part.desc +'_'+ i, 
                    type: part.type 
                });
                this.$store.dispatch("setActParts",tmpActParts);
            },
            onPublish(command){
                let url = '/api/act';
                this.bindFormData();
                this.formData.confid = command.id;

                this.$refs.formData.validate((valid) => {
                    if (!valid) {
                        return false;
                    }
                    this.$http.post(url, this.formData).then((res) => {
                        if(res.code !== 'SUCCESS'){
                            this.$message.error(res.msg);
                            return;
                        }
                        this.$router.push({
                            path:'/act/list'
                        });
                    }).catch(() => { });
                });
            },
            showPartsFn(part){
                let curAlertKey = part.value;
                if(!curAlertKey){
                    return;
                }
                if(!this.selectedAlertKey){
                    this.tempAlertKey = this.selectedAlertKey = curAlertKey;
                    this.$refs[this.selectedAlertKey][0].show();
                    return;
                }

                if(curAlertKey != this.selectedAlertKey){
                    this.$refs[this.selectedAlertKey][0].hide();
                    this.tempAlertKey = this.selectedAlertKey = curAlertKey;
                    this.$refs[this.selectedAlertKey][0].show();
                    return;
                }
                this.$refs[this.selectedAlertKey][0].hide();
                this.tempAlertKey = this.selectedAlertKey =  '';
            },
            getDomains(){
                let url = '/api/config/listByType';
                let params = {
                    type:'authData'
                };
                this.$http.get(url, { params: params }).then((res)=>{
                    if(res.code != 'SUCCESS'){
                        this.$message.error(res.msg);
                        return;
                    }
                    let tmpDomains = [];
                    for(let key in res.data){
                        tmpDomains.push(res.data[key]);
                    }
                    if(tmpDomains.length === 0){
                        this.domains = { noDomain: { disabled: true, name:'发布环境' }};
                        this.$message.warning("无效发布环境，请联系管理配置业务数据");
                        return;
                    }
                    this.domains = tmpDomains;
                    if(this.formData.confid && this.domains.length > 0){
                        this.curDomain = this.domains.find(item => item.id === this.formData.confid);
                    }
                }).catch(() => { });
            },
            saveDraftsFn(){
                let url = "/api/act/draft";
                this.bindFormData();
                this.isDrafing = true;
                this.$http.post(url,this.formData).then((res)=>{
                    this.isDrafing = false;
                    if(res.code !== 'SUCCESS'){
                        this.$message.error(res.msg);
                        return;
                    }
                    this.$router.push({
                        path:'/act/list'
                    });
                }).catch(() => {
                    this.isDrafing = false;
                });
            },
            checkJsonFn(){
                this.bindFormData();
                let tplData = Object.assign({}, this.formData.data);
                tplData.third_code = {} // 第三方统计代码，后台会从act_config表里读取
                tplData.download_url = '{}' // 下载地址 json string, 在nunjucks 模板引擎做数据绑定时反序列化
                // eslint-disable-next-line
                console.log(JSON.stringify(tplData))
            },
            bindFormData(){
                this.canLeave = true;
                this.formData.data.components = [];
                this.formData.data.title = this.formData.name;
                this.formData.data.code = this.formData.code;
                this.formData.data.uuid = this.formData.uuid;
                this.formData.data.extend = this.formData.extend;
                let compData = [], actParts = [];
                this.cacheActParts.forEach(part => {
                    let partData = this.$refs[part.value][0].getData();
                    compData.push(partData);
                    actParts.push(part.name);
                });
                this.formData.data.components = compData;
                this.formData.components = actParts.join(',');
            },
            handleBgExceed(){
                this.$message.warning('抱歉，只能上传一张背景图，如需修改，请删除后再操作');
            },
            handleBgRemove(){
                this.formData.data.style['background-image'] = "";
            },
            handleBgSuccess(response){
                this.formData.data.style['background-image'] = `url(${response.file.path})`;
            },

            loadActData(id){
                let url = '/api/act/'+ id;
                this.$http.get(url).then((res) => {
                    if(res.code != 'SUCCESS'){
                        this.$message.error(res.msg);
                        return;
                    }
                    this.$store.dispatch('setUploadData',{ uuid: res.data.uuid });

                    let resData = res.data;
                    this.formData = resData;
                    this.tmpExtendValue = resData.extend[this.curExtendKey];
                    if(resData.confid && this.domains.length > 0){
                        this.curDomain = this.domains.find(item => item.id === resData.confid) || 
                                        { id:-1, name:'未知环境', disabled: true }
                    }
                    // this.formData.data = resData.data;
                    let originBg = this.formData.data.style['background-image'];//渲染编辑背景
                    if(originBg){
                        let fileName = originBg.split('/').pop();
                        this.bgList.push({ name:fileName, url: originBg });
                    }

                    let tmpParts = resData.components.split(',');

                    let tmpOriginData = [];
                    let tmpActParts = [];

                    for(let i = 0; i< tmpParts.length; i++){
                        let itemPart = this.allParts[tmpParts[i]];
                        tmpOriginData.push(this.formData.data.components[i]);
                        tmpActParts.push( {
                            name: itemPart.name,
                            value: itemPart.name +'_'+ i, 
                            label: itemPart.desc +'_'+ i, 
                            type: itemPart.type 
                        });
                    }
                    this.originData = tmpOriginData;
                    this.$store.dispatch("setActParts", tmpActParts);
                }).catch(() => {});
            },
        }
    }
</script>
<style lang='scss' scope>
.act_edit{
    padding-bottom: 50px;
    .parts{
        margin-bottom: 15px;
        background-color:#324157;
        white-space: nowrap;
        height:50px;
        line-height:50px;
        color:#ccc;
        overflow-x:scroll;
        overflow-y:hidden;
        box-shadow:0px 2px 8px #324157;
        z-index: 100;
        &.fixed{
            position:fixed;
            top:75px;
        }
        > div{
            display:inline-block;
            min-width:60px;
            padding:0 10px;
            float:none;
            position:relative;
            text-align:center;
            &:hover{
                color:#ffd04b;
                background-color:rgb(40,52,70);
                cursor:pointer;
            }
        }
    }
    .part_item{
        position:relative;
        &:hover .modify{
            display: flex;
            z-index:1000;
        }
        .modify{
            position:absolute;
            display:none;
            top:0;
            right:0;
            background-color:rgba(0,0,0,0.5);
            color:#fff;
            padding:5px;
            font-size:16px;
            line-height:20px;
            i+i{
                margin-left:10px;
            }
        }
    }
    .footer{
        position:fixed;
        bottom:15px;
        left:215px;
        background-color:#fff;
        padding:5px;
        border-top: 1px solid #ddd;
        text-align: right;
        z-index:100;
        .el-button+.el-dropdown{
            margin-left: 10px;
        }
    }
}


.contentWrapper{
        width: 375px;
        height: 667px;
        overflow-x: hidden;
        overflow-y: auto;
        border:2px solid #bfcbd9;
        background-size:auto;
        position:relative;
        > div{
            border-bottom: 1px dashed #bfcbd9;
            // &:last-child{border:none;}
        }
    }
    .alerts_mask{
        width: 375px;
        height: 667px;
        background: rgba(0, 0, 0, 0.8);
        overflow: hidden;
        position: absolute;
        top: 0;
        left:0;
        z-index: 999;
    }
    .parts_hidden{
        width: 375px;
        height: auto;
        overflow: hidden;
        box-sizing:border-box;
        border:1px dashed #bfcbd9;
        border-top:0;
        text-align: center;
        cursor: pointer;
        &:empty{
            border:none;
        }
        li{
            position:relative;
            border-bottom:1px dashed #bfcbd9;
            border-right: 1px dashed #bfcbd9;
            margin-bottom:-1px;
            margin-right: -1px;
            width:93px;
            height: 30px;
            line-height: 1;
            overflow:hidden;
            word-wrap:break-word;
            float:left;
            &:hover .mask, &.selected .mask{
                display:block;
            }
            i{
                float:right;
                color:#fff;
                padding:2px;
            }
            
        }
    }
.btn-tag{
    font-size: 12px;
    padding: 0 8px;
    line-height: 18px;
    height:24px;
}
.el-button + .el-button{
    margin-left:10px;
}
</style>