const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

async function createConfirmedUser() {
  const { data, error } = await supabase.auth.admin.createUser({
    email: 'confirmed_test_user@maaun.edu.ng',
    password: 'Password123!',
    email_confirm: true,
    user_metadata: { full_name: 'Confirmed Tester' }
  });
  
  if (error) {
    if (error.message.includes('already registered')) {
      console.log('User already exists. Updating password and email_confirm...');
      const { data: qData, error: qError } = await supabase.from('auth.users').update({ email_confirmed_at: new Date() }).eq('email', 'confirmed_test_user@maaun.edu.ng');
    } else {
      console.error('Error creating user:', error);
    }
  } else {
    console.log('User created successfully:', data.user.id);
    
    // Create profile
    await supabase.from('profiles').upsert([
        { id: data.user.id, full_name: 'Confirmed Tester', role: 'student' }
    ]);
    console.log('Profile created successfully');
  }
}

createConfirmedUser();
