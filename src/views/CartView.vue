<script setup>
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import { useCartStore } from '../stores/cart'
import { useAuthStore } from '../stores/auth'
import CartItem from '../components/CartItem.vue'
import GuestRestrictModal from '../components/GuestRestrictModal.vue'

const cartStore = useCartStore()
const authStore = useAuthStore()
const router = useRouter()
const isEmpty = computed(() => cartStore.items.length === 0)
const showGuestModal = ref(false)

function handleClearCart() {
  if (confirm('确定要清空购物车吗？')) {
    cartStore.clearCart()
  }
}

function handleCheckout() {
  if (!authStore.isLoggedIn) {
    showGuestModal.value = true
    return
  }
  router.push('/checkout')
}
</script>

<template>
  <div class="min-h-screen">
    <div class="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 xl:px-12 py-8">
      <!-- Page Header -->
      <div class="flex items-center justify-between mb-8">
        <div>
          <h1 class="text-3xl md:text-4xl font-bold text-text-dark font-pet mb-2">
            🛒 购物车
          </h1>
          <p class="text-text-muted">
            共 {{ cartStore.totalItems }} 件商品
          </p>
        </div>
        <button
          v-if="!isEmpty"
          class="px-4 py-2 text-text-muted hover:text-accent transition-colors text-sm"
          @click="handleClearCart"
        >
          清空购物车
        </button>
      </div>

      <!-- Empty Cart -->
      <div v-if="isEmpty" class="text-center py-20">
        <span class="text-7xl block mb-6">🛒</span>
        <h2 class="text-2xl font-bold text-text-dark mb-3">购物车是空的</h2>
        <p class="text-text-muted mb-8">快去挑选您爱宠需要的商品吧！</p>
        <router-link
          to="/products"
          class="inline-block px-8 py-3 bg-primary hover:bg-primary-dark text-white font-semibold rounded-full shadow-md hover:shadow-lg transition-all duration-300"
        >
          去逛逛 →
        </router-link>
      </div>

      <!-- Cart Items -->
      <div v-else class="space-y-4 mb-8">
        <CartItem
          v-for="item in cartStore.items"
          :key="item.id"
          :item="item"
        />
      </div>

      <!-- Cart Summary -->
      <div v-if="!isEmpty" class="bg-white rounded-2xl p-6 shadow-lg sticky bottom-4">
        <div class="space-y-3 mb-6">
          <div class="flex justify-between text-text-muted">
            <span>商品数量</span>
            <span>{{ cartStore.totalItems }} 件</span>
          </div>
          <div class="flex justify-between text-text-muted">
            <span>运费</span>
            <span class="text-success">免运费</span>
          </div>
          <div class="border-t border-warm-bg-alt pt-3 flex justify-between">
            <span class="text-lg font-semibold text-text-dark">合计</span>
            <span class="text-2xl font-bold text-primary">¥{{ cartStore.totalPrice.toFixed(2) }}</span>
          </div>
        </div>
        <button
          @click="handleCheckout"
          class="w-full py-4 bg-primary hover:bg-primary-dark text-white font-semibold text-lg rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 text-center block"
        >
          💳 去结算 (¥{{ cartStore.totalPrice.toFixed(2) }})
        </button>
      </div>
    </div>

    <!-- Guest Restrict Modal -->
    <GuestRestrictModal v-model:show="showGuestModal" message="请先登录后再结算" />
  </div>
</template>
