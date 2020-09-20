<template>
	<div class="hk-area">
		<label v-if="label">{{label}}</label>
		<span class="text" 
			:class="{ empty:!curValue, disabled:disabled, error: hasError}" 
			@click="onPickerShow">{{ curValue || placeholder || '请选择'+ label}}</span>
		<mt-popup v-model="pickVisible" position="bottom" :closeOnClickModal="false" class="pop-picker">
			<div class="toolbar">
				<span class="btn cancel" @click="onCanel">取消</span>
				<span class="title">请选择</span>
				<span class="btn confirm" @click="onConfirm">确定</span>
			</div>
			<mt-picker 
        v-if="pickVisible" 
        ref="pickerArea" 
        :slots="slots"
        @change="onAreaChange" 
        value-key="name"></mt-picker>
		</mt-popup>
	</div>
</template>
<script>
	export default {
    name: 'hk-area',
		props: {
			label: String, //字段标题
			placeholder: String,
			disabled: Boolean, //是否只读
			rules: Array,
			value: String | {},//默认key值，可以为对象
		},
		data() {
			return {
        pickVisible: false,
        clickEnable: false,
				hasError: false,
        slots: [],
        curItem:{
          provice:{ code:'', name:'' },
          city:{ code:'', name:'' },
          area:{ code:'', name:'' }
        },
        tmpItem:{} // 临时选中项
			}
    },
    computed:{
      curValue(){
        let value = `${this.curItem.provice.name} ${this.curItem.city.name || ''} ${this.curItem.area.name || ''}`
        return value.trim();
      },
    },
    watch:{
      disabled(value){
        if(value){
          this.hasError = false;
        }
      },
      value(newVal){
        if(!newVal){
          // value 为空时，清空curItem 才可以清空选中项
          this.curItem = { 
            provice:{ code:'', name:'' },
            city:{ code:'', name:'' },
            area:{ code:'', name:'' }
          };
          return;
        }
        
        let [proviceCode, cityCode, areaCode ] = newVal.split('|'); 
        if(this.slots.length === 0){
          // 数据反显时，绑定反显的值
          this.curItem.provice.code = proviceCode;
          this.curItem.city.code = cityCode;
          this.curItem.area.code = areaCode;
          return;
        }
        let proviceList = this.slots[0].values;
        this.curItem.provice = proviceList.find(item => item.code == proviceCode);
        cityCode && (this.curItem.city = this.curItem.provice.children.find(item => item.code == cityCode) || {});
        areaCode && (this.curItem.area = this.curItem.city.children.find(item => item.code == areaCode) || {});
        this.tmpItem = Object.assign({}, this.curItem);
      }
    },
		created() {
      if(this.value){
        let [proviceCode, cityCode, areaCode ] = this.value.split('|'); 
        this.curItem.provice.code = parseInt(proviceCode || 0);
        this.curItem.city.code = parseInt(cityCode || 0);
        this.curItem.area.code = parseInt(areaCode || 0); 
      }
      this.tmpItem = Object.assign({}, this.curItem);
      this.loadData();
    },
    
		methods: {
      getData(){
        return {
          addrProvince: this.curItem.provice.code,
          addrProvinceName: this.curItem.provice.name,
          addrCity: this.curItem.city.code,  
          addrCityName: this.curItem.city.name,
          addrCounty: this.curItem.area.code, 
          addrCountyName: this.curItem.area.name,
          // addrProvince: this.value.provice && this.value.provice.code,
          // addrProvinceName: this.value.provice && this.value.provice.name,
          // addrCity: this.value.city && this.value.city.code,  
          // addrCityName: this.value.city && this.value.city.name,
          // addrCounty: this.value.area && this.value.area.code, 
          // addrCountyName: this.value.area && this.value.area.name,
        }
      },
      showError(message){
				this.hasError = true;
				message && this.$toast(message);
      },
      clearError(){ // 在父组件中调用，清空出错标记
				this.hasError = false;
			},
			validate(){
        if(this.disabled) return;

				if(!this.rules || this.rules.length === 0){
					return;
				}
				for(let i = 0; i < this.rules.length; i++){
					let rule = this.rules[i];
					if(!this.tmpItem.provice.code){
						rule.required && this.showError(rule.message);
						return;
					}
				}
			},
			onPickerShow() {
        if(this.disabled || !this.clickEnable) return;
        
				this.pickVisible = true;
        this.stopScroll();

        if(!this.value) return;

        this.$nextTick(() => {
          this.curItem.provice.code && this.$refs.pickerArea.setSlotValue(0, this.curItem.provice);
          this.curItem.city.code && this.$refs.pickerArea.setSlotValue(1, this.curItem.city);
          this.curItem.area.code && this.$refs.pickerArea.setSlotValue(2, this.curItem.area);
        });
			},
			onCanel() {
				this.pickVisible = false;
				this.enableScroll();
			},
			onConfirm() {
        this.onCanel();
        this.clearError();
        let pickerValues = this.$refs.pickerArea.getValues();
        this.curItem.provice = pickerValues[0];
        this.curItem.city = pickerValues[1] || {};
        this.curItem.area = pickerValues[2] || {};
        this.$emit('input', `${this.curItem.provice.code}|${this.curItem.city.code}|${this.curItem.area.code}`);
        this.$emit('change')
        // let provice = pickerValues[0], 
        //     city = pickerValues[1] || {},
        //     area = pickerValues[2] || {};
				// this.$emit('input', { provice, city, area});
      },
      loadData(){
        let params = {
          saleItemId: this.$route.params.code,
        }
        this.$axios.post('/hk-insurance-shop/api/insuranceCommon/getInsAreaByInsCode', params).then(res => {
          if(!res.responseBody || res.responseBody.length === 0){
            console.log('file: hk-area; api:getInsAreaByInsCode; response empty', this.label);
            this.$toast('无可用'+ this.label);
            return;
          }
          this.clickEnable = true;
          let proviceList = res.responseBody.map(provice => {
            return {
              name: provice.cityName,
              code: provice.cityCode+'',
              children: provice.city.map(city => {
                return {
                  name: city.cityName,
                  code: city.cityCode+'',
                  children: city.area.map(area => {
                    return {
                      name: area.cityName,
                      code: area.cityCode+''
                    }
                  })
                }
              })
            }
          });
          let provice = {}, city = {}, area = {};
          if(this.value){
            let [proviceCode, cityCode, areaCode ] = this.value.split('|');
            provice = proviceList.find(item => item.code === proviceCode) || proviceList[0];
            city = provice.children.find(item => item.code === cityCode) || provice.children[0];
            area = city.children.find(item => item.code === areaCode) || city.children[0];

            this.curItem.provice = provice || this.curItem.provice;
            this.curItem.city = city || this.curItem.city;
            this.curItem.area = area || this.curItem.area;
            this.tmpItem = Object.assign({}, this.curItem);
          } else {
            provice = proviceList[0];
            city = provice.children[0];
            area = city.children[0];
          }
          if(provice.children.length > 0 && city.children.length > 0){
            this.slots = [
              { flex: 1, values: proviceList, textAlign: 'right'},
              { divider: true, content: '-' },
              { flex: 1, values: provice.children, textAlign: 'center'},
              { divider: true, content: '-' },
              { flex: 1, values: city.children, textAlign: 'left'},
            ]
            // this.$refs.pickerArea.setValues(provice, city, area);
            return;
          }

          if(provice.children.length > 0){
            this.slots = [
              { flex: 1, values: proviceList, textAlign: 'center'},
              { divider: true, content: '-' },
              { flex: 1, values: provice.children, textAlign: 'center'},
            ]
            // this.$refs.pickerArea.setValues(provice, city);
            return;
          }
          
          this.slots = [{ flex: 1, values: proviceList, textAlign: 'center'}];
          // this.$refs.pickerArea.setValues(proviceList);
        }).catch(() => {});
      },
      onAreaChange(picker, values){
        let provice = values[0];
        if(provice.code !== this.tmpItem.provice.code){ // 省改变
          let city = (provice.children && provice.children[0]) || { children: [] },
              area = (city.children && city.children[0]) || {};
          
          if(values[1]){
            provice.children.forEach(item => item.name = values[1].name.endsWith(' ') ? item.name.trim() : item.name +' ');
            picker.setSlotValues(1, provice.children);
          }
          if(values[2]){
            city.children.forEach(item => item.name = values[2].name.endsWith(' ') ? item.name.trim() : item.name +' ');
            picker.setSlotValues(2, city.children);
          }
          // provice.children.forEach(item => item.name = item.name.endsWith(' ') ? item.name.trim() : item.name +' ');
          // city.children.forEach(item => item.name = item.name.endsWith(' ') ? item.name.trim() : item.name +' ');

          // values[1] && picker.setSlotValues(1, provice.children);
          // values[2] && picker.setSlotValues(2, city.children);

          this.tmpItem.provice = provice;
          this.tmpItem.city = city;
          this.tmpItem.area = area;
          return;
        }

        let city = values[1];
        if(city.code !== this.tmpItem.city.code && values[2]){ // 市改变
          let area = (city.children && city.children[0]) || {};
          city.children.forEach(item => item.name = item.name.endsWith(' ') ? item.name.trim() : item.name +' ');
          picker.setSlotValues(2, city.children);

          this.tmpItem.city = city;
          this.tmpItem.area = area;
          return;
        }

        this.tmpItem.area = values[2];
      },
		}
	}
</script>
<style lang="less" scoped>
	.hk-area {
		display: flex;
		text-align: right;
		justify-content: space-between;
		align-items: center;
		width: 100%;
		position: relative;
		.text {
			text-align: inherit;
			font-size: inherit;
			flex: 1;
			margin-left: 0.1rem;
			height: 100%;
      color: #333;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
      &.empty {color: #bbb;}
      &.error{color: #FF2F49;}
		
			&:after {
				content: ' ';
				position: absolute;
				display: inline-block;
				background: url(../../assets/images/icons/arr_right.png) no-repeat center;
				background-size: auto 0.14rem;
				width: 0.3rem;
				height: 100%;
				right: -0.3rem;
			}
			&.disabled:after {
				display: none;
			}
		}
	}
	
	.pop-picker {
		background: #fff;
		width: 100%;
		.toolbar {
			border-bottom: 1px solid #eee;
			height: 0.5rem;
			line-height: 0.5rem;
			display: flex;
			text-align: center;
		}
		.title {
			flex: 1;
		}
		.btn {
			padding: 0 0.14rem;
			color: #0F90F9;
		}
	}
</style>