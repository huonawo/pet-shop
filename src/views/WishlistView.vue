<script setup>
import { computed, ref } from 'vue'
import { useRouter } from 'vue-router'
import { useWishlistStore } from '../stores/wishlist'
import { useCartStore } from '../stores/cart'
import { useAuthStore } from '../stores/auth'
import GuestRestrictModal from '../components/GuestRestrictModal.vue'

const router = useRouter()
const wishlistStore = useWishlistStore()
const cartStore = useCartStore()
const authStore = useAuthStore()

const isEmpty = computed(() => wishlistStore.items.length === 0)
const showGuestModal = ref(false)

function goToProduct(productId) {
  router.push(`/product/${productId}`)
}

function handleRemove(productId) {
  wishlistStore.removeFromWishlist(productId)
}

function handleAddToCart(productId) {
  if (!authStore.isLoggedIn) {
    showGuestModal.value = true
    return
  }
  const item = wishlistStore.items.find(i => i.id === productId)
  if (item) {
    cartStore.addToCart(item)
    wishlistStore.removeFromWishlist(productId)
  }
}

function handleClear() {
  if (confirm('确定要清空所有收藏吗？')) {
    wishlistStore.clearWishlist()
  }
}

function handleAddAllToCart() {
  if (!authStore.isLoggedIn) {
    showGuestModal.value = true
    return
  }
  wishlistStore.items.forEach(item => {
    cartStore.addToCart(item)
  })
  wishlistStore.clearWishlist()
}
</script>

<template>
  <div class="min-h-screen">
    <div class="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div class="flex items-center justify-between mb-8">
        <div>
          <h1 class="text-3xl md:text-4xl font-bold text-text-dark font-pet mb-2">
            ❤️ 我的收藏
          </h1>
          <p class="text-text-muted">
            心仪的商品 ({{ wishlistStore.items.length }})
          </p>
        </div>
        <div v-if="!isEmpty" class="flex gap-3">
          <button
            class="px-4 py-2 text-text-muted hover:text-primary transition-colors text-sm"
            @click="handleAddAllToCart"
          >
            🎁 全部加入购物车
          </button>
          <button
            class="px-4 py-2 text-text-muted hover:text-accent transition-colors text-sm"
            @click="handleClear"
          >
            清空收藏
          </button>
        </div>
      </div>

      <div
        v-if="!authStore.isLoggedIn"
        class="bg-amber-50 border border-amber-200 rounded-2xl p-6 text-center"
      >
        <span class="text-4xl block mb-3">🔒</span>
        <h3 class="text-lg font-semibold text-amber-800 mb-2">登录后查看收藏</h3>
        <p class="text-amber-700 mb-4">登录后可同步您的收藏商品</p>
        <router-link
          to="/login"
          class="inline-block px-6 py-2.5 bg-primary hover:bg-primary-dark text-white font-semibold rounded-full transition-all"
        >
          立即登录
        </router-link>
      </div>

      <div v-else-if="isEmpty" class="text-center py-20">
        <span class="text-7xl block mb-6">❤️</span>
        <h2 class="text-2xl font-bold text-text-dark mb-3">还没有收藏商品</h2>
        <p class="text-text-muted mb-8">快去挑选您爱宠需要的商品吧！</p>
        <router-link
          to="/products"
          class="inline-block px-8 py-3 bg-primary hover:bg-primary-dark text-white font-semibold rounded-full shadow-md hover:shadow-lg transition-all duration-300"
        >
          去逛逛 →
        </router-link>
      </div>

      <div v-else class="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
        <div
          v-for="item in wishlistStore.items"
          :key="item.id"
          class="group relative bg-card-bg rounded-2xl p-4 shadow-sm hover:shadow-lg transition-all duration-300"
        >
          <button
            class="absolute top-2 right-2 w-6 h-6 rounded-full bg-surface-alt hover:bg-red-100 text-text-light hover:text-red-500 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity z-10"
            @click="handleRemove(item.id)"
          >
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>

          <div
            class="w-full aspect-square rounded-xl flex items-center justify-center mb-3 cursor-pointer"
            :class="item.bgColor || 'bg-warm-bg-alt'"
            @click="goToProduct(item.id)"
          >
            <span class="text-5xl">{{ item.emoji || '🐾' }}</span>
          </div>

          <h3
            class="text-sm font-medium text-text-dark truncate mb-1 cursor-pointer hover:text-primary"
            @click="goToProduct(item.id)"
          >
            {{ item.name }}
          </h3>
          <div class="flex items-center gap-2 mb-2">
            <span class="text-primary font-bold">¥{{ item.price }}</span>
            <span v-if="item.originalPrice" class="text-xs text-text-light line-through">
              ¥{{ item.originalPrice }}
            </span>
          </div>
          <div class="flex items-center justify-between">
            <div class="flex items-center gap-1">
              <span class="text-amber-500">★</span>
              <span class="text-xs text-text-muted">{{ item.rating }}</span>
            </div>
            <span class="text-xs text-text-light">{{ item.addedAt }}</span>
          </div>

          <button
            class="w-full mt-3 py-2 bg-primary/10 hover:bg-primary text-primary hover:text-white text-sm font-medium rounded-lg transition-all duration-200"
            @click="handleAddToCart(item.id)"
          >
            🛒 加入购物车
          </button>
        </div>
      </div>
    </div>

    <GuestRestrictModal v-model:show="showGuestModal" message="请先登录后再操作" />
  </div>
</template>
