<script setup>
import { ref, computed, watch } from 'vue'
import { useRoute } from 'vue-router'
import ProductCard from '../components/ProductCard.vue'
import GuestRestrictModal from '../components/GuestRestrictModal.vue'
import { products, categories, petTypes } from '../data/products'

const route = useRoute()
const showGuestModal = ref(false)

const selectedCategory = ref('全部')
const selectedPetType = ref('all')
const searchQuery = ref('')
const sortBy = ref('default')

// 监听路由 query 变化，支持从首页/Footer 分类链接跳转
watch(
  () => route.query.category,
  (newCategory) => {
    selectedCategory.value = newCategory || '全部'
  },
  { immediate: true }
)

const filteredProducts = computed(() => {
  let result = [...products]

  if (selectedCategory.value !== '全部') {
    result = result.filter(p => p.category === selectedCategory.value)
  }

  if (selectedPetType.value !== 'all') {
    result = result.filter(p => p.petType === selectedPetType.value || p.petType === 'all')
  }

  if (searchQuery.value.trim()) {
    const query = searchQuery.value.toLowerCase()
    result = result.filter(p =>
      p.name.toLowerCase().includes(query) ||
      p.description.toLowerCase().includes(query) ||
      p.category.toLowerCase().includes(query)
    )
  }

  switch (sortBy.value) {
    case 'price-asc':
      result.sort((a, b) => a.price - b.price)
      break
    case 'price-desc':
      result.sort((a, b) => b.price - a.price)
      break
    case 'rating':
      result.sort((a, b) => b.rating - a.rating)
      break
    case 'reviews':
      result.sort((a, b) => b.reviews - a.reviews)
      break
  }

  return result
})
</script>

<template>
  <div class="min-h-screen">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <!-- Page Header + Search Bar -->
      <div class="flex items-center justify-between mb-8">
        <!-- Left: Page Header -->
        <div>
          <h1 class="text-3xl md:text-4xl font-bold text-text-dark font-pet mb-2">
            🛍️ 全部商品
          </h1>
          <p class="text-text-muted">
            共 {{ filteredProducts.length }} 件商品
          </p>
        </div>

        <!-- Right: Search Bar -->
        <div class="w-80">
          <div class="flex items-center border-2 border-warm-bg-alt rounded-xl px-3 py-2 focus-within:border-primary transition-colors">
            <svg class="w-5 h-5 text-text-light shrink-0 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <input
              v-model="searchQuery"
              type="text"
              placeholder="搜索商品名称、描述..."
              class="flex-1 outline-none bg-transparent"
            />
          </div>
        </div>
      </div>

      <!-- Filters -->
      <div class="bg-white rounded-2xl p-6 shadow-sm mb-10 max-w-4xl mx-auto">
        <!-- Pet Type Filter -->
        <div class="flex flex-wrap gap-4 mb-5">
          <button
            v-for="pet in petTypes"
            :key="pet.value"
            class="px-5 py-2.5 rounded-full text-base font-medium transition-all duration-200"
            :class="selectedPetType === pet.value
              ? 'bg-primary text-white shadow-md'
              : 'bg-warm-bg-alt text-text-muted hover:bg-primary/10 hover:text-primary'"
            @click="selectedPetType = pet.value"
          >
            {{ pet.label }}
          </button>
        </div>

        <!-- Category Filter -->
        <div class="flex flex-wrap gap-4 mb-5">
          <button
            v-for="cat in categories"
            :key="cat"
            class="px-5 py-2.5 rounded-full text-base font-medium transition-all duration-200"
            :class="selectedCategory === cat
              ? 'bg-secondary text-white shadow-md'
              : 'bg-warm-bg-alt text-text-muted hover:bg-secondary/10 hover:text-secondary'"
            @click="selectedCategory = cat"
          >
            {{ cat }}
          </button>
        </div>

        <!-- Sort -->
        <div class="flex items-center gap-2">
          <span class="text-text-muted text-sm">排序：</span>
          <select
            v-model="sortBy"
            class="px-3 py-2 rounded-lg border border-warm-bg-alt text-sm focus:border-primary focus:outline-none"
          >
            <option value="default">默认排序</option>
            <option value="price-asc">价格从低到高</option>
            <option value="price-desc">价格从高到低</option>
            <option value="rating">好评优先</option>
            <option value="reviews">销量优先</option>
          </select>
        </div>
      </div>

      <!-- Products Grid -->
      <div v-if="filteredProducts.length > 0" class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        <ProductCard
          v-for="product in filteredProducts"
          :key="product.id"
          :product="product"
          @require-login="showGuestModal = true"
        />
      </div>

      <!-- Empty State -->
      <div v-else class="text-center py-20">
        <span class="text-6xl block mb-4">🔍</span>
        <h3 class="text-xl font-semibold text-text-dark mb-2">没有找到相关商品</h3>
        <p class="text-text-muted">试试其他筛选条件吧</p>
        <button
          class="mt-4 px-6 py-2 bg-primary text-white rounded-full hover:bg-primary-dark transition-colors"
          @click="selectedCategory = '全部'; selectedPetType = 'all'; searchQuery = ''"
        >
          重置筛选
        </button>
      </div>
    </div>

    <!-- Guest Restrict Modal -->
    <GuestRestrictModal v-model:show="showGuestModal" message="请先登录后再添加购物车" />
  </div>
</template>
