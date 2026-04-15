import { defineStore } from 'pinia'
import { ref, computed } from 'vue'

function loadWishlist() {
  try {
    const stored = localStorage.getItem('pet-shop-wishlist')
    if (stored) return JSON.parse(stored)
  } catch (e) {
    // ignore
  }
  return []
}

function saveWishlist(wishlist) {
  try {
    localStorage.setItem('pet-shop-wishlist', JSON.stringify(wishlist))
  } catch (e) {
    // ignore
  }
}

export const useWishlistStore = defineStore('wishlist', () => {
  const items = ref(loadWishlist())
  const searchQuery = ref('')
  const activeCategory = ref('全部')
  const sortBy = ref('time-desc')
  const selectedItems = ref(new Set())
  const currentPage = ref(1)
  const pageSize = ref(12)

  const categories = computed(() => {
    const cats = new Set(items.value.map(item => item.category))
    return ['全部', ...cats]
  })

  const filteredItems = computed(() => {
    let result = [...items.value]

    if (searchQuery.value.trim()) {
      const query = searchQuery.value.trim().toLowerCase()
      result = result.filter(item =>
        item.name.toLowerCase().includes(query) ||
        (item.category && item.category.toLowerCase().includes(query))
      )
    }

    if (activeCategory.value !== '全部') {
      result = result.filter(item => item.category === activeCategory.value)
    }

    switch (sortBy.value) {
      case 'time-desc':
        result.sort((a, b) => new Date(b.addedAt) - new Date(a.addedAt))
        break
      case 'time-asc':
        result.sort((a, b) => new Date(a.addedAt) - new Date(b.addedAt))
        break
      case 'price-asc':
        result.sort((a, b) => a.price - b.price)
        break
      case 'price-desc':
        result.sort((a, b) => b.price - a.price)
        break
      case 'rating-desc':
        result.sort((a, b) => (b.rating || 0) - (a.rating || 0))
        break
      case 'discount-desc':
        result.sort((a, b) => {
          const discA = a.originalPrice ? (1 - a.price / a.originalPrice) : 0
          const discB = b.originalPrice ? (1 - b.price / b.originalPrice) : 0
          return discB - discA
        })
        break
    }

    return result
  })

  const totalPages = computed(() => Math.ceil(filteredItems.value.length / pageSize.value) || 1)

  const paginatedItems = computed(() => {
    const start = (currentPage.value - 1) * pageSize.value
    return filteredItems.value.slice(start, start + pageSize.value)
  })

  const totalFiltered = computed(() => filteredItems.value.length)

  const isAllSelected = computed(() =>
    filteredItems.value.length > 0 &&
    filteredItems.value.every(item => selectedItems.value.has(item.id))
  )

  const selectedCount = computed(() => selectedItems.value.size)

  function addToWishlist(product) {
    if (!isInWishlist(product.id)) {
      items.value.push({
        id: product.id,
        name: product.name,
        price: product.price,
        originalPrice: product.originalPrice,
        emoji: product.emoji,
        bgColor: product.bgColor,
        category: product.category,
        rating: product.rating,
        reviews: product.reviews,
        addedAt: new Date().toLocaleString('zh-CN'),
      })
      saveWishlist(items.value)
      return { success: true }
    }
    return { success: false, message: '商品已在收藏中' }
  }

  function removeFromWishlist(productId) {
    const index = items.value.findIndex(item => item.id === productId)
    if (index !== -1) {
      items.value.splice(index, 1)
      selectedItems.value.delete(productId)
      saveWishlist(items.value)
    }
  }

  function removeMultiple(productIds) {
    const idSet = new Set(productIds)
    items.value = items.value.filter(item => !idSet.has(item.id))
    productIds.forEach(id => selectedItems.value.delete(id))
    saveWishlist(items.value)
  }

  function isInWishlist(productId) {
    return items.value.some(item => item.id === productId)
  }

  function toggleWishlist(product) {
    if (isInWishlist(product.id)) {
      removeFromWishlist(product.id)
      return { success: true, added: false }
    } else {
      addToWishlist(product)
      return { success: true, added: true }
    }
  }

  function clearWishlist() {
    items.value = []
    selectedItems.value.clear()
    saveWishlist(items.value)
  }

  function setSearch(query) {
    searchQuery.value = query
    currentPage.value = 1
  }

  function setCategory(category) {
    activeCategory.value = category
    currentPage.value = 1
  }

  function setSortBy(sort) {
    sortBy.value = sort
    currentPage.value = 1
  }

  function toggleSelectItem(productId) {
    if (selectedItems.value.has(productId)) {
      selectedItems.value.delete(productId)
    } else {
      selectedItems.value.add(productId)
    }
  }

  function toggleSelectAll() {
    if (isAllSelected.value) {
      selectedItems.value.clear()
    } else {
      filteredItems.value.forEach(item => selectedItems.value.add(item.id))
    }
  }

  function clearSelection() {
    selectedItems.value.clear()
  }

  function removeSelected() {
    removeMultiple([...selectedItems.value])
  }

  function goToPage(page) {
    if (page >= 1 && page <= totalPages.value) {
      currentPage.value = page
    }
  }

  const count = computed(() => items.value.length)

  return {
    items,
    count,
    searchQuery,
    activeCategory,
    sortBy,
    selectedItems,
    currentPage,
    pageSize,
    categories,
    filteredItems,
    paginatedItems,
    totalPages,
    totalFiltered,
    isAllSelected,
    selectedCount,
    addToWishlist,
    removeFromWishlist,
    removeMultiple,
    isInWishlist,
    toggleWishlist,
    clearWishlist,
    setSearch,
    setCategory,
    setSortBy,
    toggleSelectItem,
    toggleSelectAll,
    clearSelection,
    removeSelected,
    goToPage,
  }
})
