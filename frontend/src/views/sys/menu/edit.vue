<template>
    <el-dialog title="修改菜单" :visible.sync="isVisible">
        <el-form label-width="90px" ref="editForm" :model="formData" :rules="rules" >
            <el-form-item label="菜单级别" prop="pid">
                <el-cascader 
                    change-on-select
                    :options="menuTree" 
                    :props="props" v-model="formData.pid" 
                    @change="pidChange"
                ></el-cascader> 
            </el-form-item> 
            <el-form-item label="菜单名称" prop="name">
                <el-input v-model="formData.name" placeholder="请输入菜单名称"></el-input>
            </el-form-item>
            <el-form-item label="菜单地址" prop="alink">
                <el-input v-model="formData.alink" placeholder="请输入菜单访问地址（如 /menus ）"></el-input>
            </el-form-item>
            <el-form-item label="是否可用" prop="status">
                <el-radio-group v-model.number="formData.status">
                    <el-radio v-bind:label="1">正常</el-radio>
                    <el-radio v-bind:label="2">停用</el-radio>
                </el-radio-group>
            </el-form-item> 
            <el-form-item label="菜单排序" prop="sort">
                <el-input v-model.number="formData.sort" placeholder="排序（默认为1）"></el-input>
            </el-form-item>
        </el-form>
         <div slot="footer" class="dialog-footer">
            <el-button @click="hide">取 消</el-button>
            <el-button type="primary" @click="submitForm">确 定</el-button>
        </div> 
    </el-dialog>
</template>
<script>
    import { mapGetters } from 'vuex';

    export default {
        props: {
            isEditVisible: { type: Boolean, default: false },
            rowData:null
        },
        computed: mapGetters({
            menuData:'getMenuTree',
        }),
        data() {
            let handleInput = (rule,val,callback) =>{
                if( rule.field == "sort"){
                    if(val>99 || val<1){
                        callback(new Error('请输入1-99之间的数字'));
                    }else{
                        callback();
                    }
                }else{
                    callback();
                }
            };
            return {
                menuTree:[],
                isVisible: false,
                props:{
                    value:'id',
                    label:'name'
                },
                formData: {
                    name: '',
                    alink:'',
                    status: 1,
                    pid: null,
                    pids:null,
                    sort: 1
                },
                rules: {
                    name: [
                        { required: true, message: '请输入菜单名称', trigger: 'blur' }
                    ],
                    alink: [
                        { required: true, message: '请输入菜单访问地址', trigger: 'blur' }
                    ],
                    status: [
                        { required: true, trigger: 'blur',type:'number'}
                    ],
                    pid: [
                        { required: true, validator:handleInput, trigger: 'change',type:'number' }
                    ],
                    sort: [
                        { required: false, validator:handleInput, trigger: 'change', type:'number' }
                    ]
                }
            };
        },
        mounted() {
        },
        watch: {
            rowData(row){
                this.formData = row;
                let pids = row.pids;
                if(pids.indexOf(",") != -1){
                    this.formData.pid=pids.split(",");
                    this.formData.pid = this.formData.pid.map( (i)=>{
                        return i*1;
                    });
                }else{
                    this.formData.pid=[Number(pids)];
                }
                this.$options.filters.disableItem(this.menuTree,row.id)
            },
            menuData(val, oldVal){
                let tmp = [{ name:'顶级菜单', id: 0, pid: 0 }];
                if(val && val != oldVal){
                    tmp = tmp.concat(val);
                }
                this.menuTree = tmp;
            }
        },
        methods:{
            show(){
                this.isVisible = true;
            },
            hide(){
                this.$refs.editForm.resetFields();
                this.isVisible = false;
            },
            submitForm(formName){
                var me = this;
                this.$refs.editForm.validate((valid) => {
                    if (!valid) {
                        return false;
                    }

                    var data = Object.assign({},me.formData);
                    var pids = data.pid;
                    var _pid = pids.slice(-1)[0];
                    data.pid = _pid >0 ? _pid : 0;
                    var apiUrl = "/api/menu/"+ this.formData.id;
                    this.isLoading = true;
                    this.$http.put(apiUrl,data).then((res)=>{
                        this.isLoading = false;
                        this.hide();
                        this.$store.dispatch('refreshMenuTree');
                        this.$emit('afterSubmit');
                    }).catch(() => {
                        this.isLoading = false;
                    });
                });
            },
            pidChange(val){
                if(!val[0]){
                    this.formData.pid=[0];
                };
                this.formData.pids = this.formData.pid.join(",");
            }
        }
    };

</script>