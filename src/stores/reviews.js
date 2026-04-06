import { defineStore } from 'pinia'
import { ref, computed } from 'vue'

function loadUserReviews() {
  try {
    const stored = localStorage.getItem('pet-shop-user-reviews')
    if (stored) return JSON.parse(stored)
  } catch (e) {
    // ignore
  }
  return []
}

function saveUserReviews(reviews) {
  try {
    localStorage.setItem('pet-shop-user-reviews', JSON.stringify(reviews))
  } catch (e) {
    // ignore
  }
}

export const useReviewStore = defineStore('reviews', () => {
  const userReviews = ref(loadUserReviews())

  function persist() {
    saveUserReviews(userReviews.value)
  }

  function addReview(review) {
    userReviews.value.unshift(review)
    persist()
  }

  function getProductReviews(productId) {
    return userReviews.value.filter(r => r.productId === productId)
  }

  function hasReviewed(orderId, productId) {
    return userReviews.value.some(r => r.orderId === orderId && r.productId === productId)
  }

  return {
    userReviews,
    addReview,
    getProductReviews,
    hasReviewed,
  }
})
