import { createClient } from "@/lib/supabase/client";

export interface ProfileData {
  id: string;
  email: string;
  full_name: string;
  phone: string | null;
  avatar_url: string | null;
  language: string;
  notifications_email: boolean;
  notifications_push: boolean;
  notifications_sla: boolean;
  theme: "light" | "dark" | "system";
}

export interface UpdateProfileInput {
  full_name?: string;
  phone?: string | null;
  avatar_url?: string | null;
  language?: string;
  notifications_email?: boolean;
  notifications_push?: boolean;
  notifications_sla?: boolean;
  theme?: "light" | "dark" | "system";
}

/**
 * Get current user's profile
 */
export async function getProfile(): Promise<ProfileData | null> {
  const supabase = createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return null;

  const { data, error } = await supabase
    .from("users")
    .select("id, email, full_name, phone, avatar_url")
    .eq("auth_id", user.id)
    .single();

  if (error) {
    console.error("Error fetching profile:", error);
    return null;
  }

  return {
    ...data,
    language: localStorage.getItem("aurix-language") || "en",
    notifications_email: true,
    notifications_push: true,
    notifications_sla: true,
    theme: "system",
  } as ProfileData;
}

/**
 * Update current user's profile
 */
export async function updateProfile(
  input: UpdateProfileInput
): Promise<{ success: boolean; error: string | null }> {
  const supabase = createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { success: false, error: "Not authenticated" };
  }

  // Only send fields that exist in the DB
  const dbFields: Record<string, unknown> = {
    updated_at: new Date().toISOString(),
  };
  if (input.full_name !== undefined) dbFields.full_name = input.full_name;
  if (input.phone !== undefined) dbFields.phone = input.phone;
  if (input.avatar_url !== undefined) dbFields.avatar_url = input.avatar_url;

  const { error } = await supabase
    .from("users")
    .update(dbFields)
    .eq("auth_id", user.id);

  if (error) {
    console.error("Error updating profile:", error);
    return { success: false, error: "Failed to update profile" };
  }

  return { success: true, error: null };
}

/**
 * Update user's password
 */
export async function updatePassword(
  newPassword: string
): Promise<{ success: boolean; error: string | null }> {
  const supabase = createClient();

  const { error } = await supabase.auth.updateUser({
    password: newPassword,
  });

  if (error) {
    console.error("Error updating password:", error);
    return { success: false, error: error.message };
  }

  return { success: true, error: null };
}

/**
 * Upload avatar image
 */
export async function uploadAvatar(
  file: File
): Promise<{ url: string | null; error: string | null }> {
  const supabase = createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { url: null, error: "Not authenticated" };
  }

  // Generate unique filename
  const fileExt = file.name.split(".").pop();
  const fileName = `${user.id}-${Date.now()}.${fileExt}`;
  const filePath = `avatars/${fileName}`;

  // Upload to Supabase Storage
  const { error: uploadError } = await supabase.storage
    .from("avatars")
    .upload(filePath, file, {
      cacheControl: "3600",
      upsert: true,
    });

  if (uploadError) {
    console.error("Error uploading avatar:", uploadError);
    return { url: null, error: "Failed to upload image" };
  }

  // Get public URL
  const {
    data: { publicUrl },
  } = supabase.storage.from("avatars").getPublicUrl(filePath);

  // Update user profile with new avatar URL
  await updateProfile({ avatar_url: publicUrl });

  return { url: publicUrl, error: null };
}

/**
 * Delete current avatar
 */
export async function deleteAvatar(): Promise<{ success: boolean; error: string | null }> {
  const supabase = createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { success: false, error: "Not authenticated" };
  }

  // Get current avatar URL to delete from storage
  const { data: profile } = await supabase
    .from("users")
    .select("avatar_url")
    .eq("auth_id", user.id)
    .single();

  if (profile?.avatar_url) {
    // Extract file path from URL and delete
    const urlParts = profile.avatar_url.split("/");
    const fileName = urlParts[urlParts.length - 1];
    const filePath = `avatars/${fileName}`;

    await supabase.storage.from("avatars").remove([filePath]);
  }

  // Update profile to remove avatar URL
  await updateProfile({ avatar_url: null });

  return { success: true, error: null };
}
