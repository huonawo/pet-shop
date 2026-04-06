import { createRouter, createWebHistory } from 'vue-router'

const routes = [
  {
    path: '/',
    name: 'Home',
    component: () => import('../views/HomeView.vue'),
  },
  {
    path: '/products',
    name: 'Products',
    component: () => import('../views/ProductsView.vue'),
  },
  {
    path: '/product/:id',
    name: 'ProductDetail',
    component: () => import('../views/ProductDetailView.vue'),
  },
  {
    path: '/cart',
    name: 'Cart',
    component: () => import('../views/CartView.vue'),
  },
  {
    path: '/checkout',
    name: 'Checkout',
    component: () => import('../views/CheckoutView.vue'),
  },
  {
    path: '/orders',
    name: 'Orders',
    component: () => import('../views/OrdersView.vue'),
  },
  {
    path: '/orders/pending',
    name: 'PendingPayment',
    component: () => import('../views/PendingPaymentView.vue'),
  },
  {
    path: '/orders/shipped',
    name: 'PendingDelivery',
    component: () => import('../views/PendingDeliveryView.vue'),
  },
  {
    path: '/orders/shipped/:orderId',
    name: 'OrderDetail',
    component: () => import('../views/OrderDetailView.vue'),
  },
  {
    path: '/orders/returns',
    name: 'Returns',
    component: () => import('../views/ReturnsView.vue'),
  },
  {
    path: '/about',
    name: 'About',
    component: () => import('../views/AboutView.vue'),
  },
  {
    path: '/login',
    name: 'Login',
    component: () => import('../views/LoginView.vue'),
  },
]

const router = createRouter({
  history: createWebHistory(),
  routes,
  scrollBehavior(to, from, savedPosition) {
    if (savedPosition) {
      return savedPosition
    }
    // 同路由但 query 变化时也滚动到顶部
    return { top: 0, behavior: 'smooth' }
  },
})

export default router
