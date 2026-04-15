<script setup>
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import { useCouponStore } from '../stores/coupons'
import { useAuthStore } from '../stores/auth'
import GuestRestrictModal from '../components/GuestRestrictModal.vue'
import { useToast } from '../composables/useToast'

const router = useRouter()
const couponStore = useCouponStore()
const authStore = useAuthStore()
const toast = useToast()

const activeTab = ref('claimable')
const showGuestModal = ref(false)

const claimableCoupons = computed(() => {
  return couponStore.availableCouponsList
})

const availableCoupons = computed(() => {
  return couponStore.myCoupons.filter(c => !c.used && !isCouponExpired(c))
})

const usedCoupons = computed(() => {
  return couponStore.myCoupons.filter(c => c.used)
})

const expiredCoupons = computed(() => {
  return couponStore.myCoupons.filter(c => !c.used && isCouponExpired(c))
})

function formatDate(date) {
  return new Date(date).toLocaleDateString('zh-CN')
}

function isExpiringSoon(expiresAt) {
  const now = new Date()
  const expiry = new Date(expiresAt)
  const daysLeft = Math.floor((expiry - now) / 86400000)
  return daysLeft <= 3 && daysLeft > 0
}

function isCouponExpired(coupon) {
  if (coupon.expired !== undefined) {
    return coupon.expired
  }
  const now = new Date()
  const validUntil = new Date(coupon.validUntil || coupon.expiresAt)
  return now > validUntil
}

function handleUseCoupon(coupon) {
  if (!authStore.isLoggedIn) {
    showGuestModal.value = true
    return
  }
  router.push('/products')
}

function handleClaimCoupon(coupon) {
  if (!authStore.isLoggedIn) {
    showGuestModal.value = true
    return
  }
  const result = couponStore.claimCoupon(coupon.id)
  if (result.success) {
    toast.success('领取成功！优惠券已放入您的卡包')
  } else {
    toast.error(result.message || '领取失败')
  }
}

function handleClaimAll() {
  if (!authStore.isLoggedIn) {
    showGuestModal.value = true
    return
  }
  let successCount = 0
  claimableCoupons.value.forEach(coupon => {
    const result = couponStore.claimCoupon(coupon.id)
    if (result.success) {
      successCount++
    }
  })
  if (successCount > 0) {
    toast.success(`成功领取 ${successCount} 张优惠券`)
  }
}

function handleSignIn() {
  if (!authStore.isLoggedIn) {
    showGuestModal.value = true
    return
  }
  const result = couponStore.signIn()
  if (result.success) {
    toast.success(`签到成功！连续签到 ${result.days} 天，获得${result.reward}奖励`)
  } else {
    toast.info(result.message)
  }
}
</script>

<template>
  <div class="min-h-screen">
    <div class="w-full px-4 sm:px-6 lg:px-8 py-8">
      <div class="max-w-6xl mx-auto w-full">
        <div class="mb-8">
          <div class="flex justify-between items-center">
            <h1 class="text-3xl md:text-4xl font-bold text-text-dark font-pet mb-2">
              🎫 优惠券中心
            </h1>
            <button
              v-if="authStore.isLoggedIn"
              class="px-8 py-3 bg-gradient-to-r from-accent to-primary text-white font-semibold rounded-full hover:shadow-lg transition-all duration-300 transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed"
              :disabled="couponStore.hasSignInToday"
              @click="handleSignIn"
            >
              <span v-if="!couponStore.hasSignInToday">
                📅 签到
                <span v-if="couponStore.consecutiveSignInDays > 0" class="text-sm ml-1">
                  (连续{{ couponStore.consecutiveSignInDays }}天)
                </span>
              </span>
              <span v-else>✅ 今日已签到</span>
            </button>
          </div>
          <p class="text-text-muted mt-2">领取优惠券，享受更多优惠</p>
        </div>

        <div
          v-if="!authStore.isLoggedIn"
          class="bg-amber-50 border border-amber-200 rounded-2xl p-6 text-center"
        >
          <span class="text-4xl block mb-3">🔒</span>
          <h3 class="text-lg font-semibold text-amber-800 mb-2">登录后领取优惠券</h3>
          <p class="text-amber-700 mb-4">登录后可领取和使用优惠券</p>
          <router-link
            to="/login"
            class="inline-block px-6 py-2.5 bg-primary hover:bg-primary-dark text-white font-semibold rounded-full transition-all"
          >
            立即登录
          </router-link>
        </div>

        <template v-else>
          <div class="flex gap-2 mb-8">
            <button
              class="flex-1 px-6 py-3 rounded-full text-base font-medium transition-all duration-200"
              :class="activeTab === 'claimable'
                ? 'bg-accent text-white shadow-md'
                : 'bg-card-bg text-text-muted hover:text-accent'"
              @click="activeTab = 'claimable'"
            >
              🎁 可领取 ({{ claimableCoupons.length }})
            </button>
            <button
              class="flex-1 px-6 py-3 rounded-full text-base font-medium transition-all duration-200"
              :class="activeTab === 'available'
                ? 'bg-primary text-white shadow-md'
                : 'bg-card-bg text-text-muted hover:text-primary'"
              @click="activeTab = 'available'"
            >
              💰 已领取 ({{ availableCoupons.length }})
            </button>
            <button
              class="flex-1 px-6 py-3 rounded-full text-base font-medium transition-all duration-200"
              :class="activeTab === 'used'
                ? 'bg-success text-white shadow-md'
                : 'bg-card-bg text-text-muted hover:text-success'"
              @click="activeTab = 'used'"
            >
              ✅ 已使用 ({{ usedCoupons.length }})
            </button>
            <button
              class="flex-1 px-6 py-3 rounded-full text-base font-medium transition-all duration-200"
              :class="activeTab === 'expired'
                ? 'bg-text-light text-white shadow-md'
                : 'bg-card-bg text-text-muted hover:text-text-light'"
              @click="activeTab = 'expired'"
            >
              ⏰ 已过期 ({{ expiredCoupons.length }})
            </button>
          </div>

          <div v-if="activeTab === 'claimable'">
            <div class="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
              <div class="flex-1">
                <h2 class="text-xl font-bold text-text-dark">可领取优惠券</h2>
                <p class="text-sm text-text-muted mt-1">登录即可领取，下单更优惠</p>
              </div>
              <button
                v-if="claimableCoupons.length > 0"
                class="px-8 py-3 bg-accent hover:bg-accent-dark text-white font-semibold rounded-full transition-all shadow-md hover:shadow-lg w-full sm:w-auto"
                @click="handleClaimAll"
              >
                一键领取全部
              </button>
            </div>

            <div v-if="claimableCoupons.length === 0" class="text-center py-20">
              <span class="text-7xl block mb-6">🎉</span>
              <h2 class="text-2xl font-bold text-text-dark mb-3">已全部领取</h2>
              <p class="text-text-muted mb-8">您已领取所有可用优惠券，更多优惠敬请期待</p>
              <router-link
                to="/products"
                class="inline-block px-8 py-3 bg-primary hover:bg-primary-dark text-white font-semibold rounded-full shadow-md hover:shadow-lg transition-all duration-300"
              >
                去使用 →
              </router-link>
            </div>

            <div v-else class="w-full space-y-4">
              <div
                v-for="coupon in claimableCoupons"
                :key="coupon.id"
                class="w-full bg-gradient-to-r from-accent/5 to-primary/5 rounded-2xl overflow-hidden border-2 border-dashed border-accent/30 hover:border-accent transition-all"
              >
                <div class="flex flex-col sm:flex-row">
                  <div class="w-full sm:w-28 bg-gradient-to-b from-accent to-accent-dark text-white p-4 flex flex-col items-center justify-center relative overflow-hidden">
                    <div class="absolute top-0 left-0 w-full h-full bg-white/10"></div>
                    <span class="text-2xl font-bold relative z-10">
                      {{ coupon.type === 'minus' ? `¥${coupon.value}` : `${coupon.value}折` }}
                    </span>
                    <span class="text-xs opacity-90 mt-1 relative z-10">{{ coupon.desc }}</span>
                  </div>
                  <div class="flex-1 p-4 sm:p-6">
                    <div class="flex flex-col sm:flex-row items-start justify-between gap-4">
                      <div class="flex-1">
                        <h3 class="font-bold text-lg text-text-dark">{{ coupon.name }}</h3>
                        <p class="text-sm text-text-muted mt-1">
                          满 {{ coupon.minSpend }} 元可用
                        </p>
                        <p class="text-xs text-text-light mt-2">
                          有效期至 {{ formatDate(coupon.validUntil) }}
                        </p>
                        <div class="flex flex-wrap gap-2 mt-3">
                          <span class="text-xs text-accent bg-accent/10 px-2 py-1 rounded-full">
                            {{ coupon.category === 'all' ? '全场通用' : coupon.category === 'cat' ? '猫咪专用' : coupon.category === 'dog' ? '狗狗专用' : coupon.category }}
                          </span>
                          <span class="text-xs text-primary bg-primary/10 px-2 py-1 rounded-full">
                            新人专享
                          </span>
                        </div>
                      </div>
                      <button
                        class="px-6 py-2.5 bg-accent text-white font-semibold rounded-full hover:bg-accent-dark transition-all shadow-md hover:shadow-lg transform hover:scale-105 w-full sm:w-auto mt-4 sm:mt-0"
                        @click="handleClaimCoupon(coupon)"
                      >
                        立即领取
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div v-if="activeTab === 'available'">
            <div class="mb-6">
              <h2 class="text-xl font-bold text-text-dark">我的优惠券</h2>
              <p class="text-sm text-text-muted mt-1">下单时自动选择最优优惠券</p>
            </div>

            <div v-if="availableCoupons.length === 0" class="text-center py-20">
              <span class="text-7xl block mb-6">🎫</span>
              <h2 class="text-2xl font-bold text-text-dark mb-3">暂无可用优惠券</h2>
              <p class="text-text-muted mb-8">快去领取一些优惠券吧</p>
              <button
                class="inline-block px-8 py-3 bg-accent hover:bg-accent-dark text-white font-semibold rounded-full shadow-md hover:shadow-lg transition-all duration-300"
                @click="activeTab = 'claimable'"
              >
                去领取优惠券
              </button>
            </div>

            <div v-else class="w-full space-y-4">
              <div
                v-for="coupon in availableCoupons"
                :key="coupon.id"
                class="w-full bg-card-bg rounded-2xl overflow-hidden shadow-sm hover:shadow-md transition-all"
                :class="{ 'ring-2 ring-accent': isExpiringSoon(coupon.expiresAt) }"
              >
                <div class="flex flex-col sm:flex-row">
                  <div class="w-full sm:w-28 bg-primary text-white p-4 flex flex-col items-center justify-center">
                    <span class="text-2xl font-bold">
                      {{ coupon.type === 'minus' ? `¥${coupon.value}` : `${coupon.value}折` }}
                    </span>
                    <span class="text-xs opacity-80 mt-1">{{ coupon.desc }}</span>
                  </div>
                  <div class="flex-1 p-4 sm:p-6">
                    <div class="flex flex-col sm:flex-row items-start justify-between gap-4">
                      <div class="flex-1">
                        <h3 class="font-semibold text-text-dark">{{ coupon.name }}</h3>
                        <p class="text-sm text-text-muted mt-1">
                          满 {{ coupon.minSpend }} 元可用
                        </p>
                        <p class="text-xs text-text-light mt-2">
                          有效期至 {{ formatDate(coupon.expiresAt) }}
                        </p>
                        <div v-if="isExpiringSoon(coupon.expiresAt)" class="mt-2">
                          <span class="text-xs text-accent bg-accent/10 px-2 py-1 rounded-full">
                            即将过期
                          </span>
                        </div>
                      </div>
                      <button
                        class="px-6 py-2.5 bg-primary text-white text-sm font-semibold rounded-full hover:bg-primary-dark transition-all shadow-md hover:shadow-lg w-full sm:w-auto mt-4 sm:mt-0"
                        @click="handleUseCoupon(coupon)"
                      >
                        去使用
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div v-if="activeTab === 'used'" class="w-full space-y-4">
            <div v-if="usedCoupons.length === 0" class="text-center py-20">
              <span class="text-7xl block mb-6">✅</span>
              <h2 class="text-2xl font-bold text-text-dark mb-3">还没有使用过的优惠券</h2>
            </div>
            <div
              v-for="coupon in usedCoupons"
              :key="coupon.id"
              class="w-full bg-card-bg rounded-2xl p-4 sm:p-6 shadow-sm opacity-60"
            >
              <div class="flex flex-col sm:flex-row items-start justify-between gap-4">
                <div class="flex-1">
                  <h3 class="font-semibold text-text-dark">{{ coupon.name }}</h3>
                  <p class="text-sm text-text-muted mt-1">
                    {{ coupon.type === 'minus' ? `¥${coupon.value}` : `${coupon.value}折` }}
                  </p>
                </div>
                <span class="text-sm text-text-light">已使用</span>
              </div>
            </div>
          </div>

          <div v-if="activeTab === 'expired'" class="w-full space-y-4">
            <div v-if="expiredCoupons.length === 0" class="text-center py-20">
              <span class="text-7xl block mb-6">⏰</span>
              <h2 class="text-2xl font-bold text-text-dark mb-3">没有已过期的优惠券</h2>
            </div>
            <div
              v-for="coupon in expiredCoupons"
              :key="coupon.id"
              class="w-full bg-card-bg rounded-2xl p-4 sm:p-6 shadow-sm opacity-60"
            >
              <div class="flex flex-col sm:flex-row items-start justify-between gap-4">
                <div class="flex-1">
                  <h3 class="font-semibold text-text-dark">{{ coupon.name }}</h3>
                  <p class="text-sm text-text-muted mt-1">
                    {{ coupon.type === 'minus' ? `¥${coupon.value}` : `${coupon.value}折` }}
                  </p>
                </div>
                <span class="text-sm text-accent">已过期</span>
              </div>
            </div>
          </div>
        </template>
      </div>
    </div>

    <GuestRestrictModal v-model:show="showGuestModal" message="请先登录后再领取优惠券" />
  </div>
</template>
