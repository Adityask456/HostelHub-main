import bcrypt from 'bcrypt';
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config({ path: './.env.local' });

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

const supabase = createClient(supabaseUrl, supabaseServiceRoleKey);

async function setupWarden() {
  try {
    // Delete existing warden
    const { error: deleteError } = await supabase
      .from('user')
      .delete()
      .eq('email', 'warden@hostel.com');

    if (deleteError) throw deleteError;
    console.log('Deleted old warden account');

    // Generate hash
    const password = '123456';
    const hash = await bcrypt.hash(password, 10);
    console.log('Generated hash:', hash);

    // Create new warden
    const { data: warden, error: createError } = await supabase
      .from('user')
      .insert({
        name: 'Warden Admin',
        email: 'warden@hostel.com',
        password: hash,
        role: 'WARDEN'
      })
      .select()
      .single();

    if (createError) throw createError;

    console.log('\n✅ Warden account created successfully!');
    console.log('Email: warden@hostel.com');
    console.log('Password: 123456');
    console.log('Role: WARDEN');

    // Verify
    const { data: testUser, error: fetchError } = await supabase
      .from('user')
      .select()
      .eq('email', 'warden@hostel.com')
      .single();

    if (fetchError) throw fetchError;

    const passwordMatch = await bcrypt.compare('123456', testUser.password);
    console.log('\nPassword verification:', passwordMatch ? '✅ PASS' : '❌ FAIL');

  } catch (err) {
    console.error('Error:', err.message);
  }
}

setupWarden();
