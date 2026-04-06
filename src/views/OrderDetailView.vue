<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useOrderStore } from '../stores/orders'
import { useReviewStore } from '../stores/reviews'
import { useProductRatingStore } from '../stores/productRatings'

const route = useRoute()
const router = useRouter()
const orderStore = useOrderStore()
const reviewStore = useReviewStore()
const productRatingStore = useProductRatingStore()

const orderId = computed(() => route.params.orderId)
const order = computed(() => orderStore.orders.find(o => o.id === orderId.value))

const confirming = ref(false)
const showReturnModal = ref(false)
const returnReason = ref('')
const returnDescription = ref('')
const showReviewModal = ref(false)
const reviewItem = ref(null)
const reviewRating = ref(5)
const reviewContent = ref('')
const reviewAnon = ref(false)

const reviewProgress = computed(() => {
  if (!order.value) return { current: 0, total: 0 }
  const reviewed = order.value.items.filter(item => reviewStore.hasReviewed(orderId.value, item.id)).length
  return { current: reviewed, total: order.value.items.length }
})

const reasonOptions = [
  '商品与描述不符',
  '质量问题',
  '收到商品破损',
  '发错商品',
  '七天无理由退换',
  '其他原因',
]

onMounted(() => {
  if (!order.value) {
    router.push('/orders/shipped')
  }
})

function handleConfirm() {
  confirming.value = true
  setTimeout(() => {
    orderStore.confirmReceive(orderId.value)
    confirming.value = false
    // 确认收货后自动弹出评价弹窗（针对第一个未评价的商品）
    if (order.value) {
      const unreviewedItem = order.value.items.find(item => !reviewStore.hasReviewed(orderId.value, item.id))
      if (unreviewedItem) {
        openReviewModal(unreviewedItem)
      }
    }
  }, 1000)
}

function copyTracking(tracking) {
  navigator.clipboard?.writeText(tracking)
}

function openReturnModal() {
  returnReason.value = ''
  returnDescription.value = ''
  showReturnModal.value = true
}

function submitReturn() {
  if (!returnReason.value) return
  orderStore.applyReturn(orderId.value, returnReason.value)
  showReturnModal.value = false
}

function goBack() {
  if (order.value?.status === 'returning') {
    router.push('/orders/returns')
  } else if (order.value?.status === 'completed') {
    router.push('/orders/shipped')
  } else {
    router.push('/orders/shipped')
  }
}

function openReviewModal(item) {
  reviewItem.value = item
  reviewRating.value = 5
  reviewContent.value = ''
  reviewAnon.value = false
  showReviewModal.value = true
}

function submitReview() {
  if (!reviewItem.value) return
  
  const userEmojis = ['🐱', '🐶', '🐰', '🐹', '🐻', '🦊', '🐼', '🐨', '🐯', '🦁']
  const userNames = ['爱宠达人', '铲屎官', '宠物爱好者', '萌宠家长', '毛孩子主人', '养宠新手', '资深铲屎官']
  reviewStore.addReview({
    id: `REV-${Date.now()}`,
    orderId: orderId.value,
    productId: reviewItem.value.id,
    productName: reviewItem.value.name,
    rating: reviewRating.value,
    content: reviewContent.value,
    user: reviewAnon.value ? '匿名用户' : userNames[Math.floor(Math.random() * userNames.length)],
    userEmoji: reviewAnon.value ? '👤' : userEmojis[Math.floor(Math.random() * userEmojis.length)],
    date: new Date().toLocaleDateString('zh-CN'),
    helpful: 0,
  })
  
  // Update product rating
  productRatingStore.updateRating(reviewItem.value.id, reviewRating.value)
  
  showReviewModal.value = false

  // Auto-prompt next unreviewed item
  const nextItem = order.value?.items.find(item => !reviewStore.hasReviewed(orderId.value, item.id))
  if (nextItem) {
    setTimeout(() => openReviewModal(nextItem), 300)
  }
}

const statusBadge = computed(() => {
  if (!order.value) return {}
  const map = {
    shipped: { label: '运输中', class: 'bg-secondary/20 text-secondary' },
    completed: { label: '已完成', class: 'bg-success/20 text-success' },
    returning: { label: '退换中', class: 'bg-accent/20 text-accent' },
  }
  return map[order.value.status] || map.shipped
})
</script>

<template>
  <div class="min-h-screen">
    <div class="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <!-- Loading / Not Found -->
      <div v-if="!order" class="text-center py-20">
        <span class="text-7xl block mb-6">🔍</span>
        <h2 class="text-2xl font-bold text-text-dark mb-3">订单不存在</h2>
        <p class="text-text-muted mb-8">未找到该订单信息</p>
        <router-link
          to="/orders/shipped"
          class="inline-block px-8 py-3 bg-primary hover:bg-primary-dark text-white font-semibold rounded-full shadow-md hover:shadow-lg transition-all duration-300"
        >
          返回待收货列表
        </router-link>
      </div>

      <!-- Order Details -->
      <div v-else>
        <!-- Page Header -->
        <div class="flex items-center justify-between mb-8">
          <div>
            <h1 class="text-3xl md:text-4xl font-bold text-text-dark font-pet mb-2">
              📋 订单详情
            </h1>
            <p class="text-text-muted">订单号：<span class="font-mono">{{ order.id }}</span></p>
          </div>
          <button
            class="text-text-muted hover:text-primary transition-colors text-sm flex items-center gap-1"
            @click="goBack"
          >
            ← 返回
          </button>
        </div>

        <!-- Status Badge -->
        <div class="bg-white rounded-2xl p-6 shadow-sm mb-4">
          <div class="flex items-center justify-between">
            <div class="flex items-center gap-3">
              <span class="text-3xl">📦</span>
              <div>
                <p class="text-lg font-bold text-text-dark font-pet">订单详情</p>
                <p class="text-sm text-text-muted">下单时间：{{ order.createdAt }}</p>
              </div>
            </div>
            <span
              class="px-4 py-2 rounded-full text-sm font-bold"
              :class="statusBadge.class"
            >
              {{ statusBadge.label }}
            </span>
          </div>
        </div>

        <!-- Tracking Info (only for shipped) -->
        <div v-if="order.status === 'shipped'" class="bg-white rounded-2xl p-6 shadow-sm mb-4">
          <h2 class="text-lg font-bold text-text-dark font-pet mb-4 flex items-center gap-2">
            🚚 物流信息
          </h2>
          <div class="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <p class="text-sm text-text-muted">物流公司</p>
              <p class="font-medium text-text-dark">顺丰速运</p>
            </div>
            <div>
              <p class="text-sm text-text-muted">运单号</p>
              <div class="flex items-center gap-2">
                <span class="font-mono font-medium text-text-dark">{{ order.tracking }}</span>
                <button
                  class="text-xs text-primary hover:text-primary-dark transition-colors"
                  @click="copyTracking(order.tracking)"
                >
                  复制
                </button>
              </div>
            </div>
            <div>
              <p class="text-sm text-text-muted">发货时间</p>
              <p class="font-medium text-text-dark">{{ order.shippedAt }}</p>
            </div>
          </div>
        </div>

        <!-- Return Info (only for returning) -->
        <div v-if="order.status === 'returning'" class="bg-white rounded-2xl p-6 shadow-sm mb-4">
          <h2 class="text-lg font-bold text-text-dark font-pet mb-4 flex items-center gap-2">
            🔄 售后信息
          </h2>
          <div class="bg-accent/5 rounded-xl p-4 mb-4">
            <p class="text-sm text-text-muted mb-1">退换原因</p>
            <p class="font-medium text-text-dark">{{ order.returnReason }}</p>
          </div>
          <div class="flex items-center justify-between">
            <div>
              <p class="text-sm text-text-muted">售后状态</p>
              <p class="font-medium text-accent">{{ order.returnStatus || '审核中' }}</p>
            </div>
            <p class="text-sm text-text-muted">预计处理时间：1-3个工作日</p>
          </div>
        </div>

        <!-- Order Items -->
        <div class="bg-white rounded-2xl p-6 shadow-sm mb-4">
          <h2 class="text-lg font-bold text-text-dark font-pet mb-4 flex items-center gap-2">
            🛍️ 商品清单
          </h2>
          <div class="space-y-3">
            <div
              v-for="item in order.items"
              :key="item.id"
              class="flex items-center gap-3"
            >
              <div
                class="w-14 h-14 rounded-xl flex items-center justify-center flex-shrink-0"
                :class="item.bgColor || 'bg-warm-bg-alt'"
              >
                <span class="text-2xl select-none">{{ item.emoji || '🐾' }}</span>
              </div>
              <div class="flex-1 min-w-0">
                <p class="font-medium text-text-dark truncate">{{ item.name }}</p>
                <p class="text-sm text-text-muted">× {{ item.quantity }}</p>
              </div>
              <span class="font-bold text-primary">¥{{ (item.price * item.quantity).toFixed(2) }}</span>
              <!-- Review button for completed orders -->
              <button
                v-if="order.status === 'completed' && !reviewStore.hasReviewed(order.id, item.id)"
                class="flex-shrink-0 px-3 py-1.5 bg-primary/10 hover:bg-primary/20 text-primary text-xs font-semibold rounded-lg transition-colors"
                @click="openReviewModal(item)"
              >
                评价
              </button>
              <span
                v-else-if="order.status === 'completed' && reviewStore.hasReviewed(order.id, item.id)"
                class="flex-shrink-0 px-3 py-1.5 text-success text-xs font-semibold"
              >
                ✓ 已评价
              </span>
            </div>
          </div>
        </div>

        <!-- Shipping Info -->
        <div class="bg-white rounded-2xl p-6 shadow-sm mb-4">
          <h2 class="text-lg font-bold text-text-dark font-pet mb-4 flex items-center gap-2">
            📍 收货信息
          </h2>
          <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <p class="text-sm text-text-muted">收货地址</p>
              <p class="font-medium text-text-dark">{{ order.address }}</p>
            </div>
            <div>
              <p class="text-sm text-text-muted">联系电话</p>
              <p class="font-medium text-text-dark">{{ order.phone }}</p>
            </div>
          </div>
        </div>

        <!-- Total Amount -->
        <div class="bg-white rounded-2xl p-6 shadow-sm mb-4">
          <div class="flex items-center justify-between">
            <span class="text-lg font-semibold text-text-dark">实付金额</span>
            <span class="text-3xl font-bold text-primary">¥{{ order.total.toFixed(2) }}</span>
          </div>
        </div>

        <!-- Action Buttons -->
        <div class="bg-white rounded-2xl p-6 shadow-sm">
          <div class="flex flex-col sm:flex-row gap-3">
            <!-- Confirm Receive (only for shipped) -->
            <button
              v-if="order.status === 'shipped'"
              class="flex-1 py-4 bg-secondary hover:bg-secondary/90 text-white font-semibold text-lg rounded-xl shadow-md hover:shadow-lg transition-all duration-300 disabled:opacity-60 disabled:cursor-not-allowed"
              :disabled="confirming"
              @click="handleConfirm"
            >
              <span v-if="confirming" class="flex items-center justify-center gap-2">
                <svg class="animate-spin w-5 h-5" fill="none" viewBox="0 0 24 24">
                  <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4" />
                  <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                </svg>
                确认中...
              </span>
              <span v-else>确认收货</span>
            </button>

            <!-- Apply Return (only for shipped) -->
            <button
              v-if="order.status === 'shipped'"
              class="flex-1 py-4 bg-accent hover:bg-accent/90 text-white font-semibold text-lg rounded-xl shadow-md hover:shadow-lg transition-all duration-300"
              @click="openReturnModal"
            >
              申请售后
            </button>

            <!-- Completed state -->
            <div v-if="order.status === 'completed'" class="flex-1 text-center py-4">
              <span class="text-lg font-semibold text-success">✅ 订单已完成</span>
            </div>

            <!-- Returning state -->
            <div v-if="order.status === 'returning'" class="flex-1 text-center py-4">
              <span class="text-lg font-semibold text-accent">🔄 售后申请已提交</span>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Review Modal -->
    <Teleport to="body">
      <Transition
        enter-active-class="transition duration-200 ease-out"
        enter-from-class="opacity-0"
        enter-to-class="opacity-100"
        leave-active-class="transition duration-150 ease-in"
        leave-from-class="opacity-100"
        leave-to-class="opacity-0"
      >
        <div v-if="showReviewModal" class="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 p-4">
          <div class="bg-white rounded-2xl p-6 w-full max-w-md shadow-2xl">
            <div class="flex items-center justify-between mb-1">
              <h3 class="text-xl font-bold text-text-dark font-pet">发表评价</h3>
              <span class="text-sm text-text-muted">{{ reviewProgress.current + 1 }}/{{ reviewProgress.total }}</span>
            </div>
            <p class="text-sm text-text-muted mb-4">对 {{ reviewItem?.name }} 进行评价</p>

            <div class="space-y-4">
              <!-- Star Rating -->
              <div>
                <label class="block text-sm font-medium text-text-dark mb-2">评分</label>
                <div class="flex items-center gap-2">
                  <button
                    v-for="star in 5"
                    :key="star"
                    class="text-3xl transition-transform hover:scale-110"
                    :class="star <= reviewRating ? 'text-yellow-400' : 'text-gray-300'"
                    @click="reviewRating = star"
                  >
                    ★
                  </button>
                  <span class="text-sm text-text-muted ml-2">{{ ['很差', '较差', '一般', '满意', '非常满意'][reviewRating - 1] }}</span>
                </div>
              </div>

              <!-- Review Content -->
              <div>
                <label class="block text-sm font-medium text-text-dark mb-1">评价内容</label>
                <textarea
                  v-model="reviewContent"
                  rows="4"
                  placeholder="分享您的使用体验..."
                  class="w-full px-4 py-3 rounded-xl border-2 border-warm-bg-alt focus:border-primary focus:outline-none transition-colors resize-none"
                />
              </div>

              <!-- Anonymous -->
              <label class="flex items-center gap-2 cursor-pointer">
                <input v-model="reviewAnon" type="checkbox" class="w-4 h-4 rounded text-primary" />
                <span class="text-sm text-text-muted">匿名评价</span>
              </label>
            </div>

            <div class="flex gap-3 mt-6">
              <button
                class="flex-1 py-3 bg-warm-bg-alt hover:bg-warm-bg-alt/80 text-text-dark font-semibold rounded-xl transition-colors"
                @click="showReviewModal = false"
              >
                取消
              </button>
              <button
                class="flex-1 py-3 bg-primary hover:bg-primary-dark text-white font-semibold rounded-xl transition-colors"
                @click="submitReview"
              >
                提交评价
              </button>
            </div>
          </div>
        </div>
      </Transition>
    </Teleport>

    <!-- Return Modal -->
    <Teleport to="body">
      <Transition
        enter-active-class="transition duration-200 ease-out"
        enter-from-class="opacity-0"
        enter-to-class="opacity-100"
        leave-active-class="transition duration-150 ease-in"
        leave-from-class="opacity-100"
        leave-to-class="opacity-0"
      >
        <div v-if="showReturnModal" class="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 p-4">
          <div class="bg-white rounded-2xl p-6 w-full max-w-md shadow-2xl">
            <h3 class="text-xl font-bold text-text-dark font-pet mb-4">申请售后</h3>

            <div class="space-y-4">
              <div>
                <label class="block text-sm font-medium text-text-dark mb-1">退换原因</label>
                <select
                  v-model="returnReason"
                  class="w-full px-4 py-3 rounded-xl border-2 border-warm-bg-alt focus:border-primary focus:outline-none transition-colors"
                >
                  <option value="" disabled>请选择原因</option>
                  <option v-for="reason in reasonOptions" :key="reason" :value="reason">
                    {{ reason }}
                  </option>
                </select>
              </div>
              <div>
                <label class="block text-sm font-medium text-text-dark mb-1">补充说明（选填）</label>
                <textarea
                  v-model="returnDescription"
                  rows="3"
                  placeholder="请详细描述问题..."
                  class="w-full px-4 py-3 rounded-xl border-2 border-warm-bg-alt focus:border-primary focus:outline-none transition-colors resize-none"
                />
              </div>
            </div>

            <div class="flex gap-3 mt-6">
              <button
                class="flex-1 py-3 bg-warm-bg-alt hover:bg-warm-bg-alt/80 text-text-dark font-semibold rounded-xl transition-colors"
                @click="showReturnModal = false"
              >
                取消
              </button>
              <button
                class="flex-1 py-3 bg-accent hover:bg-accent/90 text-white font-semibold rounded-xl transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
                :disabled="!returnReason"
                @click="submitReturn"
              >
                提交申请
              </button>
            </div>
          </div>
        </div>
      </Transition>
    </Teleport>
  </div>
</template>
