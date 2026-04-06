<script setup>
import { ref, computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { products } from '../data/products'
import { getReviews } from '../data/reviews'
import { useCartStore } from '../stores/cart'
import { useReviewStore } from '../stores/reviews'
import { useAuthStore } from '../stores/auth'
import { useProductRatingStore } from '../stores/productRatings'
import GuestRestrictModal from '../components/GuestRestrictModal.vue'

const route = useRoute()
const router = useRouter()
const cartStore = useCartStore()
const reviewStore = useReviewStore()
const authStore = useAuthStore()
const productRatingStore = useProductRatingStore()

const showGuestModal = ref(false)

const product = computed(() => {
  const id = parseInt(route.params.id)
  return products.find(p => p.id === id)
})

// Dynamic rating from store
const displayRating = computed(() => {
  if (!product.value) return 0
  const stored = productRatingStore.getProductRating(product.value.id)
  return stored.rating || product.value.rating
})

const displayReviews = computed(() => {
  if (!product.value) return 0
  const stored = productRatingStore.getProductRating(product.value.id)
  return stored.reviews || product.value.reviews
})

const quantity = ref(1)
const addedToCart = ref(false)
const selectedImage = ref(0)
const showAllReviews = ref(false)

const allReviews = computed(() => {
  if (!product.value) return []
  const preset = getReviews(product.value.id)
  const userReviews = reviewStore.getProductReviews(product.value.id)
  return [...userReviews, ...preset]
})

const displayedReviews = computed(() => {
  return showAllReviews.value ? allReviews.value : allReviews.value.slice(0, 3)
})

function handleAddToCart() {
  if (!authStore.isLoggedIn) {
    showGuestModal.value = true
    return
  }
  if (!product.value) return
  for (let i = 0; i < quantity.value; i++) {
    cartStore.addToCart(product.value)
  }
  addedToCart.value = true
  setTimeout(() => {
    addedToCart.value = false
  }, 2000)
}

function handleBuyNow() {
  if (!authStore.isLoggedIn) {
    showGuestModal.value = true
    return
  }
  handleAddToCart()
  router.push('/cart')
}
</script>

<template>
  <div v-if="product" class="min-h-screen">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <!-- Breadcrumb -->
      <nav class="flex items-center gap-2 text-sm text-text-muted mb-8">
        <router-link to="/" class="hover:text-primary transition-colors">首页</router-link>
        <span>/</span>
        <router-link to="/products" class="hover:text-primary transition-colors">全部商品</router-link>
        <span>/</span>
        <span class="text-text-dark">{{ product.name }}</span>
      </nav>

      <div class="grid grid-cols-1 md:grid-cols-2 gap-12">
        <!-- Product Image -->
        <div
          class="bg-white rounded-2xl overflow-hidden shadow-md flex items-center justify-center aspect-square"
          :class="product.bgColor || 'bg-warm-bg-alt'"
        >
          <span class="text-[10rem] md:text-[14rem] select-none">{{ product.emoji || '🐾' }}</span>
        </div>

        <!-- Product Info -->
        <div class="flex flex-col">
          <!-- Tags -->
          <div class="flex flex-wrap gap-2 mb-4">
            <span
              v-for="tag in product.tags"
              :key="tag"
              class="bg-primary/10 text-primary text-xs font-medium px-3 py-1 rounded-full"
            >
              {{ tag }}
            </span>
          </div>

          <!-- Name -->
          <h1 class="text-3xl font-bold text-text-dark font-pet mb-3">
            {{ product.name }}
          </h1>

          <!-- Rating -->
          <div class="flex items-center gap-3 mb-6">
            <div class="flex items-center gap-1">
              <span class="text-yellow-400 text-lg">★</span>
              <span class="text-lg font-semibold text-text-dark">{{ displayRating }}</span>
            </div>
            <span class="text-text-muted">|</span>
            <span class="text-text-muted">{{ displayReviews }} 条评价</span>
            <span class="text-text-muted">|</span>
            <span class="text-text-muted">库存 {{ product.stock }}</span>
          </div>

          <!-- Price -->
          <div class="bg-warm-bg-alt rounded-2xl p-6 mb-6">
            <div class="flex items-baseline gap-3">
              <span class="text-4xl font-bold text-primary">¥{{ product.price }}</span>
              <span v-if="product.originalPrice > product.price" class="text-lg text-text-light line-through">
                ¥{{ product.originalPrice }}
              </span>
              <span v-if="product.originalPrice > product.price" class="bg-accent text-white text-sm font-bold px-2 py-0.5 rounded-full">
                省 ¥{{ (product.originalPrice - product.price).toFixed(0) }}
              </span>
            </div>
          </div>

          <!-- Description -->
          <div class="mb-6">
            <h3 class="text-lg font-semibold text-text-dark mb-2">商品详情</h3>
            <p class="text-text-muted leading-relaxed">{{ product.description }}</p>
          </div>

          <!-- Category & Pet Type -->
          <div class="flex flex-wrap gap-4 mb-6 text-sm">
            <span class="text-text-muted">
              分类：<span class="text-text-dark font-medium">{{ product.category }}</span>
            </span>
            <span class="text-text-muted">
              适用：<span class="text-text-dark font-medium">{{
                product.petType === 'cat' ? '🐱 猫咪' :
                product.petType === 'dog' ? '🐶 狗狗' : '🐾 全宠物'
              }}</span>
            </span>
          </div>

          <!-- Quantity -->
          <div class="flex items-center gap-4 mb-6">
            <span class="text-text-muted">数量：</span>
            <div class="flex items-center gap-3">
              <button
                class="w-8 h-8 rounded-full bg-warm-bg-alt hover:bg-primary/20 text-text-dark font-bold transition-colors flex items-center justify-center"
                :disabled="quantity <= 1"
                @click="quantity--"
              >
                −
              </button>
              <span class="w-10 text-center font-semibold text-text-dark">{{ quantity }}</span>
              <button
                class="w-8 h-8 rounded-full bg-warm-bg-alt hover:bg-primary/20 text-text-dark font-bold transition-colors flex items-center justify-center"
                :disabled="quantity >= product.stock"
                @click="quantity++"
              >
                +
              </button>
            </div>
          </div>

          <!-- Action Buttons -->
          <div class="flex gap-4 mt-auto">
            <button
              class="flex-1 py-4 rounded-xl font-semibold text-lg transition-all duration-300"
              :class="addedToCart
                ? 'bg-success text-white'
                : 'bg-primary/10 text-primary hover:bg-primary hover:text-white'"
              @click="handleAddToCart"
            >
              {{ addedToCart ? '✓ 已加入购物车' : '🛒 加入购物车' }}
            </button>
            <button
              class="flex-1 py-4 bg-primary hover:bg-primary-dark text-white rounded-xl font-semibold text-lg shadow-lg hover:shadow-xl transition-all duration-300"
              @click="handleBuyNow"
            >
              ⚡ 立即购买
            </button>
          </div>
        </div>
      </div>

      <!-- Related Products -->
      <section class="mt-16">
        <h2 class="text-2xl font-bold text-text-dark font-pet mb-6">
          🐾 猜你喜欢
        </h2>
        <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          <router-link
            v-for="related in products.filter(p => p.category === product.category && p.id !== product.id).slice(0, 4)"
            :key="related.id"
            :to="`/product/${related.id}`"
            class="bg-white rounded-2xl overflow-hidden shadow-md hover:shadow-xl transition-all duration-300 hover:-translate-y-1 group"
          >
            <div
              class="w-full aspect-square flex items-center justify-center group-hover:scale-110 transition-transform duration-500"
              :class="related.bgColor || 'bg-warm-bg-alt'"
            >
              <span class="text-6xl select-none">{{ related.emoji || '🐾' }}</span>
            </div>
            <div class="p-4">
              <h3 class="font-semibold text-text-dark text-sm truncate group-hover:text-primary transition-colors">
                {{ related.name }}
              </h3>
              <p class="text-primary font-bold mt-1">¥{{ related.price }}</p>
            </div>
          </router-link>
        </div>
      </section>

      <!-- Reviews Section -->
      <section class="mt-16">
        <h2 class="text-2xl font-bold text-text-dark font-pet mb-6">
          💬 用户评价 <span class="text-lg text-text-muted font-normal">({{ allReviews.length }})</span>
        </h2>

        <!-- Review Summary -->
        <div class="bg-white rounded-2xl p-6 shadow-sm mb-6">
          <div class="flex items-center gap-8">
            <div class="text-center">
              <div class="text-5xl font-bold text-text-dark font-pet">{{ displayRating }}</div>
              <div class="flex items-center gap-1 my-2">
                <span v-for="i in 5" :key="i" class="text-xl" :class="i <= Math.round(displayRating) ? 'text-yellow-400' : 'text-gray-300'">
                  ★
                </span>
              </div>
              <p class="text-sm text-text-muted">{{ displayReviews }} 条评价</p>
            </div>
            <div class="flex-1 space-y-2">
              <div v-for="star in [5, 4, 3, 2, 1]" :key="star" class="flex items-center gap-3">
                <span class="text-sm text-text-muted w-8">{{ star }}星</span>
                <div class="flex-1 bg-gray-200 rounded-full h-2.5 overflow-hidden">
                  <div
                    class="bg-yellow-400 h-full rounded-full transition-all duration-500"
                    :style="{ width: `${(allReviews.filter(r => r.rating === star).length / Math.max(allReviews.length, 1)) * 100}%` }"
                  />
                </div>
                <span class="text-sm text-text-muted w-10 text-right">{{ allReviews.filter(r => r.rating === star).length }}</span>
              </div>
            </div>
          </div>
        </div>

        <!-- Review List -->
        <div class="space-y-4">
          <div
            v-for="review in displayedReviews"
            :key="review.id || review.date + review.user"
            class="bg-white rounded-2xl p-6 shadow-sm"
          >
            <div class="flex items-center justify-between mb-3">
              <div class="flex items-center gap-3">
                <div class="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                  <span class="text-lg select-none">{{ review.userEmoji || '🐾' }}</span>
                </div>
                <div>
                  <p class="font-medium text-text-dark">{{ review.user }}</p>
                  <p class="text-xs text-text-muted">{{ review.date }}</p>
                </div>
              </div>
              <div class="flex items-center gap-1">
                <span v-for="i in 5" :key="i" class="text-sm" :class="i <= review.rating ? 'text-yellow-400' : 'text-gray-300'">
                  ★
                </span>
              </div>
            </div>
            <p class="text-text-dark leading-relaxed">{{ review.content }}</p>
            <div class="flex items-center gap-4 mt-3">
              <span class="text-xs text-text-muted flex items-center gap-1">
                👍 <span>{{ review.helpful || 0 }}</span> 人觉得有用
              </span>
            </div>
          </div>
        </div>

        <!-- Show More -->
        <div v-if="allReviews.length > 3" class="text-center mt-6">
          <button
            class="px-8 py-3 bg-warm-bg-alt hover:bg-warm-bg-alt/80 text-text-dark font-semibold rounded-xl transition-colors"
            @click="showAllReviews = !showAllReviews"
          >
            {{ showAllReviews ? '收起评价' : `查看全部 ${allReviews.length} 条评价` }}
          </button>
        </div>
      </section>
    </div>
  </div>

  <!-- Not Found -->
  <div v-if="!product" class="min-h-screen flex items-center justify-center">
    <div class="text-center">
      <span class="text-6xl block mb-4">😿</span>
      <h2 class="text-2xl font-bold text-text-dark mb-2">商品不存在</h2>
      <p class="text-text-muted mb-6">抱歉，没有找到该商品</p>
      <router-link
        to="/products"
        class="inline-block px-6 py-3 bg-primary text-white rounded-full hover:bg-primary-dark transition-colors"
      >
        返回商品列表
      </router-link>
    </div>
  </div>

  <!-- Guest Restrict Modal -->
  <GuestRestrictModal v-model:show="showGuestModal" message="请先登录后再添加购物车或购买商品" />
</template>
