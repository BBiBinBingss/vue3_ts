import { computed } from 'vue'
import { darkTheme, dateZhCN, zhCN, type GlobalThemeOverrides } from 'naive-ui'
import { useDesignSettingStore } from '/@/store/modules/designSetting'

/*
 * Naive UI 根级配置。
 *
 * App.vue 只负责挂载 Provider 和 RouterView，具体主题、语言、
 * 日期语言包等框架配置集中在这里，方便长期维护和替换 UI 方案。
 */
export function useNaiveProvider() {
  const designStore = useDesignSettingStore()

  /*
   * 主题跟随 Pinia 中的框架设置。
   * 返回 null 表示使用 Naive UI 默认亮色主题，避免在模板中散落判断。
   */
  const theme = computed(() => (designStore.darkTheme ? darkTheme : null))

  /*
   * 主题覆盖只放设计系统级 token。
   * 业务组件的局部样式不要写到这里，避免 Provider 配置膨胀。
   */
  const themeOverrides = computed<GlobalThemeOverrides>(() => {
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

  return {
    theme,
    themeOverrides,
    locale: zhCN,
    dateLocale: dateZhCN,
  }
}
