<script setup>
import { computed } from 'vue'
import { useRouter } from 'vue-router'
import { useCartStore } from '../stores/cart'

const router = useRouter()
const cartStore = useCartStore()

const previewItems = computed(() => cartStore.items.slice(0, 3))
const hasMore = computed(() => cartStore.items.length > 3)

function goToCart() {
  router.push('/cart')
}
</script>

<template>
  <div class="absolute right-0 top-full mt-3 w-80 bg-surface/95 backdrop-blur-xl rounded-2xl shadow-2xl border border-border overflow-hidden z-50">
    <div class="px-4 py-3 border-b border-border flex items-center justify-between">
      <span class="font-semibold text-text-dark text-sm">购物车</span>
      <span class="text-xs text-text-muted">{{ cartStore.totalItems }} 件商品</span>
    </div>

    <div v-if="cartStore.items.length === 0" class="py-8 text-center">
      <span class="text-4xl block mb-2">🛒</span>
      <p class="text-sm text-text-muted">购物车是空的</p>
    </div>

    <div v-else class="max-h-64 overflow-y-auto">
      <div
        v-for="item in previewItems"
        :key="item.id"
        class="flex items-center gap-3 px-4 py-3 hover:bg-surface-alt transition-colors"
      >
        <div
          class="w-12 h-12 rounded-xl flex items-center justify-center shrink-0"
          :class="item.bgColor || 'bg-warm-bg-alt'"
        >
          <span class="text-2xl">{{ item.emoji || '🐾' }}</span>
        </div>
        <div class="flex-1 min-w-0">
          <p class="text-sm font-medium text-text-dark truncate">{{ item.name }}</p>
          <div class="flex items-center gap-2 mt-0.5">
            <span class="text-sm font-bold text-primary">¥{{ item.price }}</span>
            <span class="text-xs text-text-muted">×{{ item.quantity }}</span>
          </div>
        </div>
      </div>
      <div v-if="hasMore" class="px-4 py-2 text-center text-xs text-text-muted bg-surface-alt/50">
        还有 {{ cartStore.items.length - 3 }} 件商品...
      </div>
    </div>

    <div v-if="cartStore.items.length > 0" class="border-t border-border px-4 py-3">
      <div class="flex items-center justify-between mb-3">
        <span class="text-sm text-text-muted">合计</span>
        <span class="text-lg font-bold text-primary">¥{{ cartStore.totalPrice.toFixed(2) }}</span>
      </div>
      <button
        class="w-full py-2.5 bg-gradient-to-r from-primary to-primary-dark text-white rounded-xl font-medium text-sm hover:shadow-lg hover:shadow-primary/20 transition-all"
        @click="goToCart"
      >
        查看购物车
      </button>
    </div>
  </div>
</template>
