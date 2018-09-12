<template>
    <el-dialog title="新增菜单" :visible.sync="isVisible">
        <el-form label-width="90px" ref="addForm" :model="formData" :rules="rules" :show-message="true">
            <el-form-item label="菜单级别" prop="pids" >
                <el-cascader 
                    change-on-select 
                    :options="menuTree" 
                    :props="props" 
                    v-model="formData.pids" 
                    @change="pidsChange">
                </el-cascader> 
            </el-form-item> 
            <el-form-item label="菜单名称" prop="name">
                <el-input v-model="formData.name" placeholder="请输入菜单名称"></el-input>
            </el-form-item>
            <el-form-item label="菜单地址" prop="alink">
                <el-input v-model="formData.alink" placeholder="请输入菜单访问地址（如 /menus ）"></el-input>
            </el-form-item>
            <el-form-item label="菜单排序" prop="sort">
                <el-input-number v-model="formData.sort" :min="1"></el-input-number>
            </el-form-item>
        </el-form>
        <div slot="footer" class="dialog-footer">
            <el-button size="small" @click="hide">取 消</el-button>
            <el-button size="small" type="primary" @click="submitForm">确 定</el-button>
        </div> 
    </el-dialog>
</template>
<script>
    import { mapGetters } from 'vuex';

    export default {
        computed: mapGetters({
            menuData:'getMenuTree',
        }),
        data() {
            return {
                menuTree:[],
                isVisible:false,
                props:{
                    value:'id',
                    label:'name'
                },
                formData: {
                    name: '',
                    pid: null,
                    pids: null,
                    alink:'',
                    sort: 1
                },
                rules: {
                    name: [
                        { required: true, message: '请输入菜单名称', trigger: 'blur' }
                    ],
                    alink: [
                        { required: true, message: '请输入菜单访问地址', trigger: 'blur' }
                    ],
                    pids: [
                        { required: true, min: 1, type:'array', trigger: 'change'}
                    ],
                    sort: [
                        { required: false, min:1, message:'请输入菜单排序编号', type:'number', trigger: 'change' }
                    ]
                }
            };
        },
        mounted() {
        },
        watch: {
            menuData(val){
                let tmp = [{ name:'顶级菜单', id: 0, pid: 0 }];
                if(val){
                    tmp = tmp.concat(val);
                }
                this.menuTree = tmp;
            }
        },
        methods:{
            show(){
                this.$options.filters.disableItem(this.menuTree,-1)
                this.isVisible = true;
            },
            hide(){
                this.$refs.addForm.resetFields();
                this.isVisible = false;
            },
            submitForm(){
                this.$refs.addForm.validate((valid) => {
                    if (!valid) {
                        return false;
                    }
                    this.formData.pid = this.formData.pids.slice(-1)[0] || 0;
                    this.$http.post('/api/menu', this.formData).then(()=>{
                        this.hide();
                        this.$store.dispatch('refreshMenuTree');
                        this.$emit('afterSubmit');
                    });
                });
            },
            pidsChange(val){
                if(val[0] === 0){ // 顶级
                    this.formData.sort = this.menuTree.length;
                    return;
                }
                let tmpMenu = { children: this.menuTree};
                val.forEach(id => {
                    tmpMenu = tmpMenu.children.find(menu => menu.id === id);
                });
                let sort = tmpMenu.children && tmpMenu.children.slice(-1)[0].sort;
                this.formData.sort = sort + 1;
            }
        }
    }
</script>