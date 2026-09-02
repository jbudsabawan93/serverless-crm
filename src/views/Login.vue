<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { login } from '../auth'
import logo from '../assets/logo.png'

const router = useRouter()

const email = ref('')
const password = ref('')
const showPassword = ref(false)
const isSubmitting = ref(false)
const error = ref('')

const handleSubmit = async () => {
  error.value = ''
  isSubmitting.value = true
  if (login(email.value, password.value)) {
    await router.replace('/')
  } else {
    error.value = 'Invalid email or password'
  }
  isSubmitting.value = false
}
</script>

<template>
  <div class="login-page">
    <div class="login-shell">
      <aside class="login-brand">
        <div class="brand-glow"></div>
        <img :src="logo" alt="CRM managment" class="brand-logo">
        <h1>CRM managment</h1>
        <p>Manage customers, products, and orders in one place.</p>
      </aside>

      <section class="login-panel">
        <div class="panel-header">
          <h2>Sign in</h2>
          <p>Welcome back. Please enter your details.</p>
        </div>

        <form @submit.prevent="handleSubmit">
          <div v-if="error" class="form-error">{{ error }}</div>

          <div class="form-group">
            <label for="email">Email</label>
            <div class="input-wrap">
              <input
                id="email"
                v-model="email"
                type="email"
                autocomplete="username"
                placeholder="Enter email"
                required
                autofocus
              >
            </div>
          </div>

          <div class="form-group">
            <label for="password">Password</label>
            <div class="input-wrap">
              <input
                id="password"
                v-model="password"
                :type="showPassword ? 'text' : 'password'"
                autocomplete="current-password"
                placeholder="Enter password"
                required
              >
              <button
                type="button"
                class="toggle-password"
                :aria-label="showPassword ? 'Hide password' : 'Show password'"
                @click="showPassword = !showPassword"
              >
                <i :class="showPassword ? 'fas fa-eye-slash' : 'fas fa-eye'"></i>
              </button>
            </div>
          </div>

          <button type="submit" class="login-button" :disabled="isSubmitting">
            {{ isSubmitting ? 'Signing in...' : 'Sign in' }}
          </button>
        </form>
      </section>
    </div>
  </div>
</template>

<style scoped>
.login-page {
  min-height: 100vh;
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 24px;
  background:
    radial-gradient(circle at 12% 18%, rgba(67, 130, 208, 0.28), transparent 34%),
    radial-gradient(circle at 88% 82%, rgba(67, 130, 208, 0.18), transparent 32%),
    #1E2D40;
}

.login-shell {
  width: 100%;
  max-width: 920px;
  min-height: 540px;
  display: grid;
  grid-template-columns: 1fr 1fr;
  background: #fff;
  border-radius: 28px;
  overflow: hidden;
  box-shadow: 0 28px 80px rgba(0, 0, 0, 0.35);
}

.login-brand {
  position: relative;
  display: flex;
  flex-direction: column;
  justify-content: center;
  padding: 56px 48px;
  color: #fff;
  background: linear-gradient(165deg, #1E2D40 0%, #24364d 58%, #316eb9 140%);
  overflow: hidden;
}

.brand-glow {
  position: absolute;
  width: 240px;
  height: 240px;
  right: -60px;
  bottom: -70px;
  border-radius: 50%;
  background: rgba(67, 130, 208, 0.28);
  filter: blur(8px);
}

.brand-logo {
  width: 92px;
  height: 92px;
  object-fit: contain;
  margin-bottom: 24px;
  position: relative;
  z-index: 1;
}

.login-brand h1 {
  margin: 0;
  font-size: 1.85rem;
  font-weight: 700;
  letter-spacing: -0.02em;
  line-height: 1.2;
  position: relative;
  z-index: 1;
}

.login-brand p {
  margin: 12px 0 0;
  max-width: 280px;
  color: rgba(255, 255, 255, 0.72);
  font-size: 0.98rem;
  line-height: 1.55;
  position: relative;
  z-index: 1;
}

.login-panel {
  display: flex;
  flex-direction: column;
  justify-content: center;
  padding: 56px 48px;
  color: #2c3e50;
}

.panel-header {
  margin-bottom: 28px;
}

.panel-header h2 {
  margin: 0;
  font-size: 1.45rem;
  font-weight: 700;
  color: #1E2D40;
}

.panel-header p {
  margin: 8px 0 0;
  color: #8a94a3;
}

.form-group {
  margin-bottom: 18px;
}

label {
  display: block;
  margin-bottom: 8px;
  font-weight: 600;
  font-size: 0.92rem;
  color: #1E2D40;
}

.input-wrap {
  position: relative;
}

input {
  width: 100%;
  padding: 13px 14px;
  border: 1px solid #e4e8ee;
  border-radius: 12px;
  font-size: 15px;
  background: #f7f9fc;
  color: #2c3e50;
  transition: border-color 0.2s, box-shadow 0.2s, background 0.2s;
}

#password {
  padding-right: 44px;
}

input:focus {
  outline: none;
  border-color: #4382D0;
  background: #fff;
  box-shadow: 0 0 0 4px rgba(67, 130, 208, 0.15);
}

.toggle-password {
  position: absolute;
  right: 8px;
  top: 50%;
  transform: translateY(-50%);
  width: 32px;
  height: 32px;
  padding: 0;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  background: none;
  border: none;
  color: #8a94a3;
  cursor: pointer;
}

.toggle-password:hover {
  color: #4382D0;
  border-color: transparent;
}

.login-button {
  width: 100%;
  margin-top: 10px;
  background: linear-gradient(180deg, #4d8dd6 0%, #4382D0 100%);
  color: #fff;
  padding: 13px 20px;
  border: none;
  border-radius: 12px;
  cursor: pointer;
  font-size: 16px;
  font-weight: 600;
  box-shadow: 0 10px 22px rgba(67, 130, 208, 0.28);
}

.login-button:hover:not(:disabled) {
  background: linear-gradient(180deg, #3d7cc8 0%, #316eb9 100%);
  border-color: transparent;
}

.login-button:disabled {
  background: #cccccc;
  box-shadow: none;
  cursor: not-allowed;
}

.form-error {
  margin-bottom: 16px;
  padding: 10px 12px;
  border-radius: 10px;
  background: #ffebee;
  color: #c62828;
  text-align: center;
  font-size: 0.9rem;
}

@media (max-width: 800px) {
  .login-shell {
    grid-template-columns: 1fr;
    min-height: auto;
  }

  .login-brand {
    padding: 36px 32px 28px;
    align-items: center;
    text-align: center;
  }

  .login-brand p {
    max-width: none;
  }

  .brand-logo {
    width: 76px;
    height: 76px;
    margin-bottom: 16px;
  }

  .login-brand h1 {
    font-size: 1.7rem;
  }

  .login-panel {
    padding: 32px;
  }
}
</style>
