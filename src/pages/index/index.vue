<!--
 * @Author       : tangbo 852425209@qq.com
 * @Date         : 2022-06-29 16:54:07
 * @LastEditors: BBiBinBings 
 * @LastEditTime: 2025-02-23 22:36:18
 * @FilePath: \vue3_tsv\src\pages\index\index.vue
 * @Description  : 首页
-->

<template>
  <div>
    <open-layers />
  </div>
</template>

<script lang="ts" setup>
import OpenLayers from '/@/components/OpenLayers'

let i = $ref(0)
</script>

<style lang="less" scoped>
@import './index.less';
</style>
