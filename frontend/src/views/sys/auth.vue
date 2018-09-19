<template>
	<el-row>
		<h2>角色权限配置</h2>
		<el-tabs type="border-card" style="margin: 0 2%;">
			<el-tab-pane label="系统菜单权限">
				<el-tree
					ref='menuTree'
					:props="props"
					:data="menuData"
					node-key="id"
					show-checkbox
					@node-click="onNodeClick"
					@check-change="onCheckChanged">
					<span class='custom-node' slot-scope="{ node, data }">
						{{ data.name }}
						<template v-if="data.isLeaf">
							<el-tag v-if="!data.actions" size="mini" type="info">暂无</el-tag>
							<template v-else v-for='action in data.actions.split(",")'>
								<el-tag 
								v-if="tmpActions.includes(action)" 
								:key='action'
								closable
								size="mini">{{ actions[action].name }}</el-tag>
								<el-button v-else class="btn-mini" :key='action' @click="onCheckAction(data, action)">{{ actions[action].name }}</el-button>
							</template>
						</template>
					</span>
				</el-tree>
			</el-tab-pane>
			<el-tab-pane label="系统数据权限">配置管理</el-tab-pane>
		</el-tabs>
	</el-row>
</template>
<script>
    import { mapGetters } from 'vuex';
    import util from '@/assets/js/util';

	export default{
        name:"auth",
        computed: mapGetters({
            menuData:'getMenuTree',
        }),
        data() {
            return {
            	isActionVisible: false,
            	nodeData:'',
				props: {
					label: 'name',
				},
				tmpActions:['add'],
				actions:[],
				checkedActions:{}
            }
        },
        mounted(){
            this.loadActions();
            this.$nextTick(()=>{
            	console.log(this.menuData)
            })
        },
        methods:{
            loadActions(){
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
            },
            onNodeClick(data, node){
            	console.log(data, node)
            	// if(data.isLeaf){
            	// 	this.nodeData = data;
            	// 	this.nodeData.actions = data.actions ? data.actions.split(',') : [];
            	// }
            },
            onCheckChanged(data, checked, indeterminate){
            	console.log(data, checked, indeterminate);
            },
            onActionChecked(value){
            	console.log(value)
            },
            onCheckAction(data, action){
				let roleActions = {};
				roleActions[data.id] = [action];
				
            	let params = {
            		roleid: util.getQueryParams('id'),
            		actions: roleActions
            	};
            	console.log(params);
            }
        }
    }
</script>
<style>
	.custom-node{
		font-size:14px;
	}
	.btn-mini{
		font-size: 12px;
	    padding: 0 5px;
	    line-height: 18px;
	    height:20px;
	}
	.el-tag + .el-button, .el-button + .el-button{
		margin-left:10px;
	}
</style>