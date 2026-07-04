import { createClient } from "@/lib/supabase/server";

export interface PublicProfile {
  id: string;
  handle: string;
  display_name: string;
  is_official: boolean;
}

export async function getProfileByHandle(
  handle: string,
): Promise<PublicProfile | null> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("profiles")
    .select("id, handle, display_name, is_official")
    .eq("handle", handle)
    .maybeSingle();

  if (!data || !data.handle) return null;
  return data as PublicProfile;
}
