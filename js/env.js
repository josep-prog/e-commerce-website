// Environment variables for browser
// These values are loaded from the .env file but exposed to the browser
console.log('env.js loading...');

window.ENV = {
  // Supabase Configuration
  SUPABASE_URL: 'https://spgcogdnkeuvkwggltod.supabase.co',
  SUPABASE_ANON_KEY: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InNwZ2NvZ2Rua2V1dmt3Z2dsdG9kIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTYyMDc3MzUsImV4cCI6MjA3MTc4MzczNX0.uBy8VntCQtkMZqzSFiMSNYhkZFVBEraNlMiW7_kJvhA',
  SUPABASE_SERVICE_ROLE_KEY: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InNwZ2NvZ2Rua2V1dmt3Z2dsdG9kIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1NjIwNzczNSwiZXhwIjoyMDcxNzgzNzM1fQ.5tQAr0NoXB3roYoiKNj7X5qBtPyISQrbxmGW7-AbVCI',
  
  // Storage Configuration
  SUPABASE_STORAGE_URL: 'https://spgcogdnkeuvkwggltod.supabase.co/storage/v1/object/public',
  SUPABASE_DOCUMENTS_BUCKET: 'bulk',
  
  // Email Configuration
  SENDER_EMAIL: 'citywest03@gmail.com',
  APP_PASSWORD: 'ktqr nzgk iywi vcsc',
  SMTP_HOST: 'smtp.gmail.com',
  SMTP_PORT: '587',
  SMTP_SECURE: 'false',
  
  // App Configuration
  APP_NAME: 'E-Commerce Store',
  APP_DOMAIN: 'yourstore.com',
  ADMIN_EMAIL: 'admin@yourstore.com',
  DEFAULT_ADMIN_PASSWORD: 'admin123456',
  
  // File Upload Configuration
  MAX_FILE_SIZE: '10485760',
  ALLOWED_FILE_TYPES: 'pdf,doc,docx,txt,jpg,jpeg,png,gif',
  
  // Security Configuration
  JWT_SECRET: 'XVmSCjlSz/Qwm4BErJvJycq/18Fb+xgcj9qD0oEyk5NDMsATjS7KjkVclsNauQCKUnmDdJR5wgA8XYsaQ9MJ8A==',
  BCRYPT_ROUNDS: '12',
  
  // Development Configuration
  DEBUG_MODE: 'true',
  LOG_LEVEL: 'info'
};

console.log('env.js loaded. window.ENV set to:', window.ENV);
