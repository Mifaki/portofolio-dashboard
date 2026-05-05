export const useThemePreference = () => {
  const colorMode = useColorMode()
  const preference = useState<string>('theme-preference', () => colorMode.preference)

  onMounted(() => {
    preference.value = colorMode.preference
  })

  const setPreference = (value: string) => {
    colorMode.preference = value
    preference.value = value
  }

  return { preference: readonly(preference), setPreference }
}
