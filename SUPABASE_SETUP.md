# Supabase Setup Instructions

## 1. Create Your Supabase Project

1. Go to [https://supabase.com](https://supabase.com)
2. Sign up/Sign in to your account
3. Click "New Project"
4. Choose your organization
5. Name your project (e.g., "e-commerce-store")
6. Create a strong database password
7. Choose your region
8. Click "Create new project"

## 2. Get Your Project Credentials

1. Go to Settings → API
2. Copy the following values:
   - **Project URL**: This is your `SUPABASE_URL`
   - **anon public**: This is your `SUPABASE_ANON_KEY`
   - **service_role**: This is your `SUPABASE_SERVICE_ROLE_KEY` (keep this secret!)

3. Update your `.env` file with these values:
```env
SUPABASE_URL=https://your-project-ref.supabase.co
SUPABASE_ANON_KEY=your-anon-key-here
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key-here
SUPABASE_STORAGE_URL=https://your-project-ref.supabase.co/storage/v1/object/public
```

## 3. Set Up Database Tables

1. Go to the SQL Editor in your Supabase dashboard
2. Copy the entire content from `database-setup.sql`
3. Paste it into the SQL Editor
4. Click "Run" to execute the script
5. This will create all the necessary tables, policies, and functions

## 4. Set Up Storage Bucket

### Create the Bucket
1. Go to Storage in your Supabase dashboard
2. Click "New bucket"
3. Name it `product-images`
4. Make it **Public** (toggle the "Public bucket" option)
5. Click "Create bucket"

### Set Up Bucket Policies
1. Click on the `product-images` bucket
2. Go to "Policies" tab
3. Create the following policies:

#### SELECT Policy (Public Read Access)
- **Policy name**: `Public read access`
- **Allowed operation**: SELECT
- **Policy definition**:
```sql
(bucket_id = 'product-images')
```

#### INSERT Policy (Admin Only Upload)
- **Policy name**: `Admin upload only`
- **Allowed operation**: INSERT
- **Policy definition**:
```sql
(bucket_id = 'product-images') AND (
  EXISTS (
    SELECT 1 FROM profiles 
    WHERE profiles.id = auth.uid() 
    AND profiles.role = 'admin'
  )
)
```

#### UPDATE Policy (Admin Only)
- **Policy name**: `Admin update only`
- **Allowed operation**: UPDATE
- **Policy definition**:
```sql
(bucket_id = 'product-images') AND (
  EXISTS (
    SELECT 1 FROM profiles 
    WHERE profiles.id = auth.uid() 
    AND profiles.role = 'admin'
  )
)
```

#### DELETE Policy (Admin Only)
- **Policy name**: `Admin delete only`
- **Allowed operation**: DELETE
- **Policy definition**:
```sql
(bucket_id = 'product-images') AND (
  EXISTS (
    SELECT 1 FROM profiles 
    WHERE profiles.id = auth.uid() 
    AND profiles.role = 'admin'
  )
)
```

## 5. Configure Authentication Settings

1. Go to Authentication → Settings
2. **Site URL**: Set this to your domain (e.g., `http://localhost:3000` for development)
3. **Redirect URLs**: Add your allowed redirect URLs
4. **Email Templates**: Customize signup/login emails if needed
5. **Auth Providers**: Enable/disable providers as needed (Email is enabled by default)

## 6. Set Up Real-time

1. Go to Database → Replication
2. Enable real-time for these tables:
   - `products`
   - `orders`
   - `order_items`
   - `categories`

## 7. Create Your First Admin User

After setting up everything:

1. Sign up for an account normally through your application
2. Go to SQL Editor in Supabase
3. Run this query to make your account an admin:
```sql
UPDATE profiles 
SET role = 'admin' 
WHERE email = 'your-email@example.com';
```

## 8. Test Your Setup

1. Try signing up/signing in
2. Check if the profile is created automatically
3. Test product image upload (as admin)
4. Verify real-time updates work

## 9. Security Considerations

- **Never expose your service role key** in client-side code
- The service role key should only be used server-side if needed
- Always use the anon key for client-side operations
- RLS (Row Level Security) policies protect your data
- Review and test all policies before going to production

## 10. Environment Variables for Production

When deploying to production, make sure to:
- Set your actual domain in the SUPABASE_URL
- Use environment variables for all secrets
- Update redirect URLs in Supabase settings
- Test all functionality in production environment

## Troubleshooting

### Common Issues:

1. **"User not found" errors**: Check if the profile creation trigger is working
2. **Storage upload fails**: Verify bucket policies and user roles
3. **Real-time not working**: Make sure replication is enabled for tables
4. **Authentication redirects fail**: Check Site URL and Redirect URLs settings

### Useful SQL Queries for Debugging:

```sql
-- Check if user profiles are created
SELECT * FROM profiles;

-- Check user roles
SELECT email, role FROM profiles;

-- View all products
SELECT * FROM products;

-- Check bucket policies
SELECT * FROM storage.buckets WHERE name = 'product-images';
```
