<template>
    <el-row>
        <h2>合同内容 — {{title}}</h2>
        <el-form label-width="90px" ref="conForm" :model="formData" :rules="rules" :show-message="true">
            <el-form-item label="合同类型" prop="typeids">
                <el-col :span="16">
                    <el-cascader 
                        @change='typeChanged' 
                        change-on-select 
                        :options="typeTree" 
                        :props="props" 
                        v-model="formData.typeids"></el-cascader> 
                </el-col>
            </el-form-item> 
            <el-form-item label="合同标题" prop="title">
                <el-col :span="16">
                    <el-input v-model="formData.title" placeholder="请输入合同标题"></el-input>
                </el-col>
            </el-form-item>
            <el-form-item label="合同内容" prop="content">
                <el-col :span="23">
                    <div ref="editorBar" class="editor_bar"></div>
                    <div ref="editor" class="editor_con"></div>
                </el-col>
            </el-form-item>
            <el-form-item style="margin-bottom:0px;">
            <el-col :span='23' style="text-align:right;">
                <el-button size="small" @click="resetForm">取消</el-button>
                <el-button size="small" type="primary" @click="onSubmit" :loading="isDoing">确定</el-button>
            </el-col>
        </el-form-item>
        </el-form>
        
    </el-row>
</template>
<script>
    import E from 'wangeditor';
    import util from '@/assets/js/util';
    export default {
        data(){
            return {
                title: '新增',
                isDoing: false,
                formData: {
                    confid:'',
                    id:'',
                    typeids:[],
                    title: '',
                    content: ''
                },
                props:{
                    value:'id',
                    label:'name'
                },
                typeTree:[],
                rules: {
                    typeids:[{ required: true, type:'array', message:'请选择合同类型', trigger: 'change' }],
                    title:[{ required: true, message:'请输入类型名称', trigger: 'blur' }],
                    content:[{ required: true, message:'请输入合同内容', trigger: 'blur' }]
                },
                componentsType:null,
                placeholderData:[],
                preData:[],
                editor: null
            }
        },
        mounted(){
            this.bindTypeTree();
            // this.bindVMList();
            this.initEditor();
            let id = util.getQueryParams("id");
            if(!id){ // 新增
                return;
            }

            // 修改
            this.title = '编辑';
            this.loadData(id);
        },
        methods:{
            initEditor(){
                this.$refs.editor.style['height'] = (document.body.clientHeight - 400) +'px';
                this.editor = new E(this.$refs.editorBar, this.$refs.editor);
                this.editor.customConfig.zIndex = 100;
                this.editor.customConfig.pasteTextHandle = util.toCleanHtml;
                this.editor.customConfig.onchange = (html) => {
                  this.formData.content = html;
                };
                this.editor.create();
            },
            loadData(id){
                let url = '/api/contract/'+ id;
                this.$http.get(url).then((res) => {
                    if(res.code !== 'SUCCESS'){
                        this.$message.error(res.msg);
                        return;
                    }
                    this.formData = res.data;
                    this.editor.txt.html(res.data.content);
                    
                    // //为获取vm数据 
                    // this.componentsType = this.formData.typeid[0];
                    // this.getPlaceholderData()
                }).catch(() => {

                });
            },
            onSubmit(){
                if(this.formData.id){
                    this.onEditSubmit();
                    return;
                }
                this.onAddSubmit();
            },
            onAddSubmit(){
                this.$refs.conForm.validate((valid) => {
                    if (!valid) {
                        return false;
                    }
                    let apiUrl = "/api/contract";
                    this.isDoing = true;
                    this.$http.post(apiUrl, this.formData).then((res) => {
                        this.isDoing = false;
                        if(res.code != 'SUCCESS'){
                            this.$message.error(res.msg);
                            return;
                        }
                       this.resetForm();
                    }).catch(() => { 
                        this.isDoing = false;
                    });
                });
            },
            onEditSubmit(){
                this.$refs.conForm.validate((valid) => {
                    if (!valid) {
                        return false;
                    }
                    let apiUrl = "/api/contract/"+ this.formData.id;
                    this.isDoing = true;
                    this.$http.put(apiUrl, this.formData).then((res) => {
                        this.isDoing = false;
                        if(res.code != 'SUCCESS'){
                            this.$message.error(res.msg);
                            return;
                        }
                       this.resetForm();
                    }).catch(() => {
                        this.isDoing = false;
                    });
                });
            },
            resetForm() {
                this.$refs.conForm.resetFields();
                this.$router.push({
                    path:'/contract/list'
                });
            },
            bindTypeTree(){
                let url = '/api/contract/type/tree';
                this.$http.get(url).then((res) => {
                    if(res.code != 'SUCCESS'){
                        this.$message.error(res.msg);
                        return;
                    }
                    if(res.data && res.data.length > 0){
                        this.typeTree = res.data;
                        return;
                    }
                    this.typeTree = [{ name:'无数据', id: -1, disabled: true}];
                }).catch(() => { });
            },
            typeChanged(value){
                if(value.length > 1){
                    return;
                }
                let topType = this.typeTree.find(item => item.id === value[0]);
                this.formData.confid = topType.confid;
            },
            bindVMList(){
                let url = '/api/contracts/vm/lists';
                this.$http.get(url).then((res)=>{
                    if(res.code !== 'SUCCESS'){
                        this.$message.error(res.msg);
                        return;
                    }
                    this.preData = res.data.lists;
                }).catch(() => {

                });
            },
            vmDataReady(){
                var array = []
                this.preData.map((val) => {
                    if(this.componentsType !== val.typeid){
                        return;
                    }
                    array.push({
                        label: val.name,
                        value: val.placeholder
                    });
                })
                this.placeholderData = array;
                this.$nextTick(() => {
                    this.$refs.ue.createEditor();
                })
            }
        }
    }
</script>
<style lang="scss" scope>
.editor_bar {
    border: 1px solid #ccc;
}
.editor_con{
    margin-top: -1px;
    border: 1px solid #ccc;
    height: 500px;
    .w-e-text{
        table {
            border-collapse:collapse;
            width: 100%;
        }
        td,th{ 
            border: 1px solid windowtext; 
            min-width: 60px; 
            text-align: center; 
            p{
                display: inline-block; 
                margin: 2px 0;
            }
        }
    }
}
</style>