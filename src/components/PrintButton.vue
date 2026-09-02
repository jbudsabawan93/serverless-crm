<script setup lang="ts">
import { apiFetch } from '../api'
import printerIcon from '../assets/printer.svg'

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
    const response = await apiFetch('/customers')
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

    const printWindow = window.open('/invoice-preview.html', '_blank')
    if (printWindow) {
      const payload = { type: 'renderInvoice', invoiceData: plainData }
      const send = () => printWindow.postMessage(payload, window.location.origin)
      printWindow.onload = send
      setTimeout(send, 300)
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
    <img :src="printerIcon" alt="Print">
  </button>
</template>

<style scoped>
.action-button {
  background: none;
  border: none;
  cursor: pointer;
  padding: 4px 6px;
  font-size: 1rem;
  opacity: 0.7;
  transition: opacity 0.2s;
}

.action-button:hover {
  background: none;
  opacity: 1;
}

.action-button.print {
  color: #4382D0;
}
</style>