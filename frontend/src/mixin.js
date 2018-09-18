
import { mapGetters } from 'vuex';

export default {
	install(Vue, options){
		Vue.mixin({
			data(){
				return {
					// options: options
				}
			},
			computed: mapGetters({
			    curMenu:'getCurMenu',
			}),
			filters:{
	            statusFilter(val){
	                if(val === 1)
	                    return '正常';
	                if(val === 2)
	                    return '停用';
	                return '未知';
	            }
	        },
			methods:{
				dateFormat(row,column,cellvalue){
		           return this.$options.filters.formatDate(cellvalue);
		        },
		        formatTree(row, column,value){
		            return this.$options.filters.flatTree(row, value);
		        },
			}
		});
	}
}