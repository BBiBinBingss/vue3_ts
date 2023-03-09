<!--
 * @Author       : tangbo 852425209@qq.com
 * @Date         : 2022-10-26 10:08:59
 * @LastEditors  : tangbo 852425209@qq.com
 * @LastEditTime : 2022-10-26 14:26:24
 * @FilePath     : \hubei-traffic\src\App.vue
 * @Description  : 
-->
<template>
  <n-message-provider>
    <MessageApi />
  </n-message-provider>
  <router-view />
</template>
<script setup lang="ts">
import { NMessageProvider } from 'naive-ui'
</script>

<style></style>
