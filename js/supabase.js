// Supabase client configuration
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

// Debug logging
console.log('supabase.js loading...');
console.log('window.ENV available:', !!window.ENV);
console.log('window.ENV:', window.ENV);

// Get environment variables directly from window.ENV 
// This should be set by env.js which loads first
const SUPABASE_URL = window.ENV?.SUPABASE_URL || 'https://spgcogdnkeuvkwggltod.supabase.co'
const SUPABASE_ANON_KEY = window.ENV?.SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InNwZ2NvZ2Rua2V1dmt3Z2dsdG9kIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTYyMDc3MzUsImV4cCI6MjA3MTc4MzczNX0.uBy8VntCQtkMZqzSFiMSNYhkZFVBEraNlMiW7_kJvhA'

console.log('SUPABASE_URL:', SUPABASE_URL);
console.log('SUPABASE_ANON_KEY:', SUPABASE_ANON_KEY);

// Initialize Supabase client
console.log('Initializing Supabase client with URL:', SUPABASE_URL);
const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY)
console.log('Supabase client initialized successfully:', supabase);

// Authentication helpers
export const auth = {
  // Sign up new user
  async signUp(email, password, userData = {}) {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: userData
      }
    })
    return { data, error }
  },

  // Sign in user
  async signIn(email, password) {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password
    })
    return { data, error }
  },

  // Sign out user
  async signOut() {
    const { error } = await supabase.auth.signOut()
    return { error }
  },

  // Get current user
  async getCurrentUser() {
    const { data: { user } } = await supabase.auth.getUser()
    return user
  },

  // Check if user is admin
  async isAdmin() {
    const user = await this.getCurrentUser()
    if (!user) return false
    
    const { data, error } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single()
    
    return data?.role === 'admin'
  },

  // Listen to auth changes
  onAuthStateChange(callback) {
    return supabase.auth.onAuthStateChange(callback)
  }
}

// Database helpers
export const db = {
  // Products
  async getProducts(limit = null) {
    let query = supabase
      .from('products')
      .select(`
        *,
        categories (
          id,
          name,
          slug
        )
      `)
      .eq('is_active', true)
      .order('created_at', { ascending: false })
    
    if (limit) {
      query = query.limit(limit)
    }
    
    return await query
  },

  async getProduct(id) {
    const { data, error } = await supabase
      .from('products')
      .select(`
        *,
        categories (
          id,
          name,
          slug
        )
      `)
      .eq('id', id)
      .single()
    
    return { data, error }
  },

  async createProduct(productData) {
    const { data, error } = await supabase
      .from('products')
      .insert([productData])
      .select()
    
    return { data, error }
  },

  async updateProduct(id, productData) {
    const { data, error } = await supabase
      .from('products')
      .update(productData)
      .eq('id', id)
      .select()
    
    return { data, error }
  },

  async deleteProduct(id) {
    const { data, error } = await supabase
      .from('products')
      .delete()
      .eq('id', id)
    
    return { data, error }
  },

  // Categories
  async getCategories() {
    const { data, error } = await supabase
      .from('categories')
      .select('*')
      .eq('is_active', true)
      .order('name')
    
    return { data, error }
  },

  // Orders
  async createOrder(orderData) {
    const { data, error } = await supabase
      .from('orders')
      .insert([orderData])
      .select()
    
    return { data, error }
  },

  async getOrders(userId = null) {
    let query = supabase
      .from('orders')
      .select(`
        *,
        order_items (
          *,
          products (
            id,
            name,
            price,
            image_url
          )
        ),
        profiles (
          id,
          full_name,
          email
        )
      `)
      .order('created_at', { ascending: false })
    
    if (userId) {
      query = query.eq('user_id', userId)
    }
    
    return await query
  },

  async updateOrderStatus(orderId, status) {
    const { data, error } = await supabase
      .from('orders')
      .update({ status, updated_at: new Date().toISOString() })
      .eq('id', orderId)
      .select()
    
    return { data, error }
  },

  // Users/Profiles
  async getUsers() {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .order('created_at', { ascending: false })
    
    return { data, error }
  },

  async updateUserRole(userId, role) {
    const { data, error } = await supabase
      .from('profiles')
      .update({ role })
      .eq('id', userId)
      .select()
    
    return { data, error }
  },

  async updateUserStatus(userId, status, isBlocked = false, blockedReason = null) {
    const updateData = { 
      status, 
      is_blocked: isBlocked,
      blocked_reason: blockedReason,
      blocked_at: isBlocked ? new Date().toISOString() : null
    }
    
    const { data, error } = await supabase
      .from('profiles')
      .update(updateData)
      .eq('id', userId)
      .select()
    
    return { data, error }
  },

  async deleteUser(userId) {
    const { data, error } = await supabase
      .from('profiles')
      .delete()
      .eq('id', userId)
    
    return { data, error }
  },

  // Documents
  async getDocuments() {
    const { data, error } = await supabase
      .from('documents')
      .select(`
        *,
        profiles!uploaded_by (
          id,
          full_name,
          email
        )
      `)
      .eq('is_active', true)
      .eq('is_public', true)
      .order('created_at', { ascending: false })
    
    return { data, error }
  },

  async getAllDocuments() {
    const { data, error } = await supabase
      .from('documents')
      .select(`
        *,
        profiles!uploaded_by (
          id,
          full_name,
          email
        )
      `)
      .order('created_at', { ascending: false })
    
    return { data, error }
  },

  async getDocument(id) {
    const { data, error } = await supabase
      .from('documents')
      .select(`
        *,
        profiles!uploaded_by (
          id,
          full_name,
          email
        )
      `)
      .eq('id', id)
      .single()
    
    return { data, error }
  },

  async createDocument(documentData) {
    const { data, error } = await supabase
      .from('documents')
      .insert([documentData])
      .select()
    
    return { data, error }
  },

  async updateDocument(id, documentData) {
    const { data, error } = await supabase
      .from('documents')
      .update(documentData)
      .eq('id', id)
      .select()
    
    return { data, error }
  },

  async deleteDocument(id) {
    const { data, error } = await supabase
      .from('documents')
      .delete()
      .eq('id', id)
    
    return { data, error }
  },

  async incrementDocumentDownload(id) {
    // First get current count
    const { data: doc, error: fetchError } = await supabase
      .from('documents')
      .select('download_count')
      .eq('id', id)
      .single()
    
    if (fetchError) return { data: null, error: fetchError }
    
    // Then increment it
    const { data, error } = await supabase
      .from('documents')
      .update({ download_count: (doc.download_count || 0) + 1 })
      .eq('id', id)
      .select()
    
    return { data, error }
  }
}

// Storage helpers
export const storage = {
  // Upload product image
  async uploadProductImage(file, fileName) {
    const { data, error } = await supabase.storage
      .from('product-images')
      .upload(fileName, file)
    
    return { data, error }
  },

  // Delete product image
  async deleteProductImage(fileName) {
    const { data, error } = await supabase.storage
      .from('product-images')
      .remove([fileName])
    
    return { data, error }
  },

  // Get public URL for image
  getPublicUrl(bucketName, fileName) {
    const { data } = supabase.storage
      .from(bucketName)
      .getPublicUrl(fileName)
    
    return data.publicUrl
  },

  // Document storage
  async uploadDocument(file, fileName) {
    const bucketName = window.ENV?.SUPABASE_DOCUMENTS_BUCKET || 'bulk'
    const { data, error } = await supabase.storage
      .from(bucketName)
      .upload(fileName, file)
    
    return { data, error }
  },

  async deleteDocument(fileName) {
    const bucketName = window.ENV?.SUPABASE_DOCUMENTS_BUCKET || 'bulk'
    const { data, error } = await supabase.storage
      .from(bucketName)
      .remove([fileName])
    
    return { data, error }
  },

  async downloadDocument(fileName) {
    const bucketName = window.ENV?.SUPABASE_DOCUMENTS_BUCKET || 'bulk'
    const { data, error } = await supabase.storage
      .from(bucketName)
      .download(fileName)
    
    return { data, error }
  },

  getDocumentPublicUrl(fileName) {
    const bucketName = window.ENV?.SUPABASE_DOCUMENTS_BUCKET || 'bulk'
    const { data } = supabase.storage
      .from(bucketName)
      .getPublicUrl(fileName)
    
    return data.publicUrl
  }
}

// Real-time subscriptions
export const realtime = {
  // Subscribe to product changes
  subscribeToProducts(callback) {
    return supabase
      .channel('public:products')
      .on('postgres_changes', { 
        event: '*', 
        schema: 'public', 
        table: 'products' 
      }, callback)
      .subscribe()
  },

  // Subscribe to order changes
  subscribeToOrders(callback) {
    return supabase
      .channel('public:orders')
      .on('postgres_changes', { 
        event: '*', 
        schema: 'public', 
        table: 'orders' 
      }, callback)
      .subscribe()
  },

  // Unsubscribe from channel
  unsubscribe(subscription) {
    return supabase.removeChannel(subscription)
  }
}

export default supabase
