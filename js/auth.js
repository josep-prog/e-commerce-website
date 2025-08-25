// Authentication module
import { auth } from './supabase.js'

// DOM elements
const signupForm = document.querySelector('#signup-form')
const loginForm = document.querySelector('#login-form')
const authModal = document.querySelector('.auth-modal')
const userProfileDropdown = document.querySelector('.user-profile-dropdown')

// Current user state
let currentUser = null

// Initialize authentication
export async function initAuth() {
  // Check initial auth state
  currentUser = await auth.getCurrentUser()
  updateUI()
  
  // Listen for auth state changes
  auth.onAuthStateChange((event, session) => {
    currentUser = session?.user || null
    updateUI()
    
    // Redirect based on user role after login
    if (event === 'SIGNED_IN' && currentUser) {
      handleSuccessfulLogin()
    }
    
    // Handle logout
    if (event === 'SIGNED_OUT') {
      handleLogout()
    }
  })
  
  // Set up form listeners
  setupFormListeners()
}

// Set up form event listeners
function setupFormListeners() {
  // Signup form
  if (signupForm) {
    signupForm.addEventListener('submit', handleSignup)
  }
  
  // Login form
  if (loginForm) {
    loginForm.addEventListener('submit', handleLogin)
  }
  
  // Profile dropdown toggle
  const profileButton = document.querySelector('.profile-button')
  if (profileButton) {
    profileButton.addEventListener('click', toggleProfileDropdown)
  }
  
  // Logout button
  const logoutButton = document.querySelector('.logout-button')
  if (logoutButton) {
    logoutButton.addEventListener('click', handleLogoutClick)
  }
  
  // Close dropdown when clicking outside
  document.addEventListener('click', (e) => {
    if (!e.target.closest('.user-profile')) {
      closeProfileDropdown()
    }
  })
}

// Handle signup
async function handleSignup(e) {
  e.preventDefault()
  
  const formData = new FormData(e.target)
  const fullName = formData.get('fullName')
  const email = formData.get('email')
  const password = formData.get('password')
  const confirmPassword = formData.get('confirmPassword')
  
  // Validation
  if (password !== confirmPassword) {
    showError('Passwords do not match')
    return
  }
  
  if (password.length < 6) {
    showError('Password must be at least 6 characters long')
    return
  }
  
  try {
    showLoading(true)
    
    const { data, error } = await auth.signUp(email, password, {
      full_name: fullName
    })
    
    if (error) {
      showError(error.message)
      return
    }
    
    showSuccess('Account created successfully! Please check your email to confirm your account.')
    e.target.reset()
    
  } catch (error) {
    showError('An unexpected error occurred')
    console.error('Signup error:', error)
  } finally {
    showLoading(false)
  }
}

// Handle login
async function handleLogin(e) {
  e.preventDefault()
  
  const formData = new FormData(e.target)
  const email = formData.get('email')
  const password = formData.get('password')
  
  try {
    showLoading(true)
    
    const { data, error } = await auth.signIn(email, password)
    
    if (error) {
      showError(error.message)
      return
    }
    
    showSuccess('Login successful!')
    e.target.reset()
    
  } catch (error) {
    showError('An unexpected error occurred')
    console.error('Login error:', error)
  } finally {
    showLoading(false)
  }
}

// Handle successful login
async function handleSuccessfulLogin() {
  const isAdmin = await auth.isAdmin()
  
  // Redirect to appropriate dashboard
  setTimeout(() => {
    if (isAdmin) {
      window.location.href = '/admin/dashboard.html'
    } else {
      window.location.href = '/client/dashboard.html'
    }
  }, 1500)
}

// Handle logout click
async function handleLogoutClick(e) {
  e.preventDefault()
  
  try {
    const { error } = await auth.signOut()
    
    if (error) {
      showError('Error signing out')
      return
    }
    
    showSuccess('Logged out successfully!')
    
  } catch (error) {
    showError('An unexpected error occurred')
    console.error('Logout error:', error)
  }
}

// Handle logout
function handleLogout() {
  // Redirect to home page
  if (window.location.pathname.includes('/admin/') || window.location.pathname.includes('/client/')) {
    window.location.href = '/'
  }
}

// Update UI based on auth state
async function updateUI() {
  const headerRightLinks = document.querySelector('.header-right-links')
  const profileSection = headerRightLinks?.querySelector('.user-profile')
  const accountLink = headerRightLinks?.querySelector('a[href=\"account.html\"]')
  
  if (!headerRightLinks) return
  
  if (currentUser) {
    // User is logged in
    if (accountLink) {
      accountLink.style.display = 'none'
    }
    
    // Create or update profile section
    if (!profileSection) {
      createProfileSection(headerRightLinks)
    } else {
      updateProfileSection(profileSection)
    }
    
  } else {
    // User is not logged in
    if (accountLink) {
      accountLink.style.display = 'block'
    }
    
    if (profileSection) {
      profileSection.remove()
    }
  }
}

// Create profile section in header
function createProfileSection(headerRightLinks) {
  const profileHTML = `
    <div class=\"user-profile\">
      <button class=\"profile-button\">
        <i class=\"bi bi-person-circle\"></i>
        <span class=\"user-name\">Loading...</span>
      </button>
      <div class=\"user-profile-dropdown\">
        <div class=\"dropdown-header\">
          <div class=\"user-info\">
            <div class=\"user-name\">Loading...</div>
            <div class=\"user-email\">Loading...</div>
          </div>
        </div>
        <div class=\"dropdown-body\">
          <a href=\"/client/profile.html\" class=\"dropdown-item\">
            <i class=\"bi bi-person\"></i>
            Profile
          </a>
          <a href=\"#\" class=\"dropdown-item dashboard-link\">
            <i class=\"bi bi-speedometer2\"></i>
            Dashboard
          </a>
          <div class=\"dropdown-divider\"></div>
          <button class=\"dropdown-item logout-button\">
            <i class=\"bi bi-box-arrow-right\"></i>
            Logout
          </button>
        </div>
      </div>
    </div>
  `
  
  // Insert before search button
  const searchButton = headerRightLinks.querySelector('.search-button')
  searchButton.insertAdjacentHTML('beforebegin', profileHTML)
  
  // Set up event listeners for new elements
  setupProfileDropdownListeners()
  
  // Update profile data
  updateProfileData()
}

// Update profile section
function updateProfileSection(profileSection) {
  updateProfileData()
}

// Update profile data
async function updateProfileData() {
  if (!currentUser) return
  
  const userNameElements = document.querySelectorAll('.user-profile .user-name')
  const userEmailElements = document.querySelectorAll('.user-profile .user-email')
  const dashboardLink = document.querySelector('.dashboard-link')
  
  // Set basic user info
  userNameElements.forEach(el => {
    el.textContent = currentUser.user_metadata?.full_name || currentUser.email.split('@')[0]
  })
  
  userEmailElements.forEach(el => {
    el.textContent = currentUser.email
  })
  
  // Set dashboard link based on role
  if (dashboardLink) {
    const isAdmin = await auth.isAdmin()
    dashboardLink.href = isAdmin ? '/admin/dashboard.html' : '/client/dashboard.html'
    dashboardLink.innerHTML = `
      <i class=\"bi bi-speedometer2\"></i>
      ${isAdmin ? 'Admin Dashboard' : 'My Dashboard'}
    `
  }
}

// Set up profile dropdown listeners
function setupProfileDropdownListeners() {
  const profileButton = document.querySelector('.profile-button')
  const logoutButton = document.querySelector('.logout-button')
  
  if (profileButton) {
    profileButton.addEventListener('click', toggleProfileDropdown)
  }
  
  if (logoutButton) {
    logoutButton.addEventListener('click', handleLogoutClick)
  }
}

// Toggle profile dropdown
function toggleProfileDropdown(e) {
  e.preventDefault()
  e.stopPropagation()
  
  const dropdown = document.querySelector('.user-profile-dropdown')
  if (dropdown) {
    dropdown.classList.toggle('show')
  }
}

// Close profile dropdown
function closeProfileDropdown() {
  const dropdown = document.querySelector('.user-profile-dropdown')
  if (dropdown) {
    dropdown.classList.remove('show')
  }
}

// Utility functions
function showError(message) {
  // Create or update error toast
  showToast(message, 'error')
}

function showSuccess(message) {
  // Create or update success toast
  showToast(message, 'success')
}

function showToast(message, type = 'info') {
  // Remove existing toasts
  const existingToasts = document.querySelectorAll('.toast')
  existingToasts.forEach(toast => toast.remove())
  
  // Create toast
  const toast = document.createElement('div')
  toast.className = `toast toast-${type}`
  toast.innerHTML = `
    <div class=\"toast-content\">
      <i class=\"bi ${type === 'error' ? 'bi-exclamation-circle' : 'bi-check-circle'}\"></i>
      <span>${message}</span>
    </div>
    <button class=\"toast-close\">
      <i class=\"bi bi-x\"></i>
    </button>
  `
  
  // Add to document
  document.body.appendChild(toast)
  
  // Show toast
  setTimeout(() => toast.classList.add('show'), 100)
  
  // Auto remove after 5 seconds
  setTimeout(() => {
    toast.classList.remove('show')
    setTimeout(() => toast.remove(), 300)
  }, 5000)
  
  // Close button
  toast.querySelector('.toast-close').addEventListener('click', () => {
    toast.classList.remove('show')
    setTimeout(() => toast.remove(), 300)
  })
}

function showLoading(show) {
  const loadingOverlay = document.querySelector('.loading-overlay') || createLoadingOverlay()
  
  if (show) {
    loadingOverlay.style.display = 'flex'
  } else {
    loadingOverlay.style.display = 'none'
  }
}

function createLoadingOverlay() {
  const overlay = document.createElement('div')
  overlay.className = 'loading-overlay'
  overlay.innerHTML = `
    <div class=\"loading-spinner\">
      <i class=\"bi bi-arrow-clockwise\"></i>
      <span>Loading...</span>
    </div>
  `
  document.body.appendChild(overlay)
  return overlay
}

// Check if user is admin (for use in other modules)
export async function isAdmin() {
  return await auth.isAdmin()
}

// Get current user (for use in other modules)
export function getCurrentUser() {
  return currentUser
}

// Require authentication for protected pages
export function requireAuth() {
  if (!currentUser) {
    window.location.href = '/account.html'
    return false
  }
  return true
}

// Require admin role
export async function requireAdmin() {
  if (!currentUser) {
    window.location.href = '/account.html'
    return false
  }
  
  const isAdminUser = await auth.isAdmin()
  if (!isAdminUser) {
    window.location.href = '/'
    return false
  }
  
  return true
}
