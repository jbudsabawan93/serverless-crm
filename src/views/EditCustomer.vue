<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRoute, useRouter, RouterLink } from 'vue-router'
import DashboardLayout from '../components/DashboardLayout.vue'
import SubmitButton from '../components/SubmitButton.vue'
import { apiFetch } from '../api'

const route = useRoute()
const router = useRouter()

interface Customer {
  customerId: string
  fullName: string
  address: string
  phone: string
  orderNumber: string
  date: string
}

const customer = ref<Customer>({
  customerId: '',
  fullName: '',
  address: '',
  phone: '',
  orderNumber: '',
  date: ''
})

const isLoading = ref(true)
const error = ref<string | null>(null)

const fetchCustomer = async () => {
  try {
    isLoading.value = true
    error.value = null

    const response = await apiFetch('/customers')
    const customers = await response.json()

    if (response.ok) {
      const customerData = customers.find((c: any) => c.customer_id === route.params.id)
      if (customerData) {
        customer.value = {
          customerId: customerData.customer_id,
          fullName: customerData.full_name,
          address: customerData.address,
          phone: customerData.telephone,
          orderNumber: customerData.order_number,
          date: customerData.date ? new Date(customerData.date).toISOString().split('T')[0] : ''
        }
      } else {
        throw new Error('Customer not found')
      }
    } else {
      throw new Error(customers.error || 'Failed to fetch customers')
    }
  } catch (err) {
    error.value = err instanceof Error ? err.message : 'Failed to fetch customer'
  } finally {
    isLoading.value = false
  }
}

const handleSubmit = async () => {
  const requestBody = {
    customer_id: customer.value.customerId,
    full_name: customer.value.fullName,
    address: customer.value.address,
    telephone: customer.value.phone,
    order_number: customer.value.orderNumber,
    date: customer.value.date
  }

  try {
    const response = await apiFetch('/customers', {
      method: 'PUT',
      body: JSON.stringify(requestBody)
    })

    const data = await response.json()

    if (response.ok && data.status === 'success') {
      router.push('/customers')
    } else {
      throw new Error(data.error || 'Failed to update customer')
    }
  } catch (err) {
    error.value = err instanceof Error ? err.message : 'Failed to update customer'
  }
}

onMounted(() => {
  fetchCustomer()
})
</script>

<template>
  <DashboardLayout>
    <div class="customers-page">
      <div class="back-button-container">
        <RouterLink to="/customers/" class="back-button">
          <i class="fas fa-chevron-left"></i>BACK
        </RouterLink>
      </div>
      <div class="edit-customer">
        <h1>Edit Customer</h1>
        
      <div v-if="isLoading" class="loading">
        Loading...
      </div>

      <div v-else-if="error" class="error-message">
        {{ error }}
        <button @click="fetchCustomer" class="retry-button">
          Try Again
        </button>
      </div>

      <div v-else class="form-container">
        <form @submit.prevent>
          <div class="form-group">
            <label for="customerId">Customer ID</label>
            <input 
              type="text" 
              id="customerId"
              v-model="customer.customerId"
              readonly
              class="readonly-input"
            >
          </div>

          <div class="form-group">
            <label for="fullName">Full Name</label>
            <input 
              type="text" 
              id="fullName"
              v-model="customer.fullName"
              required
            >
          </div>

          <div class="form-group">
            <label for="address">Address</label>
            <textarea 
              id="address"
              v-model="customer.address"
              required
            ></textarea>
          </div>

          <div class="form-group">
            <label for="phone">Phone</label>
            <input 
              type="tel" 
              id="phone"
              v-model="customer.phone"
              required
            >
          </div>

          <div class="form-group">
            <label for="orderNumber">Order Number</label>
            <input 
              type="text" 
              id="orderNumber"
              v-model="customer.orderNumber"
              required
            >
          </div>

          <div class="form-group">
            <label for="date">Date</label>
            <input 
              type="date" 
              id="date"
              v-model="customer.date"
              required
            >
          </div>

          <div class="submit-container">
            <SubmitButton 
              :onSubmit="handleSubmit"
              redirectTo="/customers"
            />
          </div>
        </form>
        </div>
      </div>
    </div>
  </DashboardLayout>
</template>

<style scoped>
.edit-customer {
  padding: 28px 32px;
  background: white;
  border-radius: 16px;
  box-shadow: 0 8px 24px rgba(30, 45, 64, 0.07);
  overflow: auto;
}

.form-container {
  max-width: 600px;
  margin: 0 auto;
}

.form-group {
  margin-bottom: 15px;
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

input, textarea {
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

textarea {
  min-height: 100px;
  resize: vertical;
}

.submit-container {
  margin-top: 20px;
  text-align: center;
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
  border-radius: 10px;
  cursor: pointer;
}

.retry-button:hover {
  background-color: #316eb9;
}
</style> 