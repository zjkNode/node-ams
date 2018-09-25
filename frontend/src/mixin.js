
import { mapGetters } from 'vuex';

export default {
	install(Vue, opts){
		Vue.mixin({
			data(){
				return {
					opts: opts
				}
			},
			computed: mapGetters({
			    curMenu:'getCurMenu',
			    curUser: 'getCurUser'
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
		        formatTree(row, column,value){
		            return this.$options.filters.flatTree(row, value);
		        },
		        authCheck(action){
					if(this.curUser.isAdmin){
						return true;
					}
					let actions = this.curUser.actions[this.curMenu.id];
					return actions.includes(action);
				}
			}
		});
	}
}