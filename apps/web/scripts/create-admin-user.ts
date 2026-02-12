// Script to create admin user in Supabase Auth
import { createClient } from "@supabase/supabase-js";

const supabaseUrl = "https://hqedvzvkalvefoodqsgr.supabase.co";
const supabaseKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImhxZWR2enZrYWx2ZWZvb2Rxc2dyIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzAyNDE4NDUsImV4cCI6MjA4NTgxNzg0NX0.YdUZS4P649R5RgeNsNBrcotaGdJZ5j-cmRFEMx_WCyc";

const supabase = createClient(supabaseUrl, supabaseKey);

async function createAdminUser() {
  const email = "aurix.admin.test@gmail.com";
  const password = "Aurix2024!";

  console.log("Creating admin user...");
  console.log("Email:", email);

  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: {
        full_name: "Omar Al-Mansouri",
        role: "admin",
      },
    },
  });

  if (error) {
    console.error("Error creating user:", error.message);
    return;
  }

  console.log("\n✅ User created successfully!");
  console.log("User ID:", data.user?.id);
  console.log("\n--- Login Credentials ---");
  console.log("Email:", email);
  console.log("Password:", password);
}

createAdminUser();
