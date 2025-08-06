<script setup lang="ts">
import DashboardLayout from '../components/DashboardLayout.vue'
import DeleteButton from '../components/DeleteButton.vue'
import Pagination from '../components/Pagination.vue'
import { ref, onMounted, computed } from 'vue'
import { RouterLink } from 'vue-router'
import { config } from '../config'

interface Product {
  productId: string
  imageUrl: string
  productName: string
  description: string
  price: number
  quantity: number
  category: string
  sku: string
  createdAt: string
}

const products = ref<Product[]>([])
const isLoading = ref(true)
const error = ref<string | null>(null)

// Pagination variables
const currentPage = ref(1)
const itemsPerPage = 5

// Calculate total pages
const totalPages = computed(() => {
  return Math.ceil(products.value.length / itemsPerPage)
})

// Calculate data for current page
const paginatedProducts = computed(() => {
  const start = (currentPage.value - 1) * itemsPerPage
  const end = start + itemsPerPage
  return products.value.slice(start, end)
})

// Fetch products from Google Sheet
const fetchProducts = async () => {
  try {
    isLoading.value = true
    error.value = null

    const response = await fetch(`${config.API_URL}/products`)
    if (!response.ok) throw new Error('Network response was not ok')
    const data = await response.json()

    products.value = (Array.isArray(data) ? data : []).map((item: any) => ({
      productId: item.product_id || '',
      imageUrl: item.imge_url || '',
      productName: item.product_name || '',
      description: item.description || '',
      price: item.price || 0,
      quantity: item.quantity || 0,
      category: item.category || '',
      sku: item.sku || '',
      createdAt: item.createdAt || ''
    }))
  } catch (err) {
    error.value = err instanceof Error ? err.message : 'Failed to fetch products'
    products.value = []
  } finally {
    isLoading.value = false
  }
}

const deleteProduct = async (productId: string) => {
  const response = await fetch(`${config.API_URL}/products`, {
    method: 'DELETE',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ product_id: productId })
  })
  if (!response.ok) {
    const err = await response.json().catch(() => ({}))
    throw new Error(err.error || 'Failed to delete product')
  }
  products.value = products.value.filter(p => p.productId !== productId)
}

// Load data when component is mounted
onMounted(() => {
  fetchProducts()
})
</script>

<template>
  <DashboardLayout>
    <div class="products-page">
      <div class="page-header">
        <h1>Products</h1>
        <RouterLink to="/products/add" class="add-button">
          Add Product
        </RouterLink>
      </div>

      <div v-if="isLoading" class="loading">
        Loading...
      </div>

      <div v-else-if="error" class="error-message">
        {{ error }}
        <button @click="fetchProducts" class="retry-button">
          Try Again
        </button>
      </div>

      <div v-else-if="products.length === 0" class="no-data">
        No products found. Click "Add Product" to add one.
      </div>

      <div v-else class="products-table">
        <table>
          <thead>
            <tr>
              <th>Product ID</th>
              <th>Image</th>
              <th>Product Name</th>
              <th>Description</th>
              <th>Price</th>
              <th>Qty</th>
              <th>Category</th>
              <th>SKU</th>
              <th>Created At</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="product in paginatedProducts" :key="product.productId">
              <td :title="product.productId">{{ product.productId }}</td>
              <td class="image-cell">
                <img 
                  v-if="product.imageUrl" 
                  :src="product.imageUrl" 
                  :alt="product.productName"
                  class="product-image"
                >
                <span v-else class="no-image">No Image</span>
              </td>
              <td :title="product.productName">{{ product.productName }}</td>
              <td :title="product.description">{{ product.description }}</td>
              <td>{{ Number(product.price).toFixed(2) }}</td>
              <td>{{ product.quantity }}</td>
              <td>{{ product.category }}</td>
              <td :title="product.sku" class="sku-cell">
                <span class="sku-type">{{ product.sku.substring(0, 3) }}</span>
                <span class="sku-number">{{ product.sku.substring(3) }}</span>
              </td>
              <td>{{ new Date(product.createdAt).toLocaleDateString() }}</td>
              <td class="actions">
                <RouterLink 
                  :to="`/products/edit/${product.productId}`" 
                  class="action-button edit"
                  title="Edit"
                >
                  <img src="/src/assets/edit.svg" alt="Edit">
                </RouterLink>

                <DeleteButton
                  :itemId="product.productId"
                  :itemName="product.productName"
                  itemType="Product"
                  :onDelete="deleteProduct"
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
.products-page {
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

.products-table {
    padding: 40px;
    background: #fff;
    border-radius: 30px;
    box-shadow: 0 2px 4px #0000001a;
    overflow: auto;
}

table {
    width: 100%;
  border-collapse: collapse;
  min-width: 800px;
  table-layout: fixed;
}

th, td {
    padding: 12px 15px;
    text-align: left;
    border-bottom: 1px solid #ddd;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
}

th:nth-child(1), 
td:nth-child(1) {
  width: 12%;
}

th:nth-child(3), 
td:nth-child(3),
th:nth-child(4), 
td:nth-child(4) {
  width: 15%;
}

th:nth-child(2), 
td:nth-child(2),
th:nth-child(5), 
td:nth-child(5),
th:nth-child(7), 
td:nth-child(7),
th:nth-child(8), 
td:nth-child(8),
th:nth-child(10), 
td:nth-child(10) {
  width: 10%;
}

th:nth-child(9), 
td:nth-child(9) {
  width: 12%;
}

th:nth-child(6), 
td:nth-child(6) {
  width: 8%;
  text-align: center;
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

.action-button {
    background: none;
    border: none;
    cursor: pointer;
    padding: 0 5px;
    font-size: 1.2rem;
    opacity: .7;
    transition: opacity .2s;
}

.action-button img {
  width: 16px;
  height: 16px;
}

.image-cell {
  width: 80px;
}

.product-image {
  width: 60px;
  height: 60px;
  object-fit: cover;
  border-radius: 4px;
}

.no-image {
  color: #999;
  font-size: 12px;
}
</style> 