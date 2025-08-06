<script setup lang="ts">
import { config } from '../config'

interface Props {
  title: string
  data: any
  fields?: { label: string; key: string }[]
}

const props = withDefaults(defineProps<Props>(), {
  fields: () => []
})

const handlePrint = async () => {
  try {
    // Fetch customer data
    const response = await fetch(`${config.API_URL}/customers`)
    const customers = await response.json()
    
    if (!response.ok) {
      throw new Error(customers.error || 'Failed to fetch customer data')
    }
    
    // Find customer by orderNumber
    const customer = customers.find((c: any) => c.order_number === props.data.orderNumber)
    
    // Convert data to plain object
    const plainData = {
      orderId: props.data.orderId,
      orderNumber: props.data.orderNumber,
      productName: props.data.productName,
      price: props.data.price,
      amount: props.data.amount,
      total: props.data.total,
      orderDate: props.data.orderDate,
      customerName: customer?.full_name || 'N/A',
      customerAddress: customer?.address || 'N/A',
      customerPhone: customer?.telephone || 'N/A'
    }

    // Open preview window
    const printWindow = window.open('/src/components/html/invoice-preview.html', '_blank')
    if (printWindow) {
      printWindow.onload = () => {
        printWindow.postMessage({
          type: 'renderInvoice',
          invoiceData: plainData
        }, '*')
      }
    }
  } catch (error) {
    // Show error message to user
    alert('Unable to retrieve customer data. Please try again.')
  }
}
</script>

<template>
  <button 
    @click="handlePrint"
    class="action-button print"
    title="Print"
  >
    <img src="/src/assets/printer.svg" alt="Print">
  </button>
</template>

<style scoped>
.action-button {
  background: none;
  border: 1px solid #ccc;
  border-radius: 6px;
  padding: 6px 12px;
  cursor: pointer;
  font-size: 1rem;
  transition: background 0.3s;
}

.action-button:hover {
  background: #f0f0f0;
}

.action-button.print {
  color: #4382D0;
}
</style>