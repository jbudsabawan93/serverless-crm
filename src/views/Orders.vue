<script setup lang="ts">
import DashboardLayout from '../components/DashboardLayout.vue'
import DeleteButton from '../components/DeleteButton.vue'
import PrintButton from '../components/PrintButton.vue'
import Pagination from '../components/Pagination.vue'
import DateFormatter from '../components/DateFormatter.vue'
import { ref, onMounted, computed } from 'vue'
import { RouterLink } from 'vue-router'
import { config } from '../config'

interface Order {
  orderId: string
  orderNumber: string
  productName: string
  price: number
  amount: number
  total: number
  orderDate: string
}

const orders = ref<Order[]>([])
const isLoading = ref(true)
const error = ref<string | null>(null)

// Pagination
const currentPage = ref(1)
const itemsPerPage = 5
const totalPages = computed(() => {
  return Math.ceil(orders.value.length / itemsPerPage)
})
const paginatedOrders = computed(() => {
  const start = (currentPage.value - 1) * itemsPerPage
  const end = start + itemsPerPage
  return orders.value.slice(start, end)
})

const fetchOrders = async () => {
  try {
    isLoading.value = true
    error.value = null

    const response = await fetch(`${config.API_URL}/orders`)
    if (!response.ok) throw new Error('Network response was not ok')
    const data = await response.json()

    orders.value = (Array.isArray(data) ? data : []).map((item: any) => ({
      orderId: item.order_id || '',
      orderNumber: item.order_number || '',
      productName: item.product_name || '',
      price: item.price || 0,
      amount: item.amount || 0,
      total: item.total || 0,
      orderDate: item.order_date || ''
    }))
  } catch (err) {
    error.value = err instanceof Error ? err.message : 'Failed to fetch orders'
    orders.value = []
  } finally {
    isLoading.value = false
  }
}

// ฟังก์ชันสำหรับลบข้อมูลออเดอร์ผ่าน API
const deleteOrder = async (orderId: string) => {
  const response = await fetch(`${config.API_URL}/orders`, {
    method: 'DELETE',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ order_id: orderId })
  })
  if (!response.ok) {
    const err = await response.json().catch(() => ({}))
    throw new Error(err.error || 'Failed to delete order')
  }
  // ลบออกจาก state ทันที (optional)
  orders.value = orders.value.filter(o => o.orderId !== orderId)
}

onMounted(() => {
  fetchOrders()
})
</script>

<template>
  <DashboardLayout>
    <div class="orders-page">
      <div class="page-header">
        <h1>Orders</h1>
        <RouterLink to="/orders/add" class="add-button">
          Add Order
        </RouterLink>
      </div>

      <div v-if="isLoading" class="loading">
        Loading...
      </div>

      <div v-else-if="error" class="error-message">
        {{ error }}
        <button @click="fetchOrders" class="retry-button">
          Try Again
        </button>
      </div>

      <div v-else-if="orders.length === 0" class="no-data">
        No orders found. Click "Add New Order" to add one.
      </div>

      <div v-else class="orders-table">
        <table>
          <thead>
            <tr>
              <th>Order ID</th>
              <th>Order Number</th>
              <th>Product Name</th>
              <th>Price</th>
              <th>Amount</th>
              <th>Total</th>
              <th>Date</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="order in paginatedOrders" :key="order.orderId">
              <td :title="order.orderId">{{ order.orderId }}</td>
              <td :title="order.orderNumber">{{ order.orderNumber }}</td>
              <td :title="order.productName">{{ order.productName }}</td>
              <td>{{ Number(order.price).toFixed(2) }}</td>
              <td>{{ order.amount }}</td>
              <td>{{ Number(order.total).toFixed(2) }}</td>
              <td>
                <DateFormatter :date="order.orderDate" format="MM/DD/YYYY" />
              </td>
              <td class="actions">
                <RouterLink 
                  :to="`/orders/edit/${order.orderId}`" 
                  class="action-button edit"
                  title="Edit"
                >
                  <img src="/src/assets/edit.svg" alt="Edit">
                </RouterLink>
                
                <PrintButton
                  title="Order Details"
                  :data="order"
                />

                <DeleteButton
                  :itemId="order.orderId"
                  :itemName="order.orderNumber"
                  itemType="Order"
                  :onDelete="deleteOrder"
                />
              </td>
            </tr>
          </tbody>
        </table>

        <Pagination
          v-model:currentPage="currentPage"
          :totalPages="totalPages"
        />
      </div>
    </div>
  </DashboardLayout>
</template>

<style scoped>
.orders-page {
  padding: 20px;
}

.page-header {
  display: flex;
  gap: 20px;
  align-items: center;
  margin-bottom: 20px;
}

.add-button {
  background-color: #4382D0;
  color: white;
  padding: 10px 20px;
  border-radius: 10px;
  text-decoration: none;
  font-weight: bold;
}

.add-button:hover {
  background-color: #316eb9;
}

.loading, .error-message, .no-data {
  text-align: center;
  padding: 40px;
  background: white;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
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

.orders-table {
  padding: 40px;
  background: white;
  border-radius: 30px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  overflow: auto;
}

table {
  width: 100%;
  border-collapse: collapse;
  min-width: 800px;
}

th, td {
  padding: 12px 15px;
  text-align: left;
  border-bottom: 1px solid #ddd;
}

th {
  font-weight: bold;
  white-space: nowrap;
}

td {
  white-space: normal;
  word-break: break-word;
}

tr:hover {
  background-color: #f9f9f9;
}

thead tr:hover {
  background-color: transparent;
}

.no-data {
  color: #666;
  font-size: 1.1rem;
}

.actions {
  white-space: nowrap;
  width: 80px;
}

.action-button {
  background: none;
  border: none;
  cursor: pointer;
  padding: 0 10px;
  font-size: 1.2rem;
  opacity: 0.7;
  transition: opacity 0.2s;
}

.action-button:hover {
  opacity: 1;
}

.action-button.edit {
  padding-left: 0;
}

.action-button.delete {
  color: #dc3545;
}

td {
  vertical-align: middle;
}

tr:hover .action-button {
  opacity: 1;
}

th:nth-child(1), 
td:nth-child(1),
th:nth-child(2), 
td:nth-child(2) {
  width: 13%;
}

th:nth-child(3), 
td:nth-child(3) {
  width: 20%;
}

th:nth-child(4), 
td:nth-child(4),
th:nth-child(6),
td:nth-child(6),
th:nth-child(7), 
td:nth-child(7),
th:nth-child(8), 
td:nth-child(8) {
  width: 10%;
}

th:nth-child(5), 
td:nth-child(5) {
  width: 5%;
}
td:nth-child(5) {
  text-align: center;
}
</style> 