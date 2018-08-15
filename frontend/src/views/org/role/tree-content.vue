<template>
    <ul class="ul2">
        <li v-for="child in children" class="li3">
            <input type="checkbox" :value="child.id"/>
            <label>{{child.name}}</label>
            <Tree :lists = "child.children" v-if="child.children" class="t2"></Tree>
        </li>
    </ul>
</template>
<script>
    import Tree from './tree.vue';
    export default {
        props:['children'],
        components: {Tree},
    }
</script>