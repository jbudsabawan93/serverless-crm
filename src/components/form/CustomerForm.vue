<script setup lang="ts">
import { computed, ref, onMounted } from 'vue'
import DashboardLayout from '../DashboardLayout.vue'
import SubmitButton from '../SubmitButton.vue'
import { apiFetch } from '../../api'
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
const touched = ref({
  fullName: false,
  address: false,
  phone: false,
  orderNumber: false,
  date: false
})

const fieldErrors = computed(() => {
  const phone = customerData.value.phone.trim()
  return {
    fullName: customerData.value.fullName.trim() ? '' : 'Full name is required',
    address: customerData.value.address.trim() ? '' : 'Address is required',
    phone: !phone
      ? 'Telephone is required'
      : /^\d{9,10}$/.test(phone)
        ? ''
        : 'Enter 9-10 digits',
    orderNumber: customerData.value.orderNumber.trim() ? '' : 'Order number is required',
    date: customerData.value.date ? '' : 'Date is required'
  }
})

const isFormValid = computed(() =>
  Boolean(customerData.value.customerId) &&
  Object.values(fieldErrors.value).every((msg) => !msg)
)

const markTouched = (field: keyof typeof touched.value) => {
  touched.value[field] = true
}

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
  Object.keys(touched.value).forEach((key) => {
    touched.value[key as keyof typeof touched.value] = true
  })
  if (!isFormValid.value) return

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
    const response = await apiFetch('/customers', {
      method: 'POST',
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
                :class="{ invalid: touched.fullName && fieldErrors.fullName }"
                required
                @blur="markTouched('fullName')"
              >
              <p v-if="touched.fullName && fieldErrors.fullName" class="field-error">
                {{ fieldErrors.fullName }}
              </p>
            </div>

            <div class="form-group">
              <label for="address">Address</label>
              <textarea 
                id="address" 
                v-model="customerData.address"
                :class="{ invalid: touched.address && fieldErrors.address }"
                required
                @blur="markTouched('address')"
              ></textarea>
              <p v-if="touched.address && fieldErrors.address" class="field-error">
                {{ fieldErrors.address }}
              </p>
            </div>

            <div class="form-group">
              <label for="phone">Telephone</label>
              <input 
                type="tel" 
                id="phone" 
                v-model="customerData.phone"
                :class="{ invalid: touched.phone && fieldErrors.phone }"
                required
                @blur="markTouched('phone')"
              >
              <p v-if="touched.phone && fieldErrors.phone" class="field-error">
                {{ fieldErrors.phone }}
              </p>
            </div>

            <div class="form-group">
              <label for="orderNumber">Order Number</label>
              <input 
                type="text" 
                id="orderNumber" 
                v-model="customerData.orderNumber"
                :class="{ invalid: touched.orderNumber && fieldErrors.orderNumber }"
                required
                @blur="markTouched('orderNumber')"
              >
              <p v-if="touched.orderNumber && fieldErrors.orderNumber" class="field-error">
                {{ fieldErrors.orderNumber }}
              </p>
            </div>

            <div class="form-group">
              <label for="date">Date</label>
              <input 
                type="date" 
                id="date" 
                v-model="customerData.date"
                :class="{ invalid: touched.date && fieldErrors.date }"
                required
                @blur="markTouched('date')"
              >
              <p v-if="touched.date && fieldErrors.date" class="field-error">
                {{ fieldErrors.date }}
              </p>
            </div>

            <div class="submit-container">
              <SubmitButton 
                :disabled="!isFormValid"
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

input:focus, textarea:focus {
  outline: none;
  border-color: #4382D0;
  background: #fff;
  box-shadow: 0 0 0 4px rgba(67, 130, 208, 0.12);
}

input.invalid, textarea.invalid {
  border-color: #dc3545;
  background: #fff8f8;
}

.field-error {
  margin: 6px 0 0;
  font-size: 0.78rem;
  color: #c62828;
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