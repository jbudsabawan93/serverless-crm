const AUTH_KEY = 'crm_auth'

export const DEMO_EMAIL = 'admin@mail.com'
export const DEMO_PASSWORD = '1234'

export function isAuthenticated(): boolean {
  return localStorage.getItem(AUTH_KEY) === '1'
}

export function login(email: string, password: string): boolean {
  const ok = email.trim().toLowerCase() === DEMO_EMAIL && password === DEMO_PASSWORD
  if (ok) localStorage.setItem(AUTH_KEY, '1')
  return ok
}

export function logout(): void {
  localStorage.removeItem(AUTH_KEY)
}
