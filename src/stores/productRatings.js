import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { products as defaultProducts } from '../data/products'

function loadProductRatings() {
  try {
    const stored = localStorage.getItem('pet-shop-product-ratings')
    if (stored) return JSON.parse(stored)
  } catch (e) {
    // ignore
  }
  // Initialize with default product ratings
  const ratings = {}
  defaultProducts.forEach(p => {
    ratings[p.id] = { rating: p.rating, reviews: p.reviews }
  })
  return ratings
}

function saveProductRatings(ratings) {
  try {
    localStorage.setItem('pet-shop-product-ratings', JSON.stringify(ratings))
  } catch (e) {
    // ignore
  }
}

export const useProductRatingStore = defineStore('productRatings', () => {
  const ratings = ref(loadProductRatings())

  function persist() {
    saveProductRatings(ratings.value)
  }

  function getProductRating(productId) {
    return ratings.value[productId] || { rating: 0, reviews: 0 }
  }

  // Update product rating when a new review is submitted
  function updateRating(productId, newRating) {
    const current = ratings.value[productId]
    if (!current) return

    // Calculate new average rating
    const totalRating = current.rating * current.reviews + newRating
    const newReviews = current.reviews + 1
    const newAvgRating = Math.round((totalRating / newReviews) * 10) / 10

    ratings.value[productId] = {
      rating: newAvgRating,
      reviews: newReviews
    }
    persist()
  }

  return {
    ratings,
    getProductRating,
    updateRating,
  }
})