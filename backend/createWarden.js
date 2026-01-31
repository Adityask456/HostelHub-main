import bcrypt from 'bcrypt';
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config({ path: './.env.local' });

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

const supabase = createClient(supabaseUrl, supabaseServiceRoleKey);

async function createWarden() {
  try {
    const hash = await bcrypt.hash('password123', 10);
    console.log('Generated hash:', hash);
    
    const { data: user, error } = await supabase
      .from('user')
      .insert({
        name: 'Warden John',
        email: 'warden@hostel.com',
        password: hash,
        role: 'WARDEN'
      })
      .select()
      .single();

    if (error) throw error;

    console.log('Warden created successfully!');
    console.log('Email:', user.email);
    console.log('Password: password123');
  } catch (err) {
    console.error('Error:', err.message);
  }
}

createWarden();
