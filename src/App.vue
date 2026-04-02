<!--
 * @Author       : tangbo 852425209@qq.com
 * @Date         : 2022-10-26 10:08:59
 * @LastEditors: BBiBinBings
 * @LastEditTime: 2025-01-04 20:36:14
 * @FilePath: \vue3_tsv\src\App.vue
 * @Description  : 
-->
<template>
  <n-config-provider
    :theme="getDarkTheme"
    :locale="zhCN"
    :date-locale="dateZhCN"
    :theme-overrides="getThemeOverrides">
    <n-message-provider>
      <MessageApi />
    </n-message-provider>
    <router-view />
  </n-config-provider>
</template>
<script setup lang="ts">
  import { zhCN, darkTheme, dateZhCN } from 'naive-ui'
  import { useDesignSettingStore } from '/@/store/modules/designSetting'
  // 主题配置
  const designStore = useDesignSettingStore()

  // 主题
  const getDarkTheme = computed(() => (designStore.darkTheme ? darkTheme : undefined))

  /**
   * @type import('naive-ui').GlobalThemeOverrides
   */
  const getThemeOverrides = computed(() => {
    const appTheme = designStore.appTheme
    return {
      common: {
        primaryColor: appTheme,
        primaryColorSuppl: appTheme,
      },
      LoadingBar: {
        colorLoading: appTheme,
      },
    }
  })
</script>

<style></style>
