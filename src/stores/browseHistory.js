import { defineStore } from 'pinia'
import { ref, computed } from 'vue'

const MAX_HISTORY = 50

function loadBrowseHistory() {
  try {
    const stored = localStorage.getItem('pet-shop-browse-history')
    if (stored) return JSON.parse(stored)
  } catch (e) {}
  return []
}

function saveBrowseHistory(history) {
  try {
    localStorage.setItem('pet-shop-browse-history', JSON.stringify(history))
  } catch (e) {}
}

export const useBrowseHistoryStore = defineStore('browseHistory', () => {
  const history = ref(loadBrowseHistory())
  const searchQuery = ref('')
  const selectedCategory = ref('全部')
  const sortBy = ref('time-desc')

  const categories = computed(() => {
    const cats = new Set(history.value.map(item => item.category))
    return ['全部', ...cats]
  })

  const filteredHistory = computed(() => {
    let result = [...history.value]

    if (searchQuery.value.trim()) {
      const query = searchQuery.value.trim().toLowerCase()
      result = result.filter(item =>
        item.name.toLowerCase().includes(query) ||
        (item.category && item.category.toLowerCase().includes(query))
      )
    }

    if (selectedCategory.value !== '全部') {
      result = result.filter(item => item.category === selectedCategory.value)
    }

    switch (sortBy.value) {
      case 'time-desc':
        result.sort((a, b) => new Date(b.browseAt) - new Date(a.browseAt))
        break
      case 'time-asc':
        result.sort((a, b) => new Date(a.browseAt) - new Date(b.browseAt))
        break
      case 'price-asc':
        result.sort((a, b) => a.price - b.price)
        break
      case 'price-desc':
        result.sort((a, b) => b.price - a.price)
        break
    }

    return result
  })

  function addToHistory(product) {
    const existingIndex = history.value.findIndex(item => item.id === product.id)
    if (existingIndex !== -1) {
      history.value.splice(existingIndex, 1)
    }
    
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
    
    if (history.value.length > MAX_HISTORY) {
      history.value = history.value.slice(0, MAX_HISTORY)
    }
    
    saveBrowseHistory(history.value)
  }

  function clearHistory() {
    history.value = []
    searchQuery.value = ''
    selectedCategory.value = '全部'
    saveBrowseHistory(history.value)
  }

  function removeFromHistory(productId) {
    const index = history.value.findIndex(item => item.id === productId)
    if (index !== -1) {
      history.value.splice(index, 1)
      saveBrowseHistory(history.value)
    }
  }

  function setSearch(query) {
    searchQuery.value = query
  }

  function setCategory(category) {
    selectedCategory.value = category
  }

  function setSortBy(sort) {
    sortBy.value = sort
  }

  const recentHistory = computed(() => history.value.slice(0, 10))
  const totalCount = computed(() => history.value.length)
  const filteredCount = computed(() => filteredHistory.value.length)

  return {
    history,
    recentHistory,
    searchQuery,
    selectedCategory,
    sortBy,
    categories,
    filteredHistory,
    totalCount,
    filteredCount,
    addToHistory,
    clearHistory,
    removeFromHistory,
    setSearch,
    setCategory,
    setSortBy,
  }
})
