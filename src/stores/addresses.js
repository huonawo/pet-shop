import { defineStore } from 'pinia'
import { ref, computed } from 'vue'

function loadAddresses() {
  try {
    const stored = localStorage.getItem('pet-shop-addresses')
    if (stored) return JSON.parse(stored)
  } catch (e) {
    // ignore
  }
  return []
}

function saveAddresses(addresses) {
  try {
    localStorage.setItem('pet-shop-addresses', JSON.stringify(addresses))
  } catch (e) {
    // ignore
  }
}

// 生成唯一ID
function generateId() {
  return 'ADDR-' + Date.now().toString(36) + Math.random().toString(36).substr(2, 9)
}

export const useAddressStore = defineStore('addresses', () => {
  const addresses = ref(loadAddresses())
  const defaultAddressId = ref(
    JSON.parse(localStorage.getItem('pet-shop-default-address') || 'null')
  )

  function addAddress(address) {
    const newAddress = {
      id: generateId(),
      ...address,
      isDefault: addresses.value.length === 0, // 第一个地址默认为默认地址
      createdAt: new Date().toLocaleString('zh-CN'),
    }
    addresses.value.push(newAddress)
    
    if (newAddress.isDefault) {
      defaultAddressId.value = newAddress.id
    }
    
    saveAddresses(addresses.value)
    saveDefaultAddress()
    return { success: true, address: newAddress }
  }

  function updateAddress(id, updates) {
    const index = addresses.value.findIndex(a => a.id === id)
    if (index !== -1) {
      addresses.value[index] = { ...addresses.value[index], ...updates }
      saveAddresses(addresses.value)
      return { success: true }
    }
    return { success: false, message: '地址不存在' }
  }

  function deleteAddress(id) {
    const index = addresses.value.findIndex(a => a.id === id)
    if (index !== -1) {
      addresses.value.splice(index, 1)
      
      // 如果删除的是默认地址，将第一个设为默认
      if (defaultAddressId.value === id) {
        if (addresses.value.length > 0) {
          setDefaultAddress(addresses.value[0].id)
        } else {
          defaultAddressId.value = null
        }
      }
      
      saveAddresses(addresses.value)
      saveDefaultAddress()
      return { success: true }
    }
    return { success: false, message: '地址不存在' }
  }

  function setDefaultAddress(id) {
    addresses.value.forEach(addr => {
      addr.isDefault = addr.id === id
    })
    defaultAddressId.value = id
    saveAddresses(addresses.value)
    saveDefaultAddress()
  }

  function saveDefaultAddress() {
    localStorage.setItem('pet-shop-default-address', JSON.stringify(defaultAddressId.value))
  }

  function getAddressById(id) {
    return addresses.value.find(a => a.id === id)
  }

  const defaultAddress = computed(() => {
    if (defaultAddressId.value) {
      return addresses.value.find(a => a.id === defaultAddressId.value) || addresses.value[0]
    }
    return addresses.value[0] || null
  })

  const addressCount = computed(() => addresses.value.length)

  return {
    addresses,
    defaultAddressId,
    defaultAddress,
    addressCount,
    addAddress,
    updateAddress,
    deleteAddress,
    setDefaultAddress,
    getAddressById,
  }
})