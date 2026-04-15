<script setup>
import { ref, computed, onMounted, nextTick, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { products } from '../data/products'
import { getReviews } from '../data/reviews'
import { useCartStore } from '../stores/cart'
import { useReviewStore } from '../stores/reviews'
import { useAuthStore } from '../stores/auth'
import { useProductRatingStore } from '../stores/productRatings'
import { useWishlistStore } from '../stores/wishlist'
import { useBrowseHistoryStore } from '../stores/browseHistory'
import { useToast } from '../composables/useToast'
import GuestRestrictModal from '../components/GuestRestrictModal.vue'

const route = useRoute()
const router = useRouter()
const cartStore = useCartStore()
const reviewStore = useReviewStore()
const authStore = useAuthStore()
const productRatingStore = useProductRatingStore()
const wishlistStore = useWishlistStore()
const browseHistoryStore = useBrowseHistoryStore()
const toast = useToast()

const showGuestModal = ref(false)
const isLoading = ref(true)
const quantity = ref(1)
const addedToCart = ref(false)
const showAllReviews = ref(false)
const activeTab = ref('detail')
const showImageModal = ref(false)
const imageScale = ref(1)
const imageTranslate = ref({ x: 0, y: 0 })
const isDragging = ref(false)
const dragStart = ref({ x: 0, y: 0 })
const showQAModal = ref(false)
const qaQuestion = ref('')
const qaList = ref([])
const reviewSortBy = ref('latest')
const reviewFilterRating = ref(0)

const product = computed(() => {
  const id = parseInt(route.params.id)
  return products.find(p => p.id === id)
})

const isWishlisted = computed(() => {
  if (!product.value) return false
  return wishlistStore.isInWishlist(product.value.id)
})

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

const allReviews = computed(() => {
  if (!product.value) return []
  const preset = getReviews(product.value.id)
  const userReviews = reviewStore.getProductReviews(product.value.id)
  return [...userReviews, ...preset]
})

const filteredReviews = computed(() => {
  let reviews = allReviews.value
  if (reviewFilterRating.value > 0) {
    reviews = reviews.filter(r => r.rating === reviewFilterRating.value)
  }
  if (reviewSortBy.value === 'helpful') {
    return [...reviews].sort((a, b) => (b.helpful || 0) - (a.helpful || 0))
  }
  return reviews
})

const displayedReviews = computed(() => {
  return showAllReviews.value ? filteredReviews.value : filteredReviews.value.slice(0, 3)
})

const relatedProducts = computed(() => {
  if (!product.value) return []
  const sameCategory = products.filter(p => p.category === product.value.category && p.id !== product.value.id)
  const samePetType = products.filter(p => p.petType === product.value.petType && p.id !== product.value.id && p.category !== product.value.category)
  return [...sameCategory, ...samePetType].slice(0, 6)
})

const specs = computed(() => {
  if (!product.value) return []
  const p = product.value
  const baseSpecs = [
    { label: '品牌', value: '萌宠优选' },
    { label: '分类', value: p.category },
    { label: '适用宠物', value: p.petType === 'cat' ? '猫咪' : p.petType === 'dog' ? '狗狗' : '全宠物' },
    { label: '库存状态', value: p.stock > 100 ? '现货充足' : p.stock > 0 ? '库存紧张' : '暂时缺货' },
  ]
  const categorySpecs = {
    '猫粮': [
      { label: '适用阶段', value: '全阶段' },
      { label: '主要成分', value: '鸡肉、鱼肉、大米' },
      { label: '净含量', value: '1.5kg / 3kg / 5kg' },
      { label: '保质期', value: '18个月' },
      { label: '储存方式', value: '阴凉干燥处保存' },
    ],
    '狗粮': [
      { label: '适用阶段', value: '全阶段' },
      { label: '主要成分', value: '六种深海鱼、薯类' },
      { label: '净含量', value: '2kg / 6kg / 12kg' },
      { label: '保质期', value: '18个月' },
      { label: '特殊配方', value: '无谷物' },
    ],
    '玩具': [
      { label: '材质', value: '环保ABS/天然羽毛' },
      { label: '适用体重', value: '不限' },
      { label: '包装规格', value: p.tags?.includes('5件套') ? '5件套' : '单件装' },
      { label: '安全认证', value: 'SGS安全检测' },
    ],
    '用品': [
      { label: '材质', value: '食品级PP/不锈钢' },
      { label: '颜色', value: '白色/粉色/蓝色' },
      { label: '尺寸', value: '标准尺寸' },
      { label: '清洗方式', value: '可水洗' },
    ],
    '零食': [
      { label: '主要成分', value: '天然牛皮/鲜肉' },
      { label: '净含量', value: '100g / 200g' },
      { label: '保质期', value: '12个月' },
      { label: '添加剂', value: '无防腐剂' },
    ],
    '猫砂': [
      { label: '材质', value: '天然豆腐渣' },
      { label: '净含量', value: '2.5kg / 5kg / 10kg' },
      { label: '颗粒大小', value: '2mm细颗粒' },
      { label: '溶解速度', value: '3秒速溶' },
    ],
    '保健品': [
      { label: '规格', value: '50g / 100g' },
      { label: '保质期', value: '24个月' },
      { label: '喂食方式', value: '拌粮/直接喂食' },
      { label: '适用阶段', value: '全阶段' },
    ],
    '清洁': [
      { label: '主要成分', value: '植物萃取/EDI纯水' },
      { label: '规格', value: '500ml / 80抽' },
      { label: '保质期', value: '36个月' },
      { label: '适用频率', value: '每日/每周' },
    ],
  }
  return [...baseSpecs, ...(categorySpecs[p.category] || [])]
})

const discount = computed(() => {
  if (!product.value || product.value.originalPrice <= product.value.price) return 0
  return Math.round((1 - product.value.price / product.value.originalPrice) * 100)
})

onMounted(() => {
  setTimeout(() => {
    isLoading.value = false
  }, 600)
  if (product.value) {
    browseHistoryStore.addToHistory({
      id: product.value.id,
      name: product.value.name,
      price: product.value.price,
      emoji: product.value.emoji,
    })
  }
  qaList.value = [
    { id: 1, user: '小猫咪的主人', question: '这个适合多大的猫咪使用？', answer: '适合全阶段猫咪，幼猫成猫都可以哦~', date: '2026-03-10', likes: 12 },
    { id: 2, user: '新手铲屎官', question: '保质期到什么时候？', answer: '目前发货的保质期都在18个月以上，请放心购买！', date: '2026-03-08', likes: 8 },
    { id: 3, user: '橘猫爸爸', question: '可以开发票吗？', answer: '可以的，下单时备注需要发票即可。', date: '2026-03-05', likes: 5 },
  ]
})

watch(() => route.params.id, () => {
  isLoading.value = true
  quantity.value = 1
  addedToCart.value = false
  showAllReviews.value = false
  activeTab.value = 'detail'
  reviewFilterRating.value = 0
  nextTick(() => {
    setTimeout(() => { isLoading.value = false }, 400)
    if (product.value) {
      browseHistoryStore.addToHistory({
        id: product.value.id,
        name: product.value.name,
        price: product.value.price,
        emoji: product.value.emoji,
      })
    }
  })
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
  toast.success(`已将 ${quantity.value} 件商品加入购物车`)
  setTimeout(() => { addedToCart.value = false }, 2000)
}

function handleBuyNow() {
  if (!authStore.isLoggedIn) {
    showGuestModal.value = true
    return
  }
  handleAddToCart()
  router.push('/cart')
}

function toggleWishlist() {
  if (!authStore.isLoggedIn) {
    showGuestModal.value = true
    return
  }
  if (!product.value) return
  if (isWishlisted.value) {
    wishlistStore.removeFromWishlist(product.value.id)
    toast.info('已取消收藏')
  } else {
    wishlistStore.addToWishlist(product.value)
    toast.success('已添加到收藏')
  }
}

function openImageModal() {
  showImageModal.value = true
  imageScale.value = 1
  imageTranslate.value = { x: 0, y: 0 }
}

function closeImageModal() {
  showImageModal.value = false
  imageScale.value = 1
  imageTranslate.value = { x: 0, y: 0 }
}

function handleImageWheel(e) {
  e.preventDefault()
  const delta = e.deltaY > 0 ? -0.2 : 0.2
  imageScale.value = Math.max(0.5, Math.min(5, imageScale.value + delta))
}

function handleImageMouseDown(e) {
  if (imageScale.value <= 1) return
  isDragging.value = true
  dragStart.value = { x: e.clientX - imageTranslate.value.x, y: e.clientY - imageTranslate.value.y }
}

function handleImageMouseMove(e) {
  if (!isDragging.value) return
  imageTranslate.value = { x: e.clientX - dragStart.value.x, y: e.clientY - dragStart.value.y }
}

function handleImageMouseUp() {
  isDragging.value = false
}

function submitQuestion() {
  if (!qaQuestion.value.trim()) return
  if (!authStore.isLoggedIn) {
    showGuestModal.value = true
    return
  }
  qaList.value.unshift({
    id: Date.now(),
    user: authStore.currentUser?.username || '匿名用户',
    question: qaQuestion.value,
    answer: null,
    date: new Date().toLocaleDateString('zh-CN'),
    likes: 0,
  })
  qaQuestion.value = ''
  toast.success('问题已提交，商家将尽快回复')
}

function scrollToSection(sectionId) {
  const el = document.getElementById(sectionId)
  if (el) {
    el.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }
}

function ratingPercentage(star) {
  const count = allReviews.value.filter(r => r.rating === star).length
  return Math.round((count / Math.max(allReviews.value.length, 1)) * 100)
}
</script>

<template>
  <div v-if="isLoading" class="min-h-screen flex items-center justify-center">
    <div class="text-center">
      <div class="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
      <p class="text-text-muted">加载中...</p>
    </div>
  </div>

  <div v-else-if="product" class="min-h-screen">
    <div class="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8 xl:px-12 py-4 md:py-8">
      <nav class="flex items-center gap-2 text-sm text-text-muted mb-6">
        <router-link to="/" class="hover:text-primary transition-colors">首页</router-link>
        <span class="text-text-light">/</span>
        <router-link to="/products" class="hover:text-primary transition-colors">全部商品</router-link>
        <span class="text-text-light">/</span>
        <router-link :to="`/products?category=${product.category}`" class="hover:text-primary transition-colors">{{ product.category }}</router-link>
        <span class="text-text-light">/</span>
        <span class="text-text-dark truncate max-w-[200px]">{{ product.name }}</span>
      </nav>

      <div class="grid grid-cols-1 md:grid-cols-2 gap-8 lg:gap-12">
        <div class="space-y-4">
          <div
            class="bg-card-bg rounded-2xl overflow-hidden shadow-md flex items-center justify-center aspect-square relative group cursor-zoom-in"
            :class="product.bgColor || 'bg-warm-bg-alt'"
            @click="openImageModal"
          >
            <span class="text-[8rem] md:text-[12rem] select-none transition-transform duration-300 group-hover:scale-105">
              {{ product.emoji || '🐾' }}
            </span>
            <div class="absolute inset-0 bg-black/0 group-hover:bg-black/5 transition-colors flex items-center justify-center">
              <span class="opacity-0 group-hover:opacity-100 transition-opacity bg-black/50 text-white text-sm px-4 py-2 rounded-full">
                🔍 点击放大
              </span>
            </div>
            <div
              v-if="discount > 0"
              class="absolute top-4 left-4 bg-accent text-white text-sm font-bold px-3 py-1.5 rounded-xl shadow-lg"
            >
              -{{ discount }}%
            </div>
          </div>
        </div>

        <div class="flex flex-col">
          <div class="flex flex-wrap gap-2 mb-3">
            <span
              v-for="tag in product.tags"
              :key="tag"
              class="bg-primary/10 text-primary text-xs font-medium px-3 py-1 rounded-full"
            >
              {{ tag }}
            </span>
          </div>

          <h1 class="text-2xl md:text-3xl font-bold text-text-dark font-pet mb-3 leading-tight">
            {{ product.name }}
          </h1>

          <div class="flex items-center gap-3 mb-4 flex-wrap">
            <div class="flex items-center gap-1">
              <span class="text-yellow-400 text-lg">★</span>
              <span class="text-lg font-semibold text-text-dark">{{ displayRating }}</span>
            </div>
            <span class="text-text-light">|</span>
            <button class="text-text-muted hover:text-primary transition-colors" @click="scrollToSection('reviews')">
              {{ displayReviews }} 条评价
            </button>
            <span class="text-text-light">|</span>
            <span class="text-text-muted">库存 {{ product.stock }}</span>
            <span class="text-text-light">|</span>
            <span class="text-text-muted">{{ product.category }}</span>
          </div>

          <div class="bg-warm-bg-alt rounded-2xl p-5 mb-5">
            <div class="flex items-baseline gap-3">
              <span class="text-3xl md:text-4xl font-bold text-primary">¥{{ product.price }}</span>
              <span v-if="product.originalPrice > product.price" class="text-lg text-text-light line-through">
                ¥{{ product.originalPrice }}
              </span>
              <span v-if="discount > 0" class="bg-accent text-white text-sm font-bold px-2 py-0.5 rounded-full">
                省 ¥{{ (product.originalPrice - product.price).toFixed(0) }}
              </span>
            </div>
            <div v-if="product.originalPrice > product.price" class="mt-2 text-sm text-text-muted">
              限时优惠，比原价便宜 {{ discount }}%
            </div>
          </div>

          <div class="mb-5">
            <p class="text-text-muted leading-relaxed text-sm md:text-base">{{ product.description }}</p>
          </div>

          <div class="grid grid-cols-2 gap-3 mb-5 text-sm">
            <div class="flex items-center gap-2 text-text-muted">
              <span class="text-base">🚚</span>
              <span>满99元免运费</span>
            </div>
            <div class="flex items-center gap-2 text-text-muted">
              <span class="text-base">🔄</span>
              <span>7天无理由退换</span>
            </div>
            <div class="flex items-center gap-2 text-text-muted">
              <span class="text-base">✅</span>
              <span>正品保障</span>
            </div>
            <div class="flex items-center gap-2 text-text-muted">
              <span class="text-base">📦</span>
              <span>24小时内发货</span>
            </div>
          </div>

          <div class="flex items-center gap-4 mb-5">
            <span class="text-text-muted text-sm">数量：</span>
            <div class="flex items-center gap-2">
              <button
                class="w-8 h-8 rounded-lg bg-warm-bg-alt hover:bg-primary/20 text-text-dark font-bold transition-colors flex items-center justify-center text-lg"
                :class="{ 'opacity-40 cursor-not-allowed': quantity <= 1 }"
                :disabled="quantity <= 1"
                @click="quantity > 1 && quantity--"
              >
                −
              </button>
              <span class="w-12 text-center font-semibold text-text-dark">{{ quantity }}</span>
              <button
                class="w-8 h-8 rounded-lg bg-warm-bg-alt hover:bg-primary/20 text-text-dark font-bold transition-colors flex items-center justify-center text-lg"
                :class="{ 'opacity-40 cursor-not-allowed': quantity >= product.stock }"
                :disabled="quantity >= product.stock"
                @click="quantity < product.stock && quantity++"
              >
                +
              </button>
              <span class="text-xs text-text-light ml-1">库存 {{ product.stock }} 件</span>
            </div>
          </div>

          <div class="flex gap-3 mt-auto">
            <button
              class="w-12 h-12 rounded-xl border-2 flex items-center justify-center transition-all shrink-0"
              :class="isWishlisted
                ? 'border-accent bg-accent/10 text-accent'
                : 'border-border text-text-muted hover:border-accent hover:text-accent'"
              @click="toggleWishlist"
            >
              {{ isWishlisted ? '❤️' : '🤍' }}
            </button>
            <button
              class="flex-1 py-3.5 rounded-xl font-semibold text-base transition-all duration-300"
              :class="addedToCart
                ? 'bg-success text-white'
                : 'bg-primary/10 text-primary hover:bg-primary hover:text-white'"
              @click="handleAddToCart"
            >
              {{ addedToCart ? '✓ 已加入购物车' : '🛒 加入购物车' }}
            </button>
            <button
              class="flex-1 py-3.5 bg-primary hover:bg-primary-dark text-white rounded-xl font-semibold text-base shadow-lg hover:shadow-xl transition-all duration-300"
              @click="handleBuyNow"
            >
              ⚡ 立即购买
            </button>
          </div>
        </div>
      </div>

      <div class="mt-10 sticky top-16 z-30 bg-warm-bg/95 backdrop-blur-sm border-b border-border -mx-4 px-4 md:mx-0 md:px-0">
        <div class="flex gap-1 overflow-x-auto py-3 no-scrollbar">
          <button
            v-for="tab in [
              { id: 'detail', label: '商品详情' },
              { id: 'specs', label: '规格参数' },
              { id: 'reviews', label: `评价 (${allReviews.length})` },
              { id: 'qa', label: '问答' },
              { id: 'related', label: '推荐' },
            ]"
            :key="tab.id"
            class="px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-colors"
            :class="activeTab === tab.id
              ? 'bg-primary text-white'
              : 'text-text-muted hover:text-primary hover:bg-primary/5'"
            @click="activeTab = tab.id; scrollToSection(tab.id)"
          >
            {{ tab.label }}
          </button>
        </div>
      </div>

      <section id="detail" class="mt-8">
        <h2 class="text-xl font-bold text-text-dark font-pet mb-4">商品详情</h2>
        <div class="bg-card-bg rounded-2xl p-6 shadow-sm">
          <div class="prose prose-sm max-w-none">
            <p class="text-text-muted leading-relaxed mb-4">{{ product.description }}</p>
            <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div class="bg-warm-bg-alt rounded-xl p-4">
                <h4 class="font-semibold text-text-dark mb-2">✨ 产品亮点</h4>
                <ul class="space-y-2 text-sm text-text-muted">
                  <li v-for="tag in product.tags" :key="tag" class="flex items-center gap-2">
                    <span class="text-primary">●</span> {{ tag }}
                  </li>
                  <li class="flex items-center gap-2">
                    <span class="text-primary">●</span> 品质保证，正品行货
                  </li>
                  <li class="flex items-center gap-2">
                    <span class="text-primary">●</span> 7天无理由退换
                  </li>
                </ul>
              </div>
              <div class="bg-warm-bg-alt rounded-xl p-4">
                <h4 class="font-semibold text-text-dark mb-2">📋 温馨提示</h4>
                <ul class="space-y-2 text-sm text-text-muted">
                  <li class="flex items-center gap-2">
                    <span class="text-secondary">●</span> 请在保质期内使用
                  </li>
                  <li class="flex items-center gap-2">
                    <span class="text-secondary">●</span> 如有不适请停止使用
                  </li>
                  <li class="flex items-center gap-2">
                    <span class="text-secondary">●</span> 请置于阴凉干燥处保存
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section id="specs" class="mt-8">
        <h2 class="text-xl font-bold text-text-dark font-pet mb-4">规格参数</h2>
        <div class="bg-card-bg rounded-2xl overflow-hidden shadow-sm">
          <div
            v-for="(spec, index) in specs"
            :key="spec.label"
            class="flex items-center px-6 py-3.5 text-sm"
            :class="index % 2 === 0 ? 'bg-warm-bg-alt/50' : ''"
          >
            <span class="w-28 shrink-0 text-text-muted">{{ spec.label }}</span>
            <span class="text-text-dark font-medium">{{ spec.value }}</span>
          </div>
        </div>
      </section>

      <section id="reviews" class="mt-8">
        <h2 class="text-xl font-bold text-text-dark font-pet mb-4">
          用户评价 <span class="text-base text-text-muted font-normal">({{ allReviews.length }})</span>
        </h2>

        <div class="bg-card-bg rounded-2xl p-6 shadow-sm mb-6">
          <div class="flex flex-col sm:flex-row items-start sm:items-center gap-6">
            <div class="text-center shrink-0">
              <div class="text-5xl font-bold text-text-dark font-pet">{{ displayRating }}</div>
              <div class="flex items-center gap-1 my-2 justify-center">
                <span v-for="i in 5" :key="i" class="text-xl" :class="i <= Math.round(displayRating) ? 'text-yellow-400' : 'text-gray-300'">★</span>
              </div>
              <p class="text-sm text-text-muted">{{ displayReviews }} 条评价</p>
            </div>
            <div class="flex-1 w-full space-y-2">
              <button
                v-for="star in [5, 4, 3, 2, 1]"
                :key="star"
                class="flex items-center gap-3 w-full"
                :class="reviewFilterRating === star ? 'opacity-100' : 'opacity-80 hover:opacity-100'"
                @click="reviewFilterRating = reviewFilterRating === star ? 0 : star"
              >
                <span class="text-sm text-text-muted w-8 shrink-0">{{ star }}星</span>
                <div class="flex-1 bg-border rounded-full h-2.5 overflow-hidden">
                  <div
                    class="bg-yellow-400 h-full rounded-full transition-all duration-500"
                    :style="{ width: `${ratingPercentage(star)}%` }"
                  />
                </div>
                <span class="text-sm text-text-muted w-12 text-right shrink-0">{{ ratingPercentage(star) }}%</span>
              </button>
            </div>
          </div>
        </div>

        <div class="flex items-center justify-between mb-4">
          <div class="flex gap-2">
            <button
              class="px-3 py-1.5 rounded-lg text-xs font-medium transition-colors"
              :class="reviewSortBy === 'latest' ? 'bg-primary text-white' : 'bg-card-bg text-text-muted hover:text-primary'"
              @click="reviewSortBy = 'latest'"
            >
              最新
            </button>
            <button
              class="px-3 py-1.5 rounded-lg text-xs font-medium transition-colors"
              :class="reviewSortBy === 'helpful' ? 'bg-primary text-white' : 'bg-card-bg text-text-muted hover:text-primary'"
              @click="reviewSortBy = 'helpful'"
            >
              最有用
            </button>
          </div>
          <button
            v-if="reviewFilterRating > 0"
            class="text-xs text-primary hover:underline"
            @click="reviewFilterRating = 0"
          >
            清除筛选
          </button>
        </div>

        <div class="space-y-4">
          <div
            v-for="review in displayedReviews"
            :key="review.id || review.date + review.user"
            class="bg-card-bg rounded-2xl p-5 shadow-sm"
          >
            <div class="flex items-center justify-between mb-3">
              <div class="flex items-center gap-3">
                <div class="w-9 h-9 rounded-full bg-primary/10 flex items-center justify-center">
                  <span class="text-base select-none">{{ review.userEmoji || '🐾' }}</span>
                </div>
                <div>
                  <p class="font-medium text-text-dark text-sm">{{ review.user }}</p>
                  <p class="text-xs text-text-muted">{{ review.date }}</p>
                </div>
              </div>
              <div class="flex items-center gap-0.5">
                <span v-for="i in 5" :key="i" class="text-sm" :class="i <= review.rating ? 'text-yellow-400' : 'text-gray-300'">★</span>
              </div>
            </div>
            <p class="text-text-dark leading-relaxed text-sm">{{ review.content }}</p>
            <div class="flex items-center gap-4 mt-3">
              <span class="text-xs text-text-muted flex items-center gap-1">
                👍 <span>{{ review.helpful || 0 }}</span> 人觉得有用
              </span>
            </div>
          </div>
        </div>

        <div v-if="filteredReviews.length === 0" class="text-center py-10">
          <span class="text-4xl block mb-3">📝</span>
          <p class="text-text-muted">暂无{{ reviewFilterRating > 0 ? `${reviewFilterRating}星` : '' }}评价</p>
        </div>

        <div v-if="filteredReviews.length > 3" class="text-center mt-6">
          <button
            class="px-8 py-3 bg-card-bg hover:bg-surface-alt text-text-dark font-semibold rounded-xl transition-colors shadow-sm"
            @click="showAllReviews = !showAllReviews"
          >
            {{ showAllReviews ? '收起评价' : `查看全部 ${filteredReviews.length} 条评价` }}
          </button>
        </div>
      </section>

      <section id="qa" class="mt-8">
        <div class="flex items-center justify-between mb-4">
          <h2 class="text-xl font-bold text-text-dark font-pet">商品问答</h2>
          <button
            class="px-4 py-2 bg-primary text-white text-sm font-medium rounded-lg hover:bg-primary-dark transition-colors"
            @click="showQAModal = !showQAModal"
          >
            提问
          </button>
        </div>

        <div v-if="showQAModal" class="bg-card-bg rounded-2xl p-5 shadow-sm mb-4">
          <textarea
            v-model="qaQuestion"
            rows="3"
            placeholder="请输入您的问题..."
            class="w-full px-4 py-3 rounded-xl border-2 border-border focus:border-primary focus:outline-none transition-colors resize-none text-sm bg-input-bg text-text-dark"
          ></textarea>
          <div class="flex justify-end gap-3 mt-3">
            <button
              class="px-4 py-2 text-sm text-text-muted hover:text-text-dark transition-colors"
              @click="showQAModal = false"
            >
              取消
            </button>
            <button
              class="px-4 py-2 bg-primary text-white text-sm font-medium rounded-lg hover:bg-primary-dark transition-colors disabled:opacity-50"
              :disabled="!qaQuestion.trim()"
              @click="submitQuestion"
            >
              提交问题
            </button>
          </div>
        </div>

        <div class="space-y-3">
          <div
            v-for="qa in qaList"
            :key="qa.id"
            class="bg-card-bg rounded-2xl p-5 shadow-sm"
          >
            <div class="flex items-start gap-3">
              <span class="text-base shrink-0 mt-0.5">❓</span>
              <div class="flex-1">
                <div class="flex items-center gap-2 mb-1">
                  <span class="text-sm font-medium text-text-dark">{{ qa.user }}</span>
                  <span class="text-xs text-text-light">{{ qa.date }}</span>
                </div>
                <p class="text-sm text-text-muted">{{ qa.question }}</p>
              </div>
            </div>
            <div v-if="qa.answer" class="flex items-start gap-3 mt-3 ml-6 pl-4 border-l-2 border-primary/20">
              <span class="text-base shrink-0 mt-0.5">💬</span>
              <div>
                <p class="text-sm text-text-dark">{{ qa.answer }}</p>
              </div>
            </div>
            <div v-else class="ml-6 pl-4 border-l-2 border-primary/20 mt-3">
              <p class="text-xs text-text-light">等待商家回复...</p>
            </div>
          </div>
        </div>

        <div v-if="qaList.length === 0" class="text-center py-10">
          <span class="text-4xl block mb-3">💬</span>
          <p class="text-text-muted">暂无问答，快来提问吧！</p>
        </div>
      </section>

      <section id="related" class="mt-8 mb-8">
        <h2 class="text-xl font-bold text-text-dark font-pet mb-4">猜你喜欢</h2>
        <div class="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
          <router-link
            v-for="related in relatedProducts"
            :key="related.id"
            :to="`/product/${related.id}`"
            class="bg-card-bg rounded-2xl overflow-hidden shadow-sm hover:shadow-lg transition-all duration-300 hover:-translate-y-1 group"
          >
            <div
              class="w-full aspect-square flex items-center justify-center group-hover:scale-110 transition-transform duration-500"
              :class="related.bgColor || 'bg-warm-bg-alt'"
            >
              <span class="text-5xl select-none">{{ related.emoji || '🐾' }}</span>
            </div>
            <div class="p-3 min-h-[4.5rem]">
              <h3 class="font-medium text-text-dark text-sm leading-tight line-clamp-2 group-hover:text-primary transition-colors">
                {{ related.name }}
              </h3>
              <p class="text-primary font-bold text-sm mt-1">¥{{ related.price }}</p>
            </div>
          </router-link>
        </div>
      </section>
    </div>

    <div
      v-if="showImageModal"
      class="fixed inset-0 z-[200] bg-black/90 flex items-center justify-center"
      @click.self="closeImageModal"
    >
      <button
        class="absolute top-4 right-4 w-10 h-10 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition-colors z-10"
        @click="closeImageModal"
      >
        <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
        </svg>
      </button>
      <div class="absolute top-4 left-4 text-white/60 text-sm z-10">
        滚轮缩放 · 拖拽移动 · 点击空白关闭
      </div>
      <div
        class="select-none cursor-grab"
        :class="isDragging ? 'cursor-grabbing' : ''"
        :style="{
          transform: `scale(${imageScale}) translate(${imageTranslate.x / imageScale}px, ${imageTranslate.y / imageScale}px)`,
          transition: isDragging ? 'none' : 'transform 0.2s ease',
        }"
        @wheel.prevent="handleImageWheel"
        @mousedown="handleImageMouseDown"
        @mousemove="handleImageMouseMove"
        @mouseup="handleImageMouseUp"
        @mouseleave="handleImageMouseUp"
      >
        <div
          class="w-[60vw] h-[60vh] md:w-[50vw] md:h-[50vh] flex items-center justify-center rounded-2xl"
          :class="product.bgColor || 'bg-warm-bg-alt'"
        >
          <span class="text-[12rem] md:text-[18rem] select-none">{{ product.emoji || '🐾' }}</span>
        </div>
      </div>
    </div>

    <div
      v-if="authStore.isLoggedIn"
      class="fixed bottom-16 md:bottom-0 left-0 right-0 z-40 bg-nav-bg backdrop-blur-xl border-t border-border md:hidden"
    >
      <div class="flex items-center gap-3 px-4 py-3">
        <button
          class="w-11 h-11 rounded-xl border-2 flex items-center justify-center shrink-0 transition-all"
          :class="isWishlisted ? 'border-accent bg-accent/10 text-accent' : 'border-border text-text-muted'"
          @click="toggleWishlist"
        >
          {{ isWishlisted ? '❤️' : '🤍' }}
        </button>
        <button
          class="flex-1 py-3 rounded-xl font-semibold text-sm transition-all"
          :class="addedToCart ? 'bg-success text-white' : 'bg-primary/10 text-primary'"
          @click="handleAddToCart"
        >
          {{ addedToCart ? '✓ 已加入' : '🛒 加入购物车' }}
        </button>
        <button
          class="flex-1 py-3 bg-primary text-white rounded-xl font-semibold text-sm shadow-lg"
          @click="handleBuyNow"
        >
          ⚡ 立即购买
        </button>
      </div>
    </div>
  </div>

  <div v-if="!product && !isLoading" class="min-h-screen flex items-center justify-center">
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

  <GuestRestrictModal v-model:show="showGuestModal" message="请先登录后再添加购物车或购买商品" />
</template>

<style scoped>
.no-scrollbar::-webkit-scrollbar {
  display: none;
}
.no-scrollbar {
  -ms-overflow-style: none;
  scrollbar-width: none;
}
</style>
