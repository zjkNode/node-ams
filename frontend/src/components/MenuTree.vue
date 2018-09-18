<template>
<div>
    <template v-for="menu in menuData">
        <el-submenu :index="menu.alink" v-if="menu.children">
            <template slot="title">
                <i class="el-icon-menu"></i>
                <span slot="title">{{menu.name}}</span>
            </template>
            <MenuTree :menuData="menu.children"></MenuTree>
        </el-submenu>
        <el-menu-item :route="menu.alink" :index="menu.alink" v-else>
            <i class="el-icon-menu"></i>
            <span slot="title">{{menu.name}}</span>
        </el-menu-item>
    </template>
    </div>
</template>

<script>
  export default {
    props: ['menuData'],
    name: 'MenuTree'
  }
</script>