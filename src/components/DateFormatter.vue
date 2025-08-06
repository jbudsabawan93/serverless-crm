<script setup lang="ts">
interface Props {
  date: string
  format?: 'YYYY-MM-DD' | 'DD/MM/YYYY' | 'MM/DD/YYYY'
}

const props = withDefaults(defineProps<Props>(), {
  format: 'YYYY-MM-DD'
})

const formatDate = (dateString: string) => {
  if (!dateString) return ''
  
  try {
    const date = new Date(dateString)
    if (isNaN(date.getTime())) {
      return dateString
    }

    const year = date.getFullYear()
    const month = String(date.getMonth() + 1).padStart(2, '0')
    const day = String(date.getDate()).padStart(2, '0')

    switch (props.format) {
      case 'DD/MM/YYYY':
        return `${day}/${month}/${year}`
      case 'MM/DD/YYYY':
        return `${month}/${day}/${year}`
      default:
        return `${year}-${month}-${day}`
    }
  } catch (err) {
    console.error('Error formatting date:', err)
    return dateString
  }
}
</script>

<template>
  <span :title="date">{{ formatDate(date) }}</span>
</template> 