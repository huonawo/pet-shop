<script setup>
import { ref, computed } from 'vue'
import { useOrderStore } from '../stores/orders'
import { useReviewStore } from '../stores/reviews'
import { useProductRatingStore } from '../stores/productRatings'

const orderStore = useOrderStore()
const reviewStore = useReviewStore()
const productRatingStore = useProductRatingStore()

const activeTab = ref('all')
const expandedOrderId = ref(null)

const tabs = [
  { key: 'all', label: '全部', icon: '📋' },
  { key: 'pending', label: '待付款', icon: '💰' },
  { key: 'shipped', label: '待收货', icon: '📦' },
  { key: 'returning', label: '退换/售后', icon: '🔄' },
  { key: 'completed', label: '已完成', icon: '✅' },
]

const filteredOrders = computed(() => {
  if (activeTab.value === 'all') return orderStore.orders
  return orderStore.orders.filter(o => o.status === activeTab.value)
})

const stats = computed(() => ({
  all: orderStore.orders.length,
  pending: orderStore.pendingOrders.length,
  shipped: orderStore.shippedOrders.length,
  returning: orderStore.returningOrders.length,
  completed: orderStore.orders.filter(o => o.status === 'completed').length,
}))

function statusLabel(status, order) {
  const map = {
    pending: '待付款',
    shipped: '待收货',
    returning: order?.returnStatus || '退换中',
    completed: '已完成',
  }
  return map[status] || status
}

function statusClass(status) {
  const map = {
    pending: 'bg-warning/20 text-warning',
    shipped: 'bg-secondary/20 text-secondary',
    returning: 'bg-accent/20 text-accent',
    completed: 'bg-success/20 text-success',
  }
  return map[status] || ''
}

function orderLink(order) {
  if (order.status === 'pending') return { path: '/orders/pending', query: { orderId: order.id } }
  if (order.status === 'shipped') return `/orders/shipped/${order.id}`
  if (order.status === 'returning') return `/orders/shipped/${order.id}`
  if (order.status === 'completed') return `/orders/shipped/${order.id}`
  return '#'
}

function toggleExpand(orderId) {
  expandedOrderId.value = expandedOrderId.value === orderId ? null : orderId
}

// Review
const showReviewModal = ref(false)
const reviewOrder = ref(null)
const reviewItem = ref(null)
const reviewRating = ref(5)
const reviewContent = ref('')
const reviewAnon = ref(false)

function openReviewModal(order, item) {
  reviewOrder.value = order
  reviewItem.value = item
  reviewRating.value = 5
  reviewContent.value = ''
  reviewAnon.value = false
  showReviewModal.value = true
}

function submitReview() {
  if (!reviewItem.value || !reviewOrder.value) return
  const userEmojis = ['🐱', '🐶', '🐰', '🐹', '🐻', '🦊', '🐼', '🐨', '🐯', '🦁']
  const userNames = ['爱宠达人', '铲屎官', '宠物爱好者', '萌宠家长', '毛孩子主人', '养宠新手', '资深铲屎官']
  reviewStore.addReview({
    id: `REV-${Date.now()}`,
    orderId: reviewOrder.value.id,
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
  const nextItem = reviewOrder.value.items.find(item => !reviewStore.hasReviewed(reviewOrder.value.id, item.id))
  if (nextItem) {
    setTimeout(() => openReviewModal(reviewOrder.value, nextItem), 300)
  }
}

const reviewProgress = computed(() => {
  if (!reviewOrder.value) return { current: 0, total: 0 }
  const reviewed = reviewOrder.value.items.filter(item => reviewStore.hasReviewed(reviewOrder.value.id, item.id)).length
  return { current: reviewed, total: reviewOrder.value.items.length }
})
</script>

<template>
  <div class="min-h-screen">
    <div class="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <!-- Page Header -->
      <div class="mb-8">
        <h1 class="text-3xl md:text-4xl font-bold text-text-dark font-pet mb-2">
          📋 全部订单
        </h1>
        <p class="text-text-muted">查看和管理您的所有交易订单</p>
      </div>

      <!-- Stats -->
      <div class="grid grid-cols-2 md:grid-cols-5 gap-3 mb-6">
        <button
          v-for="tab in tabs"
          :key="tab.key"
          class="bg-white rounded-xl p-4 shadow-sm hover:shadow-md transition-all text-center cursor-pointer border-2"
          :class="activeTab === tab.key ? 'border-primary bg-primary/5' : 'border-transparent'"
          @click="activeTab = tab.key"
        >
          <span class="text-2xl block mb-1">{{ tab.icon }}</span>
          <div class="text-xl font-bold text-text-dark font-pet">{{ stats[tab.key] }}</div>
          <div class="text-text-muted text-xs">{{ tab.label }}</div>
        </button>
      </div>

      <!-- Empty State -->
      <div v-if="filteredOrders.length === 0" class="text-center py-20 bg-white rounded-2xl shadow-sm">
        <span class="text-7xl block mb-6">📭</span>
        <h2 class="text-2xl font-bold text-text-dark mb-3">暂无{{ tabs.find(t => t.key === activeTab)?.label }}订单</h2>
        <p class="text-text-muted mb-8">快去挑选您爱宠需要的商品吧！</p>
        <router-link
          to="/products"
          class="inline-block px-8 py-3 bg-primary hover:bg-primary-dark text-white font-semibold rounded-full shadow-md hover:shadow-lg transition-all duration-300 whitespace-nowrap"
        >
          去逛逛 →
        </router-link>
      </div>

      <!-- Orders List -->
      <div v-else class="space-y-4">
        <div
          v-for="order in filteredOrders"
          :key="order.id"
          class="bg-white rounded-2xl shadow-sm hover:shadow-md transition-shadow overflow-hidden"
        >
          <!-- Order Header (always visible) -->
          <div
            class="p-4 cursor-pointer"
            @click="toggleExpand(order.id)"
          >
            <div class="flex items-center justify-between mb-3">
              <div class="flex items-center gap-3">
                <span class="font-mono text-sm text-text-muted">订单号: {{ order.id }}</span>
                <span class="text-xs text-text-light">{{ order.createdAt }}</span>
              </div>
              <span
                class="px-3 py-1 rounded-full text-xs font-bold"
                :class="statusClass(order.status)"
              >
                {{ statusLabel(order.status, order) }}
              </span>
            </div>
            <div class="flex items-center gap-3">
              <div
                v-for="item in order.items.slice(0, 4)"
                :key="item.id"
                class="w-12 h-12 rounded-lg flex items-center justify-center flex-shrink-0"
                :class="item.bgColor || 'bg-warm-bg-alt'"
              >
                <span class="text-xl select-none">{{ item.emoji || '🐾' }}</span>
              </div>
              <span v-if="order.items.length > 4" class="text-text-muted text-sm">
                +{{ order.items.length - 4 }}
              </span>
              <div class="flex-1" />
              <span class="text-lg font-bold text-primary">¥{{ order.total.toFixed(2) }}</span>
              <svg
                class="w-5 h-5 text-text-muted transition-transform duration-200"
                :class="expandedOrderId === order.id ? 'rotate-180' : ''"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
              </svg>
            </div>
          </div>

          <!-- Expanded Details -->
          <div v-if="expandedOrderId === order.id" class="border-t border-warm-bg-alt p-4 space-y-4">
            <!-- Items List with Review Buttons -->
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
                  @click="openReviewModal(order, item)"
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

            <!-- Shipping Info -->
            <div class="bg-warm-bg-alt/50 rounded-xl p-4">
              <div class="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
                <div>
                  <span class="text-text-muted">收货地址：</span>
                  <span class="text-text-dark">{{ order.address }}</span>
                </div>
                <div>
                  <span class="text-text-muted">联系电话：</span>
                  <span class="text-text-dark">{{ order.phone }}</span>
                </div>
              </div>
            </div>

            <!-- Action Buttons -->
            <div class="flex justify-end gap-3 pt-2">
              <router-link
                :to="orderLink(order)"
                class="px-5 py-2.5 bg-primary/10 hover:bg-primary/20 text-primary font-semibold rounded-xl transition-colors text-sm"
              >
                查看详情
              </router-link>
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
  </div>
</template>
