// Supabase client configuration
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

// Load environment variables (you'll need to replace these with your actual values)
const SUPABASE_URL = 'your_supabase_project_url_here'
const SUPABASE_ANON_KEY = 'your_supabase_anon_key_here'

// Initialize Supabase client
const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY)

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
