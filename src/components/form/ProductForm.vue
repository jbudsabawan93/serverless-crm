<script setup lang="ts">
import { ref } from 'vue'
import DashboardLayout from '../DashboardLayout.vue'
import SubmitButton from '../SubmitButton.vue'
import { config } from '../../config'
import { RouterLink } from 'vue-router'

interface Product {
  productId: string
  productName: string
  description: string
  price: number
  quantity: number
  typeCode: string
  sku: string
  imageUrl: string
  createdAt: string
}

const products = ref<Product[]>([])
const newProduct = ref<Product>({
  productId: '',
  productName: '',
  description: '',
  price: 0,
  quantity: 0,
  typeCode: '',
  sku: '',
  imageUrl: '',
  createdAt: new Date().toISOString()
})

// ประเภทสินค้า
const productTypes = [
  { code: 'ELC', name: 'อิเล็กทรอนิกส์' },
  { code: 'CLT', name: 'เสื้อผ้า' },
  { code: 'FOD', name: 'อาหาร' },
  { code: 'BOK', name: 'หนังสือ' },
  { code: 'TOY', name: 'ของเล่น' }
]

const generateProductId = (): string => {
  const date = new Date();
  const year = date.getFullYear().toString().slice(-2);
  const month = (date.getMonth() + 1).toString().padStart(2, '0');
  const day = date.getDate().toString().padStart(2, '0');
  const random = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
  return `P${year}${month}${day}${random}`;
}

const addProduct = async () => {
  try {
    // Generate Product ID
    newProduct.value.productId = generateProductId()
    
    // Add to list
    products.value.push({ ...newProduct.value })
    
    // Reset form
    newProduct.value = {
      productId: '',
      productName: '',
      description: '',
      price: 0,
      quantity: 0,
      typeCode: '',
      sku: '',
      imageUrl: '',
      createdAt: new Date().toISOString()
    }
  } catch (error) {
    console.error('Error adding product:', error)
  }
}

const removeProduct = (index: number) => {
  products.value.splice(index, 1)
}

const handleSubmit = async () => {
  try {
    // Process each product
    for (const product of products.value) {
      const requestBody = {
        product_id: product.productId,
        imge_url: product.imageUrl,
        product_name: product.productName,
        description: product.description,
        price: product.price,
        quantity: product.quantity,
        category: product.typeCode,
        sku: product.sku,
        createdAt: product.createdAt
      };

      const response = await fetch(`${config.API_URL}/products`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestBody)
      });

      const data = await response.json();

      if (!response.ok || data.status !== 'success') {
        throw new Error(data.error || 'Failed to save data for product ' + product.productId);
      }
    }

    // Reset form after all products are saved successfully
    products.value = []
    newProduct.value = {
      productId: '',
      productName: '',
      description: '',
      price: 0,
      quantity: 0,
      typeCode: '',
      sku: '',
      imageUrl: '',
      createdAt: new Date().toISOString()
    }
  } catch (error) {
    alert(error instanceof Error ? error.message : 'Failed to save products')
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

// เพิ่มฟังก์ชันสำหรับจัดการการอัพโหลดรูปภาพ
const handleImageUpload = async (event: Event) => {
  const input = event.target as HTMLInputElement;
  if (input.files && input.files[0]) {
    const file = input.files[0];
    const reader = new FileReader();
    
    reader.onload = async (e) => {
      if (e.target?.result) {
        const base64String = e.target.result as string;
        // บีบอัดรูปภาพก่อนบันทึก
        newProduct.value.imageUrl = await compressImage(base64String);
      }
    };
    
    reader.readAsDataURL(file);
  }
};
</script>

<template>
  <DashboardLayout>
    <div class="products-page">
      <div class="back-button-container">
        <RouterLink to="/products/" class="back-button">
          <i class="fas fa-chevron-left"></i>BACK
        </RouterLink>
      </div>
      <div class="product-form">
        <h1>Add New Product</h1>
        <div class="form-container">
          <form @submit.prevent="addProduct">
            <div class="form-flex">
              <div class="form-table">
                <div class="form-group full-width">
                  <label for="name">Product Name</label>
                  <input 
                    type="text" 
                    id="name"
                    v-model="newProduct.productName"
                    required
                  >
                </div>

                <div class="form-group">
                  <label for="typeCode">Category</label>
                  <select
                    id="typeCode"
                    v-model="newProduct.typeCode"
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
                    v-model="newProduct.sku"
                  >
                </div>

                <div class="form-group">
                  <label for="price">Price</label>
                  <input 
                    type="number" 
                    id="price"
                    v-model="newProduct.price"
                    min="0"
                    step="0.01"
                    required
                  >
                </div>

                <div class="form-group">
                  <label for="quantity">Qty</label>
                  <input 
                    type="number" 
                    id="quantity"
                    v-model="newProduct.quantity"
                    min="0"
                    required
                  >
                </div>

                <div class="form-group full-width">
                  <label for="description">Description</label>
                  <textarea
                    id="description"
                    v-model="newProduct.description"
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
                  <div class="image-preview" v-if="newProduct.imageUrl">
                    <img 
                      :src="newProduct.imageUrl" 
                      :alt="newProduct.productName"
                      class="preview-image"
                    >
                    <button 
                      type="button" 
                      class="remove-image-button"
                      @click="newProduct.imageUrl = ''"
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

                <div class="add-container">
                  <button type="submit" class="add-button">Add Item</button>
                </div>
              </div>
            </div>
          </form>
        </div>

        <div class="product-table" v-if="products.length > 0">
          <table>
            <thead>
              <tr>
                <th>Product ID</th>
                <th>Image</th>
                <th>Product Name</th>
                <th>Price</th>
                <th>Qty</th>
                <th>Category</th>
                <th>SKU</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="(product, index) in products" :key="index">
                <td>{{ product.productId }}</td>
                <td class="image-cell">
                  <img 
                    v-if="product.imageUrl" 
                    :src="product.imageUrl" 
                    :alt="product.productName"
                    class="product-image"
                  >
                  <span v-else class="no-image">No Image</span>
                </td>
                <td>{{ product.productName }}</td>
                <td>{{ product.price }}</td>
                <td>{{ product.quantity }}</td>
                <td>{{ product.typeCode }}</td>
                <td>{{ product.sku }}</td>
                <td>
                  <button 
                    @click="removeProduct(index)"
                    class="remove-button"
                    title="Remove product"
                  >
                    ❌
                  </button>
                </td>
              </tr>
            </tbody>
          </table>
          <div class="submit-container">
            <SubmitButton 
              :disabled="products.length === 0"
              :onSubmit="handleSubmit"
              redirectTo="/products"
            />
          </div>
        </div>
      </div>
    </div>
  </DashboardLayout>
</template>

<style scoped>
.products-page {
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
.form-container{
  max-width: 800px;
  margin: 0 auto 4rem;
}
.form-container .form-flex {
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

input:focus,
select:focus,
textarea:focus {
  outline: none;
  border-color: #4382D0;
  box-shadow: 0 0 0 2px rgba(67, 130, 208, 0.1);
}

.add-container {
  text-align: center;
  margin: 20px 0;
}

.add-button {
  background-color: #4382D0;
  color: white;
  padding: 10px 20px;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-weight: 500;
}

.add-button:hover {
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
td:nth-child(1),
th:nth-child(2), 
td:nth-child(2) {
  width: 10%;
}

th:nth-child(3), 
td:nth-child(3) {
  width: 12%;
}

th:nth-child(4), 
td:nth-child(4),
th:nth-child(6), 
td:nth-child(6),
th:nth-child(7), 
td:nth-child(7),
th:nth-child(9), 
td:nth-child(9) {
  width: 10%;
}

th:nth-child(5), 
td:nth-child(5) {
  text-align: center;
}

th:nth-child(5), 
td:nth-child(5),
th:nth-child(8), 
td:nth-child(8) {
  width: 6%;
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

.remove-button {
  background: none;
  border: none;
  cursor: pointer;
  padding: 4px;
}

.submit-container {
  text-align: center;
  margin-top: 20px;
}

.image-cell {
  width: 80px;
  text-align: center;
}

.product-image {
  width: 100px;
  height: 100px;
  object-fit: cover;
  border-radius: 4px;
}

.no-image {
  color: #999;
  font-size: 12px;
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
  max-height: 200px;
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