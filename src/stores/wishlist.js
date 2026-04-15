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
      saveWishlist(items.value)
    }
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
    saveWishlist(items.value)
  }

  const count = computed(() => items.value.length)

  return {
    items,
    count,
    addToWishlist,
    removeFromWishlist,
    isInWishlist,
    toggleWishlist,
    clearWishlist,
  }
})