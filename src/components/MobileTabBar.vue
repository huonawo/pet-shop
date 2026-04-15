<script setup>
import { computed } from 'vue'
import { useRoute } from 'vue-router'
import { useCartStore } from '../stores/cart'
import { useAuthStore } from '../stores/auth'

const route = useRoute()
const cartStore = useCartStore()
const authStore = useAuthStore()

const tabs = computed(() => [
  { name: '首页', path: '/', icon: 'home' },
  { name: '分类', path: '/products', icon: 'grid' },
  { name: '购物车', path: '/cart', icon: 'cart', badge: cartStore.totalItems },
  { name: '我的', path: authStore.isLoggedIn ? '/orders' : '/login', icon: 'user' },
])

function isActive(path) {
  if (path === '/') return route.path === '/'
  return route.path.startsWith(path)
}
</script>

<template>
  <nav class="fixed bottom-0 left-0 right-0 z-50 md:hidden bg-nav-bg backdrop-blur-xl border-t border-border safe-area-bottom">
    <div class="flex items-center justify-around h-14">
      <router-link
        v-for="tab in tabs"
        :key="tab.path"
        :to="tab.path"
        class="flex flex-col items-center justify-center gap-0.5 flex-1 h-full relative"
        :class="isActive(tab.path) ? 'text-primary' : 'text-text-light'"
      >
        <div class="relative">
          <svg v-if="tab.icon === 'home'" class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
          </svg>
          <svg v-else-if="tab.icon === 'grid'" class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
          </svg>
          <svg v-else-if="tab.icon === 'cart'" class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 8a2 2 0 100-4 2 2 0 000 4z" />
          </svg>
          <svg v-else-if="tab.icon === 'user'" class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
          </svg>
          <span
            v-if="tab.badge && tab.badge > 0"
            class="absolute -top-1.5 -right-2.5 min-w-[16px] h-4 px-1 bg-accent text-white text-[9px] rounded-full flex items-center justify-center font-bold"
          >
            {{ tab.badge > 99 ? '99+' : tab.badge }}
          </span>
        </div>
        <span class="text-[10px] font-medium">{{ tab.name }}</span>
      </router-link>
    </div>
  </nav>
</template>
