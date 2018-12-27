<template>
    <el-container>
      <el-aside width="200px">
        <div class="avatar">
            <img src="@/assets/img/admin.png" alt="" />
        </div>
        <el-menu router
          background-color="#324157"
          text-color="#fff"
          @select="onMenuSelected"
          :default-active='$route.path'
          active-text-color="#ffd04b">
          <MenuTree :menuData="menuData" ></MenuTree>
        </el-menu>
      </el-aside>
      <el-container>
        <el-header>
            <el-col :span="20">
            您好！ {{ curUser.depName }} -- {{ curUser.roleName  }} -- {{ curUser.nickname }}
            </el-col>
            <el-col :span="4" style="text-align:right">
                <el-dropdown trigger="click" @command="handleCommand">
                    <span class="el-dropdown-link">
                        {{ curUser.nickname }}<i class="el-icon-caret-bottom el-icon--right"></i>
                    </span>
                    <el-dropdown-menu slot="dropdown">
                        <el-dropdown-item command="info">基本信息</el-dropdown-item>
                        <el-dropdown-item command="signout">退出</el-dropdown-item>
                    </el-dropdown-menu>
                </el-dropdown>
            </el-col>
        </el-header>
        <el-main class='main'>
            <transition name="el-fade-in-linear" mode="out-in">
                <router-view ref='mainView'></router-view>
            </transition>
        </el-main>
      </el-container>

        <el-dialog title="基本信息 -- 修改" :visible.sync="isVisible">
            <el-form :model="formData" :rules="rules" ref="dialogForm" label-width="80px" @keyup.enter.native="onSubmit">
                <el-form-item label="用户名" prop="email">
                  <el-input v-model="formData.email" name="email" placeholder="登录邮箱" :disabled="true"></el-input>
                </el-form-item>
                <el-form-item label="真实姓名" prop="nickname">
                  <el-input v-model="formData.nickname" name="nickname" placeholder="真实姓名"></el-input>
                </el-form-item>
                <el-form-item label="密码" prop="newPwd">
                  <el-input v-model="formData.newPwd" type="password" name="newPwd" placeholder="登录密码"></el-input>
                </el-form-item>
                <el-form-item label="联系电话" prop="phone">
                  <el-input v-model="formData.phone" name="phone" placeholder="联系电话"></el-input>
                </el-form-item>
            </el-form>
            <div slot="footer" class="dialog-footer">
                <el-button size="small" @click="isVisible = false">取 消</el-button>
                <el-button size="small" type="primary" @click="onSubmit" :loading="isDoing">确 定</el-button>
            </div>
        </el-dialog>

    </el-container>

</template>
<script>
    import MenuTree from '@/components/MenuTree';
    import util from '@/assets/js/util';
    import { mapGetters } from 'vuex';

    export default{
        name:"mainApp",
        components:{
            MenuTree,
        },
        computed: mapGetters({
            menuData:'getMenuTree',
        }),
        data() {
            return {
                user:{},
                isVisible: false,
                isDoing: false,
                formData:{
                    id:'',
                    depids:[],
                    roleids:[],
                    email:'',
                    nickname:'',
                    password:'',
                    newPwd:'',
                    phone:''
                },
                rules: {
                    email:[
                        { required: true, message: '请输入邮箱地址', trigger: 'blur' },
                    ],
                    newPwd:[
                        { min: 6,  message: '密码不能小于 6 位', trigger: 'blur' }
                    ],
                    nickname:[
                        { required:true, message:'请输入用户别名',trigger:'blur'}
                    ]
                }
            }
        },
        mounted(){
            for(let key in this.formData){
                this.formData[key] = this.curUser[key];
            }
        },
        methods:{
            handleCommand(command){
                if(command=='signout'){
                    this.signout();
                    return;
                }
                if(command == 'info'){
                    this.isVisible = true;
                    return;
                }
            },
            onMenuSelected(index, indexPath){
                let curMenu = {};
                let tmpMenus = this.menuData;
                indexPath.forEach(path => {
                   curMenu = tmpMenus.find(menu => menu.alink === path);
                   tmpMenus = curMenu.children;
                });
                this.$store.dispatch('setCurMenu', curMenu);
            },
            onSubmit(){
                this.$refs.dialogForm.validate((valid) => {
                    if (!valid) {
                        return false;
                    }
                    this.isDoing = true;
                    let apiUrl = "/api/user/"+ this.formData.id;
                    let params = Object.assign({}, this.formData);
                    if(params.newPwd && params.newPwd.trim()){
                        params.newPwd = util.encrypt(params.newPwd.trim());
                    }
                    if(this.curUser.isAdmin){
                        params.depids = [0];
                        params.roleids = [0];
                    }
                    this.$http.put(apiUrl, params).then((res)=>{
                        this.isDoing = false;
                        if(res.code !== 'SUCCESS'){
                            this.$message.error(res.msg);
                            return;
                        }
                        this.isVisible = false;

                        // 更新缓存
                        let tmpUser = {};
                        for(let key in this.curUser){
                            tmpUser[key] = this.formData[key] || this.curUser[key];
                        }
                        this.$store.dispatch('setCurUser', tmpUser);

                        // 如果是用户列表页，刷新列表
                        if(this.$route.path === '/sys/org/user'){
                            this.$refs.mainView.bindUsers();
                        }
                    }).catch(() => {
                        this.isDoing = false;
                    });
                });
            }
        }
    }
</script>
<style lang="scss">
.el-header{ //, .el-footer 
    color: #324057;
    text-align: left;
    font-size: 14px;
    line-height: 60px;
    background: #fff;
}
  
.el-aside {
    background-color: #324157;
    color: #333;
    text-align: center;
    line-height: 200px;
    .avatar{
        height: 150px;
        border-bottom: solid 1px #ccc;
        img{
            width: 100px;
            border-radius:100px;
            margin:25px auto;
        }
    }
    .el-menu{
        text-align:left;
        border:none;
    }
}
.el-cascader, .el-select{
    width:100%;
}
.el-pagination{
    margin-top:10px;
}

.el-tag, .el-tag + .el-dropdown {
    margin-right: 10px;
    margin-top: 5px;
}
.main {
    overflow-y: auto;
    overflow-x:hidden;
    margin: 15px;
    padding:0;
    background: #fff;
    border-radius: 4px;
    box-shadow: 0 1px 1px rgba(0, 0, 0, 0.05);
    h2 {
        border-left: 5px solid #324057;
        color: #324057;
        padding-left: 10px;
        margin-bottom: 15px;
        margin-left:15px;
    }
    .tools{
        padding:0 15px 15px 15px;
    }
}
  
body > .el-container {
    height: 100%;
}

.el-cascader-menus{
    max-width: 50%;
    overflow-x:auto;
}
.el-button--text[disabled]{
    color: #c0c4cc !important;
}
</style>
