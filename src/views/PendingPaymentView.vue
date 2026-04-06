<script setup>
import { useOrderStore } from '../stores/orders'

const orderStore = useOrderStore()
</script>

<template>
  <div class="min-h-screen">
    <div class="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <!-- Page Header -->
      <div class="flex items-center justify-between mb-8">
        <div>
          <h1 class="text-3xl md:text-4xl font-bold text-text-dark font-pet mb-2">
            💰 待付款
          </h1>
          <p class="text-text-muted">
            共 {{ orderStore.pendingOrders.length }} 笔订单待付款
          </p>
        </div>
        <router-link
          to="/orders"
          class="text-text-muted hover:text-primary transition-colors text-sm flex items-center gap-1"
        >
          ← 返回订单中心
        </router-link>
      </div>

      <!-- Empty State -->
      <div v-if="orderStore.pendingOrders.length === 0" class="text-center py-20">
        <span class="text-7xl block mb-6">💰</span>
        <h2 class="text-2xl font-bold text-text-dark mb-3">没有待付款订单</h2>
        <p class="text-text-muted mb-8">所有订单均已付款</p>
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
          v-for="order in orderStore.pendingOrders"
          :key="order.id"
          class="bg-white rounded-2xl p-6 shadow-sm hover:shadow-md transition-shadow"
        >
          <!-- Order Header -->
          <div class="flex items-center justify-between mb-4 pb-4 border-b border-warm-bg-alt">
            <div>
              <span class="font-mono text-sm text-text-muted">订单号: {{ order.id }}</span>
              <p class="text-xs text-text-light mt-1">{{ order.createdAt }}</p>
            </div>
            <span class="px-3 py-1 bg-warning/20 text-warning rounded-full text-xs font-bold">
              待付款
            </span>
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
              <p>收货地址：{{ order.address }}</p>
              <p>联系电话：{{ order.phone }}</p>
            </div>
            <div class="flex items-center gap-3">
              <router-link
                :to="`/orders/shipped/${order.id}`"
                class="px-5 py-3 bg-primary/10 hover:bg-primary/20 text-primary font-semibold rounded-xl transition-all duration-300"
              >
                查看详情
              </router-link>
              <div class="text-right">
                <p class="text-sm text-text-muted">应付金额</p>
                <p class="text-2xl font-bold text-primary">¥{{ order.total.toFixed(2) }}</p>
              </div>
              <router-link
                :to="`/checkout?orderId=${order.id}`"
                class="px-6 py-3 bg-primary hover:bg-primary-dark text-white font-semibold rounded-xl shadow-md hover:shadow-lg transition-all duration-300 text-center"
              >
                立即付款
              </router-link>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
