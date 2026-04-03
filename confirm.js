const fs = require('fs');
const { createClient } = require('@supabase/supabase-js');

const envFile = fs.readFileSync('.env.local', 'utf8');
const envUrl = envFile.match(/NEXT_PUBLIC_SUPABASE_URL="(.+)"/)[1];
const envKey = envFile.match(/SUPABASE_SERVICE_ROLE_KEY="(.+)"/)[1];

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || envUrl;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || envKey;
const supabase = createClient(supabaseUrl, supabaseKey);

async function confirm() {
    console.log('Fetching users...');
    const { data: { users }, error } = await supabase.auth.admin.listUsers();
    if (error) {
        console.error(error);
        return;
    }
    const user = users.find(u => u.email === 'test_user_new_C@maaun.edu.ng');
    if (user) {
        const { error: updateError } = await supabase.auth.admin.updateUserById(user.id, { email_confirm: true });
        if (updateError) {
             console.error('Update error:', updateError);
        } else {
             console.log('User confirmed successfully!');
        }
    } else {
        console.log('User not found.');
    }
}
confirm();
