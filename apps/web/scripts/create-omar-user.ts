// create-omar-user.ts
import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = 'https://hqedvzvkalvefoodqsgr.supabase.co';
const SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY!;

const supabase = createClient(SUPABASE_URL, SERVICE_ROLE_KEY);

async function main() {
  console.log('Creando usuario Omar Al-Mansouri...\n');

  const { data, error } = await supabase.auth.admin.createUser({
    email: 'omar.almansouri@meridianharbor.com',
    password: 'MHRealty2024!',
    email_confirm: true,
    user_metadata: {
      full_name: 'Omar Al-Mansouri',
      role: 'admin',
      company: 'Meridian Harbor Realty',
    },
  });

  if (error) {
    console.error('Error creando usuario:', error.message);
    return;
  }

  console.log('✅ Usuario creado exitosamente!\n');
  console.log('ID:', data.user?.id);
  console.log('Email:', data.user?.email);
  console.log('\n--- Credenciales de acceso ---');
  console.log('Email: omar.almansouri@meridianharbor.com');
  console.log('Password: MHRealty2024!');
}

main();
