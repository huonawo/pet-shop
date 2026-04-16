<script setup>
import { computed, ref, onMounted, onUnmounted, nextTick } from 'vue'
import { useRouter } from 'vue-router'
import { useBrowseHistoryStore } from '../stores/browseHistory'
import { useAuthStore } from '../stores/auth'
import { useToast } from '../composables/useToast'
import GuestRestrictModal from '../components/GuestRestrictModal.vue'

const router = useRouter()
const browseHistoryStore = useBrowseHistoryStore()
const authStore = useAuthStore()
const toast = useToast()

const showGuestModal = ref(false)
const isPageVisible = ref(false)
const visibleItems = ref(new Set())
const itemObserver = ref(null)
const removingItems = ref(new Set())

const categoryIcons = {
  '全部': '📦',
  '猫粮': '🐱',
  '狗粮': '🐶',
  '玩具': '🎾',
  '用品': '🏠',
  '零食': '🍖',
  '猫砂': '🧹',
  '保健品': '💊',
  '清洁': '🧴',
}

const sortOptions = [
  { value: 'time-desc', label: '最近浏览', icon: '🕐' },
  { value: 'time-asc', label: '最早浏览', icon: '📅' },
  { value: 'price-asc', label: '价格从低到高', icon: '💰' },
  { value: 'price-desc', label: '价格从高到低', icon: '💎' },
]

const activeSortLabel = computed(() => {
  const opt = sortOptions.find(o => o.value === browseHistoryStore.sortBy)
  return opt ? `${opt.icon} ${opt.label}` : '🕐 最近浏览'
})

const isEmpty = computed(() => browseHistoryStore.history.length === 0)
const isFilteredEmpty = computed(() => browseHistoryStore.filteredHistory.length === 0 && !isEmpty.value)

function getCategoryCount(cat) {
  if (cat === '全部') return browseHistoryStore.history.length
  return browseHistoryStore.history.filter(item => item.category === cat).length
}

function setupItemObserver() {
  if (itemObserver.value) itemObserver.value.disconnect()
  visibleItems.value = new Set()
  itemObserver.value = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          visibleItems.value.add(entry.target.dataset.itemId)
        }
      })
    },
    { threshold: 0.05, rootMargin: '0px 0px -30px 0px' }
  )
  document.querySelectorAll('[data-item-id]').forEach((el) => {
    itemObserver.value.observe(el)
  })
}

function isItemVisible(id) {
  return visibleItems.value.has(String(id))
}

function goToProduct(productId) {
  router.push(`/product/${productId}`)
}

function handleClear() {
  if (confirm('确定要清空所有浏览记录吗？')) {
    browseHistoryStore.clearHistory()
    toast.success('已清空浏览记录')
  }
}

function handleRemove(productId, event) {
  event.stopPropagation()
  removingItems.value.add(productId)
  setTimeout(() => {
    browseHistoryStore.removeFromHistory(productId)
    removingItems.value.delete(productId)
    toast.info('已移除该浏览记录')
  }, 300)
}

function handleRemoveAllInCategory(category, event) {
  event.stopPropagation()
  if (confirm(`确定要清空"${category}"分类的所有浏览记录吗？`)) {
    const itemsToRemove = browseHistoryStore.filteredHistory.filter(item => item.category === category)
    itemsToRemove.forEach(item => {
      removingItems.value.add(item.id)
      browseHistoryStore.removeFromHistory(item.id)
    })
    setTimeout(() => {
      removingItems.value.clear()
      toast.success(`已清空"${category}"分类的浏览记录`)
    }, 300)
  }
}

const showSortDropdown = ref(false)

function toggleSortDropdown() {
  showSortDropdown.value = !showSortDropdown.value
}

function selectSort(value) {
  browseHistoryStore.setSortBy(value)
  showSortDropdown.value = false
}

onMounted(() => {
  setTimeout(() => {
    isPageVisible.value = true
    nextTick(() => setupItemObserver())
  }, 100)
})

onUnmounted(() => {
  if (itemObserver.value) itemObserver.value.disconnect()
})
</script>

<template>
  <div class="min-h-screen">
    <div class="w-full mx-auto px-4 sm:px-6 lg:px-8 xl:px-12 2xl:px-16 py-8 mr-4">

      <div
        class="mb-8 transition-all duration-700"
        :class="isPageVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6'"
      >
        <div class="flex items-center justify-between">
          <div>
            <h1 class="text-3xl md:text-4xl font-bold text-text-dark font-pet mb-2">
              👣 浏览足迹
            </h1>
            <p class="text-text-muted">
              共 <span class="font-semibold text-primary">{{ browseHistoryStore.totalCount }}</span> 条记录
              <span v-if="browseHistoryStore.searchQuery.trim()" class="ml-2 text-sm">
                搜索 "<span class="text-accent">{{ browseHistoryStore.searchQuery }}</span>"
              </span>
            </p>
          </div>
          <button
            v-if="!isEmpty"
            class="px-5 py-2.5 text-sm font-medium text-text-muted hover:text-accent transition-all duration-300 hover:bg-accent/10 rounded-xl"
            @click="handleClear"
          >
            🗑️ 清空记录
          </button>
        </div>
      </div>

      <div
        v-if="!authStore.isLoggedIn"
        class="bg-amber-50 border border-amber-200 rounded-2xl p-8 text-center transition-all duration-700"
        :class="isPageVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6'"
        :style="{ transitionDelay: '100ms' }"
      >
        <span class="text-5xl block mb-4">🔒</span>
        <h3 class="text-xl font-semibold text-amber-800 mb-2">登录后查看浏览记录</h3>
        <p class="text-amber-700 mb-6">登录后可同步您的浏览记录，跨设备查看</p>
        <router-link
          to="/login"
          class="inline-block px-8 py-3 bg-primary hover:bg-primary-dark text-white font-semibold rounded-full transition-all shadow-md hover:shadow-lg"
        >
          立即登录
        </router-link>
      </div>

      <template v-else>
        <div
          v-if="isEmpty"
          class="text-center py-20 transition-all duration-700"
          :class="isPageVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6'"
          :style="{ transitionDelay: '100ms' }"
        >
          <span class="text-8xl block mb-6 animate-float">👣</span>
          <h2 class="text-2xl font-bold text-text-dark mb-3">还没有浏览记录</h2>
          <p class="text-text-muted mb-8">快去逛逛吧，看看有什么心仪的商品</p>
          <router-link
            to="/products"
            class="inline-block px-8 py-3 bg-primary hover:bg-primary-dark text-white font-semibold rounded-full shadow-md hover:shadow-lg transition-all duration-300 transform hover:scale-105"
          >
            去逛逛 →
          </router-link>
        </div>

        <template v-else>
          <div
            class="bg-card-bg rounded-2xl shadow-sm mb-8 border border-border/50 overflow-hidden transition-all duration-700"
            :class="isPageVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6'"
            :style="{ transitionDelay: '150ms' }"
          >
            <div class="p-5 md:p-6">
              <div class="flex flex-col sm:flex-row gap-3 mb-5">
                <div class="relative flex-1 max-w-lg">
                  <div class="absolute inset-y-0 left-0 flex items-center pl-3.5 pointer-events-none">
                    <svg class="w-5 h-5 text-text-light transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                    </svg>
                  </div>
                  <input
                    v-model="browseHistoryStore.searchQuery"
                    @input="browseHistoryStore.setSearch(browseHistoryStore.searchQuery)"
                    type="text"
                    placeholder="搜索浏览记录..."
                    class="w-full pl-12 pr-10 py-3 bg-surface-alt border border-border rounded-xl text-text-dark placeholder-text-light focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all text-base leading-relaxed"
                    aria-label="搜索浏览记录"
                  />
                  <button
                    v-if="browseHistoryStore.searchQuery"
                    class="absolute inset-y-0 right-0 flex items-center pr-3"
                    aria-label="清除搜索"
                    @click="browseHistoryStore.setSearch('')"
                  >
                    <div class="w-6 h-6 rounded-full bg-text-light/20 hover:bg-text-light/40 flex items-center justify-center transition-all">
                      <svg class="w-3.5 h-3.5 text-text-dark" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </div>
                  </button>
                </div>

                <div class="relative">
                  <button
                    class="flex items-center gap-2 px-4 py-3 bg-surface-alt border border-border rounded-xl text-sm text-text-dark font-medium hover:border-primary transition-all"
                    @click="toggleSortDropdown"
                  >
                    <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 4h13M3 8h9m-9 4h6m4 0l4-4m0 0l4 4m-4-4v12" />
                    </svg>
                    <span>{{ activeSortLabel }}</span>
                  </button>
                  <div
                    v-if="showSortDropdown"
                    class="absolute right-0 top-full mt-2 w-48 bg-card-bg border border-border rounded-xl shadow-xl z-30 overflow-hidden"
                  >
                    <button
                      v-for="opt in sortOptions"
                      :key="opt.value"
                      class="w-full flex items-center gap-3 px-4 py-3 text-sm text-text-dark hover:bg-primary/10 transition-colors"
                      :class="browseHistoryStore.sortBy === opt.value ? 'bg-primary/5 text-primary font-medium' : ''"
                      @click="selectSort(opt.value)"
                    >
                      <span>{{ opt.icon }}</span>
                      <span>{{ opt.label }}</span>
                      <svg
                        v-if="browseHistoryStore.sortBy === opt.value"
                        class="w-4 h-4 ml-auto text-primary"
                        fill="currentColor" viewBox="0 0 20 20"
                      >
                        <path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clip-rule="evenodd" />
                      </svg>
                    </button>
                  </div>
                </div>
              </div>

              <div>
                <div class="flex items-center gap-2 mb-3">
                  <span class="text-xs font-medium text-text-light uppercase tracking-wider">商品分类</span>
                  <div class="flex-1 h-px bg-border/50"></div>
                </div>
                <div class="flex flex-wrap gap-2">
                  <button
                    v-for="cat in browseHistoryStore.categories"
                    :key="cat"
                    class="group relative px-4 py-2.5 rounded-xl text-sm font-medium transition-all duration-300 flex items-center gap-2"
                    :class="browseHistoryStore.selectedCategory === cat
                      ? 'bg-secondary text-white shadow-md shadow-secondary/25'
                      : 'bg-surface-alt text-text-muted hover:bg-secondary/10 hover:text-secondary hover:shadow-sm'"
                    @click="browseHistoryStore.setCategory(cat)"
                  >
                    <span class="text-base transition-transform duration-300" :class="browseHistoryStore.selectedCategory === cat ? 'scale-110' : 'group-hover:scale-110'">
                      {{ categoryIcons[cat] || '📦' }}
                    </span>
                    <span>{{ cat }}</span>
                    <span
                      class="text-xs px-1.5 py-0.5 rounded-full transition-colors"
                      :class="browseHistoryStore.selectedCategory === cat
                        ? 'bg-white/20 text-white'
                        : 'bg-border/50 text-text-light'"
                    >
                      {{ getCategoryCount(cat) }}
                    </span>
                  </button>
                </div>
              </div>
            </div>

            <div
              v-if="browseHistoryStore.selectedCategory !== '全部' || browseHistoryStore.searchQuery.trim()"
              class="px-5 md:px-6 py-3 bg-surface-alt/50 border-t border-border/30 flex items-center gap-2 flex-wrap"
            >
              <span class="text-xs text-text-light">已筛选：</span>
              <span
                v-if="browseHistoryStore.searchQuery.trim()"
                class="inline-flex items-center gap-1 px-3 py-1 bg-accent/10 text-accent text-xs font-medium rounded-full"
              >
                "{{ browseHistoryStore.searchQuery }}"
                <button class="hover:text-accent/70 transition-colors" @click="browseHistoryStore.setSearch('')">✕</button>
              </span>
              <span
                v-if="browseHistoryStore.selectedCategory !== '全部'"
                class="inline-flex items-center gap-1 px-3 py-1 bg-secondary/10 text-secondary text-xs font-medium rounded-full"
              >
                {{ browseHistoryStore.selectedCategory }}
                <button class="hover:text-accent transition-colors" @click="browseHistoryStore.setCategory('全部')">✕</button>
              </span>
              <button
                class="text-xs text-text-light hover:text-accent transition-colors ml-auto"
                @click="() => { browseHistoryStore.setSearch(''); browseHistoryStore.setCategory('全部') }"
              >
                清除全部
              </button>
            </div>
          </div>

          <div v-if="isFilteredEmpty" class="text-center py-20">
            <span class="text-6xl block mb-4">🔍</span>
            <h3 class="text-xl font-bold text-text-dark mb-2">未找到匹配的浏览记录</h3>
            <p class="text-text-muted mb-6">试试其他搜索词或筛选条件</p>
            <button
              class="px-6 py-2.5 bg-primary/10 text-primary font-medium rounded-full hover:bg-primary hover:text-white transition-all"
              @click="() => { browseHistoryStore.setSearch(''); browseHistoryStore.setCategory('全部') }"
            >
              清除筛选
            </button>
          </div>

          <div v-else class="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6 gap-4 lg:gap-6">
            <div
              v-for="(item, index) in browseHistoryStore.filteredHistory"
              :key="`${item.id}-${index}`"
              :data-item-id="String(item.id)"
              class="group relative bg-card-bg rounded-2xl p-4 shadow-sm hover:shadow-xl transition-all duration-300 cursor-pointer hover:-translate-y-1"
              :class="[
                isItemVisible(item.id) ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8',
                removingItems.has(item.id) ? 'opacity-0 scale-95' : ''
              ]"
              :style="{ transitionDelay: `${index * 50}ms` }"
              @click="goToProduct(item.id)"
            >
              <button
                class="absolute top-2 right-2 z-10 w-7 h-7 rounded-full bg-white/80 backdrop-blur-sm flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-200 hover:bg-red-50 hover:scale-110"
                aria-label="移除记录"
                @click.stop="handleRemove(item.id, $event)"
              >
                <svg class="w-3.5 h-3.5 text-text-light hover:text-red-500 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>

              <div
                class="w-full aspect-square rounded-xl flex items-center justify-center mb-3 bg-warm-bg-alt group-hover:scale-105 transition-transform duration-500"
              >
                <span class="text-5xl select-none">{{ item.emoji || '🐾' }}</span>
              </div>

              <h3 class="text-sm font-medium text-text-dark truncate mb-2 group-hover:text-primary transition-colors">
                {{ item.name }}
              </h3>

              <div class="flex items-center justify-between mb-2">
                <span class="text-xs text-text-light bg-surface-alt px-2 py-0.5 rounded-full">{{ item.category }}</span>
                <span class="text-xs text-text-light">{{ item.browseAt }}</span>
              </div>

              <div class="flex items-center gap-2">
                <span class="text-primary font-bold">¥{{ item.price }}</span>
                <span v-if="item.originalPrice && item.originalPrice > item.price" class="text-xs text-text-light line-through">
                  ¥{{ item.originalPrice }}
                </span>
              </div>
            </div>
          </div>
        </template>
      </template>
    </div>

    <div
      v-if="showSortDropdown"
      class="fixed inset-0 z-20"
      @click="showSortDropdown = false"
    ></div>

    <GuestRestrictModal v-model:show="showGuestModal" message="请先登录后再查看浏览记录" />
  </div>
</template>
