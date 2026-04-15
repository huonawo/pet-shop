<script setup>
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import { useAddressStore } from '../stores/addresses'
import { useAuthStore } from '../stores/auth'
import GuestRestrictModal from '../components/GuestRestrictModal.vue'

const router = useRouter()
const addressStore = useAddressStore()
const authStore = useAuthStore()

const showGuestModal = ref(false)
const showAddModal = ref(false)
const showEditModal = ref(false)
const editingAddress = ref(null)

const form = ref({
  name: '',
  phone: '',
  province: '',
  city: '',
  district: '',
  address: '',
  isDefault: false,
})

const formErrors = ref({})

const isEmpty = computed(() => addressStore.addresses.length === 0)

function validateForm() {
  const errors = {}
  if (!form.value.name.trim()) errors.name = '请输入收货人姓名'
  if (!form.value.phone.trim()) errors.phone = '请输入手机号码'
  else if (!/^1[3-9]\d{9}$/.test(form.value.phone)) errors.phone = '请输入有效的手机号'
  if (!form.value.province.trim()) errors.province = '请输入省份'
  if (!form.value.city.trim()) errors.city = '请输入城市'
  if (!form.value.address.trim()) errors.address = '请输入详细地址'
  formErrors.value = errors
  return Object.keys(errors).length === 0
}

function openAddModal() {
  form.value = {
    name: '',
    phone: '',
    province: '',
    city: '',
    district: '',
    address: '',
    isDefault: addressStore.addresses.length === 0,
  }
  formErrors.value = {}
  showAddModal.value = true
}

function openEditModal(address) {
  editingAddress.value = address
  form.value = {
    name: address.name,
    phone: address.phone,
    province: address.province || '',
    city: address.city,
    district: address.district || '',
    address: address.address,
    isDefault: address.isDefault,
  }
  formErrors.value = {}
  showEditModal.value = true
}

function handleAdd() {
  if (!validateForm()) return
  addressStore.addAddress({
    name: form.value.name,
    phone: form.value.phone,
    province: form.value.province,
    city: form.value.city,
    district: form.value.district,
    address: form.value.address,
    isDefault: form.value.isDefault,
  })
  showAddModal.value = false
}

function handleEdit() {
  if (!validateForm()) return
  addressStore.updateAddress(editingAddress.value.id, {
    name: form.value.name,
    phone: form.value.phone,
    province: form.value.province,
    city: form.value.city,
    district: form.value.district,
    address: form.value.address,
    isDefault: form.value.isDefault,
  })
  showEditModal.value = false
  editingAddress.value = null
}

function handleDelete(addressId) {
  if (confirm('确定要删除该地址吗？')) {
    addressStore.deleteAddress(addressId)
  }
}

function handleSetDefault(addressId) {
  addressStore.setDefaultAddress(addressId)
}

function goBack() {
  router.back()
}
</script>

<template>
  <div class="min-h-screen">
    <div class="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div class="flex items-center gap-3 mb-8">
        <button
          class="text-text-muted hover:text-primary transition-colors"
          @click="goBack"
        >
          ← 返回
        </button>
        <h1 class="text-3xl md:text-4xl font-bold text-text-dark font-pet">
          📍 收货地址管理
        </h1>
      </div>

      <div
        v-if="!authStore.isLoggedIn"
        class="bg-amber-50 border border-amber-200 rounded-2xl p-6 text-center"
      >
        <span class="text-4xl block mb-3">🔒</span>
        <h3 class="text-lg font-semibold text-amber-800 mb-2">登录后管理地址</h3>
        <p class="text-amber-700 mb-4">登录后可管理您的收货地址</p>
        <router-link
          to="/login"
          class="inline-block px-6 py-2.5 bg-primary hover:bg-primary-dark text-white font-semibold rounded-full transition-all"
        >
          立即登录
        </router-link>
      </div>

      <div v-else class="mb-6 w-full">
        <button
          class="px-8 py-4 bg-primary hover:bg-primary-dark text-white font-semibold rounded-xl shadow-md hover:shadow-lg transition-all flex items-center gap-2 w-full justify-center"
          @click="openAddModal"
        >
          <svg class="w-5 h-5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
          </svg>
          <span>新增收货地址</span>
        </button>
      </div>

      <div v-if="authStore.isLoggedIn && isEmpty" class="text-center py-20">
        <span class="text-7xl block mb-6">📍</span>
        <h2 class="text-2xl font-bold text-text-dark mb-3">还没有收货地址</h2>
        <p class="text-text-muted mb-8">点击上方按钮添加收货地址</p>
      </div>

      <div v-else-if="authStore.isLoggedIn" class="space-y-4">
        <div
          v-for="address in addressStore.addresses"
          :key="address.id"
          class="bg-card-bg rounded-2xl p-8 shadow-sm hover:shadow-lg transition-all relative"
          :class="{ 'ring-2 ring-primary': address.isDefault }"
        >
          <div
            v-if="address.isDefault"
            class="absolute -top-2 -right-2 bg-primary text-white text-xs px-3 py-1 rounded-full font-medium"
          >
            默认
          </div>

          <div class="flex items-start justify-between">
            <div class="flex-1">
              <div class="flex items-center gap-4 mb-4">
                <span class="text-xl font-bold text-text-dark">{{ address.name }}</span>
                <span class="text-lg text-text-muted">{{ address.phone }}</span>
              </div>
              <p class="text-text-muted truncate">
                {{ address.province }}{{ address.city }}{{ address.district }} {{ address.address }}
              </p>
            </div>

            <div class="flex flex-col gap-3 ml-6">
              <button
                v-if="!address.isDefault"
                class="text-base text-primary hover:underline"
                @click="handleSetDefault(address.id)"
              >
                设为默认
              </button>
              <button
                class="text-base text-text-muted hover:text-primary"
                @click="openEditModal(address)"
              >
                编辑
              </button>
              <button
                class="text-base text-text-muted hover:text-red-500"
                @click="handleDelete(address.id)"
              >
                删除
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>

    <div
      v-if="showAddModal"
      class="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
      @click.self="showAddModal = false"
    >
      <div class="bg-card-bg rounded-2xl p-6 w-full max-w-md max-h-[90vh] overflow-y-auto">
        <h2 class="text-xl font-bold text-text-dark mb-6">新增收货地址</h2>
        
        <div class="space-y-4">
          <div>
            <label class="block text-sm font-medium text-text-dark mb-1">收货人姓名 *</label>
            <input
              v-model="form.name"
              type="text"
              placeholder="请输入收货人姓名"
              class="w-full px-4 py-3 rounded-xl border-2 transition-colors focus:outline-none"
              :class="formErrors.name ? 'border-accent bg-accent/5' : 'border-border focus:border-primary'"
            />
            <p v-if="formErrors.name" class="text-accent text-sm mt-1">{{ formErrors.name }}</p>
          </div>
          
          <div>
            <label class="block text-sm font-medium text-text-dark mb-1">手机号码 *</label>
            <input
              v-model="form.phone"
              type="tel"
              placeholder="请输入11位手机号"
              class="w-full px-4 py-3 rounded-xl border-2 transition-colors focus:outline-none"
              :class="formErrors.phone ? 'border-accent bg-accent/5' : 'border-border focus:border-primary'"
            />
            <p v-if="formErrors.phone" class="text-accent text-sm mt-1">{{ formErrors.phone }}</p>
          </div>
          
          <div class="grid grid-cols-3 gap-4">
            <div>
              <label class="block text-sm font-medium text-text-dark mb-1">省份 *</label>
              <input
                v-model="form.province"
                type="text"
                placeholder="省份"
                class="w-full px-3 py-2 rounded-lg border-2 focus:outline-none"
                :class="formErrors.province ? 'border-accent' : 'border-border focus:border-primary'"
              />
            </div>
            <div>
              <label class="block text-sm font-medium text-text-dark mb-1">城市 *</label>
              <input
                v-model="form.city"
                type="text"
                placeholder="城市"
                class="w-full px-3 py-2 rounded-lg border-2 focus:outline-none"
                :class="formErrors.city ? 'border-accent' : 'border-border focus:border-primary'"
              />
            </div>
            <div>
              <label class="block text-sm font-medium text-text-dark mb-1">区县</label>
              <input
                v-model="form.district"
                type="text"
                placeholder="区县"
                class="w-full px-3 py-2 rounded-lg border-2 border-border focus:border-primary focus:outline-none"
              />
            </div>
          </div>
          
          <div>
            <label class="block text-sm font-medium text-text-dark mb-1">详细地址 *</label>
            <textarea
              v-model="form.address"
              rows="2"
              placeholder="请输入街道、门牌号等详细地址"
              class="w-full px-4 py-3 rounded-xl border-2 transition-colors focus:outline-none resize-none"
              :class="formErrors.address ? 'border-accent bg-accent/5' : 'border-border focus:border-primary'"
            />
            <p v-if="formErrors.address" class="text-accent text-sm mt-1">{{ formErrors.address }}</p>
          </div>
          
          <label class="flex items-center gap-3 cursor-pointer">
            <input
              v-model="form.isDefault"
              type="checkbox"
              class="w-5 h-5 rounded text-primary focus:ring-primary"
            />
            <span class="text-text-dark">设为默认地址</span>
          </label>
        </div>

        <div class="flex gap-3 mt-6">
          <button
            class="flex-1 py-3 bg-surface-alt text-text-dark font-semibold rounded-xl hover:bg-border transition-colors"
            @click="showAddModal = false"
          >
            取消
          </button>
          <button
            class="flex-1 py-3 bg-primary text-white font-semibold rounded-xl hover:bg-primary-dark transition-colors"
            @click="handleAdd"
          >
            保存
          </button>
        </div>
      </div>
    </div>

    <div
      v-if="showEditModal"
      class="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
      @click.self="showEditModal = false"
    >
      <div class="bg-card-bg rounded-2xl p-6 w-full max-w-md max-h-[90vh] overflow-y-auto">
        <h2 class="text-xl font-bold text-text-dark mb-6">编辑收货地址</h2>
        
        <div class="space-y-4">
          <div>
            <label class="block text-sm font-medium text-text-dark mb-1">收货人姓名 *</label>
            <input
              v-model="form.name"
              type="text"
              placeholder="请输入收货人姓名"
              class="w-full px-4 py-3 rounded-xl border-2 transition-colors focus:outline-none"
              :class="formErrors.name ? 'border-accent bg-accent/5' : 'border-border focus:border-primary'"
            />
            <p v-if="formErrors.name" class="text-accent text-sm mt-1">{{ formErrors.name }}</p>
          </div>
          
          <div>
            <label class="block text-sm font-medium text-text-dark mb-1">手机号码 *</label>
            <input
              v-model="form.phone"
              type="tel"
              placeholder="请输入11位手机号"
              class="w-full px-4 py-3 rounded-xl border-2 transition-colors focus:outline-none"
              :class="formErrors.phone ? 'border-accent bg-accent/5' : 'border-border focus:border-primary'"
            />
            <p v-if="formErrors.phone" class="text-accent text-sm mt-1">{{ formErrors.phone }}</p>
          </div>
          
          <div class="grid grid-cols-3 gap-4">
            <div>
              <label class="block text-sm font-medium text-text-dark mb-1">省份 *</label>
              <input
                v-model="form.province"
                type="text"
                placeholder="省份"
                class="w-full px-3 py-2 rounded-lg border-2 focus:outline-none"
                :class="formErrors.province ? 'border-accent' : 'border-border focus:border-primary'"
              />
            </div>
            <div>
              <label class="block text-sm font-medium text-text-dark mb-1">城市 *</label>
              <input
                v-model="form.city"
                type="text"
                placeholder="城市"
                class="w-full px-3 py-2 rounded-lg border-2 focus:outline-none"
                :class="formErrors.city ? 'border-accent' : 'border-border focus:border-primary'"
              />
            </div>
            <div>
              <label class="block text-sm font-medium text-text-dark mb-1">区县</label>
              <input
                v-model="form.district"
                type="text"
                placeholder="区县"
                class="w-full px-3 py-2 rounded-lg border-2 border-border focus:border-primary focus:outline-none"
              />
            </div>
          </div>
          
          <div>
            <label class="block text-sm font-medium text-text-dark mb-1">详细地址 *</label>
            <textarea
              v-model="form.address"
              rows="2"
              placeholder="请输入街道、门牌号等详细地址"
              class="w-full px-4 py-3 rounded-xl border-2 transition-colors focus:outline-none resize-none"
              :class="formErrors.address ? 'border-accent bg-accent/5' : 'border-border focus:border-primary'"
            />
            <p v-if="formErrors.address" class="text-accent text-sm mt-1">{{ formErrors.address }}</p>
          </div>
          
          <label class="flex items-center gap-3 cursor-pointer">
            <input
              v-model="form.isDefault"
              type="checkbox"
              class="w-5 h-5 rounded text-primary focus:ring-primary"
            />
            <span class="text-text-dark">设为默认地址</span>
          </label>
        </div>

        <div class="flex gap-3 mt-6">
          <button
            class="flex-1 py-3 bg-surface-alt text-text-dark font-semibold rounded-xl hover:bg-border transition-colors"
            @click="showEditModal = false"
          >
            取消
          </button>
          <button
            class="flex-1 py-3 bg-primary text-white font-semibold rounded-xl hover:bg-primary-dark transition-colors"
            @click="handleEdit"
          >
            保存
          </button>
        </div>
      </div>
    </div>

    <GuestRestrictModal v-model:show="showGuestModal" message="请先登录后再管理地址" />
  </div>
</template>
