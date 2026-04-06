<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useCartStore } from '../stores/cart'
import { useOrderStore } from '../stores/orders'
import { useAuthStore } from '../stores/auth'

const route = useRoute()
const router = useRouter()
const cartStore = useCartStore()
const orderStore = useOrderStore()
const authStore = useAuthStore()

// 如果未登录，重定向到登录页
if (!authStore.isLoggedIn) {
  router.push({ path: '/login', query: { redirect: '/checkout' } })
}

// 判断是从待付款页面跳转过来的
const isOrderPayment = computed(() => !!route.query.orderId)
const pendingOrder = computed(() => {
  if (!isOrderPayment.value) return null
  return orderStore.orders.find(o => o.id === route.query.orderId)
})

onMounted(() => {
  // 如果是订单支付模式，检查订单是否存在
  if (isOrderPayment.value && !pendingOrder.value) {
    router.push('/orders/pending')
    return
  }
  // 如果是普通结算模式，检查购物车
  if (!isOrderPayment.value && cartStore.items.length === 0) {
    router.push('/cart')
    return
  }
  // 自动填充已保存的收货信息
  if (!isOrderPayment.value && orderStore.shippingInfo.name) {
    shippingForm.value = { ...orderStore.shippingInfo }
  }
})

const paymentMethod = ref('alipay')
const isProcessing = ref(false)
const orderComplete = ref(false)
const orderId = ref('')

const shippingForm = ref({
  name: '',
  phone: '',
  address: '',
  city: '',
  zipCode: '',
  remark: '',
})

const formErrors = ref({})

function validateForm() {
  const errors = {}
  if (!shippingForm.value.name.trim()) errors.name = '请输入收货人姓名'
  if (!shippingForm.value.phone.trim()) errors.phone = '请输入手机号码'
  else if (!/^1[3-9]\d{9}$/.test(shippingForm.value.phone)) errors.phone = '请输入有效的手机号'
  if (!shippingForm.value.address.trim()) errors.address = '请输入详细地址'
  if (!shippingForm.value.city.trim()) errors.city = '请输入城市'
  formErrors.value = errors
  return Object.keys(errors).length === 0
}

function generateOrderId() {
  const now = new Date()
  const y = now.getFullYear()
  const m = String(now.getMonth() + 1).padStart(2, '0')
  const d = String(now.getDate()).padStart(2, '0')
  const h = String(now.getHours()).padStart(2, '0')
  const min = String(now.getMinutes()).padStart(2, '0')
  const s = String(now.getSeconds()).padStart(2, '0')
  const r = Math.floor(Math.random() * 10000).toString().padStart(4, '0')
  return `PS${y}${m}${d}${h}${min}${s}${r}`
}

async function handleSubmit() {
  if (!validateForm()) return

  isProcessing.value = true
  await new Promise(resolve => setTimeout(resolve, 2000))

  if (isOrderPayment.value && pendingOrder.value) {
    // 订单支付模式：直接标记为已付款（运输中）
    orderStore.payOrder(pendingOrder.value.id)
    orderId.value = pendingOrder.value.id
  } else {
    // 普通结算模式
    const newId = generateOrderId()
    orderId.value = newId
    orderStore.addOrder({
      id: newId,
      status: 'shipped',
      createdAt: new Date().toLocaleString('zh-CN'),
      shippedAt: new Date().toLocaleString('zh-CN'),
      tracking: 'SF' + Date.now().toString().slice(-10),
      items: cartStore.items.map(item => ({ ...item })),
      total: total.value,
      address: `${shippingForm.value.city} ${shippingForm.value.address}`,
      phone: shippingForm.value.phone,
    })
    // 保存收货信息到 store（自动持久化到 localStorage）
    orderStore.updateShippingInfo(shippingForm.value)
    cartStore.clearCart()
  }

  isProcessing.value = false
  orderComplete.value = true
}

// 根据模式计算金额
const orderItems = computed(() => {
  if (isOrderPayment.value && pendingOrder.value) {
    return pendingOrder.value.items
  }
  return cartStore.items
})

const subtotal = computed(() => {
  return orderItems.value.reduce((sum, item) => sum + item.price * item.quantity, 0)
})
const shippingFee = computed(() => subtotal.value >= 99 ? 0 : 10)
const discount = computed(() => subtotal.value >= 200 ? 20 : 0)
const total = computed(() => subtotal.value + shippingFee.value - discount.value)

const paymentMethods = [
  { value: 'alipay', name: '支付宝', icon: '💙' },
  { value: 'wechat', name: '微信支付', icon: '💚' },
  { value: 'card', name: '银行卡', icon: '💳' },
]
</script>

<template>
  <div class="min-h-screen">
    <div class="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <!-- Success State -->
      <div v-if="orderComplete" class="text-center py-20">
        <div class="inline-flex items-center justify-center w-24 h-24 bg-success/20 rounded-full mb-6 animate-pulse-soft">
          <span class="text-5xl">✅</span>
        </div>
        <h1 class="text-3xl md:text-4xl font-bold text-text-dark font-pet mb-3">
          {{ isOrderPayment ? '付款成功！' : '订单提交成功！' }}
        </h1>
        <p class="text-text-muted text-lg mb-2">
          订单号：<span class="font-mono font-bold text-text-dark">{{ orderId }}</span>
        </p>
        <p class="text-text-muted mb-8">
          {{ isOrderPayment ? '订单已更新为待发货状态 📦' : '感谢您的购买，我们将尽快为您发货 🐾' }}
        </p>
        <div class="flex flex-col sm:flex-row gap-4 justify-center">
          <router-link
            :to="isOrderPayment ? '/orders/shipped' : '/products'"
            class="inline-block px-8 py-3 bg-primary hover:bg-primary-dark text-white font-semibold rounded-full shadow-md hover:shadow-lg transition-all duration-300"
          >
            {{ isOrderPayment ? '查看待收货订单 📦' : '继续购物 🛍️' }}
          </router-link>
          <router-link
            to="/"
            class="inline-block px-8 py-3 bg-white hover:bg-warm-bg-alt text-text-dark font-semibold rounded-full shadow-md hover:shadow-lg transition-all duration-300 border-2 border-primary/20"
          >
            返回首页
          </router-link>
        </div>
      </div>

      <!-- Checkout Form -->
      <div v-else>
        <!-- Page Header -->
        <div class="mb-8">
          <div class="flex items-center gap-3 mb-2">
            <router-link
              :to="isOrderPayment ? { path: '/orders/pending', query: { orderId: route.query.orderId } } : '/cart'"
              class="text-text-muted hover:text-primary transition-colors text-sm flex items-center gap-1"
            >
              ← 返回
            </router-link>
            <h1 class="text-3xl md:text-4xl font-bold text-text-dark font-pet">
              {{ isOrderPayment ? '💰 订单付款' : '💳 订单结算' }}
            </h1>
          </div>
          <p class="text-text-muted">
            {{ isOrderPayment ? '请选择支付方式完成付款' : '请填写收货信息并完成支付' }}
          </p>
        </div>

        <div class="grid grid-cols-1 lg:grid-cols-5 gap-8">
          <!-- Left: Form -->
          <div class="lg:col-span-3 space-y-6">
            <!-- Shipping Info (only for regular checkout) -->
            <div v-if="!isOrderPayment" class="bg-white rounded-2xl p-6 shadow-sm">
              <h2 class="text-xl font-bold text-text-dark font-pet mb-6 flex items-center gap-2">
                📦 收货信息
              </h2>
              <div class="space-y-4">
                <div>
                  <label class="block text-sm font-medium text-text-dark mb-1">
                    收货人 <span class="text-accent">*</span>
                  </label>
                  <input
                    v-model="shippingForm.name"
                    type="text"
                    placeholder="请输入收货人姓名"
                    class="w-full px-4 py-3 rounded-xl border-2 transition-colors focus:outline-none"
                    :class="formErrors.name ? 'border-accent bg-accent/5' : 'border-warm-bg-alt focus:border-primary'"
                  />
                  <p v-if="formErrors.name" class="text-accent text-sm mt-1">{{ formErrors.name }}</p>
                </div>
                <div>
                  <label class="block text-sm font-medium text-text-dark mb-1">
                    手机号码 <span class="text-accent">*</span>
                  </label>
                  <input
                    v-model="shippingForm.phone"
                    type="tel"
                    placeholder="请输入11位手机号"
                    class="w-full px-4 py-3 rounded-xl border-2 transition-colors focus:outline-none"
                    :class="formErrors.phone ? 'border-accent bg-accent/5' : 'border-warm-bg-alt focus:border-primary'"
                  />
                  <p v-if="formErrors.phone" class="text-accent text-sm mt-1">{{ formErrors.phone }}</p>
                </div>
                <div class="grid grid-cols-2 gap-4">
                  <div>
                    <label class="block text-sm font-medium text-text-dark mb-1">
                      城市 <span class="text-accent">*</span>
                    </label>
                    <input
                      v-model="shippingForm.city"
                      type="text"
                      placeholder="如：上海市"
                      class="w-full px-4 py-3 rounded-xl border-2 transition-colors focus:outline-none"
                      :class="formErrors.city ? 'border-accent bg-accent/5' : 'border-warm-bg-alt focus:border-primary'"
                    />
                    <p v-if="formErrors.city" class="text-accent text-sm mt-1">{{ formErrors.city }}</p>
                  </div>
                  <div>
                    <label class="block text-sm font-medium text-text-dark mb-1">
                      邮编
                    </label>
                    <input
                      v-model="shippingForm.zipCode"
                      type="text"
                      placeholder="选填"
                      class="w-full px-4 py-3 rounded-xl border-2 border-warm-bg-alt focus:border-primary transition-colors focus:outline-none"
                    />
                  </div>
                </div>
                <div>
                  <label class="block text-sm font-medium text-text-dark mb-1">
                    详细地址 <span class="text-accent">*</span>
                  </label>
                  <textarea
                    v-model="shippingForm.address"
                    rows="3"
                    placeholder="请输入街道、门牌号等详细地址"
                    class="w-full px-4 py-3 rounded-xl border-2 transition-colors focus:outline-none resize-none"
                    :class="formErrors.address ? 'border-accent bg-accent/5' : 'border-warm-bg-alt focus:border-primary'"
                  />
                  <p v-if="formErrors.address" class="text-accent text-sm mt-1">{{ formErrors.address }}</p>
                </div>
                <div>
                  <label class="block text-sm font-medium text-text-dark mb-1">
                    备注
                  </label>
                  <input
                    v-model="shippingForm.remark"
                    type="text"
                    placeholder="选填，如：请放快递柜"
                    class="w-full px-4 py-3 rounded-xl border-2 border-warm-bg-alt focus:border-primary transition-colors focus:outline-none"
                  />
                </div>
              </div>
            </div>

            <!-- Payment Method -->
            <div class="bg-white rounded-2xl p-6 shadow-sm">
              <h2 class="text-xl font-bold text-text-dark font-pet mb-6 flex items-center gap-2">
                💰 支付方式
              </h2>
              <div class="grid grid-cols-3 gap-4">
                <button
                  v-for="method in paymentMethods"
                  :key="method.value"
                  class="flex flex-col items-center gap-2 py-4 px-3 rounded-xl border-2 transition-all duration-200"
                  :class="paymentMethod === method.value
                    ? 'border-primary bg-primary/5 text-primary shadow-sm'
                    : 'border-warm-bg-alt text-text-muted hover:border-primary/30'"
                  @click="paymentMethod = method.value"
                >
                  <span class="text-2xl">{{ method.icon }}</span>
                  <span class="text-sm font-medium">{{ method.name }}</span>
                </button>
              </div>
            </div>
          </div>

          <!-- Right: Order Summary -->
          <div class="lg:col-span-2">
            <div class="bg-white rounded-2xl p-6 shadow-sm sticky top-8">
              <h2 class="text-xl font-bold text-text-dark font-pet mb-6 flex items-center gap-2">
                📋 {{ isOrderPayment ? '付款详情' : '订单摘要' }}
              </h2>

              <!-- Shipping Info (for order payment mode, in sidebar) -->
              <div v-if="isOrderPayment && pendingOrder" class="mb-6 pb-4 border-b border-warm-bg-alt">
                <h3 class="text-sm font-semibold text-text-dark mb-3 flex items-center gap-1">
                  📦 收货信息
                </h3>
                <div class="space-y-2 text-sm">
                  <div>
                    <span class="text-text-muted">收货地址</span>
                    <p class="text-text-dark mt-1">{{ pendingOrder.address }}</p>
                  </div>
                  <div>
                    <span class="text-text-muted">联系电话</span>
                    <p class="text-text-dark mt-1">{{ pendingOrder.phone }}</p>
                  </div>
                </div>
              </div>

              <!-- Order Items -->
              <div class="space-y-3 mb-6 max-h-64 overflow-y-auto pr-1">
                <div
                  v-for="item in orderItems"
                  :key="item.id"
                  class="flex items-center gap-3"
                >
                  <div
                    class="w-12 h-12 rounded-lg flex items-center justify-center flex-shrink-0"
                    :class="item.bgColor || 'bg-warm-bg-alt'"
                  >
                    <span class="text-xl select-none">{{ item.emoji || '🐾' }}</span>
                  </div>
                  <div class="flex-1 min-w-0">
                    <p class="text-sm font-medium text-text-dark truncate">{{ item.name }}</p>
                    <p class="text-xs text-text-muted">× {{ item.quantity }}</p>
                  </div>
                  <span class="text-sm font-bold text-primary">¥{{ (item.price * item.quantity).toFixed(2) }}</span>
                </div>
              </div>

              <!-- Price Breakdown -->
              <div class="space-y-3 pt-4 border-t border-warm-bg-alt">
                <div class="flex justify-between text-sm text-text-muted">
                  <span>商品小计</span>
                  <span>¥{{ subtotal.toFixed(2) }}</span>
                </div>
                <div v-if="!isOrderPayment" class="flex justify-between text-sm text-text-muted">
                  <span>运费</span>
                  <span :class="shippingFee === 0 ? 'text-success' : ''">
                    {{ shippingFee === 0 ? '免运费' : '¥' + shippingFee.toFixed(2) }}
                  </span>
                </div>
                <div v-if="!isOrderPayment && discount > 0" class="flex justify-between text-sm text-success">
                  <span>满减优惠 (满¥200减¥20)</span>
                  <span>-¥{{ discount.toFixed(2) }}</span>
                </div>
                <div class="flex justify-between pt-3 border-t border-warm-bg-alt">
                  <span class="text-lg font-semibold text-text-dark">应付总额</span>
                  <span class="text-2xl font-bold text-primary">¥{{ total.toFixed(2) }}</span>
                </div>
              </div>

              <!-- Submit Button -->
              <button
                class="w-full mt-6 py-4 bg-primary hover:bg-primary-dark text-white font-semibold text-lg rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 disabled:opacity-60 disabled:cursor-not-allowed disabled:hover:shadow-lg"
                :disabled="isProcessing"
                @click="handleSubmit"
              >
                <span v-if="isProcessing" class="flex items-center justify-center gap-2">
                  <svg class="animate-spin w-5 h-5" fill="none" viewBox="0 0 24 24">
                    <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4" />
                    <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                  </svg>
                  正在处理支付...
                </span>
                <span v-else>
                  确认支付 ¥{{ total.toFixed(2) }}
                </span>
              </button>

              <p class="text-xs text-text-light text-center mt-3">
                🔒 支付信息已加密，请放心填写
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
