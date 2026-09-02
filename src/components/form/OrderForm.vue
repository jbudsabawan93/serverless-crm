<script setup lang="ts">
import { ref } from 'vue'
import DashboardLayout from '../DashboardLayout.vue'
import SubmitButton from '../SubmitButton.vue'
import { apiFetch } from '../../api'
import { RouterLink } from 'vue-router'

interface OrderItem {
  orderId: string
  orderNumber: string
  productName: string
  price: number
  amount: number
  total: number
  orderDate: string
}

const orderItems = ref<OrderItem[]>([])
const newItem = ref<OrderItem>({
  orderId: '',
  orderNumber: '',
  productName: '',
  price: 0,
  amount: 0,
  total: 0,
  orderDate: new Date().toISOString().split('T')[0]
})

const generateOrderId = (): string => {
  const date = new Date()
  const year = date.getFullYear().toString().slice(-2)
  const month = (date.getMonth() + 1).toString().padStart(2, '0')
  const day = date.getDate().toString().padStart(2, '0')
  const random = Math.floor(Math.random() * 1000).toString().padStart(3, '0')
  return `ORD${year}${month}${day}${random}`
}

const calculateTotal = () => {
  newItem.value.total = newItem.value.price * newItem.value.amount
}

const addItem = () => {
  newItem.value.orderId = generateOrderId()
  orderItems.value.push({ ...newItem.value })
  newItem.value = {
    orderId: '',
    orderNumber: '',
    productName: '',
    price: 0,
    amount: 0,
    total: 0,
    orderDate: new Date().toISOString().split('T')[0]
  }
}

const removeItem = (index: number) => {
  orderItems.value.splice(index, 1)
}

const handleSubmit = async () => {
  try {
    for (const item of orderItems.value) {
      const response = await apiFetch('/orders', {
        method: 'POST',
        body: JSON.stringify({
          order_id: item.orderId,
          order_number: item.orderNumber,
          product_name: item.productName,
          price: item.price,
          amount: item.amount,
          total: item.total,
          order_date: item.orderDate
        })
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      if (data.status !== 'success') {
        throw new Error(data.error || 'Failed to save data');
      }
    }

    orderItems.value = []
    newItem.value = {
      orderId: '',
      orderNumber: '',
      productName: '',
      price: 0,
      amount: 0,
      total: 0,
      orderDate: new Date().toISOString().split('T')[0]
    }
  } catch (error) {
    throw error;
  }
}
</script>

<template>
  <DashboardLayout>
    <div class="customers-page">
      <div class="back-button-container">
        <RouterLink to="/orders/" class="back-button">
          <i class="fas fa-chevron-left"></i>BACK
        </RouterLink>
      </div>
      <div class="order-form">
        <h1>Add New Order</h1>
        <div class="form-container">
          <form @submit.prevent="addItem">
              <div class="form-table">
                <div class="form-group">
                  <label for="orderNumber">Order Number</label>
                  <input 
                      type="text" 
                      id="orderNumber"
                      v-model="newItem.orderNumber"
                      required
                  >
                </div>

                <div class="form-group">
                  <label for="productName">Product Name</label>
                  <input 
                      type="text" 
                      id="productName"
                      v-model="newItem.productName"
                      required
                  >
                </div>

                <div class="form-group">
                  <label for="price">Price</label>
                  <input 
                      type="number" 
                      id="price"
                      v-model="newItem.price"
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
                      v-model="newItem.amount"
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
                      v-model="newItem.total"
                      readonly
                  >
                </div>

                <div class="form-group">
                  <label for="orderDate">Order Date</label>
                  <input 
                      type="date" 
                      id="orderDate"
                      v-model="newItem.orderDate"
                      required
                  >
                </div>
              </div>
              <div class="add-container"><button type="submit" class="add-button">Add Item</button></div>
          </form>
          
        </div>

        <div class="order-table" v-if="orderItems.length > 0">
            <table>
                <thead>
                <tr>
                    <th>Order ID</th>
                    <th>Order Number</th>
                    <th>Product Name</th>
                    <th>Price</th>
                    <th>Amount</th>
                    <th>Total</th>
                    <th>Order Date</th>
                    <th>Actions</th>
                </tr>
                </thead>
                <tbody>
                <tr v-for="(item, index) in orderItems" :key="index">
                    <td>{{ item.orderId }}</td>
                    <td>{{ item.orderNumber }}</td>
                    <td>{{ item.productName }}</td>
                    <td>{{ item.price.toFixed(2) }}</td>
                    <td>{{ item.amount }}</td>
                    <td>{{ item.total.toFixed(2) }}</td>
                    <td>{{ item.orderDate }}</td>
                    <td>
                    <button 
                        @click="removeItem(index)"
                        class="remove-button"
                        title="Remove item"
                    >
                        ❌
                    </button>
                    </td>
                </tr>
                </tbody>
            </table>
            <div class="submit-container">
                <SubmitButton 
                    :disabled="orderItems.length === 0"
                    :onSubmit="handleSubmit"
                    redirectTo="/orders"
                />
            </div>
        </div>
      </div>
    </div>
  </DashboardLayout>
</template>

<style scoped>
.order-form {
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

input[readonly] {
  background-color: #f5f5f5;
}

table {
  width: 100%;
  border-collapse: collapse;
  margin-top: 20px;
}

th, td {
  padding: 12px;
  text-align: left;
  border-bottom: 1px solid #e8edf3;
  font-size: 0.9rem;
}

th {
  font-size: 0.75rem;
  font-weight: 600;
  letter-spacing: 0.04em;
  text-transform: uppercase;
  color: #6b7785;
}

.remove-button {
  background: none;
  border: none;
  cursor: pointer;
  padding: 4px;
  font-size: 16px;
}

.remove-button:hover {
  opacity: 0.7;
}

.submit-container {
  margin-top: 20px;
  margin-bottom: 2rem;
  text-align: center;
}

.add-container {
  margin-bottom: 2rem;
  text-align: right;
}

.add-button {
  background-color: #4382D0;
  color: white;
  padding: 8px 16px;
  border: none;
  border-radius: 10px;
  cursor: pointer;
  width: auto;
  font-size: 0.85rem;
  font-weight: 600;
}

.add-button:hover {
  background-color: #316eb9;
}
</style> 