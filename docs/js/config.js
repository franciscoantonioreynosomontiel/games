// Supabase and Cloudinary Configuration
// Replace the placeholders with your actual credentials

// Supabase Credentials
const SUPABASE_URL = 'YOUR_SUPABASE_URL';
const SUPABASE_ANON_KEY = 'YOUR_SUPABASE_ANON_KEY';

// Cloudinary Credentials
// To use Cloudinary, set your cloud name below (Line 10)
const CLOUDINARY_CLOUD_NAME = 'YOUR_CLOUDINARY_CLOUD_NAME';

const supabaseClient = supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// Export configurations if needed, or use them globally
window.appConfig = {
    supabase: supabaseClient,
    cloudinaryCloudName: CLOUDINARY_CLOUD_NAME
};
