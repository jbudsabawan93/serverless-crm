<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRoute, useRouter, RouterLink } from 'vue-router'
import DashboardLayout from '../components/DashboardLayout.vue'
import SubmitButton from '../components/SubmitButton.vue'
import { apiFetch } from '../api'

const route = useRoute()
const router = useRouter()

interface Order {
  orderId: string
  orderNumber: string
  productName: string
  price: number
  amount: number
  total: number
  orderDate: string
}

const order = ref<Order>({
  orderId: '',
  orderNumber: '',
  productName: '',
  price: 0,
  amount: 0,
  total: 0,
  orderDate: ''
})

const isLoading = ref(true)
const error = ref<string | null>(null)

const calculateTotal = () => {
  order.value.total = order.value.price * order.value.amount
}

const fetchOrder = async () => {
  try {
    isLoading.value = true
    error.value = null
    
    const response = await apiFetch('/orders')
    if (!response.ok) throw new Error('Network response was not ok')
    const orders = await response.json()
    
    const foundOrder = orders.find((item: any) => item.order_id === route.params.id)
    
    if (foundOrder) {
      order.value = {
        orderId: foundOrder.order_id || '',
        orderNumber: foundOrder.order_number || '',
        productName: foundOrder.product_name || '',
        price: foundOrder.price || 0,
        amount: foundOrder.amount || 0,
        total: foundOrder.total || 0,
        orderDate: foundOrder.order_date ? new Date(foundOrder.order_date).toISOString().split('T')[0] : ''
      }
    } else {
      throw new Error('Order not found')
    }

  } catch (err) {
    error.value = err instanceof Error ? err.message : 'Failed to fetch order'
  } finally {
    isLoading.value = false
  }
}

const handleSubmit = async () => {
  try {
    const response = await apiFetch('/orders', {
      method: 'PUT',
      body: JSON.stringify({
        order_id: order.value.orderId,
        order_number: order.value.orderNumber,
        product_name: order.value.productName,
        price: order.value.price,
        amount: order.value.amount,
        total: order.value.total,
        order_date: order.value.orderDate
      })
    })
    
    if (!response.ok) throw new Error('Network response was not ok')
    const data = await response.json()

    if (data.status === 'success') {
      router.push('/orders')
    } else {
      throw new Error(data.error || 'Failed to update order')
    }
  } catch (err) {
    error.value = err instanceof Error ? err.message : 'Failed to update order'
  }
}

onMounted(() => {
  fetchOrder()
})
</script>

<template>
  <DashboardLayout>
    <div class="customers-page">
      <div class="back-button-container">
        <RouterLink to="/orders/" class="back-button">
          <i class="fas fa-chevron-left"></i> BACK
        </RouterLink>
      </div>
      <div class="edit-order">
        <h1>Edit Order</h1>
        
        <div v-if="isLoading" class="loading">
          Loading...
        </div>

        <div v-else-if="error" class="error-message">
          {{ error }}
          <button @click="fetchOrder" class="retry-button">
            Try Again
          </button>
        </div>

        <div v-else class="form-container">
          <form @submit.prevent>
            <div class="form-table">
              <div class="form-group">
                <label for="orderId">Order ID</label>
                <input 
                  type="text" 
                  id="orderId"
                  v-model="order.orderId"
                  readonly
                  class="readonly-input"
                >
              </div>

              <div class="form-group">
                <label for="orderNumber">Order Number</label>
                <input 
                  type="text" 
                  id="orderNumber"
                  v-model="order.orderNumber"
                  required
                >
              </div>

              <div class="form-group">
                <label for="productName">Product Name</label>
                <input 
                  type="text" 
                  id="productName"
                  v-model="order.productName"
                  required
                >
              </div>

              <div class="form-group">
                <label for="price">Price</label>
                <input 
                  type="number" 
                  id="price"
                  v-model="order.price"
                  @input="calculateTotal"
                  min="0"
                  step="0.01"
                  required
                >
              </div>

              <div class="form-group">
                <label for="amount">Amount</label>
                <input 
                  type="number" 
                  id="amount"
                  v-model="order.amount"
                  @input="calculateTotal"
                  min="1"
                  required
                >
              </div>

              <div class="form-group">
                <label for="total">Total</label>
                <input 
                  type="number" 
                  id="total"
                  v-model="order.total"
                  readonly
                  class="readonly-input"
                >
              </div>
              <div class="form-group">
                <label for="orderDate">Order Date</label>
                <input 
                  type="date" 
                  id="orderDate"
                  v-model="order.orderDate"
                  required
                >
              </div>
            </div>
            
            <div class="submit-container">
              <SubmitButton 
                :onSubmit="handleSubmit"
                redirectTo="/orders"
              />
            </div>
          </form>
        </div>
      </div>
    </div>
  </DashboardLayout>
</template>

<style scoped>
.edit-order {
  padding: 28px 32px;
  background: white;
  border-radius: 16px;
  box-shadow: 0 8px 24px rgba(30, 45, 64, 0.07);
  overflow: auto;
}

.form-container .form-table {
  display: flex;
  gap: 10px;
}

.form-group {
  margin-bottom: 15px;
  width: calc(100% / 6);
}

h1 {
  margin: 0 0 1.75rem;
  text-align: center;
  font-size: 1.5rem;
  font-weight: 700;
  color: #1E2D40;
}

label {
  display: block;
  margin-bottom: 6px;
  font-size: 0.82rem;
  font-weight: 600;
  color: #1E2D40;
}

input {
  width: 100%;
  padding: 10px 12px;
  border: 1px solid #e4e8ee;
  border-radius: 10px;
  font-size: 0.9rem;
  background: #f7f9fc;
}

.readonly-input {
  background-color: #f5f5f5;
  cursor: not-allowed;
}

.submit-container {
  margin-top: 20px;
  text-align: right;
}

.loading, .error-message {
  text-align: center;
  padding: 40px;
  background: white;
  border-radius: 16px;
  box-shadow: 0 8px 24px rgba(30, 45, 64, 0.07);
  font-size: 0.95rem;
}

.error-message {
  color: #dc3545;
}

.retry-button {
  display: block;
  margin: 10px auto 0;
  padding: 8px 16px;
  background-color: #4382D0;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
}

.retry-button:hover {
  background-color: #316eb9;
}
</style> 