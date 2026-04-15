import { defineStore } from 'pinia'
import { ref, computed } from 'vue'

const MAX_HISTORY = 50 // 最多保存50条足迹

function loadBrowseHistory() {
  try {
    const stored = localStorage.getItem('pet-shop-browse-history')
    if (stored) return JSON.parse(stored)
  } catch (e) {
    // ignore
  }
  return []
}

function saveBrowseHistory(history) {
  try {
    localStorage.setItem('pet-shop-browse-history', JSON.stringify(history))
  } catch (e) {
    // ignore
  }
}

export const useBrowseHistoryStore = defineStore('browseHistory', () => {
  const history = ref(loadBrowseHistory())

  function addToHistory(product) {
    // 移除已存在的同商品记录
    const existingIndex = history.value.findIndex(item => item.id === product.id)
    if (existingIndex !== -1) {
      history.value.splice(existingIndex, 1)
    }
    
    // 添加到最前面
    history.value.unshift({
      id: product.id,
      name: product.name,
      price: product.price,
      originalPrice: product.originalPrice,
      emoji: product.emoji,
      bgColor: product.bgColor,
      category: product.category,
      rating: product.rating,
      browseAt: new Date().toLocaleString('zh-CN'),
    })
    
    // 限制数量
    if (history.value.length > MAX_HISTORY) {
      history.value = history.value.slice(0, MAX_HISTORY)
    }
    
    saveBrowseHistory(history.value)
  }

  function clearHistory() {
    history.value = []
    saveBrowseHistory(history.value)
  }

  function removeFromHistory(productId) {
    const index = history.value.findIndex(item => item.id === productId)
    if (index !== -1) {
      history.value.splice(index, 1)
      saveBrowseHistory(history.value)
    }
  }

  const recentHistory = computed(() => history.value.slice(0, 10))

  return {
    history,
    recentHistory,
    addToHistory,
    clearHistory,
    removeFromHistory,
  }
})