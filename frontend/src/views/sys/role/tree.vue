<template>
    <ul class="ul1">
        <li v-for = "item in lists" class="li2">
               <input type="checkbox" :value="item.id" /> <label>{{item.name}}</label> <TreeCon :children="item.children" v-if="item.children" class="li5" ></TreeCon>
        </li>

    </ul>

</template>
<script>
    export default {
        props:['lists'],
        components: {},
        methods:{

        },
        beforeCreate: function () {
            this.$options.components.TreeCon = require('./tree-content.vue')
        }
    }
</script>
