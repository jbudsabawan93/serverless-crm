<script setup lang="ts">
import Swal from 'sweetalert2'
import trashIcon from '../assets/trash.svg'

interface Props {
  itemId: string
  itemName: string
  itemType: string
  onDelete: (id: string) => Promise<void>
}

const props = defineProps<Props>()

const handleDelete = async () => {
  const result = await Swal.fire({
    title: 'Confirm',
    text: `Are you sure you want to delete ${props.itemName}?`,
    icon: 'warning',
    showCancelButton: true,
    confirmButtonColor: '#dc3545',
    cancelButtonColor: '#6c757d',
    confirmButtonText: 'Yes, delete it.',
    cancelButtonText: 'Cancle'
  })

  if (result.isConfirmed) {
    try {
      await props.onDelete(props.itemId)
      
      // แสดงข้อความแจ้งเตือนเมื่อลบสำเร็จ
      const successResult = await Swal.fire({
        title: 'Successfully!',
        text: `${props.itemType} has been deleted.`,
        icon: 'success',
        confirmButtonColor: '#4382D0'
      })

      // รีเฟรชหน้าหลังจากกดปิดป๊อปอัพ
      if (successResult.isConfirmed) {
        window.location.reload()
      }
    } catch (err) {
      Swal.fire({
        title: 'Error!',
        text: err instanceof Error ? err.message : `Could not delete ${props.itemType}, Please try again.`,
        icon: 'error',
        confirmButtonColor: '#dc3545'
      })
    }
  }
}
</script>

<template>
  <button 
    @click="handleDelete"
    class="action-button delete"
    :title="`Delete${itemType}`"
  >
    <img :src="trashIcon" alt="Delete">
  </button>
</template>

<style scoped>
.action-button {
  background: none;
  border: none;
  cursor: pointer;
  padding: 4px 8px;
  font-size: 1.2rem;
  opacity: 0.7;
  transition: opacity 0.2s;
}

.action-button:hover {
  opacity: 1;
}

.action-button.delete {
  color: #dc3545;
}
</style> 