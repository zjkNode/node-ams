
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
			methods:{

			}
		});
	}
}