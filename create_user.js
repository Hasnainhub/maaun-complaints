const fs = require('fs');
const { createClient } = require('@supabase/supabase-js');

const envFile = fs.readFileSync('.env.local', 'utf8');
const envUrl = envFile.match(/NEXT_PUBLIC_SUPABASE_URL="(.+)"/)[1];
const envKey = envFile.match(/SUPABASE_SERVICE_ROLE_KEY="(.+)"/)[1];

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || envUrl;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || envKey;
const supabase = createClient(supabaseUrl, supabaseKey);

async function createAndConfirm() {
    console.log('Creating confirmed user...');
    
    // Attempt to delete it first if it exists
    const { data: listData } = await supabase.auth.admin.listUsers();
    const existing = listData?.users?.find(u => u.email === 'test_verified@maaun.edu.ng');
    if (existing) {
        await supabase.auth.admin.deleteUser(existing.id);
        console.log('Deleted old user');
    }

    const { data: userDat, error } = await supabase.auth.admin.createUser({
        email: 'test_verified@maaun.edu.ng',
        password: 'Password123!',
        email_confirm: true,
        user_metadata: { full_name: 'Test Verified' }
    });
    
    if (error) {
        console.error('Error creating user:', error);
        return;
    }
    
    console.log('User created & confirmed! ID:', userDat.user.id);
    
    // Create profile
    const { error: profError } = await supabase.from('profiles').insert([
        { id: userDat.user.id, full_name: 'Test Verified', role: 'student' }
    ]);
    if (profError) {
        console.error('Profile creation error:', profError);
    } else {
        console.log('Profile created.');
    }
}
createAndConfirm();
