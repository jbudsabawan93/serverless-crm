<script setup lang="ts">
import { ref, onMounted } from 'vue'
import DashboardLayout from '../components/DashboardLayout.vue'
import { config } from '../config'

interface DashboardStats {
  totalProducts: number
  totalCustomers: number
  totalOrders: number
}

const stats = ref<DashboardStats>({
  totalProducts: 0,
  totalCustomers: 0,
  totalOrders: 0
})

const isLoading = ref(true)
const error = ref<string | null>(null)

const fetchStats = async () => {
  try {
    isLoading.value = true
    error.value = null

    // ดึงข้อมูลจากแต่ละ endpoint
    const [ordersRes, customersRes, productsRes] = await Promise.all([
      fetch(`${config.API_URL}/orders`),
      fetch(`${config.API_URL}/customers`),
      fetch(`${config.API_URL}/products`)
    ])
    if (!ordersRes.ok || !customersRes.ok || !productsRes.ok) throw new Error('Network response was not ok')
    const [orders, customers, products] = await Promise.all([
      ordersRes.json(),
      customersRes.json(),
      productsRes.json()
    ])
    stats.value = {
      totalOrders: Array.isArray(orders) ? orders.length : 0,
      totalCustomers: Array.isArray(customers) ? customers.length : 0,
      totalProducts: Array.isArray(products) ? products.length : 0
    }
  } catch (err) {
    error.value = err instanceof Error ? err.message : 'Failed to fetch stats'
  } finally {
    isLoading.value = false
  }
}

onMounted(() => {
  fetchStats()
})
</script>

<template>
  <DashboardLayout>
    <div class="dashboard-page">
      <h1>Dashboard</h1>
      
      <div class="stats-container">
        <div class="stat-card">
          <div class="stat-icon">
            <i class="fas fa-box"></i>
          </div>
          <div class="stat-content">
            <h3>Total Products</h3>
            <p class="stat-number">{{ stats.totalProducts }}</p>
          </div>
        </div>

        <div class="stat-card">
          <div class="stat-icon">
            <i class="fas fa-users"></i>
          </div>
          <div class="stat-content">
            <h3>Total Customers</h3>
            <p class="stat-number">{{ stats.totalCustomers }}</p>
          </div>
        </div>

        <div class="stat-card">
          <div class="stat-icon">
            <i class="fas fa-shopping-cart"></i>
          </div>
          <div class="stat-content">
            <h3>Total Orders</h3>
            <p class="stat-number">{{ stats.totalOrders }}</p>
          </div>
        </div>
      </div>
    </div>
  </DashboardLayout>
</template>

<style scoped>
.dashboard-page {
  padding: 20px;
  background-color: #f0f2f5;
}

h1 {
  margin-bottom: 2rem;
  text-align: left;
  color: #333;
  font-size: 2rem;
  font-weight: bold;
}

.stats-container {
  display: flex;
  gap: 20px;
  padding: 20px;
  background-color: white;
  border-radius: 15px;
  box-shadow: 0 5px 15px rgba(0, 0, 0, 0.08);
  justify-content: space-around;
  align-items: center;
}

.stat-card {
  background: none;
  border-radius: 0;
  padding: 0;
  display: flex;
  align-items: center;
  gap: 20px;
  box-shadow: none;
  transition: none;
  flex: 1;
  justify-content: center;
}

.stat-card:not(:last-child) {
  border-right: 1px solid #eee;
  padding-right: 20px;
}

.stat-card:not(:first-child) {
   padding-left: 20px;
}

.stat-card:hover {
  transform: none;
}

.stat-icon {
  width: 70px;
  height: 70px;
  background: #e0f7e9;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.stat-icon i {
  font-size: 30px;
  color: #4caf50;
}

.stat-content {
  flex: 1;
  text-align: left;
}

.stat-content h3 {
  margin: 0;
  font-size: 14px;
  color: #9e9e9e;
  font-weight: normal;
  text-transform: uppercase;
}

.stat-number {
  margin: 5px 0 0;
  font-size: 36px;
  font-weight: bold;
  color: #333;
}

@media (max-width: 768px) {
  .stats-container {
    flex-direction: column;
    padding: 10px;
    gap: 10px;
  }
  
  .stat-card {
    width: 100%;
    justify-content: flex-start;
    padding: 15px;
    border-right: none;
    border-bottom: 1px solid #eee;
  }
  
  .stat-card:not(:last-child) {
    border-right: none;
    padding-right: 15px;
  }

  .stat-card:not(:first-child) {
    padding-left: 15px;
  }

  .stat-card:last-child {
     border-bottom: none;
  }

  .stat-icon {
    width: 50px;
    height: 50px;
  }

  .stat-icon i {
    font-size: 24px;
  }

  .stat-content h3 {
    font-size: 12px;
  }

  .stat-number {
    font-size: 28px;
  }
}
</style> 