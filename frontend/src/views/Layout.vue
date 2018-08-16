<template>
    <el-container>
      <el-aside width="200px">
        <div class="logo">
            <img src="@/assets/img/admin.png" alt="" />
        </div>
        <el-menu router
          @open="handleOpen"
          @close="handleClose"
          background-color="#324157"
          text-color="#fff"
          active-text-color="#ffd04b">
          <MenuTree :menuData="menuData" ></MenuTree>
        </el-menu>
      </el-aside>
      <el-container>
        <el-header>
            <el-col :span="20">
            您好！ {{ user.deps | formatDep }} -- {{ user.role.name }} -- {{ user.nickname }}
            </el-col>
            <el-col :span="4" style="text-align:right">
                <el-dropdown trigger="click" @command="handleCommand">
                    <span class="el-dropdown-link">
                        {{ user.nickname }}<i class="el-icon-caret-bottom el-icon--right"></i>
                    </span>
                    <el-dropdown-menu slot="dropdown">
                        <el-dropdown-item command="info">修改信息</el-dropdown-item>
                        <el-dropdown-item command="signout">退出</el-dropdown-item>
                    </el-dropdown-menu>
                </el-dropdown>
            </el-col>
        </el-header>
        <el-main class='main'>
            <transition name="el-fade-in-linear" mode="out-in">
                <router-view></router-view>
            </transition>
        </el-main>
      </el-container>
    </el-container>

</template>
<script>
    import MenuTree from '@/components/MenuTree'
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
                user:{
                    role:{}
                }
            }
        },
        mounted(){
            this.init();
        },
        filters:{
            formatDep(deps) {
                if(!deps || deps.length == 0){
                    return '';
                }
                let depName = deps.map((dep)=>{ return dep.name }).join(' -- ');
                return depName;
            }
        },
        methods:{
            init(){
                this.user = JSON.parse(localStorage.getItem('user')) || this.user;
            },
            handleCommand(command){
                if(command=='signout'){
                    let url = '/api/signout';
                    this.$http.post(url).then((res)=>{
                        if(res.body.code == 'SUCCESS'){
                            localStorage.clear();
                            this.$cookie.delete('cmsnodessid');
                            this.$router.push({ path: '/login'});
                        }
                    },(err)=>{
                        console.log(err);
                    });
                    return;
                }
                if(command == 'info'){
                    this.editFormVisible=true;
                }
            },
            onEditVisibleChange(val){
                this.editFormVisible = val;
            },
            handleOpen(key, keyPath) {
                // console.log(key, keyPath);
            },
            handleClose(key, keyPath) {
                // console.log(key, keyPath);
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
    .logo{
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
  
</style>
