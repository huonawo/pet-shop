<script setup>
import { computed, ref } from 'vue'
import { useRouter } from 'vue-router'
import { useBrowseHistoryStore } from '../stores/browseHistory'
import { useAuthStore } from '../stores/auth'
import GuestRestrictModal from '../components/GuestRestrictModal.vue'

const router = useRouter()
const browseHistoryStore = useBrowseHistoryStore()
const authStore = useAuthStore()

const isEmpty = computed(() => browseHistoryStore.history.length === 0)
const showGuestModal = ref(false)

function goToProduct(productId) {
  router.push(`/product/${productId}`)
}

function handleClear() {
  if (confirm('确定要清空所有浏览记录吗？')) {
    browseHistoryStore.clearHistory()
  }
}
</script>

<template>
  <div class="min-h-screen">
    <div class="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div class="flex items-center justify-between mb-8">
        <div>
          <h1 class="text-3xl md:text-4xl font-bold text-text-dark font-pet mb-2">
            👣 浏览足迹
          </h1>
          <p class="text-text-muted">
            最近浏览 ({{ browseHistoryStore.history.length }})
          </p>
        </div>
        <button
          v-if="!isEmpty"
          class="px-4 py-2 text-text-muted hover:text-accent transition-colors text-sm"
          @click="handleClear"
        >
          清空记录
        </button>
      </div>

      <div
        v-if="!authStore.isLoggedIn"
        class="bg-amber-50 border border-amber-200 rounded-2xl p-6 text-center"
      >
        <span class="text-4xl block mb-3">🔒</span>
        <h3 class="text-lg font-semibold text-amber-800 mb-2">登录后查看浏览记录</h3>
        <p class="text-amber-700 mb-4">登录后可同步您的浏览记录</p>
        <router-link
          to="/login"
          class="inline-block px-6 py-2.5 bg-primary hover:bg-primary-dark text-white font-semibold rounded-full transition-all"
        >
          立即登录
        </router-link>
      </div>

      <div v-else-if="isEmpty" class="text-center py-20">
        <span class="text-7xl block mb-6">👣</span>
        <h2 class="text-2xl font-bold text-text-dark mb-3">还没有浏览记录</h2>
        <p class="text-text-muted mb-8">快去逛逛吧，看看有什么心仪的商品</p>
        <router-link
          to="/products"
          class="inline-block px-8 py-3 bg-primary hover:bg-primary-dark text-white font-semibold rounded-full shadow-md hover:shadow-lg transition-all duration-300"
        >
          去逛逛 →
        </router-link>
      </div>

      <div v-else class="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
        <div
          v-for="(item, index) in browseHistoryStore.history"
          :key="`${item.id}-${index}`"
          class="bg-card-bg rounded-2xl p-4 shadow-sm hover:shadow-lg transition-all duration-300 cursor-pointer group"
          @click="goToProduct(item.id)"
        >
          <div
            class="w-full aspect-square rounded-xl flex items-center justify-center mb-3 bg-warm-bg-alt group-hover:scale-105 transition-transform"
          >
            <span class="text-5xl">{{ item.emoji || '🐾' }}</span>
          </div>
          <h3 class="text-sm font-medium text-text-dark truncate mb-1 group-hover:text-primary transition-colors">
            {{ item.name }}
          </h3>
          <div class="flex items-center justify-between">
            <span class="text-primary font-bold">¥{{ item.price }}</span>
            <span class="text-xs text-text-light">{{ item.viewedAt }}</span>
          </div>
        </div>
      </div>
    </div>

    <GuestRestrictModal v-model:show="showGuestModal" message="请先登录后再查看浏览记录" />
  </div>
</template>
