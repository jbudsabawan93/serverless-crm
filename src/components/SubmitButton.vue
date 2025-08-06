<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import Swal from 'sweetalert2'

const router = useRouter()

const props = defineProps<{
  disabled?: boolean
  onSubmit: () => Promise<void>
  redirectTo?: string
}>()

const isSubmitting = ref(false)

const handleSubmit = async () => {
  try {
    const result = await Swal.fire({
      title: 'Confirm',
      text: 'Do you want to save this data?',
      icon: 'question',
      showCancelButton: true,
      confirmButtonText: 'Save',
      cancelButtonText: 'Cancle',
      confirmButtonColor: '#4CAF50',
      cancelButtonColor: '#dc3545'
    })

    if (result.isConfirmed) {
      isSubmitting.value = true
      await props.onSubmit()
      
      const successResult = await Swal.fire({
        title: 'Saved successfully!',
        text: 'The data has been saved successfully.',
        icon: 'success',
        confirmButtonColor: '#4CAF50'
      })

      if (successResult.isConfirmed && props.redirectTo) {
        router.push(props.redirectTo)
      }
    }
  } catch (error) {
    await Swal.fire({
      title: 'An error occurred!',
      text: error instanceof Error ? error.message : 'Failed to save data',
      icon: 'error',
      confirmButtonColor: '#dc3545'
    })
  } finally {
    isSubmitting.value = false
  }
}
</script>

<template>
  <button 
    @click="handleSubmit" 
    class="submit-button"
    :disabled="disabled || isSubmitting"
  >
    <span v-if="isSubmitting">Saving...</span>
    <span v-else>Save</span>
  </button>
</template>

<style scoped>
.submit-button {
  background-color: #4382D0;
  color: white;
  padding: 10px 20px;
  border: none;
  border-radius: 10px;
  cursor: pointer;
  width: auto;
}

.submit-button:hover:not(:disabled) {
  background-color: #316eb9;
}

.submit-button:disabled {
  background-color: #cccccc;
  cursor: not-allowed;
}
</style> 