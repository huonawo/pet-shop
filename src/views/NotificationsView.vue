<script setup>
import { computed, ref } from 'vue'
import { useRouter } from 'vue-router'
import { useNotificationStore } from '../stores/notifications'
import { useAuthStore } from '../stores/auth'
import GuestRestrictModal from '../components/GuestRestrictModal.vue'

const router = useRouter()
const notificationStore = useNotificationStore()
const authStore = useAuthStore()

const isEmpty = computed(() => notificationStore.notifications.length === 0)
const showGuestModal = ref(false)

function getNotificationIcon(type) {
  const icons = {
    order: '📦',
    system: '🔔',
    promotion: '🎁',
    reminder: '⏰',
  }
  return icons[type] || '📢'
}

function getNotificationColor(type) {
  const colors = {
    order: 'bg-primary/10 text-primary',
    system: 'bg-secondary/10 text-secondary',
    promotion: 'bg-accent/10 text-accent',
    reminder: 'bg-warning/10 text-warning',
  }
  return colors[type] || 'bg-gray-100 text-gray-700'
}

function formatTime(time) {
  const now = new Date()
  const date = new Date(time)
  const diff = now - date
  const minutes = Math.floor(diff / 60000)
  const hours = Math.floor(diff / 3600000)
  const days = Math.floor(diff / 86400000)

  if (minutes < 1) return '刚刚'
  if (minutes < 60) return `${minutes}分钟前`
  if (hours < 24) return `${hours}小时前`
  if (days < 7) return `${days}天前`
  return date.toLocaleDateString('zh-CN')
}

function handleNotificationClick(notification) {
  if (!notification.isRead) {
    notificationStore.markAsRead(notification.id)
  }
  if (notification.actionUrl) {
    router.push(notification.actionUrl)
  }
}

function handleMarkAllRead() {
  notificationStore.markAllAsRead()
}
</script>

<template>
  <div class="min-h-screen">
    <div class="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div class="flex items-center justify-between mb-8">
        <div>
          <h1 class="text-3xl md:text-4xl font-bold text-text-dark font-pet mb-2">
            🔔 消息通知
          </h1>
          <p class="text-text-muted">
            {{ notificationStore.unreadCount > 0 ? `${notificationStore.unreadCount} 条未读消息` : '暂无未读消息' }}
          </p>
        </div>
        <button
          v-if="notificationStore.unreadCount > 0"
          class="px-4 py-2 text-primary hover:text-primary-dark transition-colors text-sm"
          @click="handleMarkAllRead"
        >
          全部已读
        </button>
      </div>

      <div
        v-if="!authStore.isLoggedIn"
        class="bg-amber-50 border border-amber-200 rounded-2xl p-6 text-center"
      >
        <span class="text-4xl block mb-3">🔒</span>
        <h3 class="text-lg font-semibold text-amber-800 mb-2">登录后查看消息</h3>
        <p class="text-amber-700 mb-4">登录后可查看订单动态和系统通知</p>
        <router-link
          to="/login"
          class="inline-block px-6 py-2.5 bg-primary hover:bg-primary-dark text-white font-semibold rounded-full transition-all"
        >
          立即登录
        </router-link>
      </div>

      <div v-else-if="isEmpty" class="text-center py-20">
        <span class="text-7xl block mb-6">🔔</span>
        <h2 class="text-2xl font-bold text-text-dark mb-3">暂无消息</h2>
        <p class="text-text-muted mb-8">您还没有收到任何消息</p>
      </div>

      <div v-else class="space-y-3">
        <div
          v-for="notification in notificationStore.notifications"
          :key="notification.id"
          class="bg-card-bg rounded-2xl p-4 shadow-sm hover:shadow-md transition-all cursor-pointer"
          :class="{ 'opacity-60': notification.isRead }"
          @click="handleNotificationClick(notification)"
        >
          <div class="flex items-start gap-4">
            <div
              class="w-10 h-10 rounded-full flex items-center justify-center shrink-0 text-lg"
              :class="getNotificationColor(notification.type)"
            >
              {{ getNotificationIcon(notification.type) }}
            </div>
            <div class="flex-1 min-w-0">
              <div class="flex items-center justify-between mb-1">
                <h3 class="font-semibold text-text-dark text-sm">
                  {{ notification.title }}
                </h3>
                <span class="text-xs text-text-light">
                  {{ formatTime(notification.time) }}
                </span>
              </div>
              <p class="text-text-muted text-sm line-clamp-2">
                {{ notification.message }}
              </p>
              <div
                v-if="!notification.isRead"
                class="mt-2 flex items-center gap-2"
              >
                <span class="w-2 h-2 rounded-full bg-primary shrink-0"></span>
                <span class="text-xs text-primary">未读</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <GuestRestrictModal v-model:show="showGuestModal" message="请先登录后再查看消息" />
  </div>
</template>
