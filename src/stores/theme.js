import { defineStore } from 'pinia'
import { ref, computed } from 'vue'

function loadTheme() {
  try {
    const stored = localStorage.getItem('pet-shop-theme')
    if (stored) return stored
  } catch (e) {
    // ignore
  }
  return 'light'
}

function saveTheme(theme) {
  try {
    localStorage.setItem('pet-shop-theme', theme)
  } catch (e) {
    // ignore
  }
}

export const useThemeStore = defineStore('theme', () => {
  const theme = ref(loadTheme())

  const isDark = computed(() => theme.value === 'dark')

  function toggleTheme() {
    theme.value = theme.value === 'dark' ? 'light' : 'dark'
    saveTheme(theme.value)
    applyTheme()
  }

  function applyTheme() {
    if (theme.value === 'dark') {
      document.documentElement.classList.add('dark')
    } else {
      document.documentElement.classList.remove('dark')
    }
  }

  // Apply on init
  applyTheme()

  return {
    theme,
    isDark,
    toggleTheme,
  }
})
