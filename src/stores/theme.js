import { defineStore } from 'pinia'
import { ref, computed } from 'vue'

export const themePresets = [
  { id: 'light', name: '明亮', icon: '☀️', primary: '#FF8C42', secondary: '#8B5CF6', accent: '#F472B6' },
  { id: 'dark', name: '暗黑', icon: '🌙', primary: '#FF8C42', secondary: '#8B5CF6', accent: '#F472B6' },
  { id: 'warm', name: '暖阳', icon: '🌞', primary: '#F59E0B', secondary: '#EF4444', accent: '#EC4899' },
  { id: 'ocean', name: '海洋', icon: '🌊', primary: '#06B6D4', secondary: '#3B82F6', accent: '#8B5CF6' },
  { id: 'forest', name: '森林', icon: '🌲', primary: '#22C55E', secondary: '#14B8A6', accent: '#84CC16' },
  { id: 'pastel', name: '粉彩', icon: '🎨', primary: '#F472B6', secondary: '#A78BFA', accent: '#FB923C' },
]

function loadTheme() {
  try {
    const stored = localStorage.getItem('pet-shop-theme')
    if (stored) {
      const parsed = JSON.parse(stored)
      if (parsed.id && themePresets.find(t => t.id === parsed.id)) {
        return parsed
      }
    }
  } catch (e) {
    // ignore
  }
  return { id: 'light', colors: themePresets[0] }
}

function saveTheme(theme) {
  try {
    localStorage.setItem('pet-shop-theme', JSON.stringify(theme))
  } catch (e) {
    // ignore
  }
}

export const useThemeStore = defineStore('theme', () => {
  const currentTheme = ref(loadTheme())

  const isDark = computed(() => currentTheme.value.id === 'dark')

  function setTheme(themeId) {
    const preset = themePresets.find(t => t.id === themeId)
    if (preset) {
      currentTheme.value = { id: themeId, colors: preset }
      saveTheme(currentTheme.value)
      applyTheme()
    }
  }

  function toggleTheme() {
    // Cycle through themes
    const currentIndex = themePresets.findIndex(t => t.id === currentTheme.value.id)
    const nextIndex = (currentIndex + 1) % themePresets.length
    setTheme(themePresets[nextIndex].id)
  }

  function applyTheme() {
    const theme = currentTheme.value.colors
    document.documentElement.setAttribute('data-theme', currentTheme.value.id)
    document.documentElement.style.setProperty('--color-primary', theme.primary)
    document.documentElement.style.setProperty('--color-secondary', theme.secondary)
    document.documentElement.style.setProperty('--color-accent', theme.accent)
  }

  // Apply on init
  applyTheme()

  return {
    currentTheme,
    themePresets,
    isDark,
    setTheme,
    toggleTheme,
  }
})
