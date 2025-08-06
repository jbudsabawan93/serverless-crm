<script setup lang="ts">
import { ref, onMounted } from 'vue'
import DashboardLayout from '../DashboardLayout.vue'
import SubmitButton from '../SubmitButton.vue'
import { config } from '../../config'
import { RouterLink } from 'vue-router'

interface CustomerData {
  customerId: string
  fullName: string
  address: string
  phone: string
  orderNumber: string
  date: string
}

const customerData = ref<CustomerData>({
  customerId: '',
  fullName: '',
  address: '',
  phone: '',
  orderNumber: '',
  date: ''
})

const isSubmitting = ref(false)
const submitStatus = ref('')

// ฟังก์ชันสร้างรหัสลูกค้าแบบอัตโนมัติ
const generateCustomerId = (): string => {
  const date = new Date()
  const year = date.getFullYear().toString().slice(-2)
  const month = (date.getMonth() + 1).toString().padStart(2, '0')
  const day = date.getDate().toString().padStart(2, '0')
  const random = Math.floor(Math.random() * 1000).toString().padStart(3, '0')
  return `C${year}${month}${day}${random}`
}

// สร้างรหัสลูกค้าเมื่อ component ถูกโหลด
onMounted(() => {
  customerData.value.customerId = generateCustomerId()
})

const handleSubmit = async () => {
  try {
    isSubmitting.value = true
    submitStatus.value = 'Saving data...'

    const requestBody = {
      customer_id: customerData.value.customerId,
      full_name: customerData.value.fullName,
      address: customerData.value.address,
      telephone: customerData.value.phone,
      order_number: customerData.value.orderNumber,
      date: customerData.value.date
    };

    // Send actual request
    const response = await fetch(`${config.API_URL}/customers`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(requestBody)
    });

    const data = await response.json()

    if (response.ok && data.status === 'success') {
      submitStatus.value = 'Successfully saved'
      
      // รีเซ็ตฟอร์มและสร้างรหัสลูกค้าใหม่
      customerData.value = {
        customerId: generateCustomerId(),
        fullName: '',
        address: '',
        phone: '',
        orderNumber: '',
        date: ''
      }
    } else {
      throw new Error(data.error || 'Failed to save data')
    }
  } catch (error) {
    submitStatus.value = 'Error: ' + (error as Error).message
  } finally {
    isSubmitting.value = false
  }
}
</script>

<template>
  <DashboardLayout>
    <div class="customers-page">
      <div class="back-button-container">
        <RouterLink to="/customers/" class="back-button">
          <i class="fas fa-chevron-left"></i> BACK
        </RouterLink>
      </div>
      <div class="customer-form">
        <div class="form-container">
          <h1>Add New Customer</h1>
          <form @submit.prevent>
            <div class="form-group">
              <label for="customerId">Customer ID</label>
              <input 
                type="text" 
                id="customerId" 
                v-model="customerData.customerId" 
                readonly
                class="readonly-input"
              >
            </div>

            <div class="form-group">
              <label for="fullName">Full Name</label>
              <input 
                type="text" 
                id="fullName" 
                v-model="customerData.fullName" 
                required
              >
            </div>

            <div class="form-group">
              <label for="address">Address</label>
              <textarea 
                id="address" 
                v-model="customerData.address" 
                required
              ></textarea>
            </div>

            <div class="form-group">
              <label for="phone">Telephone</label>
              <input 
                type="tel" 
                id="phone" 
                v-model="customerData.phone" 
                required
              >
            </div>

            <div class="form-group">
              <label for="orderNumber">Order Number</label>
              <input 
                type="text" 
                id="orderNumber" 
                v-model="customerData.orderNumber" 
                required
              >
            </div>

            <div class="form-group">
              <label for="date">Date</label>
              <input 
                type="date" 
                id="date" 
                v-model="customerData.date" 
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
.customer-form {
  padding: 40px;
  background: white;
  border-radius: 30px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
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
  margin: 2rem 0 4rem;
  text-align: center;
}

label {
  display: block;
  margin-bottom: 5px;
  font-weight: bold;
}

input, textarea {
  width: 100%;
  padding: 10px;
  border: 1px solid #ddd;
  border-radius: 10px;
  font-size: 16px;
}

.readonly-input {
  background-color: #f5f5f5;
  cursor: not-allowed;
}

textarea {
  height: 100px;
  resize: vertical;
}

.submit-container {
  margin-top: 20px;
  margin-bottom: 2rem;
  text-align: center;
}

.submit-button {
  background-color: #4382D0;
  color: white;
  padding: 10px 20px;
  border: none;
  border-radius: 10px;
  cursor: pointer;
  width: auto;
}

.submit-button:hover:not(:disabled) {
  background-color: #316eb9;
}

.submit-button:disabled {
  background-color: #cccccc;
  cursor: not-allowed;
}

.form-status {
  margin: 10px 0;
  padding: 10px;
  border-radius: 4px;
  text-align: center;
}

.form-status.error {
  background-color: #ffebee;
  color: #c62828;
}
</style> 