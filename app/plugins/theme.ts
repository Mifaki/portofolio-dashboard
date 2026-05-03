export default defineNuxtPlugin({
  name: 'theme-persistence',
  enforce: 'pre',
  setup() {
    const appConfig = useAppConfig()

    const primaryCookie = useCookie<string>('theme-primary', {
      default: () => appConfig.ui.colors.primary,
      maxAge: 60 * 60 * 24 * 365
    })
    const neutralCookie = useCookie<string>('theme-neutral', {
      default: () => appConfig.ui.colors.neutral,
      maxAge: 60 * 60 * 24 * 365
    })

    appConfig.ui.colors.primary = primaryCookie.value
    appConfig.ui.colors.neutral = neutralCookie.value

    if (import.meta.client) {
      watch(() => appConfig.ui.colors.primary, (val) => { primaryCookie.value = val })
      watch(() => appConfig.ui.colors.neutral, (val) => { neutralCookie.value = val })
    }
  }
})
