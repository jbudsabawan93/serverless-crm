<script setup lang="ts">
import DashboardLayout from '../components/DashboardLayout.vue'
import { ref, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import { config } from '../config'
import SubmitButton from '../components/SubmitButton.vue'

interface Product {
  productId: string
  productName: string
  description: string
  price: number
  quantity: number
  category: string
  sku: string
  imageUrl: string
  createdAt: string
}

const route = useRoute()

// ประเภทสินค้า
const productTypes = [
  { code: 'ELC', name: 'อิเล็กทรอนิกส์' },
  { code: 'CLT', name: 'เสื้อผ้า' },
  { code: 'FOD', name: 'อาหาร' },
  { code: 'BOK', name: 'หนังสือ' },
  { code: 'TOY', name: 'ของเล่น' }
]

const product = ref<Product>({
  productId: '',
  productName: '',
  description: '',
  price: 0,
  quantity: 0,
  category: '',
  sku: '',
  imageUrl: '',
  createdAt: ''
})

const isLoading = ref(true)
const error = ref<string | null>(null)

// ฟังก์ชันดึงข้อมูลสินค้า
const fetchProduct = async () => {
  try {
    isLoading.value = true
    error.value = null

    const response = await fetch(`${config.API_URL}/products`)
    const products = await response.json()

    if (response.ok) {
      const productData = products.find((p: any) => p.product_id === route.params.id)
      if (productData) {
        product.value = {
          productId: productData.product_id,
          productName: productData.product_name,
          description: productData.description,
          price: productData.price,
          quantity: productData.quantity,
          category: productData.category,
          sku: productData.sku,
          imageUrl: productData.imge_url,
          createdAt: productData.createdAt ? new Date(productData.createdAt).toISOString().split('T')[0] : ''
        }
      } else {
        throw new Error('Product not found')
      }
    } else {
      throw new Error(products.error || 'Failed to fetch products')
    }
  } catch (err) {
    error.value = err instanceof Error ? err.message : 'Failed to fetch product'
  } finally {
    isLoading.value = false
  }
}

// ฟังก์ชันสำหรับบีบอัดรูปภาพ
const compressImage = async (base64String: string, maxSize = 50000): Promise<string> => {
  return new Promise((resolve) => {
    const img = new Image();
    img.src = base64String;
    img.onload = () => {
      const canvas = document.createElement('canvas');
      let width = img.width;
      let height = img.height;
      
      // คำนวณขนาดใหม่เพื่อให้พอดีกับ maxSize
      while ((width * height * 0.75) > maxSize) {
        width *= 0.8;
        height *= 0.8;
      }
      
      canvas.width = width;
      canvas.height = height;
      const ctx = canvas.getContext('2d');
      ctx?.drawImage(img, 0, 0, width, height);
      
      // แปลงเป็น base64 ด้วยคุณภาพที่ต่ำลง
      const compressedBase64 = canvas.toDataURL('image/jpeg', 0.5);
      resolve(compressedBase64);
    };
  });
};

// ฟังก์ชันบันทึกข้อมูล
const handleSubmit = async () => {
  try {
    let imageUrl = product.value.imageUrl;
    if (imageUrl && imageUrl.startsWith('data:image')) {
      imageUrl = await compressImage(imageUrl);
    }

    const requestBody = {
      product_id: product.value.productId,
      imge_url: imageUrl || '',
      product_name: product.value.productName || '',
      description: product.value.description || '',
      price: product.value.price,
      quantity: product.value.quantity,
      category: product.value.category || '',
      sku: product.value.sku || '',
      createdAt: product.value.createdAt || new Date().toISOString()
    };

    const response = await fetch(`${config.API_URL}/products`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(requestBody),
    });

    const data = await response.json();

    if (!response.ok || data.status !== 'success') {
      throw new Error(data.error || 'Failed to update product');
    }
  } catch (err) {
    error.value = err instanceof Error ? err.message : 'An unknown error occurred';
    // Re-throw the error so the SubmitButton component can catch it
    throw err;
  }
}

// เพิ่มฟังก์ชันสำหรับจัดการการอัพโหลดรูปภาพ
const handleImageUpload = (event: Event) => {
  const input = event.target as HTMLInputElement
  if (input.files && input.files[0]) {
    const file = input.files[0]
    const reader = new FileReader()
    
    reader.onload = (e) => {
      if (e.target?.result) {
        product.value.imageUrl = e.target.result as string
      }
    }
    
    reader.readAsDataURL(file)
  }
}

// โหลดข้อมูลเมื่อ component ถูกโหลด
onMounted(() => {
  fetchProduct()
})
</script>

<template>
  <DashboardLayout>
    <div class="edit-product-page">
      <div class="back-button-container">
        <RouterLink to="/products/" class="back-button">
          <i class="fas fa-chevron-left"></i>BACK
        </RouterLink>
      </div>
      <div class="product-form">
        <h1>Edit Product</h1>
        <div class="form-container">
          <form @submit.prevent="handleSubmit">
            <div class="form-flex">
              <div class="form-table">
                <div class="form-group full-width">
                  <label for="name">Product Name</label>
                  <input 
                    type="text" 
                    id="name"
                    v-model="product.productName"
                    required
                  >
                </div>

                <div class="form-group">
                  <label for="typeCode">Category</label>
                  <select
                    id="typeCode"
                    v-model="product.category"
                    required
                  >
                    <option value="">Choose</option>
                    <option
                      v-for="type in productTypes"
                      :key="type.code"
                      :value="type.code"
                    >
                      {{ type.name }} ({{ type.code }})
                    </option>
                  </select>
                </div>

                <div class="form-group">
                  <label for="sku">SKU</label>
                  <input 
                    type="text" 
                    id="sku"
                    v-model="product.sku"
                  >
                </div>

                <div class="form-group">
                  <label for="price">Price</label>
                  <input 
                    type="number" 
                    id="price"
                    v-model="product.price"
                    min="0"
                    step="0.01"
                    required
                  >
                </div>

                <div class="form-group">
                  <label for="quantity">Quantity</label>
                  <input 
                    type="number" 
                    id="quantity"
                    v-model="product.quantity"
                    min="0"
                    required
                  >
                </div>

                <div class="form-group full-width">
                  <label for="description">Description</label>
                  <textarea
                    id="description"
                    v-model="product.description"
                    rows="3"
                    placeholder="กรอกรายละเอียดสินค้า"
                  ></textarea>
                </div>
              </div>

              <div class="form-group">
                <label for="imageUrl">Image</label>
                <div class="image-upload-container">
                  <input 
                    type="file" 
                    id="imageUrl"
                    accept="image/*"
                    @change="handleImageUpload"
                    class="image-upload-input"
                  >
                  <div class="image-preview" v-if="product.imageUrl">
                    <img 
                      :src="product.imageUrl" 
                      :alt="product.productName"
                      class="preview-image"
                    >
                    <button 
                      type="button" 
                      class="remove-image-button"
                      @click="product.imageUrl = ''"
                      title="Remove image"
                    >
                      ❌
                    </button>
                  </div>
                  <div v-else class="upload-placeholder">
                    <i class="fas fa-cloud-upload-alt"></i>
                    <span>Click to upload image</span>
                  </div>
                </div>

                <div class="submit-container">
                  <SubmitButton 
                    :onSubmit="handleSubmit"
                    redirectTo="/products"
                  />
                </div>
              </div>
            </div>
          </form>
        </div>
      </div>
    </div>
  </DashboardLayout>
</template>

<style scoped>
.edit-product-page {
  padding: 20px;
}

.back-button-container {
  margin-bottom: 20px;
}

.back-button {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 8px 16px;
  background-color: #f8f9fa;
  color: #333;
  text-decoration: none;
  border-radius: 4px;
  font-weight: 500;
}

.back-button:hover {
  background-color: #e9ecef;
}

.product-form {
  padding: 40px;
  background: white;
  border-radius: 30px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  overflow: auto;
}
.form-container {
  max-width: 800px;
  margin: auto;
}
.form-flex {
  display: flex;
  gap: 20px;
}

.form-container .form-table {
  display: flex;
  flex-wrap: wrap;
  gap: 20px;
  margin-bottom: 20px;
}

.form-group {
  margin-bottom: 15px;
  width: calc(50% - 10px);
}

.form-group.full-width {
  width: 100%;
}

h1 {
  margin: 2rem 0 4rem;
  text-align: center;
}

label {
  display: block;
  margin-bottom: 8px;
  font-weight: 500;
  color: #333;
}

input,
select,
textarea {
  width: 100%;
  padding: 8px 12px;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 14px;
}

input:disabled,
select:disabled {
  background-color: #f8f9fa;
  cursor: not-allowed;
}

input:focus,
select:focus,
textarea:focus {
  outline: none;
  border-color: #4382D0;
  box-shadow: 0 0 0 2px rgba(67, 130, 208, 0.1);
}

.submit-container {
  text-align: center;
  margin-top: 20px;
}

.image-upload-container {
  position: relative;
  width: 100%;
  min-height: 150px;
  border: 2px dashed #ddd;
  border-radius: 4px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: border-color 0.3s;
}

.image-upload-container:hover {
  border-color: #4382D0;
}

.image-upload-input {
  position: absolute;
  width: 100%;
  height: 100%;
  top: 0;
  left: 0;
  opacity: 0;
  cursor: pointer;
}

.image-preview {
  position: relative;
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 10px;
}

.preview-image {
  max-width: 100%;
  max-height: 150px;
  object-fit: contain;
  border-radius: 4px;
}

.remove-image-button {
  position: absolute;
  top: 5px;
  right: 5px;
  background: rgba(255, 255, 255, 0.8);
  border: none;
  border-radius: 50%;
  width: 24px;
  height: 24px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  font-size: 12px;
  transition: background-color 0.3s;
}

.remove-image-button:hover {
  background: rgba(255, 255, 255, 1);
}

.upload-placeholder {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
  color: #666;
}

.upload-placeholder i {
  font-size: 24px;
  color: #4382D0;
}

.upload-placeholder span {
  font-size: 14px;
}
</style> 