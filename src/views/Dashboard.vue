<script setup lang="ts">
import { computed, nextTick, onMounted, onUnmounted, ref } from 'vue'
import { Chart } from 'chart.js/auto'
import DashboardLayout from '../components/DashboardLayout.vue'
import DateFormatter from '../components/DateFormatter.vue'
import { apiFetch } from '../api'

interface DashboardStats {
  totalProducts: number
  totalCustomers: number
  totalOrders: number
}

interface OrderRow {
  orderId: string
  orderNumber: string
  productName: string
  amount: number
  total: number
  orderDate: string
}

interface TopProduct {
  name: string
  qty: number
}

interface SalesPoint {
  date: string
  total: number
}

const stats = ref<DashboardStats>({
  totalProducts: 0,
  totalCustomers: 0,
  totalOrders: 0
})
const orders = ref<OrderRow[]>([])
const isLoading = ref(true)
const error = ref<string | null>(null)
const chartCanvas = ref<HTMLCanvasElement | null>(null)
const salesChartCanvas = ref<HTMLCanvasElement | null>(null)
let chart: Chart | null = null
let salesChart: Chart | null = null

const recentOrders = computed(() =>
  [...orders.value]
    .sort((a, b) => new Date(b.orderDate).getTime() - new Date(a.orderDate).getTime())
    .slice(0, 10)
)

const topProducts = computed<TopProduct[]>(() => {
  const map = new Map<string, number>()
  for (const order of orders.value) {
    const name = order.productName || 'Unknown'
    map.set(name, (map.get(name) || 0) + Number(order.amount || 0))
  }
  return [...map.entries()]
    .map(([name, qty]) => ({ name, qty }))
    .sort((a, b) => b.qty - a.qty)
    .slice(0, 8)
})

const salesByDate = computed<SalesPoint[]>(() => {
  const map = new Map<string, number>()
  for (const order of orders.value) {
    const d = new Date(order.orderDate)
    if (Number.isNaN(d.getTime())) continue
    const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
    map.set(key, (map.get(key) || 0) + Number(order.total || 0))
  }
  return [...map.entries()]
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([date, total]) => ({ date, total }))
})

const formatChartDate = (iso: string) => {
  const [, month, day] = iso.split('-')
  return `${month}/${day}`
}

const renderChart = () => {
  if (!chartCanvas.value) return
  chart?.destroy()
  const items = topProducts.value
  chart = new Chart(chartCanvas.value, {
    type: 'bar',
    data: {
      labels: items.map((item) => item.name),
      datasets: [{
        label: 'Qty sold',
        data: items.map((item) => item.qty),
        backgroundColor: '#4382D0',
        borderRadius: 8,
        barThickness: 18
      }]
    },
    options: {
      indexAxis: 'y',
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: { display: false }
      },
      scales: {
        x: {
          beginAtZero: true,
          ticks: { precision: 0, color: '#6b7785' },
          grid: { color: '#e8edf3' }
        },
        y: {
          ticks: { color: '#1E2D40', font: { size: 11 } },
          grid: { display: false }
        }
      }
    }
  })
}

const renderSalesChart = () => {
  if (!salesChartCanvas.value) return
  salesChart?.destroy()
  const items = salesByDate.value
  salesChart = new Chart(salesChartCanvas.value, {
    type: 'line',
    data: {
      labels: items.map((item) => formatChartDate(item.date)),
      datasets: [{
        label: 'Sales',
        data: items.map((item) => item.total),
        borderColor: '#4382D0',
        backgroundColor: 'rgba(67, 130, 208, 0.12)',
        fill: true,
        tension: 0.35,
        pointRadius: 4,
        pointBackgroundColor: '#4382D0',
        borderWidth: 2
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: { display: false }
      },
      scales: {
        x: {
          ticks: { color: '#6b7785' },
          grid: { display: false }
        },
        y: {
          beginAtZero: true,
          ticks: {
            color: '#6b7785',
            callback: (value) => `฿${Number(value).toLocaleString()}`
          },
          grid: { color: '#e8edf3' }
        }
      }
    }
  })
}

const fetchStats = async () => {
  try {
    isLoading.value = true
    error.value = null

    const [ordersRes, customersRes, productsRes] = await Promise.all([
      apiFetch('/orders'),
      apiFetch('/customers'),
      apiFetch('/products')
    ])
    if (!ordersRes.ok || !customersRes.ok || !productsRes.ok) throw new Error('Network response was not ok')
    const [ordersData, customers, products] = await Promise.all([
      ordersRes.json(),
      customersRes.json(),
      productsRes.json()
    ])
    orders.value = (Array.isArray(ordersData) ? ordersData : []).map((item: Record<string, unknown>) => ({
      orderId: String(item.order_id || ''),
      orderNumber: String(item.order_number || ''),
      productName: String(item.product_name || ''),
      amount: Number(item.amount || 0),
      total: Number(item.total || 0),
      orderDate: String(item.order_date || '')
    }))
    stats.value = {
      totalOrders: orders.value.length,
      totalCustomers: Array.isArray(customers) ? customers.length : 0,
      totalProducts: Array.isArray(products) ? products.length : 0
    }
    await nextTick()
    renderChart()
    renderSalesChart()
  } catch (err) {
    error.value = err instanceof Error ? err.message : 'Failed to fetch stats'
  } finally {
    isLoading.value = false
  }
}

onMounted(() => {
  fetchStats()
})

onUnmounted(() => {
  chart?.destroy()
  salesChart?.destroy()
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

      <div class="dashboard-grid">
        <section class="panel">
          <h2>Recent Orders</h2>
          <div v-if="!isLoading && recentOrders.length === 0" class="empty">No orders yet.</div>
          <div v-else class="table-wrap">
            <table>
              <thead>
                <tr>
                  <th>Order</th>
                  <th>Product</th>
                  <th>Qty</th>
                  <th>Total</th>
                  <th>Date</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="order in recentOrders" :key="order.orderId">
                  <td>{{ order.orderNumber }}</td>
                  <td :title="order.productName">{{ order.productName }}</td>
                  <td>{{ order.amount }}</td>
                  <td>{{ Number(order.total).toFixed(2) }}</td>
                  <td>
                    <DateFormatter :date="order.orderDate" format="MM/DD/YYYY" />
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </section>

        <section class="panel">
          <h2>Best Selling Products</h2>
          <div v-if="!isLoading && topProducts.length === 0" class="empty">No sales data yet.</div>
          <div v-else class="chart-wrap">
            <canvas ref="chartCanvas"></canvas>
          </div>
        </section>
      </div>

      <section class="panel sales-panel">
        <h2>Sales</h2>
        <div v-if="!isLoading && salesByDate.length === 0" class="empty">No sales data yet.</div>
        <div v-else class="chart-wrap sales-chart">
          <canvas ref="salesChartCanvas"></canvas>
        </div>
      </section>
    </div>
  </DashboardLayout>
</template>

<style scoped>
.dashboard-page {
  padding: 4px 0 8px;
  background: transparent;
}

h1 {
  margin-bottom: 1.25rem;
  text-align: left;
  color: #1E2D40;
  font-size: 1.5rem;
  font-weight: 700;
  letter-spacing: -0.02em;
}

.stats-container {
  display: flex;
  gap: 20px;
  padding: 24px;
  background-color: white;
  border-radius: 16px;
  box-shadow: 0 8px 24px rgba(30, 45, 64, 0.07);
  justify-content: space-around;
  align-items: center;
}

.stat-card {
  background: none;
  border-radius: 0;
  padding: 0;
  display: flex;
  align-items: center;
  gap: 16px;
  box-shadow: none;
  transition: none;
  flex: 1;
  justify-content: center;
}

.stat-card:not(:last-child) {
  border-right: 1px solid #e8edf3;
  padding-right: 20px;
}

.stat-card:not(:first-child) {
   padding-left: 20px;
}

.stat-card:hover {
  transform: none;
}

.stat-icon {
  width: 56px;
  height: 56px;
  background: #e8f1fb;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.stat-icon i {
  font-size: 22px;
  color: #4382D0;
}

.stat-content {
  flex: 1;
  text-align: left;
}

.stat-content h3 {
  margin: 0;
  font-size: 0.75rem;
  color: #6b7785;
  font-weight: 600;
  letter-spacing: 0.06em;
  text-transform: uppercase;
}

.stat-number {
  margin: 4px 0 0;
  font-size: 1.75rem;
  font-weight: 700;
  letter-spacing: -0.03em;
  color: #1E2D40;
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
    font-size: 20px;
  }

  .stat-content h3 {
    font-size: 0.7rem;
  }

  .stat-number {
    font-size: 1.45rem;
  }
}

.dashboard-grid {
  display: grid;
  grid-template-columns: 1.1fr 0.9fr;
  gap: 20px;
  margin-top: 20px;
}

.panel {
  background: #fff;
  border-radius: 16px;
  box-shadow: 0 8px 24px rgba(30, 45, 64, 0.07);
  padding: 20px 22px;
  min-height: 320px;
}

.panel h2 {
  margin: 0 0 16px;
  font-size: 0.95rem;
  font-weight: 700;
  color: #1E2D40;
}

.empty {
  color: #6b7785;
  font-size: 0.9rem;
  padding: 24px 0;
}

.table-wrap {
  overflow: auto;
  max-height: 360px;
}

table {
  width: 100%;
  border-collapse: collapse;
}

th, td {
  padding: 10px 8px;
  text-align: left;
  border-bottom: 1px solid #e8edf3;
  font-size: 0.85rem;
}

th {
  font-size: 0.72rem;
  font-weight: 600;
  letter-spacing: 0.04em;
  text-transform: uppercase;
  color: #6b7785;
  background: #f7f9fc;
  position: sticky;
  top: 0;
}

td:nth-child(2) {
  max-width: 160px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.chart-wrap {
  height: 320px;
}

.sales-panel {
  margin-top: 20px;
  min-height: 280px;
}

.sales-chart {
  height: 280px;
}

@media (max-width: 960px) {
  .dashboard-grid {
    grid-template-columns: 1fr;
  }
}
</style> 