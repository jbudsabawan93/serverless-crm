<script setup lang="ts">
import DashboardLayout from '../components/DashboardLayout.vue'
import Pagination from '../components/Pagination.vue'
import DateFormatter from '../components/DateFormatter.vue'
import DeleteButton from '../components/DeleteButton.vue'
import { ref, onMounted, computed } from 'vue'
import { RouterLink } from 'vue-router'
import { apiFetch } from '../api'

interface Customer {
  customerId: string
  fullName: string
  address: string
  phone: string
  orderNumber: string
  date: string
}

const customers = ref<Customer[]>([])
const isLoading = ref(true)
const error = ref<string | null>(null)

// เพิ่มตัวแปรสำหรับ pagination
const currentPage = ref(1)
const itemsPerPage = 15

// คำนวณจำนวนหน้าทั้งหมด
const totalPages = computed(() => {
  return Math.ceil(customers.value.length / itemsPerPage)
})

// คำนวณข้อมูลที่จะแสดงในหน้าปัจจุบัน
const paginatedCustomers = computed(() => {
  const start = (currentPage.value - 1) * itemsPerPage
  const end = start + itemsPerPage
  return customers.value.slice(start, end)
})

// ฟังก์ชันดึงข้อมูลลูกค้าจาก Google Sheet
const fetchCustomers = async () => {
  try {
    isLoading.value = true
    error.value = null

    const response = await apiFetch('/customers')
    if (!response.ok) throw new Error('Network response was not ok')
    const data = await response.json()

    customers.value = (Array.isArray(data) ? data : []).map((item: any) => ({
      customerId: item.customer_id || '',
      fullName: item.full_name || '',
      address: item.address || '',
      phone: item.telephone || '',
      orderNumber: item.order_number || '',
      date: item.date || ''
    }))
  } catch (err) {
    error.value = err instanceof Error ? err.message : 'Failed to fetch customers'
    customers.value = []
  } finally {
    isLoading.value = false
  }
}

const deleteCustomer = async (customerId: string) => {
  const response = await apiFetch('/customers', {
    method: 'DELETE',
    body: JSON.stringify({ customer_id: customerId })
  })
  if (!response.ok) {
    const err = await response.json().catch(() => ({}))
    throw new Error(err.error || 'Failed to delete customer')
  }
  customers.value = customers.value.filter(c => c.customerId !== customerId)
}

// โหลดข้อมูลเมื่อ component ถูกโหลด
onMounted(() => {
  fetchCustomers()
})
</script>

<template>
  <DashboardLayout>
    <div class="customers-page">
      <div class="page-header">
        <h1>Customers</h1>
        <RouterLink to="/customers/add" class="add-button">
          Add Customer
        </RouterLink>
      </div>

      <div v-if="isLoading" class="loading">
        Loading...
      </div>

      <div v-else-if="error" class="error-message">
        {{ error }}
        <button @click="fetchCustomers" class="retry-button">
          Try Again
        </button>
      </div>

      <div v-else-if="customers.length === 0" class="no-data">
        No customers found. Click "Add New Customer" to add one.
      </div>

      <div v-else class="customers-table">
        <div class="table-scroll">
          <table>
          <thead>
            <tr>
              <th>Customer ID</th>
              <th>Full Name</th>
              <th>Address</th>
              <th>Telephone</th>
              <th>Order Number</th>
              <th>Date</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="customer in paginatedCustomers" :key="customer.customerId">
              <td :title="customer.customerId">{{ customer.customerId }}</td>
              <td :title="customer.fullName">{{ customer.fullName }}</td>
              <td :title="customer.address">{{ customer.address }}</td>
              <td :title="customer.phone">{{ customer.phone }}</td>
              <td :title="customer.orderNumber">{{ customer.orderNumber }}</td>
              <td>
                <DateFormatter :date="customer.date" format="MM/DD/YYYY" />
              </td>
              <td class="actions">
                <RouterLink 
                  :to="`/customers/edit/${customer.customerId}`" 
                  class="action-button edit"
                  title="Edit"
                >
                  <img src="/src/assets/edit.svg" alt="Edit">
                </RouterLink>
                <DeleteButton
                  :itemId="customer.customerId"
                  :itemName="customer.fullName"
                  itemType="customer"
                  :onDelete="deleteCustomer"
                />
              </td>
            </tr>
          </tbody>
          </table>
        </div>

        <Pagination
          v-model:currentPage="currentPage"
          :totalPages="totalPages"
        />
      </div>
    </div>
  </DashboardLayout>
</template>

<style scoped>
.customers-page {
  padding: 4px 0 0;
  flex: 1;
  min-height: 0;
  display: flex;
  flex-direction: column;
}

.page-header {
  display: flex;
  gap: 16px;
  align-items: center;
  margin-bottom: 18px;
  flex-shrink: 0;
}

.page-header h1 {
  margin: 0;
  font-size: 1.5rem;
  font-weight: 700;
  color: #1E2D40;
}

.add-button {
  background-color: #4382D0;
  color: white;
  padding: 8px 16px;
  border-radius: 10px;
  text-decoration: none;
  font-size: 0.85rem;
  font-weight: 600;
}

.add-button:hover {
  background-color: #316eb9;
}

.loading, .error-message, .no-data {
  text-align: center;
  padding: 40px;
  background: white;
  border-radius: 16px;
  box-shadow: 0 8px 24px rgba(30, 45, 64, 0.07);
  font-size: 0.95rem;
  color: #6b7785;
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
  font-size: 0.85rem;
}

.retry-button:hover {
  background-color: #316eb9;
}

.customers-table {
  flex: 1;
  min-height: 0;
  background: white;
  border-radius: 16px;
  box-shadow: 0 8px 24px rgba(30, 45, 64, 0.07);
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

.table-scroll {
  flex: 1;
  min-height: 0;
  overflow: auto;
}

table {
  width: 100%;
  border-collapse: collapse;
  min-width: 800px;
  table-layout: fixed;
}

th, td {
  padding: 12px 14px;
  text-align: left;
  border-bottom: 1px solid #e8edf3;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

td {
  position: relative;
}

td:hover::after {
  content: attr(title);
  position: absolute;
  left: 0;
  top: 100%;
  z-index: 1;
  background: rgba(0, 0, 0, 0.8);
  color: white;
  padding: 5px 10px;
  border-radius: 4px;
  font-size: 14px;
  white-space: normal;
  max-width: 200px;
  display: none;
}

td[title]:hover::after {
  display: block;
}

th {
  font-size: 0.75rem;
  font-weight: 600;
  letter-spacing: 0.04em;
  text-transform: uppercase;
  color: #6b7785;
  background: #f7f9fc;
  white-space: nowrap;
  position: sticky;
  top: 0;
  z-index: 2;
}

td {
  white-space: normal;
  word-break: break-word;
  font-size: 0.9rem;
  color: #1E2D40;
}

tr:hover {
  background-color: #f7f9fc;
}

thead tr:hover {
  background-color: transparent;
}

.no-data {
  color: #6b7785;
  font-size: 0.95rem;
}

.edit-link {
  color: #2c3e50;
  text-decoration: none;
  display: block;
}

.edit-link:hover {
  color: #42b883;
  text-decoration: underline;
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
  font-size: 1rem;
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

/* ปรับปรุง table styles */
td {
  vertical-align: middle;
}

tr:hover .action-button {
  opacity: 1;
}

th:nth-child(2), 
td:nth-child(2),
th:nth-child(3), 
td:nth-child(3) {
  width: 20%;
}

th:nth-child(4), 
td:nth-child(4),
th:nth-child(6), 
td:nth-child(6) {
  width: 10%;
}

th:nth-child(1), 
td:nth-child(1),
th:nth-child(5), 
td:nth-child(5) {
 width: 13%;
}
th:nth-child(7), 
td:nth-child(7) {
  width: 8%;
}
</style> 