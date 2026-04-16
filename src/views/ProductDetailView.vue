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
const reviewFilterWithImages = ref(false)
const selectedSku = ref(null)
const showPromotionModal = ref(false)

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
  if (reviewFilterWithImages.value) {
    reviews = reviews.filter(r => r.images && r.images.length > 0)
  }
  if (reviewFilterRating.value > 0) {
    reviews = reviews.filter(r => r.rating === reviewFilterRating.value)
  }
  if (reviewSortBy.value === 'helpful') {
    return [...reviews].sort((a, b) => (b.helpful || 0) - (a.helpful || 0))
  }
  if (reviewSortBy.value === 'withImages') {
    return [...reviews].sort((a, b) => (b.images?.length || 0) - (a.images?.length || 0))
  }
  return reviews
})

const displayedReviews = computed(() => {
  return showAllReviews.value ? filteredReviews.value : filteredReviews.value.slice(0, 5)
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
    { label: '品牌', value: p.brand || '萌宠优选' },
    { label: '分类', value: p.category },
    { label: '适用宠物', value: p.petType === 'cat' ? '猫咪' : p.petType === 'dog' ? '狗狗' : '全宠物' },
    { label: '库存状态', value: p.stock > 100 ? '现货充足' : p.stock > 0 ? '库存紧张' : '暂时缺货' },
    { label: '产地', value: p.origin || '中国' },
    { label: '规格', value: p.weight || '标准装' },
    { label: '保质期', value: p.shelfLife || '详见包装' },
  ]
  if (p.capacity) baseSpecs.push({ label: '容量', value: p.capacity })
  return baseSpecs
})

const discount = computed(() => {
  if (!product.value || product.value.originalPrice <= product.value.price) return 0
  return Math.round((1 - product.value.price / product.value.originalPrice) * 100)
})

const reviewTags = computed(() => {
  const tags = []
  const total = allReviews.value.length
  if (total === 0) return tags
  
  const withImages = allReviews.value.filter(r => r.images?.length > 0).length
  const fiveStar = allReviews.value.filter(r => r.rating === 5).length
  const fourStar = allReviews.value.filter(r => r.rating === 4).length
  
  tags.push({ label: '全部', count: total, active: reviewFilterRating.value === 0 && !reviewFilterWithImages.value, action: () => { reviewFilterRating.value = 0; reviewFilterWithImages.value = false } })
  tags.push({ label: '有图', count: withImages, active: reviewFilterWithImages.value, action: () => { reviewFilterWithImages.value = !reviewFilterWithImages.value } })
  tags.push({ label: '好评', count: fiveStar, active: reviewFilterRating.value === 5, action: () => { reviewFilterRating.value = reviewFilterRating.value === 5 ? 0 : 5 } })
  tags.push({ label: '中评', count: fourStar, active: reviewFilterRating.value === 4, action: () => { reviewFilterRating.value = reviewFilterRating.value === 4 ? 0 : 4 } })
  
  return tags
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
    { id: 2, user: '新手铲屎官', question: '保质期到什么时候？', answer: '目前发货的保质期都在 18 个月以上，请放心购买！', date: '2026-03-08', likes: 8 },
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
  reviewFilterWithImages.value = false
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

  <div v-else-if="product" class="min-h-screen bg-warm-bg">
    <div class="max-w-[1920px] mx-auto px-4 sm:px-6 lg:px-8 xl:px-12 py-4 md:py-8">

      <nav class="flex items-center gap-2 text-sm text-text-muted mb-6 bg-card-bg rounded-xl px-4 py-3 shadow-sm">
        <router-link to="/" class="hover:text-primary transition-colors">首页</router-link>
        <span class="text-text-light">/</span>
        <router-link to="/products" class="hover:text-primary transition-colors">全部商品</router-link>
        <span class="text-text-light">/</span>
        <router-link :to="`/products?category=${product.category}`" class="hover:text-primary transition-colors">{{ product.category }}</router-link>
        <span class="text-text-light">/</span>
        <span class="text-text-dark truncate max-w-[200px]">{{ product.name }}</span>
      </nav>

      <div class="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12">

        <div class="lg:col-span-7 space-y-4">
          <div
            class="bg-card-bg rounded-3xl overflow-hidden shadow-lg flex items-center justify-center aspect-square relative group cursor-zoom-in"
            :class="product.bgColor || 'bg-warm-bg-alt'"
            @click="openImageModal"
          >
            <span class="text-[8rem] md:text-[14rem] select-none transition-transform duration-500 group-hover:scale-110">
              {{ product.emoji || '🐾' }}
            </span>
            <div class="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
            <div class="absolute bottom-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity bg-black/60 backdrop-blur-sm text-white text-xs px-4 py-2 rounded-full">
              🔍 点击放大查看
            </div>
            <div
              v-if="discount > 0"
              class="absolute top-4 left-4 bg-accent text-white text-sm font-bold px-4 py-2 rounded-xl shadow-lg animate-pulse"
            >
              限时特惠 -{{ discount }}%
            </div>
          </div>

          <div class="bg-card-bg rounded-2xl p-6 shadow-sm">
            <h3 class="text-lg font-bold text-text-dark font-pet mb-4 flex items-center gap-2">
              <span>📋</span> 商品详情
            </h3>
            <p class="text-text-muted leading-relaxed mb-6 text-base">{{ product.description }}</p>
            
            <div v-if="product.images && product.images.length > 0" class="mb-8">
              <h4 class="text-base font-bold text-text-dark mb-4 flex items-center gap-2">
                <span>🖼️</span> 商品展示
              </h4>
              <div class="grid grid-cols-2 sm:grid-cols-4 gap-4">
                <div
                  v-for="(img, index) in product.images"
                  :key="index"
                  class="aspect-square rounded-xl bg-warm-bg-alt flex items-center justify-center text-5xl hover:scale-105 transition-transform cursor-pointer shadow-sm hover:shadow-md"
                  @click="openImageModal"
                >
                  {{ img }}
                </div>
              </div>
            </div>

            <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div class="bg-gradient-to-br from-warm-bg-alt to-warm-bg rounded-2xl p-6 border border-border/30">
                <h4 class="font-bold text-text-dark mb-4 flex items-center gap-2 text-lg">
                  <span class="text-2xl">✨</span> 产品亮点
                </h4>
                <ul class="space-y-3 text-sm text-text-muted">
                  <li v-for="tag in product.tags" :key="tag" class="flex items-start gap-3">
                    <span class="text-primary text-lg leading-none">●</span>
                    <span class="leading-relaxed">{{ tag }}</span>
                  </li>
                  <li class="flex items-start gap-3">
                    <span class="text-primary text-lg leading-none">●</span>
                    <span class="leading-relaxed">品质保证，正品行货，支持专柜验货</span>
                  </li>
                  <li class="flex items-start gap-3">
                    <span class="text-primary text-lg leading-none">●</span>
                    <span class="leading-relaxed">7 天无理由退换，购物零风险</span>
                  </li>
                  <li class="flex items-start gap-3">
                    <span class="text-primary text-lg leading-none">●</span>
                    <span class="leading-relaxed">全国联保，售后无忧</span>
                  </li>
                </ul>
              </div>
              <div class="bg-gradient-to-br from-warm-bg-alt to-warm-bg rounded-2xl p-6 border border-border/30">
                <h4 class="font-bold text-text-dark mb-4 flex items-center gap-2 text-lg">
                  <span class="text-2xl">💡</span> 温馨提示
                </h4>
                <ul class="space-y-3 text-sm text-text-muted">
                  <li class="flex items-start gap-3">
                    <span class="text-secondary text-lg leading-none">●</span>
                    <span class="leading-relaxed">请在保质期内使用，过期请勿使用</span>
                  </li>
                  <li class="flex items-start gap-3">
                    <span class="text-secondary text-lg leading-none">●</span>
                    <span class="leading-relaxed">如有不适请停止使用并咨询兽医</span>
                  </li>
                  <li class="flex items-start gap-3">
                    <span class="text-secondary text-lg leading-none">●</span>
                    <span class="leading-relaxed">请置于阴凉干燥处保存，避免阳光直射</span>
                  </li>
                  <li class="flex items-start gap-3">
                    <span class="text-secondary text-lg leading-none">●</span>
                    <span class="leading-relaxed">请放置在宠物和儿童无法触及的地方</span>
                  </li>
                </ul>
              </div>
            </div>
          </div>

          <div v-if="product.detailedImages && product.detailedImages.length > 0" class="bg-card-bg rounded-2xl p-6 shadow-sm">
            <h3 class="text-lg font-bold text-text-dark font-pet mb-4 flex items-center gap-2">
              <span>🏭</span> 生产流程
            </h3>
            <div class="grid grid-cols-2 sm:grid-cols-4 gap-4">
              <div
                v-for="(img, index) in product.detailedImages"
                :key="index"
                class="aspect-square rounded-xl bg-gradient-to-br from-primary/10 to-secondary/10 flex items-center justify-center text-5xl hover:scale-105 transition-transform shadow-sm hover:shadow-md"
              >
                {{ img }}
              </div>
            </div>
          </div>

          <div v-if="product.ingredients" class="bg-card-bg rounded-2xl p-6 shadow-sm">
            <h3 class="text-lg font-bold text-text-dark font-pet mb-4 flex items-center gap-2">
              <span>🥗</span> 主要成分
            </h3>
            <p class="text-text-muted leading-loose text-sm bg-warm-bg-alt rounded-xl p-4 border border-border/30">
              {{ product.ingredients }}
            </p>
          </div>

          <div v-if="product.feedingGuide" class="bg-card-bg rounded-2xl p-6 shadow-sm">
            <h3 class="text-lg font-bold text-text-dark font-pet mb-4 flex items-center gap-2">
              <span>📖</span> 使用方法
            </h3>
            <p class="text-text-muted leading-loose text-sm bg-gradient-to-br from-primary/5 to-secondary/5 rounded-xl p-4 border border-primary/20">
              {{ product.feedingGuide }}
            </p>
          </div>

          <div class="bg-card-bg rounded-2xl p-6 shadow-sm">
            <h3 class="text-lg font-bold text-text-dark font-pet mb-4 flex items-center gap-2">
              <span>📊</span> 规格参数
            </h3>
            <div class="space-y-3">
              <div
                v-for="(spec, index) in specs"
                :key="spec.label"
                class="flex items-center py-3 border-b border-border/30 last:border-0"
              >
                <span class="w-28 shrink-0 text-text-muted text-sm">{{ spec.label }}</span>
                <span class="text-text-dark font-medium text-sm">{{ spec.value }}</span>
              </div>
            </div>
          </div>
        </div>

        <div class="lg:col-span-5">
          <div class="bg-card-bg rounded-3xl p-6 shadow-lg sticky top-24">

            <div class="flex flex-wrap gap-2 mb-4">
              <span
                v-for="tag in product.tags"
                :key="tag"
                class="bg-gradient-to-r from-primary/10 to-primary/5 text-primary text-xs font-medium px-3 py-1.5 rounded-full border border-primary/20"
              >
                {{ tag }}
              </span>
            </div>

            <h1 class="text-2xl md:text-3xl font-bold text-text-dark font-pet mb-4 leading-snug">
              {{ product.name }}
            </h1>

            <div class="flex items-center gap-4 mb-5 pb-5 border-b border-border/30">
              <div class="flex items-center gap-2">
                <span class="text-yellow-400 text-xl">★</span>
                <span class="text-xl font-bold text-text-dark">{{ displayRating }}</span>
              </div>
              <span class="text-text-light">|</span>
              <button class="text-text-muted hover:text-primary transition-colors text-sm" @click="scrollToSection('reviews')">
                {{ displayReviews }} 条评价
              </button>
              <span class="text-text-light">|</span>
              <span :class="product.stock > 100 ? 'text-success' : 'text-accent'" class="text-sm font-medium">
                {{ product.stock > 100 ? '现货充足' : product.stock > 0 ? '库存紧张' : '缺货' }}
              </span>
            </div>

            <div class="bg-gradient-to-r from-primary/5 via-secondary/5 to-accent/5 rounded-2xl p-5 mb-5 border border-primary/10">
              <div class="flex items-baseline gap-3 mb-2">
                <span class="text-4xl font-bold text-primary">¥{{ product.price }}</span>
                <span v-if="product.originalPrice > product.price" class="text-xl text-text-light line-through">
                  ¥{{ product.originalPrice }}
                </span>
                <span v-if="discount > 0" class="bg-accent text-white text-xs font-bold px-3 py-1 rounded-full">
                  省 ¥{{ (product.originalPrice - product.price).toFixed(0) }}
                </span>
              </div>
              <div v-if="product.originalPrice > product.price" class="flex items-center gap-2 text-sm">
                <span class="text-accent font-medium">限时优惠</span>
                <span class="text-text-muted">比原价便宜 {{ discount }}%</span>
              </div>
            </div>

            <div class="grid grid-cols-2 gap-3 mb-5">
              <div class="flex items-center gap-2 text-text-muted text-xs bg-warm-bg-alt rounded-xl px-3 py-2">
                <span class="text-base">🚚</span>
                <span>满 99 元免运费</span>
              </div>
              <div class="flex items-center gap-2 text-text-muted text-xs bg-warm-bg-alt rounded-xl px-3 py-2">
                <span class="text-base">🔄</span>
                <span>7 天无理由退换</span>
              </div>
              <div class="flex items-center gap-2 text-text-muted text-xs bg-warm-bg-alt rounded-xl px-3 py-2">
                <span class="text-base">✅</span>
                <span>正品保障</span>
              </div>
              <div class="flex items-center gap-2 text-text-muted text-xs bg-warm-bg-alt rounded-xl px-3 py-2">
                <span class="text-base">📦</span>
                <span>24h 发货</span>
              </div>
            </div>

            <div class="mb-6">
              <div class="flex items-center gap-3 mb-3">
                <span class="text-text-muted text-sm">购买数量</span>
                <span class="text-xs text-text-light">库存 {{ product.stock }} 件</span>
              </div>
              <div class="flex items-center gap-3">
                <button
                  class="w-10 h-10 rounded-xl bg-warm-bg-alt hover:bg-primary/20 text-text-dark font-bold transition-all active:scale-95 flex items-center justify-center text-xl"
                  :class="{ 'opacity-40 cursor-not-allowed': quantity <= 1 }"
                  :disabled="quantity <= 1"
                  @click="quantity > 1 && quantity--"
                >
                  −
                </button>
                <span class="w-16 text-center font-bold text-lg text-text-dark bg-warm-bg-alt rounded-xl py-2.5">{{ quantity }}</span>
                <button
                  class="w-10 h-10 rounded-xl bg-warm-bg-alt hover:bg-primary/20 text-text-dark font-bold transition-all active:scale-95 flex items-center justify-center text-xl"
                  :class="{ 'opacity-40 cursor-not-allowed': quantity >= product.stock }"
                  :disabled="quantity >= product.stock"
                  @click="quantity < product.stock && quantity++"
                >
                  +
                </button>
              </div>
            </div>

            <div class="flex gap-3 mb-4">
              <button
                class="w-14 h-14 rounded-2xl border-2 flex items-center justify-center shrink-0 transition-all hover:scale-105"
                :class="isWishlisted
                  ? 'border-accent bg-accent/10 text-accent'
                  : 'border-border text-text-muted hover:border-accent hover:text-accent'"
                @click="toggleWishlist"
              >
                {{ isWishlisted ? '❤️' : '🤍' }}
              </button>
              <button
                class="flex-1 py-4 rounded-2xl font-bold text-lg transition-all duration-300 hover:shadow-lg hover:-translate-y-0.5"
                :class="addedToCart
                  ? 'bg-success text-white'
                  : 'bg-gradient-to-r from-primary to-primary-dark text-white hover:shadow-primary/30'"
                @click="handleAddToCart"
              >
                {{ addedToCart ? '✓ 已加入购物车' : '🛒 加入购物车' }}
              </button>
              <button
                class="flex-1 py-4 bg-gradient-to-r from-accent to-secondary hover:from-accent-dark hover:to-secondary-dark text-white rounded-2xl font-bold text-lg shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-0.5"
                @click="handleBuyNow"
              >
                ⚡ 立即购买
              </button>
            </div>

            <div class="bg-gradient-to-r from-primary/5 to-secondary/5 rounded-xl p-4 text-xs text-text-muted space-y-2">
              <div class="flex items-center gap-2">
                <span class="text-primary">🎁</span>
                <span>新人专享多重好礼，最高立减 200 元</span>
              </div>
              <div class="flex items-center gap-2">
                <span class="text-secondary">💳</span>
                <span>支持花呗分期付款</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div class="mt-12 sticky top-16 z-30 bg-warm-bg/95 backdrop-blur-xl border-b border-border -mx-4 px-4 md:mx-0 md:px-0 shadow-sm">
        <div class="flex gap-1 overflow-x-auto py-3 no-scrollbar">
          <button
            v-for="tab in [
              { id: 'detail', label: '商品详情', icon: '📋' },
              { id: 'specs', label: '规格参数', icon: '📊' },
              { id: 'reviews', label: `评价 (${allReviews.length})`, icon: '💬' },
              { id: 'qa', label: '问答', icon: '❓' },
              { id: 'related', label: '推荐', icon: '🎯' },
            ]"
            :key="tab.id"
            class="px-5 py-2.5 rounded-xl text-sm font-medium whitespace-nowrap transition-all flex items-center gap-2"
            :class="activeTab === tab.id
              ? 'bg-primary text-white shadow-md'
              : 'text-text-muted hover:text-primary hover:bg-primary/5'"
            @click="activeTab = tab.id; scrollToSection(tab.id)"
          >
            <span>{{ tab.icon }}</span>
            {{ tab.label }}
          </button>
        </div>
      </div>

      <section id="detail" class="mt-12 scroll-mt-24">
        <h2 class="text-2xl font-bold text-text-dark font-pet mb-6 flex items-center gap-3">
          <span class="text-3xl">📝</span> 商品详情
        </h2>
        <div class="bg-card-bg rounded-3xl p-8 shadow-sm border border-border/30">
          <div class="prose prose-sm max-w-none">
            <p class="text-text-muted leading-loose text-base mb-6">{{ product.description }}</p>
            <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div class="bg-gradient-to-br from-warm-bg-alt to-warm-bg rounded-2xl p-6 border border-border/30">
                <h4 class="font-bold text-text-dark mb-4 flex items-center gap-2 text-lg">
                  <span class="text-2xl">✨</span> 产品核心优势
                </h4>
                <ul class="space-y-3 text-sm text-text-muted">
                  <li v-for="tag in product.tags" :key="tag" class="flex items-start gap-3">
                    <span class="text-primary text-lg leading-none">●</span>
                    <span class="leading-relaxed">{{ tag }}</span>
                  </li>
                  <li class="flex items-start gap-3">
                    <span class="text-primary text-lg leading-none">●</span>
                    <span class="leading-relaxed">品质保证，正品行货，支持专柜验货</span>
                  </li>
                  <li class="flex items-start gap-3">
                    <span class="text-primary text-lg leading-none">●</span>
                    <span class="leading-relaxed">7 天无理由退换，购物零风险</span>
                  </li>
                  <li class="flex items-start gap-3">
                    <span class="text-primary text-lg leading-none">●</span>
                    <span class="leading-relaxed">全国联保，售后无忧</span>
                  </li>
                </ul>
              </div>
              <div class="bg-gradient-to-br from-warm-bg-alt to-warm-bg rounded-2xl p-6 border border-border/30">
                <h4 class="font-bold text-text-dark mb-4 flex items-center gap-2 text-lg">
                  <span class="text-2xl">💡</span> 使用建议
                </h4>
                <ul class="space-y-3 text-sm text-text-muted">
                  <li class="flex items-start gap-3">
                    <span class="text-secondary text-lg leading-none">●</span>
                    <span class="leading-relaxed">请在保质期内使用，过期请勿使用</span>
                  </li>
                  <li class="flex items-start gap-3">
                    <span class="text-secondary text-lg leading-none">●</span>
                    <span class="leading-relaxed">如有不适请停止使用并咨询兽医</span>
                  </li>
                  <li class="flex items-start gap-3">
                    <span class="text-secondary text-lg leading-none">●</span>
                    <span class="leading-relaxed">请置于阴凉干燥处保存，避免阳光直射</span>
                  </li>
                  <li class="flex items-start gap-3">
                    <span class="text-secondary text-lg leading-none">●</span>
                    <span class="leading-relaxed">请放置在宠物和儿童无法触及的地方</span>
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section id="specs" class="mt-12 scroll-mt-24">
        <h2 class="text-2xl font-bold text-text-dark font-pet mb-6 flex items-center gap-3">
          <span class="text-3xl">📊</span> 规格参数
        </h2>
        <div class="bg-card-bg rounded-3xl overflow-hidden shadow-sm border border-border/30">
          <div
            v-for="(spec, index) in specs"
            :key="spec.label"
            class="flex items-center px-6 py-4 text-sm"
            :class="index % 2 === 0 ? 'bg-warm-bg-alt/50' : ''"
          >
            <span class="w-32 shrink-0 text-text-muted font-medium">{{ spec.label }}</span>
            <span class="text-text-dark font-semibold">{{ spec.value }}</span>
          </div>
        </div>
      </section>

      <section id="reviews" class="mt-12 scroll-mt-24">
        <div class="flex items-center justify-between mb-6">
          <h2 class="text-2xl font-bold text-text-dark font-pet flex items-center gap-3">
            <span class="text-3xl">💬</span> 用户评价
            <span class="text-base text-text-muted font-normal">({{ allReviews.length }})</span>
          </h2>
        </div>

        <div class="bg-card-bg rounded-3xl p-6 shadow-sm border border-border/30 mb-8">
          <div class="flex flex-col lg:flex-row items-start lg:items-center gap-6 lg:gap-8">
            <div class="text-center shrink-0">
              <div class="text-6xl font-bold text-text-dark font-pet mb-2">{{ displayRating }}</div>
              <div class="flex items-center gap-1 mb-3 justify-center">
                <span v-for="i in 5" :key="i" class="text-2xl" :class="i <= Math.round(displayRating) ? 'text-yellow-400' : 'text-gray-300'">★</span>
              </div>
              <p class="text-sm text-text-muted">{{ displayReviews }} 条评价</p>
            </div>
            <div class="flex-1 w-full space-y-3">
              <button
                v-for="star in [5, 4, 3, 2, 1]"
                :key="star"
                class="flex items-center gap-3 w-full group"
                :class="reviewFilterRating === star ? 'opacity-100' : 'opacity-70 hover:opacity-100'"
                @click="reviewFilterRating = reviewFilterRating === star ? 0 : star"
              >
                <span class="text-sm text-text-muted w-10 shrink-0 font-medium">{{ star }}星</span>
                <div class="flex-1 bg-border rounded-full h-3 overflow-hidden group-hover:scale-[1.02] transition-transform">
                  <div
                    class="bg-gradient-to-r from-yellow-400 to-yellow-500 h-full rounded-full transition-all duration-700"
                    :style="{ width: `${ratingPercentage(star)}%` }"
                  />
                </div>
                <span class="text-sm text-text-muted w-14 text-right shrink-0 font-medium">{{ ratingPercentage(star) }}%</span>
              </button>
            </div>
          </div>
        </div>

        <div class="flex flex-wrap items-center gap-3 mb-6">
          <button
            v-for="tag in reviewTags"
            :key="tag.label"
            class="px-5 py-2.5 rounded-xl text-sm font-medium transition-all"
            :class="tag.active
              ? 'bg-primary text-white shadow-md'
              : 'bg-card-bg text-text-muted hover:bg-primary/10 hover:text-primary border border-border'"
            @click="tag.action"
          >
            {{ tag.label }}
            <span
              class="ml-1.5 px-2 py-0.5 rounded-full text-xs"
              :class="tag.active ? 'bg-white/20' : 'bg-border/50'"
            >
              {{ tag.count }}
            </span>
          </button>
          <div class="flex-1"></div>
          <select
            v-model="reviewSortBy"
            class="px-4 py-2.5 rounded-xl text-sm border border-border bg-card-bg text-text-dark focus:border-primary focus:outline-none cursor-pointer"
          >
            <option value="latest">默认排序</option>
            <option value="helpful">最有价值</option>
            <option value="withImages">有图优先</option>
          </select>
        </div>

        <div class="space-y-4">
          <div
            v-for="review in displayedReviews"
            :key="review.id || review.date + review.user"
            class="bg-card-bg rounded-2xl p-5 shadow-sm border border-border/30 hover:shadow-md transition-shadow"
          >
            <div class="flex items-start justify-between mb-3">
              <div class="flex items-center gap-3">
                <div class="w-11 h-11 rounded-full bg-gradient-to-br from-primary/20 to-secondary/20 flex items-center justify-center">
                  <span class="text-lg select-none">{{ review.userEmoji || '🐾' }}</span>
                </div>
                <div>
                  <p class="font-semibold text-text-dark text-sm">{{ review.user }}</p>
                  <p class="text-xs text-text-muted">{{ review.date }}</p>
                </div>
              </div>
              <div class="flex items-center gap-0.5">
                <span v-for="i in 5" :key="i" class="text-base" :class="i <= review.rating ? 'text-yellow-400' : 'text-gray-300'">★</span>
              </div>
            </div>
            <p class="text-text-dark leading-relaxed text-sm mb-3">{{ review.content }}</p>
            <div v-if="review.images && review.images.length > 0" class="flex gap-2 mb-3 overflow-x-auto">
              <div
                v-for="(img, idx) in review.images"
                :key="idx"
                class="w-20 h-20 rounded-lg bg-warm-bg-alt flex-shrink-0 flex items-center justify-center text-3xl"
              >
                {{ img }}
              </div>
            </div>
            <div class="flex items-center gap-4">
              <span class="text-xs text-text-muted flex items-center gap-1.5">
                <span>👍</span>
                <span>{{ review.helpful || 0 }}</span>
                <span>人觉得有用</span>
              </span>
            </div>
          </div>
        </div>

        <div v-if="filteredReviews.length === 0" class="text-center py-12 bg-card-bg rounded-2xl">
          <span class="text-5xl block mb-4">📝</span>
          <p class="text-text-muted">暂无{{ reviewFilterRating > 0 ? `${reviewFilterRating}星` : reviewFilterWithImages ? '带图' : '' }}评价</p>
        </div>

        <div v-if="filteredReviews.length > 5" class="text-center mt-8">
          <button
            class="px-10 py-3.5 bg-card-bg hover:bg-surface-alt text-text-dark font-semibold rounded-xl transition-all shadow-sm hover:shadow-md border border-border"
            @click="showAllReviews = !showAllReviews"
          >
            {{ showAllReviews ? '收起评价' : `查看全部 ${filteredReviews.length} 条评价` }}
          </button>
        </div>
      </section>

      <section id="qa" class="mt-12 scroll-mt-24">
        <div class="flex items-center justify-between mb-6">
          <h2 class="text-2xl font-bold text-text-dark font-pet flex items-center gap-3">
            <span class="text-3xl">❓</span> 商品问答
          </h2>
          <button
            class="px-5 py-2.5 bg-primary text-white text-sm font-semibold rounded-xl hover:bg-primary-dark transition-all shadow-md hover:shadow-lg"
            @click="showQAModal = !showQAModal"
          >
            ➕ 提问
          </button>
        </div>

        <div v-if="showQAModal" class="bg-card-bg rounded-2xl p-5 shadow-sm border border-border/30 mb-6">
          <textarea
            v-model="qaQuestion"
            rows="3"
            placeholder="请输入您的问题，商家将尽快回复..."
            class="w-full px-4 py-3 rounded-xl border-2 border-border focus:border-primary focus:outline-none transition-colors resize-none text-sm bg-input-bg text-text-dark placeholder-text-light"
          ></textarea>
          <div class="flex justify-end gap-3 mt-4">
            <button
              class="px-5 py-2.5 text-sm text-text-muted hover:text-text-dark transition-colors rounded-xl hover:bg-surface-alt"
              @click="showQAModal = false"
            >
              取消
            </button>
            <button
              class="px-5 py-2.5 bg-primary text-white text-sm font-semibold rounded-xl hover:bg-primary-dark transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-md"
              :disabled="!qaQuestion.trim()"
              @click="submitQuestion"
            >
              提交问题
            </button>
          </div>
        </div>

        <div class="space-y-4">
          <div
            v-for="qa in qaList"
            :key="qa.id"
            class="bg-card-bg rounded-2xl p-5 shadow-sm border border-border/30"
          >
            <div class="flex items-start gap-4">
              <div class="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                <span class="text-xl">❓</span>
              </div>
              <div class="flex-1">
                <div class="flex items-center gap-3 mb-2">
                  <span class="text-sm font-semibold text-text-dark">{{ qa.user }}</span>
                  <span class="text-xs text-text-light">{{ qa.date }}</span>
                </div>
                <p class="text-sm text-text-dark leading-relaxed">{{ qa.question }}</p>
              </div>
            </div>
            <div v-if="qa.answer" class="flex items-start gap-4 mt-4 ml-14 pl-5 border-l-2 border-primary/20">
              <div class="w-10 h-10 rounded-full bg-secondary/10 flex items-center justify-center shrink-0">
                <span class="text-xl">💬</span>
              </div>
              <div>
                <p class="text-sm text-text-dark leading-relaxed">{{ qa.answer }}</p>
              </div>
            </div>
            <div v-else class="ml-14 pl-5 border-l-2 border-primary/20 mt-4">
              <p class="text-xs text-text-light flex items-center gap-2">
                <span class="w-2 h-2 bg-primary rounded-full animate-pulse"></span>
                等待商家回复...
              </p>
            </div>
          </div>
        </div>

        <div v-if="qaList.length === 0" class="text-center py-12 bg-card-bg rounded-2xl">
          <span class="text-5xl block mb-4">💬</span>
          <p class="text-text-muted">暂无问答，快来提问吧！</p>
        </div>
      </section>

      <section id="related" class="mt-12 mb-12 scroll-mt-24">
        <h2 class="text-2xl font-bold text-text-dark font-pet mb-6 flex items-center gap-3">
          <span class="text-3xl">🎯</span> 猜你喜欢
        </h2>
        <div class="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4 lg:gap-6">
          <router-link
            v-for="related in relatedProducts"
            :key="related.id"
            :to="`/product/${related.id}`"
            class="bg-card-bg rounded-2xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 hover:-translate-y-2 group border border-border/30"
          >
            <div
              class="w-full aspect-square flex items-center justify-center group-hover:scale-110 transition-transform duration-500"
              :class="related.bgColor || 'bg-warm-bg-alt'"
            >
              <span class="text-5xl select-none">{{ related.emoji || '🐾' }}</span>
            </div>
            <div class="p-4">
              <h3 class="font-medium text-text-dark text-sm leading-tight line-clamp-2 group-hover:text-primary transition-colors mb-2">
                {{ related.name }}
              </h3>
              <div class="flex items-center justify-between">
                <p class="text-primary font-bold text-base">¥{{ related.price }}</p>
                <span class="text-xs text-text-muted">{{ related.category }}</span>
              </div>
            </div>
          </router-link>
        </div>
      </section>
    </div>

    <div
      v-if="showImageModal"
      class="fixed inset-0 z-[200] bg-black/95 flex items-center justify-center backdrop-blur-sm"
      @click.self="closeImageModal"
    >
      <button
        class="absolute top-6 right-6 w-12 h-12 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition-all hover:scale-110 z-10 shadow-lg"
        @click="closeImageModal"
      >
        <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M6 18L18 6M6 6l12 12" />
        </svg>
      </button>
      <div class="absolute top-6 left-6 text-white/60 text-sm z-10 flex items-center gap-4">
        <span class="bg-black/30 backdrop-blur-sm px-4 py-2 rounded-full">🖱️ 滚轮缩放</span>
        <span class="bg-black/30 backdrop-blur-sm px-4 py-2 rounded-full">✋ 拖拽移动</span>
        <span class="bg-black/30 backdrop-blur-sm px-4 py-2 rounded-full">␈ 点击空白关闭</span>
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
          class="w-[70vw] h-[70vh] md:w-[60vw] md:h-[60vh] flex items-center justify-center rounded-3xl shadow-2xl"
          :class="product.bgColor || 'bg-warm-bg-alt'"
        >
          <span class="text-[14rem] md:text-[20rem] select-none">{{ product.emoji || '🐾' }}</span>
        </div>
      </div>
    </div>

    <div
      v-if="authStore.isLoggedIn"
      class="fixed bottom-0 left-0 right-0 z-40 bg-nav-bg/95 backdrop-blur-xl border-t border-border md:hidden safe-area-pb"
    >
      <div class="flex items-center gap-3 px-4 py-3">
        <button
          class="w-12 h-12 rounded-2xl border-2 flex items-center justify-center shrink-0 transition-all hover:scale-105"
          :class="isWishlisted ? 'border-accent bg-accent/10 text-accent' : 'border-border text-text-muted'"
          @click="toggleWishlist"
        >
          {{ isWishlisted ? '❤️' : '🤍' }}
        </button>
        <button
          class="flex-1 py-3.5 rounded-2xl font-bold text-sm transition-all shadow-md"
          :class="addedToCart ? 'bg-success text-white' : 'bg-primary/10 text-primary hover:bg-primary hover:text-white'"
          @click="handleAddToCart"
        >
          {{ addedToCart ? '✓ 已加入' : '🛒 加入购物车' }}
        </button>
        <button
          class="flex-1 py-3.5 bg-gradient-to-r from-accent to-secondary text-white rounded-2xl font-bold text-sm shadow-lg"
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
        class="inline-block px-8 py-3.5 bg-primary text-white rounded-full hover:bg-primary-dark transition-all shadow-lg hover:shadow-xl font-semibold"
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
.safe-area-pb {
  padding-bottom: env(safe-area-inset-bottom);
}
</style>
