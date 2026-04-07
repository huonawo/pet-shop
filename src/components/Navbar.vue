<script setup>
import { ref } from 'vue'
import { useRoute } from 'vue-router'
import { useCartStore } from '../stores/cart'
import { useOrderStore } from '../stores/orders'
import { useAuthStore } from '../stores/auth'
import { useThemeStore } from '../stores/theme'

const collapsed = defineModel('collapsed', { type: Boolean, default: false })

const cartStore = useCartStore()
const orderStore = useOrderStore()
const authStore = useAuthStore()
const themeStore = useThemeStore()
const route = useRoute()

const showThemeMenu = ref(false)

const navLinks = [
  { name: '首页', path: '/', icon: '🏠' },
  { name: '全部商品', path: '/products', icon: '🛍️' },
  { name: '关于我们', path: '/about', icon: '💝' },
]

const orderLinks = [
  { name: '全部订单', path: '/orders', icon: '📋', count: () => orderStore.orders.length },
  { name: '待付款', path: '/orders/pending', icon: '💰', count: () => orderStore.pendingOrders.length },
  { name: '待收货', path: '/orders/shipped', icon: '📦', count: () => orderStore.shippedOrders.length },
  { name: '退换/售后', path: '/orders/returns', icon: '🔄', count: () => orderStore.returningOrders.length },
]

function isActive(path) {
  if (path === '/') return route.path === '/'
  return route.path.startsWith(path)
}

function handleLogout() {
  authStore.logout()
}

function selectTheme(themeId) {
  themeStore.setTheme(themeId)
  showThemeMenu.value = false
}
</script>

<template>
  <aside
    class="fixed top-0 right-0 bottom-0 z-50 flex flex-col transition-all duration-300 ease-in-out"
    :class="collapsed ? 'w-20' : 'w-72'"
  >
    <!-- Glassmorphism Background -->
    <div class="absolute inset-0 bg-white/80 backdrop-blur-lg border-l border-white/30 shadow-lg" />

    <!-- Content -->
    <div class="relative z-10 flex flex-col h-full">
      <!-- Header: Logo + Toggle -->
      <div class="flex items-center justify-between py-6 px-3 border-b border-warm-bg-alt/50">
        <router-link
          to="/"
          class="flex items-center gap-3 group overflow-hidden whitespace-nowrap"
        >
          <span class="text-2xl flex-shrink-0 group-hover:animate-wiggle">🐾</span>
          <span
            class="text-lg font-bold text-text-dark font-pet transition-all duration-300"
            :class="collapsed ? 'w-0 opacity-0' : 'w-auto opacity-100'"
          >
            萌宠小店
          </span>
        </router-link>

        <!-- Toggle Button -->
        <button
          class="flex-shrink-0 w-8 h-8 rounded-lg flex items-center justify-center text-text-muted hover:text-primary hover:bg-primary/10 transition-all duration-200"
          @click="collapsed = !collapsed"
        >
          <svg
            class="w-5 h-5 transition-transform duration-300"
            :class="collapsed ? 'rotate-180' : ''"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
          </svg>
        </button>

        <!-- Theme Toggle with Dropdown -->
        <div class="relative">
          <button
            class="flex-shrink-0 w-8 h-8 rounded-lg flex items-center justify-center text-text-muted hover:text-primary hover:bg-primary/10 transition-all duration-200"
            @click="showThemeMenu = !showThemeMenu"
          >
            <span class="text-lg">{{ themeStore.currentTheme.colors.icon }}</span>
          </button>
          
          <!-- Theme Dropdown Menu -->
          <div
            v-if="showThemeMenu"
            class="absolute top-full right-0 mt-2 w-40 bg-card-bg rounded-xl shadow-xl border border-warm-bg-alt overflow-hidden z-50"
          >
            <button
              v-for="theme in themeStore.themePresets"
              :key="theme.id"
              class="w-full px-3 py-2 flex items-center gap-2 hover:bg-warm-bg-alt transition-colors text-left"
              :class="themeStore.currentTheme.id === theme.id ? 'bg-warm-bg-alt' : ''"
              @click="selectTheme(theme.id)"
            >
              <span>{{ theme.icon }}</span>
              <span class="text-sm text-text-dark">{{ theme.name }}</span>
              <span
                class="ml-auto w-3 h-3 rounded-full"
                :style="{ backgroundColor: theme.primary }"
              />
            </button>
          </div>
        </div>
      </div>

      <!-- User Auth Section -->
      <div class="px-2 py-3">
        <!-- Logged In -->
        <div v-if="authStore.isLoggedIn" class="mx-2 mb-1 p-3 bg-primary/5 rounded-xl border border-primary/20">
          <div v-if="!collapsed" class="flex items-center gap-2 mb-2">
            <div class="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center">
              <span class="text-sm">👤</span>
            </div>
            <div class="flex-1 min-w-0">
              <p class="text-sm font-medium text-text-dark truncate">{{ authStore.currentUser?.username }}</p>
              <p class="text-xs text-text-muted">已登录</p>
            </div>
          </div>
          <div v-else class="flex justify-center">
            <div class="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center">
              <span class="text-sm">👤</span>
            </div>
          </div>
          <button
            v-if="!collapsed"
            class="w-full mt-2 py-1.5 text-xs font-medium text-accent hover:bg-accent/10 rounded-lg transition-colors"
            @click="handleLogout"
          >
            退出登录
          </button>
        </div>

        <!-- Guest -->
        <router-link
          v-else
          to="/login"
          class="mx-2 mb-1 p-3 bg-warm-bg-alt/50 rounded-xl border border-warm-bg-alt hover:border-primary/30 hover:bg-primary/5 transition-all cursor-pointer"
        >
          <div class="flex items-center gap-2">
            <div class="w-8 h-8 rounded-full bg-warm-bg-alt flex items-center justify-center">
              <span class="text-sm">🔑</span>
            </div>
            <div v-if="!collapsed" class="flex-1 min-w-0">
              <p class="text-sm font-medium text-text-dark">登录 / 注册</p>
              <p class="text-xs text-text-muted">登录后享受完整功能</p>
            </div>
          </div>
        </router-link>
      </div>

      <!-- Nav Links -->
      <nav class="flex-1 py-2 flex flex-col gap-1 px-2 overflow-y-auto">
        <router-link
          v-for="link in navLinks"
          :key="link.path"
          :to="link.path"
          class="flex items-center gap-3 py-3 px-3 rounded-xl transition-all duration-200 group overflow-hidden whitespace-nowrap"
          :class="isActive(link.path)
            ? 'bg-primary/10 text-primary'
            : 'text-text-muted hover:bg-warm-bg-alt hover:text-primary'"
        >
          <span class="text-2xl flex-shrink-0">{{ link.icon }}</span>
          <span
            class="text-base font-medium transition-all duration-300"
            :class="collapsed ? 'w-0 opacity-0' : 'w-auto opacity-100'"
          >
            {{ link.name }}
          </span>
        </router-link>

        <!-- Order Section Divider -->
        <div v-if="authStore.isLoggedIn" class="my-3 border-t border-warm-bg-alt/50 mx-2" />
        <p
          v-if="!collapsed && authStore.isLoggedIn"
          class="px-3 text-xs font-semibold text-text-light uppercase tracking-wider mb-1"
        >
          我的订单
        </p>

        <!-- Order Links -->
        <router-link
          v-for="link in orderLinks"
          v-show="authStore.isLoggedIn"
          :key="link.path"
          :to="link.path"
          class="flex items-center gap-3 py-3 px-3 rounded-xl transition-all duration-200 group overflow-hidden whitespace-nowrap relative"
          :class="isActive(link.path)
            ? 'bg-secondary/10 text-secondary'
            : 'text-text-muted hover:bg-warm-bg-alt hover:text-secondary'"
        >
          <span class="text-2xl flex-shrink-0">{{ link.icon }}</span>
          <span
            class="text-base font-medium transition-all duration-300"
            :class="collapsed ? 'w-0 opacity-0' : 'w-auto opacity-100'"
          >
            {{ link.name }}
          </span>
          <span
            v-if="link.count() > 0"
            class="absolute top-1 right-1 bg-secondary text-white text-[10px] w-5 h-5 rounded-full flex items-center justify-center font-bold"
          >
            {{ link.count() }}
          </span>
        </router-link>
      </nav>

      <!-- Shipping Info -->
      <div
        v-if="authStore.isLoggedIn && !collapsed && orderStore.shippingInfo.name"
        class="mx-2 mb-3 p-3 bg-warm-bg-alt/50 rounded-xl border border-warm-bg-alt/80"
      >
        <p class="text-xs font-semibold text-text-dark mb-2 flex items-center gap-1">
          📍 收货信息
        </p>
        <div class="space-y-1 text-xs">
          <p class="text-text-dark font-medium truncate">{{ orderStore.shippingInfo.name }}</p>
          <p class="text-text-muted truncate">{{ orderStore.shippingInfo.phone }}</p>
          <p class="text-text-muted truncate">{{ orderStore.shippingInfo.city }} {{ orderStore.shippingInfo.address }}</p>
        </div>
      </div>

      <!-- Cart -->
      <div class="px-2 pb-6">
        <router-link
          to="/cart"
          class="flex items-center gap-3 py-3 px-3 rounded-xl transition-all duration-200 relative overflow-hidden whitespace-nowrap"
          :class="route.path === '/cart'
            ? 'bg-accent/10 text-accent'
            : 'text-text-muted hover:bg-warm-bg-alt hover:text-accent'"
        >
          <span class="text-2xl flex-shrink-0">🛒</span>
          <span
            class="text-base font-medium transition-all duration-300"
            :class="collapsed ? 'w-0 opacity-0' : 'w-auto opacity-100'"
          >
            购物车
          </span>
          <span
            v-if="cartStore.totalItems > 0"
            class="absolute top-1 right-1 bg-accent text-white text-[10px] w-5 h-5 rounded-full flex items-center justify-center font-bold"
          >
            {{ cartStore.totalItems }}
          </span>
        </router-link>
      </div>
    </div>
  </aside>
</template>
