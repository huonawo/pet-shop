<script setup>
import { ref, computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useCartStore } from '../stores/cart'
import { useAuthStore } from '../stores/auth'
import { useThemeStore } from '../stores/theme'
import CartPreview from './CartPreview.vue'

const route = useRoute()
const router = useRouter()
const cartStore = useCartStore()
const authStore = useAuthStore()
const themeStore = useThemeStore()

const searchQuery = ref('')
const showUserMenu = ref(false)
const showThemeMenu = ref(false)
const showMobileSearch = ref(false)
const showCartPreview = ref(false)

const searchHistory = ref(loadSearchHistory())

function loadSearchHistory() {
  try {
    const stored = localStorage.getItem('pet-shop-search-history')
    if (stored) return JSON.parse(stored).slice(0, 8)
  } catch (e) {}
  return []
}

function saveSearchHistory(history) {
  try {
    localStorage.setItem('pet-shop-search-history', JSON.stringify(history.slice(0, 8)))
  } catch (e) {}
}

function handleSearch() {
  const query = searchQuery.value.trim()
  if (!query) return
  const idx = searchHistory.value.indexOf(query)
  if (idx > -1) searchHistory.value.splice(idx, 1)
  searchHistory.value.unshift(query)
  saveSearchHistory(searchHistory.value)
  showMobileSearch.value = false
  router.push({ path: '/products', query: { search: query } })
}

function clearHistory() {
  searchHistory.value = []
  saveSearchHistory([])
}

function handleLogout() {
  authStore.logout()
  showUserMenu.value = false
  router.push('/')
}

function selectTheme(themeId) {
  themeStore.setTheme(themeId)
  showThemeMenu.value = false
}

function closeMenus(e) {
  if (!e.target.closest('.user-menu-trigger')) showUserMenu.value = false
  if (!e.target.closest('.theme-menu-trigger')) showThemeMenu.value = false
  if (!e.target.closest('.cart-preview-trigger')) showCartPreview.value = false
}

if (typeof window !== 'undefined') {
  document.addEventListener('click', closeMenus)
}
</script>

<template>
  <header class="sticky top-0 z-50 bg-nav-bg backdrop-blur-xl border-b border-border shadow-sm w-full">
    <div class="w-full px-4 sm:px-6 lg:px-8 xl:px-12 2xl:px-16">
      <div class="flex items-center justify-between h-16">
        <!-- Left Section: Logo + Navigation -->
        <div class="flex items-center gap-4 lg:gap-6">
          <!-- Logo -->
          <router-link to="/" class="flex items-center gap-2 shrink-0 group">
            <div class="w-9 h-9 rounded-xl bg-gradient-to-br from-primary to-primary-dark flex items-center justify-center shadow-md shadow-primary/20 group-hover:scale-110 transition-transform duration-200">
              <svg class="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8zm-5.5-2.5l1.5-1.5 1.5 1.5 2-2 1.5 1.5-3.5 3.5-3.5-3.5zm7.5-2.5l1.5-1.5 1.5 1.5 2-2 1.5 1.5-3.5 3.5-3.5-3.5z"/>
              </svg>
            </div>
            <span class="text-lg font-bold text-text-dark font-pet hidden sm:block">萌宠小店</span>
          </router-link>

          <!-- Navigation -->
          <nav class="hidden md:flex items-center gap-2 lg:gap-3">
            <router-link
              to="/"
              class="px-4 py-2 rounded-lg text-sm font-medium transition-colors"
              :class="route.path === '/' ? 'text-primary bg-primary/5' : 'text-text-muted hover:text-primary hover:bg-primary/5'"
            >
              首页
            </router-link>
            <router-link
              to="/products"
              class="px-4 py-2 rounded-lg text-sm font-medium transition-colors"
              :class="route.path.startsWith('/products') || route.path.startsWith('/product') ? 'text-primary bg-primary/5' : 'text-text-muted hover:text-primary hover:bg-primary/5'"
            >
              全部商品
            </router-link>
            <router-link
              to="/about"
              class="px-4 py-2 rounded-lg text-sm font-medium transition-colors"
              :class="route.path === '/about' ? 'text-primary bg-primary/5' : 'text-text-muted hover:text-primary hover:bg-primary/5'"
            >
              关于我们
            </router-link>
          </nav>
        </div>

        <!-- Center: Search Bar -->
        <div class="hidden sm:block flex-1 max-w-2xl lg:max-w-3xl xl:max-w-[560px]">
          <form @submit.prevent="handleSearch" class="relative">
            <div class="flex items-center border-2 border-warm-bg-alt rounded-full px-4 py-2.5 focus-within:border-primary focus-within:shadow-sm focus-within:shadow-primary/10 transition-all duration-200 bg-warm-bg/30">
              <svg class="w-4 h-4 text-text-light shrink-0 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              <input
                v-model="searchQuery"
                type="text"
                placeholder="搜索商品名称、描述..."
                class="flex-1 outline-none bg-transparent text-sm md:text-base text-text-dark placeholder:text-text-light"
              />
              <button
                v-if="searchQuery"
                type="button"
                class="text-text-light hover:text-text-muted ml-1"
                @click="searchQuery = ''"
              >
                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          </form>
        </div>

        <!-- Right: Action Buttons -->
        <div class="flex items-center gap-2 lg:gap-3">
          <button
            class="sm:hidden w-9 h-9 rounded-xl flex items-center justify-center text-text-muted hover:text-primary hover:bg-primary/5 transition-colors"
            @click="showMobileSearch = !showMobileSearch"
          >
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </button>

          <div class="relative theme-menu-trigger">
            <button
              class="w-9 h-9 rounded-xl flex items-center justify-center text-text-muted hover:text-primary hover:bg-primary/5 transition-colors"
              @click.stop="showThemeMenu = !showThemeMenu"
            >
              <div class="w-5 h-5 rounded-full bg-gradient-to-br from-primary to-accent" />
            </button>
            <div
              v-if="showThemeMenu"
              class="absolute right-0 top-full mt-2 w-40 bg-surface/95 backdrop-blur-xl rounded-2xl shadow-2xl border border-border overflow-hidden z-50"
            >
              <button
                v-for="theme in themeStore.themePresets"
                :key="theme.id"
                class="w-full px-4 py-2.5 flex items-center gap-3 hover:bg-surface-alt transition-colors text-left"
                :class="themeStore.currentTheme.id === theme.id ? 'bg-primary/5' : ''"
                @click="selectTheme(theme.id)"
              >
                <span class="text-base">{{ theme.icon }}</span>
                <span class="text-sm font-medium text-text-dark">{{ theme.name }}</span>
                <span
                  v-if="themeStore.currentTheme.id === theme.id"
                  class="ml-auto text-primary text-sm"
                >✓</span>
              </button>
            </div>
          </div>

          <div class="relative cart-preview-trigger">
            <router-link
              to="/cart"
              class="relative w-9 h-9 rounded-xl flex items-center justify-center text-text-muted hover:text-primary hover:bg-primary/5 transition-colors"
              data-cart-icon
              @mouseenter="showCartPreview = true"
              @mouseleave="showCartPreview = false"
            >
              <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 8a2 2 0 100-4 2 2 0 000 4z" />
              </svg>
              <span
                v-if="cartStore.totalItems > 0"
                class="absolute -top-1 -right-1 min-w-[18px] h-[18px] px-1 bg-accent text-white text-[10px] rounded-full flex items-center justify-center font-bold"
              >
                {{ cartStore.totalItems > 99 ? '99+' : cartStore.totalItems }}
              </span>
            </router-link>
            <div
              v-if="showCartPreview"
              class="absolute right-0 top-full pt-2"
              @mouseenter="showCartPreview = true"
              @mouseleave="showCartPreview = false"
            >
              <CartPreview />
            </div>
          </div>

          <div class="relative user-menu-trigger">
            <button
              v-if="authStore.isLoggedIn"
              class="w-9 h-9 rounded-xl bg-gradient-to-br from-primary to-primary-dark flex items-center justify-center text-white shadow-sm hover:shadow-md transition-shadow"
              @click.stop="showUserMenu = !showUserMenu"
            >
              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
            </button>
            <router-link
              v-else
              to="/login"
              class="w-9 h-9 rounded-xl flex items-center justify-center text-text-muted hover:text-primary hover:bg-primary/5 transition-colors border border-border"
            >
              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
            </router-link>

            <div
              v-if="showUserMenu && authStore.isLoggedIn"
              class="absolute right-0 top-full mt-2 w-56 bg-surface/95 backdrop-blur-xl rounded-2xl shadow-2xl border border-border overflow-hidden z-50"
            >
              <div class="px-4 py-3 border-b border-border">
                <p class="font-semibold text-text-dark text-sm">{{ authStore.currentUser?.username }}</p>
                <p class="text-xs text-text-muted mt-0.5">✓ 已登录</p>
              </div>
              <div class="py-1">
                <router-link to="/orders" class="block px-4 py-2.5 text-sm text-text-dark hover:bg-surface-alt transition-colors" @click="showUserMenu = false">
                  📋 我的订单
                </router-link>
                <router-link to="/wishlist" class="block px-4 py-2.5 text-sm text-text-dark hover:bg-surface-alt transition-colors" @click="showUserMenu = false">
                  ❤️ 我的收藏
                </router-link>
                <router-link to="/history" class="block px-4 py-2.5 text-sm text-text-dark hover:bg-surface-alt transition-colors" @click="showUserMenu = false">
                  👣 浏览足迹
                </router-link>
                <router-link to="/coupons" class="block px-4 py-2.5 text-sm text-text-dark hover:bg-surface-alt transition-colors" @click="showUserMenu = false">
                  🎫 优惠券
                </router-link>
                <router-link to="/addresses" class="block px-4 py-2.5 text-sm text-text-dark hover:bg-surface-alt transition-colors" @click="showUserMenu = false">
                  📍 收货地址
                </router-link>
              </div>
              <div class="border-t border-border py-1">
                <button
                  class="w-full px-4 py-2.5 text-sm text-red-400 hover:bg-red-500/10 transition-colors text-left"
                  @click="handleLogout"
                >
                  退出登录
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <div v-if="showMobileSearch" class="sm:hidden px-4 pb-3">
      <form @submit.prevent="handleSearch" class="relative">
        <div class="flex items-center border-2 border-warm-bg-alt rounded-full px-4 py-2 focus-within:border-primary transition-all bg-warm-bg/30">
          <svg class="w-4 h-4 text-text-light shrink-0 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          <input
            ref="mobileSearchInput"
            v-model="searchQuery"
            type="text"
            placeholder="搜索商品..."
            class="flex-1 outline-none bg-transparent text-sm text-text-dark placeholder:text-text-light"
          />
        </div>
      </form>
      <div v-if="searchHistory.length > 0 && !searchQuery" class="mt-2">
        <div class="flex items-center justify-between px-2 mb-1">
          <span class="text-xs text-text-muted">搜索历史</span>
          <button class="text-xs text-text-light hover:text-primary" @click="clearHistory">清除</button>
        </div>
        <div class="flex flex-wrap gap-2">
          <button
            v-for="item in searchHistory"
            :key="item"
            class="px-3 py-1 bg-warm-bg-alt rounded-full text-xs text-text-muted hover:text-primary hover:bg-primary/5 transition-colors"
            @click="searchQuery = item; handleSearch()"
          >
            {{ item }}
          </button>
        </div>
      </div>
    </div>
  </header>
</template>
