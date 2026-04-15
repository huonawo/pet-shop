import { defineStore } from 'pinia'
import { ref, computed } from 'vue'

// 预定义优惠券（可被用户领取）
const availableCoupons = [
  {
    id: 'COUPON-001',
    name: '新人专享券',
    type: 'minus',
    value: 20,
    minSpend: 99,
    desc: '满99减20',
    validUntil: '2026-12-31',
    category: 'all', // all, cat, dog, food, toy, etc.
  },
  {
    id: 'COUPON-002',
    name: '满减优惠券',
    type: 'minus',
    value: 50,
    minSpend: 299,
    desc: '满299减50',
    validUntil: '2026-12-31',
    category: 'all',
  },
  {
    id: 'COUPON-003',
    name: '猫咪专用券',
    type: 'minus',
    value: 15,
    minSpend: 79,
    desc: '满79减15',
    validUntil: '2026-12-31',
    category: 'cat',
  },
  {
    id: 'COUPON-004',
    name: '狗狗专用券',
    type: 'minus',
    value: 15,
    minSpend: 79,
    desc: '满79减15',
    validUntil: '2026-12-31',
    category: 'dog',
  },
  {
    id: 'COUPON-005',
    name: '9折折扣券',
    type: 'discount',
    value: 10,
    minSpend: 0,
    desc: '无门槛9折',
    validUntil: '2026-12-31',
    category: 'all',
  },
  {
    id: 'COUPON-006',
    name: '零食满减券',
    type: 'minus',
    value: 10,
    minSpend: 49,
    desc: '零食满49减10',
    validUntil: '2026-12-31',
    category: '零食',
  },
]

function loadMyCoupons() {
  try {
    const stored = localStorage.getItem('pet-shop-my-coupons')
    if (stored) return JSON.parse(stored)
  } catch (e) {
    // ignore
  }
  return []
}

function saveMyCoupons(coupons) {
  try {
    localStorage.setItem('pet-shop-my-coupons', JSON.stringify(coupons))
  } catch (e) {
    // ignore
  }
}

function loadSignInHistory() {
  try {
    const stored = localStorage.getItem('pet-shop-signin-history')
    if (stored) return JSON.parse(stored)
  } catch (e) {}
  return []
}

function saveSignInHistory(history) {
  try {
    localStorage.setItem('pet-shop-signin-history', JSON.stringify(history))
  } catch (e) {}
}

function isCouponValid(coupon) {
  const now = new Date()
  const validUntil = new Date(coupon.validUntil)
  return now <= validUntil && !coupon.used
}

export const useCouponStore = defineStore('coupons', () => {
  const myCoupons = ref(loadMyCoupons())
  const signInHistory = ref(loadSignInHistory())

  // 获取可领取的优惠券
  const availableCouponsList = computed(() => {
    const now = new Date()
    return availableCoupons.filter(coupon => {
      const validUntil = new Date(coupon.validUntil)
      // 未过期且未领取
      const notClaimed = !myCoupons.value.some(mc => mc.id === coupon.id)
      return now <= validUntil && notClaimed
    })
  })

  // 获取已领取的优惠券
  const claimedCoupons = computed(() => {
    return myCoupons.value.filter(coupon => isCouponValid(coupon))
  })

  // 获取已使用的优惠券
  const usedCoupons = computed(() => {
    return myCoupons.value.filter(coupon => coupon.used)
  })

  // 检查今天是否已签到
  const hasSignInToday = computed(() => {
    const today = new Date().toDateString()
    return signInHistory.value.includes(today)
  })

  // 获取连续签到天数
  const consecutiveSignInDays = computed(() => {
    if (signInHistory.value.length === 0) return 0
    
    // 按日期排序
    const sortedDates = [...signInHistory.value].sort((a, b) => {
      return new Date(b) - new Date(a)
    })
    
    let count = 0
    let currentDate = new Date()
    
    // 检查是否包含今天
    if (!sortedDates.includes(currentDate.toDateString())) {
      currentDate = new Date(Date.now() - 86400000) // 昨天
    }
    
    // 计算连续天数
    while (sortedDates.includes(currentDate.toDateString())) {
      count++
      currentDate = new Date(currentDate.getTime() - 86400000)
    }
    
    return count
  })

  // 签到
  function signIn() {
    const today = new Date().toDateString()
    if (signInHistory.value.includes(today)) {
      return { success: false, message: '今天已经签到过了' }
    }
    
    signInHistory.value.unshift(today)
    saveSignInHistory(signInHistory.value)
    
    // 签到奖励：随机优惠券或积分
    const reward = Math.random() > 0.5 ? '积分' : '优惠券'
    return { 
      success: true, 
      message: '签到成功',
      reward,
      days: consecutiveSignInDays.value
    }
  }

  // 领取优惠券
  function claimCoupon(couponId) {
    const couponTemplate = availableCoupons.find(c => c.id === couponId)
    if (!couponTemplate) {
      return { success: false, message: '优惠券不存在' }
    }
    
    if (myCoupons.value.some(c => c.id === couponId)) {
      return { success: false, message: '您已领取过该优惠券' }
    }
    
    myCoupons.value.push({
      ...couponTemplate,
      claimedAt: new Date().toLocaleString('zh-CN'),
      used: false,
      usedAt: null,
      orderId: null,
    })
    
    saveMyCoupons(myCoupons.value)
    return { success: true, message: '领取成功' }
  }

  // 使用优惠券
  function useCoupon(couponId, orderId) {
    const coupon = myCoupons.value.find(c => c.id === couponId)
    if (coupon && !coupon.used) {
      coupon.used = true
      coupon.usedAt = new Date().toLocaleString('zh-CN')
      coupon.orderId = orderId
      saveMyCoupons(myCoupons.value)
      return { success: true }
    }
    return { success: false, message: '优惠券不可用' }
  }

  // 检查优惠券是否可用于指定商品
  function canUseCoupon(couponId, cartItems, subtotal) {
    const coupon = myCoupons.value.find(c => c.id === couponId)
    if (!coupon || coupon.used) return { valid: false, reason: '优惠券不可用' }
    
    // 检查有效期
    const now = new Date()
    const validUntil = new Date(coupon.validUntil)
    if (now > validUntil) return { valid: false, reason: '优惠券已过期' }
    
    // 检查最低消费
    if (subtotal < coupon.minSpend) {
      return { valid: false, reason: `满${coupon.minSpend}元可用` }
    }
    
    // 检查适用分类
    if (coupon.category !== 'all') {
      const hasValidItem = cartItems.some(item => {
        const product = item
        return product.category === coupon.category || 
               product.petType === coupon.category ||
               product.petType === 'all'
      })
      if (!hasValidItem) {
        return { valid: false, reason: '该优惠券不适用于购物车中的商品' }
      }
    }
    
    return { valid: true }
  }

  // 计算优惠券优惠金额
  function calculateDiscount(couponId, subtotal) {
    const coupon = myCoupons.value.find(c => c.id === couponId)
    if (!coupon) return 0
    
    if (coupon.type === 'minus') {
      return coupon.value
    } else if (coupon.type === 'discount') {
      return Math.round(subtotal * (coupon.value / 100) * 10) / 10
    }
    return 0
  }

  // 获取适用于当前购物车的最优优惠券
  function getBestCoupon(cartItems, subtotal) {
    const validCoupons = claimedCoupons.value.filter(coupon => {
      const check = canUseCoupon(coupon.id, cartItems, subtotal)
      return check.valid
    })
    
    if (validCoupons.length === 0) return null
    
    // 选择优惠最大的
    let bestCoupon = validCoupons[0]
    let maxDiscount = calculateDiscount(bestCoupon.id, subtotal)
    
    validCoupons.forEach(coupon => {
      const discount = calculateDiscount(coupon.id, subtotal)
      if (discount > maxDiscount) {
        maxDiscount = discount
        bestCoupon = coupon
      }
    })
    
    return bestCoupon
  }

  return {
    myCoupons,
    availableCouponsList,
    claimedCoupons,
    usedCoupons,
    signInHistory,
    hasSignInToday,
    consecutiveSignInDays,
    signIn,
    claimCoupon,
    useCoupon,
    canUseCoupon,
    calculateDiscount,
    getBestCoupon,
  }
})