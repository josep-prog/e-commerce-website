// Configuration management for environment variables
// This module loads and provides access to environment variables

class Config {
  constructor() {
    this.config = {}
    this.loadConfig()
  }

  loadConfig() {
    // Debug logging
    console.log('Config.loadConfig() called');
    console.log('window.ENV available?', !!window.ENV);
    console.log('window.ENV:', window.ENV);
    
    // In a real application with a build process, these would be loaded from process.env
    // For now, we'll use a configuration object that should be populated with actual values
    this.config = {
      // Supabase Configuration
      SUPABASE_URL: window.ENV?.SUPABASE_URL || 'your_supabase_project_url_here',
      SUPABASE_ANON_KEY: window.ENV?.SUPABASE_ANON_KEY || 'your_supabase_anon_key_here',
      SUPABASE_SERVICE_ROLE_KEY: window.ENV?.SUPABASE_SERVICE_ROLE_KEY || 'your_supabase_service_role_key_here',
      
      // Storage Configuration
      SUPABASE_STORAGE_URL: window.ENV?.SUPABASE_STORAGE_URL || 'your_supabase_project_url_here/storage/v1/object/public',
      
      // Email Configuration
      SENDER_EMAIL: window.ENV?.SENDER_EMAIL || 'noreply@yourstore.com',
      APP_PASSWORD: window.ENV?.APP_PASSWORD || 'your_app_specific_password_here',
      SMTP_HOST: window.ENV?.SMTP_HOST || 'smtp.gmail.com',
      SMTP_PORT: window.ENV?.SMTP_PORT || '587',
      SMTP_SECURE: window.ENV?.SMTP_SECURE === 'true',
      
      // App Configuration
      APP_NAME: window.ENV?.APP_NAME || 'E-Commerce Store',
      APP_DOMAIN: window.ENV?.APP_DOMAIN || 'yourstore.com',
      ADMIN_EMAIL: window.ENV?.ADMIN_EMAIL || 'admin@yourstore.com',
      DEFAULT_ADMIN_PASSWORD: window.ENV?.DEFAULT_ADMIN_PASSWORD || 'admin123456',
      
      // File Upload Configuration
      MAX_FILE_SIZE: parseInt(window.ENV?.MAX_FILE_SIZE || '10485760'), // 10MB
      ALLOWED_FILE_TYPES: (window.ENV?.ALLOWED_FILE_TYPES || 'pdf,doc,docx,txt,jpg,jpeg,png,gif').split(','),
      
      // Security Configuration
      JWT_SECRET: window.ENV?.JWT_SECRET || 'your_jwt_secret_key_here',
      BCRYPT_ROUNDS: parseInt(window.ENV?.BCRYPT_ROUNDS || '12'),
      
      // Development Configuration
      DEBUG_MODE: window.ENV?.DEBUG_MODE === 'true',
      LOG_LEVEL: window.ENV?.LOG_LEVEL || 'info'
    }
  }

  get(key, defaultValue = null) {
    return this.config[key] !== undefined ? this.config[key] : defaultValue
  }

  set(key, value) {
    this.config[key] = value
  }

  getAll() {
    return { ...this.config }
  }

  isProduction() {
    return !this.get('DEBUG_MODE', false)
  }

  isDevelopment() {
    return this.get('DEBUG_MODE', false)
  }

  // Validation methods
  validateRequired() {
    const requiredKeys = [
      'SUPABASE_URL',
      'SUPABASE_ANON_KEY',
      'APP_NAME'
    ]

    const missing = requiredKeys.filter(key => 
      !this.config[key] || this.config[key].includes('your_') || this.config[key].includes('_here')
    )

    if (missing.length > 0) {
      console.warn('Missing or incomplete environment configuration for:', missing)
      return false
    }

    return true
  }

  // File validation helpers
  isAllowedFileType(fileName) {
    const extension = fileName.split('.').pop()?.toLowerCase()
    return this.get('ALLOWED_FILE_TYPES').includes(extension)
  }

  isValidFileSize(fileSize) {
    return fileSize <= this.get('MAX_FILE_SIZE')
  }

  formatFileSize(bytes) {
    if (bytes === 0) return '0 Bytes'
    
    const k = 1024
    const sizes = ['Bytes', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
  }

  // Logging helpers
  log(level, message, ...args) {
    if (!this.isDevelopment()) return

    const levels = ['error', 'warn', 'info', 'debug']
    const currentLevel = levels.indexOf(this.get('LOG_LEVEL'))
    const messageLevel = levels.indexOf(level)

    if (messageLevel <= currentLevel) {
      console[level](`[${level.toUpperCase()}]`, message, ...args)
    }
  }

  logError(message, ...args) {
    this.log('error', message, ...args)
  }

  logWarn(message, ...args) {
    this.log('warn', message, ...args)
  }

  logInfo(message, ...args) {
    this.log('info', message, ...args)
  }

  logDebug(message, ...args) {
    this.log('debug', message, ...args)
  }
}

// Create and export singleton instance
const config = new Config()

// Validate configuration on load
if (config.isDevelopment()) {
  config.validateRequired()
}

export default config

// For convenience, also export individual getters
export const {
  SUPABASE_URL,
  SUPABASE_ANON_KEY,
  SUPABASE_SERVICE_ROLE_KEY,
  SUPABASE_STORAGE_URL,
  APP_NAME,
  ADMIN_EMAIL,
  MAX_FILE_SIZE,
  ALLOWED_FILE_TYPES
} = config.getAll()
