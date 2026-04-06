import { defineStore } from 'pinia'
import { ref, computed } from 'vue'

// 初始模拟数据（仅在 localStorage 为空时使用）
const initialOrders = []

function loadShippingInfo() {
  try {
    const stored = localStorage.getItem('pet-shop-shipping-info')
    if (stored) {
      const data = JSON.parse(stored)
      data.name = data.name ?? ''
      data.phone = data.phone ?? ''
      data.address = data.address ?? ''
      data.city = data.city ?? ''
      data.zipCode = data.zipCode ?? ''
      data.remark = data.remark ?? ''
      return data
    }
  } catch (e) {
    // ignore
  }
  return { name: '', phone: '', address: '', city: '', zipCode: '', remark: '' }
}

function loadOrders() {
  try {
    const stored = localStorage.getItem('pet-shop-orders')
    if (stored) {
      return JSON.parse(stored)
    }
  } catch (e) {
    // ignore
  }
  return initialOrders
}

function saveOrders(orders) {
  try {
    localStorage.setItem('pet-shop-orders', JSON.stringify(orders))
  } catch (e) {
    // ignore
  }
}



export const useOrderStore = defineStore('orders', () => {
  const orders = ref(loadOrders())
  const shippingInfo = ref(loadShippingInfo())

  const pendingOrders = computed(() => orders.value.filter(o => o.status === 'pending'))
  const shippedOrders = computed(() => orders.value.filter(o => o.status === 'shipped'))
  const returningOrders = computed(() => orders.value.filter(o => o.status === 'returning'))

  function persist() {
    saveOrders(orders.value)
  }

  function addOrder(order) {
    orders.value.unshift(order)
    persist()
  }

  function payOrder(orderId) {
    const order = orders.value.find(o => o.id === orderId)
    if (order) {
      order.status = 'shipped'
      order.shippedAt = new Date().toLocaleString('zh-CN')
      order.tracking = 'SF' + Date.now().toString().slice(-10)
      persist()
    }
  }

  function confirmReceive(orderId) {
    const order = orders.value.find(o => o.id === orderId)
    if (order) {
      order.status = 'completed'
      persist()
    }
  }

  function persistShippingInfo() {
    saveShippingInfo()
  }

  function saveShippingInfo() {
    try {
      localStorage.setItem('pet-shop-shipping-info', JSON.stringify(shippingInfo.value))
    } catch (e) {
      // ignore
    }
  }

  function updateShippingInfo(info) {
    shippingInfo.value = { ...shippingInfo.value, ...info }
    persistShippingInfo()
  }

  function $reset() {
    orders.value = []
    shippingInfo.value = { name: '', phone: '', address: '', city: '', zipCode: '', remark: '' }
    localStorage.removeItem('pet-shop-orders')
    localStorage.removeItem('pet-shop-shipping-info')
  }

  function applyReturn(orderId, reason) {
    const order = orders.value.find(o => o.id === orderId)
    if (order) {
      order.status = 'returning'
      order.returnReason = reason
      order.returnStatus = '审核中'
      order.returnAppliedAt = Date.now()
      persist()

      // Auto-resolve after 1-2 minutes (random)
      const resolveDelay = (60 + Math.random() * 60) * 1000
      setTimeout(() => {
        const o = orders.value.find(ord => ord.id === orderId)
        if (o && o.status === 'returning') {
          o.returnStatus = '退款/退货成功'
          o.returnResolvedAt = Date.now()
          persist()
        }
      }, resolveDelay)
    }
  }

  // Auto-resolve existing returning orders on load
  function initReturnTimers() {
    const now = Date.now()
    orders.value.forEach(order => {
      if (order.status === 'returning' && order.returnAppliedAt && !order.returnResolvedAt) {
        const elapsed = now - order.returnAppliedAt
        if (elapsed >= 120000) {
          // Already past 2 minutes, resolve immediately
          order.returnStatus = '退款/退货成功'
          order.returnResolvedAt = now
        } else {
          // Still within window, set remaining timer
          const remaining = (60 + Math.random() * 60) * 1000 - elapsed
          if (remaining > 0) {
            setTimeout(() => {
              const o = orders.value.find(ord => ord.id === order.id)
              if (o && o.status === 'returning' && !o.returnResolvedAt) {
                o.returnStatus = '退款/退货成功'
                o.returnResolvedAt = Date.now()
                persist()
              }
            }, remaining)
          }
        }
      }
    })
    persist()
  }

  initReturnTimers()

  return {
    orders,
    shippingInfo,
    pendingOrders,
    shippedOrders,
    returningOrders,
    addOrder,
    payOrder,
    confirmReceive,
    applyReturn,
    saveShippingInfo,
    updateShippingInfo,
  }
})
