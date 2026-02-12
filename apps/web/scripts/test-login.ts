import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = 'https://hqedvzvkalvefoodqsgr.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImhxZWR2enZrYWx2ZWZvb2Rxc2dyIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzAyNDE4NDUsImV4cCI6MjA4NTgxNzg0NX0.YdUZS4P649R5RgeNsNBrcotaGdJZ5j-cmRFEMx_WCyc';

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

async function testLogin() {
  console.log('Probando login...\n');

  const { data, error } = await supabase.auth.signInWithPassword({
    email: 'omar.almansouri@meridianharbor.com',
    password: 'MHRealty2024!',
  });

  if (error) {
    console.error('❌ Error de login:', error.message);
    console.error('Código:', error.status);
    return;
  }

  console.log('✅ Login exitoso!');
  console.log('User ID:', data.user?.id);
  console.log('Email:', data.user?.email);
}

testLogin();
