import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { useCartStore } from './cart'
import { useOrderStore } from './orders'

function loadUsers() {
  try {
    const stored = localStorage.getItem('pet-shop-users')
    if (stored) return JSON.parse(stored)
  } catch (e) {
    // ignore
  }
  return []
}

function saveUsers(users) {
  try {
    localStorage.setItem('pet-shop-users', JSON.stringify(users))
  } catch (e) {
    // ignore
  }
}

function loadCurrentUser() {
  try {
    const stored = localStorage.getItem('pet-shop-current-user')
    if (stored) return JSON.parse(stored)
  } catch (e) {
    // ignore
  }
  return null
}

function saveCurrentUser(user) {
  try {
    if (user) {
      localStorage.setItem('pet-shop-current-user', JSON.stringify(user))
    } else {
      localStorage.removeItem('pet-shop-current-user')
    }
  } catch (e) {
    // ignore
  }
}

export const useAuthStore = defineStore('auth', () => {
  const users = ref(loadUsers())
  const currentUser = ref(loadCurrentUser())

  const isLoggedIn = computed(() => currentUser.value !== null)

  function register(username, password, phone) {
    if (users.value.find(u => u.username === username)) {
      return { success: false, message: '用户名已存在' }
    }
    const newUser = {
      id: `USER-${Date.now()}`,
      username,
      password,
      phone: phone || '',
      createdAt: new Date().toLocaleString('zh-CN'),
      orders: [],
      cart: [],
    }
    users.value.push(newUser)
    saveUsers(users.value)
    currentUser.value = { ...newUser }
    saveCurrentUser(currentUser.value)
    return { success: true, message: '注册成功' }
  }

  function login(username, password) {
    const user = users.value.find(u => u.username === username && u.password === password)
    if (!user) {
      return { success: false, message: '用户名或密码错误' }
    }
    currentUser.value = { ...user }
    saveCurrentUser(currentUser.value)
    return { success: true, message: '登录成功' }
  }

  function logout() {
    currentUser.value = null
    saveCurrentUser(null)
    
    // 退出登录时清除购物车、订单和收货信息
    const cartStore = useCartStore()
    const orderStore = useOrderStore()
    cartStore.$reset()
    orderStore.$reset()
  }

  function updateProfile(data) {
    if (!currentUser.value) return
    currentUser.value = { ...currentUser.value, ...data }
    saveCurrentUser(currentUser.value)
    const idx = users.value.findIndex(u => u.id === currentUser.value.id)
    if (idx !== -1) {
      users.value[idx] = { ...currentUser.value }
      saveUsers(users.value)
    }
  }

  return {
    users,
    currentUser,
    isLoggedIn,
    register,
    login,
    logout,
    updateProfile,
  }
})
