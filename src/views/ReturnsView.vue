<script setup>
import { ref } from 'vue'
import { useOrderStore } from '../stores/orders'

const orderStore = useOrderStore()
const showReturnModal = ref(false)
const selectedOrderId = ref('')
const returnReason = ref('')
const returnDescription = ref('')

const reasonOptions = [
  '商品与描述不符',
  '质量问题',
  '收到商品破损',
  '发错商品',
  '七天无理由退换',
  '其他原因',
]

function openReturnModal(orderId) {
  selectedOrderId.value = orderId
  returnReason.value = ''
  returnDescription.value = ''
  showReturnModal.value = true
}

function submitReturn() {
  if (!returnReason.value) return
  orderStore.applyReturn(selectedOrderId.value, returnReason.value)
  showReturnModal.value = false
}
</script>

<template>
  <div class="min-h-screen">
    <div class="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <!-- Page Header -->
      <div class="flex items-center justify-between mb-8">
        <div>
          <h1 class="text-3xl md:text-4xl font-bold text-text-dark font-pet mb-2">
            🔄 退换/售后
          </h1>
          <p class="text-text-muted">管理您的退换和售后申请</p>
        </div>
        <router-link
          to="/orders"
          class="text-text-muted hover:text-primary transition-colors text-sm flex items-center gap-1"
        >
          ← 返回订单中心
        </router-link>
      </div>

      <!-- Empty State -->
      <div v-if="orderStore.returningOrders.length === 0" class="text-center py-20">
        <span class="text-7xl block mb-6">🔄</span>
        <h2 class="text-2xl font-bold text-text-dark mb-3">暂无退换/售后申请</h2>
        <p class="text-text-muted mb-8">如有问题，可在订单详情中申请售后服务</p>
        <router-link
          to="/orders/shipped"
          class="inline-block px-8 py-3 bg-secondary hover:bg-secondary/90 text-white font-semibold rounded-full shadow-md hover:shadow-lg transition-all duration-300 whitespace-nowrap"
        >
          查看待收货订单
        </router-link>
      </div>

      <!-- Return Orders List -->
      <div v-else class="space-y-4">
        <div
          v-for="order in orderStore.returningOrders"
          :key="order.id"
          class="bg-white rounded-2xl p-6 shadow-sm hover:shadow-md transition-shadow"
        >
          <!-- Order Header -->
          <div class="flex items-center justify-between mb-4 pb-4 border-b border-warm-bg-alt">
            <div>
              <span class="font-mono text-sm text-text-muted">订单号: {{ order.id }}</span>
              <p class="text-xs text-text-light mt-1">申请时间: {{ order.createdAt }}</p>
            </div>
            <span class="px-3 py-1 bg-accent/20 text-accent rounded-full text-xs font-bold">
              {{ order.returnStatus || '审核中' }}
            </span>
          </div>

          <!-- Return Reason -->
          <div class="bg-accent/5 rounded-xl p-4 mb-4">
            <p class="text-sm text-text-muted mb-1">退换原因</p>
            <p class="font-medium text-text-dark">{{ order.returnReason }}</p>
          </div>

          <!-- Order Items -->
          <div class="space-y-3 mb-4">
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
            </div>
          </div>

          <!-- Order Footer -->
          <div class="flex items-center justify-between pt-4 border-t border-warm-bg-alt">
            <div class="text-sm text-text-muted">
              <p>退款金额</p>
              <p class="text-2xl font-bold text-accent">¥{{ order.total.toFixed(2) }}</p>
            </div>
            <div class="flex items-center gap-3">
              <p class="text-sm text-text-muted">
                预计处理时间：1-3个工作日
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>

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
            <h3 class="text-xl font-bold text-text-dark font-pet mb-4">申请退换</h3>

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
