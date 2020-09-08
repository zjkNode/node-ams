
import { mapGetters } from 'vuex';

export default {
	install(Vue, opts){
		Vue.mixin({
			data(){
				return {
					opts: opts,
				}
			},
			computed: mapGetters({
			    curMenu:'getCurMenu',
			    curUser: 'getCurUser',
			    sysActions: 'getActions'
			}),
			filters:{
	            statusFilter(val){
	                if(val === 1)
	                    return '正常';
	                if(val === 2)
	                    return '停用';
	                return '未知';
	            },
	        },
			methods:{
				dateFormat(row,column,cellvalue){
		           return this.$options.filters.formatDate(cellvalue);
		        },
		        treeFormat(row, column,value){
		            return this.$options.filters.flatTree(row, value);
		        },
		        authCheck(action){
					let actions = this.curUser.actions[this.curMenu.id];
					if(this.curUser.isAdmin || !actions){ // 默认 所有菜单不受权限控制
						return true;
					}
					return actions.includes(action);
				},
				signout(){
					let url = '/api/user/signout';
                    this.$http.post(url).then((res) => {
                        if(res.code !== 'SUCCESS'){
                            this.$message.error(res.msg)
                            return;
                        }
                        localStorage.removeItem('curMenu');
                        localStorage.removeItem('curUser');
                        localStorage.removeItem('menuData');
                        
                        this.$store.dispatch('refreshMenuTree');
                        this.$cookie.delete('nodesyscookie');
            			// 强制刷新页面，清除vuex 对变量的缓存，否则重新登录后，系统菜单加载不出来
                        // window.location.replace('/login');
                        // this.$router.push({ path: '/login'});
                    }).catch(() => { }); 
				}
			}
		});
	}
}