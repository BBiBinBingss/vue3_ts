<!--
 * @Author       : tangbo 852425209@qq.com
 * @Date         : 2022-10-26 10:08:59
 * @LastEditors  : tangbo 852425209@qq.com
 * @LastEditTime : 2023-07-11 15:36:41
 * @FilePath     : \vue3_ts\src\App.vue
 * @Description  : 
-->
<template>
  <n-config-provider
    :theme="theme"
    :locale="locale"
    :date-locale="dateLocale"
    :theme-overrides="themeOverrides"
  >
    <n-message-provider>
      <MessageApi />
    </n-message-provider>
    <router-view />
  </n-config-provider>
</template>

<script setup lang="ts">
import { useNaiveProvider } from '/@/app/naive'

const { theme, themeOverrides, locale, dateLocale } = useNaiveProvider()
</script>

<style></style>
