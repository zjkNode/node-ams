<template>
    <el-row>
        <h2>系统功能配置</h2>
        <el-table :data="menuList" highlight-current-row v-loading="isLoading">
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
                        <el-dropdown-item v-for="(action, index) in actions" :command='`${action.key}_${scope.row.menu_id}`' :disabled='scope.row.actions.includes(action.key)'>{{ action.name }}</el-dropdown-item>
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
                menuList:[],
                actions:[],
                isLoading: false,
            }
        },
        mounted() {
            this.loadRules();
            this.loadSysActions();
        },
        methods: {
            onAddAction(command){
                let cmds = command.split('_');
                let params = {
                    menu_id: cmds[1],
                    action: cmds[0]
                };
                this.$http.post('/api/rule',  params).then(res => {
                    if(res.code !== "SUCCESS"){
                        this.$message.error(res.msg);
                        return;
                    }
                    this.$message.success(res.msg);
                    let curMenu = this.menuList.find(item => item.id === params.menu_id);
                    curMenu.actions.push(params.action);
                });
            },
            onRemoveAction(menu, action){
                let params = {
                    menu_id: menu,
                    action: action
                };
                this.$http.delete('/api/rule',  params ).then(res => {
                    if(res.code !== "SUCCESS"){
                        this.$message.error(res.msg);
                        return;
                    }
                    this.$message.success(res.msg);
                    menu.actions.splice(menu.actions.indexOf(action)+1, 1);
                }); 
            },
            //获取全部数据
            loadRules(){
                let url = '/api/rule';
                this.isLoading = true;
                this.$http.get(url).then((res)=> {
                    this.isLoading = false;
                    if(res.code !== 'SUCCESS'){
                        this.$message.error(res.msg);
                        return;
                    }
                    this.menuList = res.data;
                }).catch(() => {
                    this.isLoading = false;
                });
            },
            loadSysActions(){
                let query = {
                    type: 'authAction'
                };
                this.$http.get('/api/config/listByType', { params: query }).then(res => {
                    if(res.code !== 'SUCCESS'){
                        this.$message.error(res.msg);
                        return;
                    }
                    this.actions = res.data;
                });
            }
        }
    }

</script>
