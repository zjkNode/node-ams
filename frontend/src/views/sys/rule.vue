<template>
    <el-row>
        <h2>系统功能配置</h2>
        <el-table :data="menuList" highlight-current-row v-loading="loading">
            <el-table-column type="expand">
                <template slot-scope="scope">
                    <el-tag
                      :key="action"
                      v-for="action in scope.row.actions"
                      closable
                      :disable-transitions="false"
                      @close="onRemoveAction(scope.row.menu_id, action)">
                      {{action}}
                    </el-tag>
                    <el-dropdown @command="onAddAction">
                      <el-tag class="el-dropdown-link">
                        添加功能<i class="el-icon-arrow-down el-icon--right"></i>
                      </el-tag>
                      <el-dropdown-menu slot="dropdown">
                        <el-dropdown-item :command='"a_"+ scope.row.menu_id'>黄金糕</el-dropdown-item>
                        <el-dropdown-item command="b">狮子头</el-dropdown-item>
                        <el-dropdown-item command="c">螺蛳粉</el-dropdown-item>
                        <el-dropdown-item command="d" disabled>双皮奶</el-dropdown-item>
                        <el-dropdown-item command="e" divided>蚵仔煎</el-dropdown-item>
                      </el-dropdown-menu>
                    </el-dropdown>
                </template>
            </el-table-column>
            <el-table-column prop="menu_name" label="菜单名称" >
            </el-table-column>
        </el-table>
    </el-row>
</template>
<script>
    export default {
        data() {
            return {
                keys:'',
                menuList:[],
                rules:[],
                loading: false,
                editValue:'',
            }
        },
        mounted() {
            this.loadRules();
        },
        methods: {
            onAddAction(action){
                console.log(action)
            },
            onRemoveAction(menuId, action){

            },
            //获取全部数据
            loadRules(){
                let url = '/api/rule';
                let data = { keys: this.keys };
                this.loading = true;
                this.$http.get(url, { params: data }).then((res)=> {
                    this.loading = false;
                    if(res.code !== 'SUCCESS'){
                        this.$message.error(res.msg);
                        return;
                    }
                    this.menuList = res.data;
                }).catch(() => {
                    this.loading = false;
                });
            },
            loadSysActions(){
                
            }
        }
    }

</script>
