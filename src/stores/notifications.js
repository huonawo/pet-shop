import { defineStore } from 'pinia'
import { ref, computed } from 'vue'

function loadNotifications() {
  try {
    const stored = localStorage.getItem('pet-shop-notifications')
    if (stored) return JSON.parse(stored)
  } catch (e) {
    // ignore
  }
  return []
}

function saveNotifications(notifications) {
  try {
    localStorage.setItem('pet-shop-notifications', JSON.stringify(notifications))
  } catch (e) {
    // ignore
  }
}

export const useNotificationStore = defineStore('notifications', () => {
  const notifications = ref(loadNotifications())

  // 添加通知
  function addNotification(type, title, message, relatedId = null) {
    const notification = {
      id: 'NOTIF-' + Date.now().toString(36) + Math.random().toString(36).substr(2, 9),
      type, // order, system, promotion, review
      title,
      message,
      relatedId,
      read: false,
      createdAt: new Date().toLocaleString('zh-CN'),
    }
    
    notifications.value.unshift(notification)
    
    // 最多保存100条通知
    if (notifications.value.length > 100) {
      notifications.value = notifications.value.slice(0, 100)
    }
    
    saveNotifications(notifications.value)
    return notification
  }

  // 标记为已读
  function markAsRead(notificationId) {
    const notification = notifications.value.find(n => n.id === notificationId)
    if (notification) {
      notification.read = true
      saveNotifications(notifications.value)
    }
  }

  // 全部标记为已读
  function markAllAsRead() {
    notifications.value.forEach(n => {
      n.read = true
    })
    saveNotifications(notifications.value)
  }

  // 删除通知
  function deleteNotification(notificationId) {
    const index = notifications.value.findIndex(n => n.id === notificationId)
    if (index !== -1) {
      notifications.value.splice(index, 1)
      saveNotifications(notifications.value)
    }
  }

  // 清空所有通知
  function clearAll() {
    notifications.value = []
    saveNotifications(notifications.value)
  }

  // 未读数量
  const unreadCount = computed(() => {
    return notifications.value.filter(n => !n.read).length
  })

  // 获取通知图标
  function getNotificationIcon(type) {
    const icons = {
      order: '📦',
      system: '🔔',
      promotion: '🎁',
      review: '⭐',
      success: '✅',
      warning: '⚠️',
      error: '❌',
    }
    return icons[type] || '🔔'
  }

  // 创建订单通知
  function notifyOrderCreated(orderId) {
    return addNotification(
      'order',
      '订单已提交',
      `您的订单 #${orderId} 已成功提交，请等待发货`,
      orderId
    )
  }

  // 创建发货通知
  function notifyOrderShipped(orderId, tracking) {
    return addNotification(
      'order',
      '订单已发货',
      `您的订单 #${orderId} 已发货，快递单号: ${tracking}`,
      orderId
    )
  }

  // 创建退款通知
  function notifyReturnApproved(orderId) {
    return addNotification(
      'order',
      '退款申请已通过',
      `您的订单 #${orderId} 退款申请已通过，退款将原路返回`,
      orderId
    )
  }

  // 创建系统通知
  function notifySystem(title, message) {
    return addNotification('system', title, message)
  }

  return {
    notifications,
    unreadCount,
    addNotification,
    markAsRead,
    markAllAsRead,
    deleteNotification,
    clearAll,
    getNotificationIcon,
    notifyOrderCreated,
    notifyOrderShipped,
    notifyReturnApproved,
    notifySystem,
  }
})