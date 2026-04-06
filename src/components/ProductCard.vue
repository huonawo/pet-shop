<script setup>
import { ref, computed } from 'vue'
import { useCartStore } from '../stores/cart'
import { useAuthStore } from '../stores/auth'
import { useProductRatingStore } from '../stores/productRatings'

const props = defineProps({
  product: {
    type: Object,
    required: true,
  },
})

const emit = defineEmits(['require-login'])
const cartStore = useCartStore()
const authStore = useAuthStore()
const productRatingStore = useProductRatingStore()
const addedToCart = ref(false)

// Get dynamic rating from store, fallback to product default
const displayRating = computed(() => {
  const stored = productRatingStore.getProductRating(props.product.id)
  return stored.rating || props.product.rating
})

const displayReviews = computed(() => {
  const stored = productRatingStore.getProductRating(props.product.id)
  return stored.reviews || props.product.reviews
})

function handleAddToCart() {
  if (!authStore.isLoggedIn) {
    emit('require-login')
    return
  }
  cartStore.addToCart(props.product)
  addedToCart.value = true
  setTimeout(() => {
    addedToCart.value = false
  }, 1500)
}
</script>

<template>
  <div class="group bg-card-bg rounded-2xl shadow-md hover:shadow-xl transition-all duration-300 overflow-hidden hover:-translate-y-1">
    <!-- Product Image -->
    <router-link :to="`/product/${product.id}`" class="block relative overflow-hidden">
      <div
        class="w-full aspect-square flex items-center justify-center group-hover:scale-110 transition-transform duration-500"
        :class="product.bgColor || 'bg-warm-bg-alt'"
      >
        <span class="text-7xl md:text-8xl select-none">{{ product.emoji || '🐾' }}</span>
      </div>
      <!-- Discount Badge -->
      <div
        v-if="product.originalPrice > product.price"
        class="absolute top-3 left-3 bg-accent text-white text-xs font-bold px-3 py-1 rounded-full"
      >
        -{{ Math.round((1 - product.price / product.originalPrice) * 100) }}%
      </div>
      <!-- Tags -->
      <div class="absolute top-3 right-3 flex flex-col gap-1">
        <span
          v-for="tag in product.tags.slice(0, 1)"
          :key="tag"
          class="bg-white/90 backdrop-blur-sm text-text-dark text-xs px-2 py-0.5 rounded-full font-medium"
        >
          {{ tag }}
        </span>
      </div>
    </router-link>

    <!-- Product Info -->
    <div class="p-4">
      <router-link :to="`/product/${product.id}`">
        <h3 class="font-semibold text-text-dark text-base mb-1 line-clamp-1 group-hover:text-primary transition-colors">
          {{ product.name }}
        </h3>
      </router-link>

      <!-- Rating -->
      <div class="flex items-center gap-1 mb-2">
        <span class="text-yellow-400 text-sm">★</span>
        <span class="text-sm text-text-muted">{{ displayRating }}</span>
        <span class="text-xs text-text-light">({{ displayReviews }})</span>
      </div>

      <!-- Price -->
      <div class="flex items-baseline gap-2 mb-3">
        <span class="text-xl font-bold text-primary">¥{{ product.price }}</span>
        <span v-if="product.originalPrice > product.price" class="text-sm text-text-light line-through">
          ¥{{ product.originalPrice }}
        </span>
      </div>

      <!-- Add to Cart Button -->
      <button
        class="w-full py-2.5 rounded-xl font-medium transition-all duration-300 text-sm"
        :class="addedToCart
          ? 'bg-success text-white'
          : 'bg-primary/10 text-primary hover:bg-primary hover:text-white'"
        @click="handleAddToCart"
      >
        {{ addedToCart ? '✓ 已加入' : '🛒 加入购物车' }}
      </button>
    </div>
  </div>
</template>
