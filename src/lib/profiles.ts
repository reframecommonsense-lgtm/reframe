import { createClient } from "@/lib/supabase/server";

export interface PublicProfile {
  id: string;
  handle: string;
  display_name: string;
  is_official: boolean;
}

export interface CurrentProfileState {
  isAnonymous: boolean;
  displayName: string;
  handle: string | null;
}

export async function getCurrentProfileState(): Promise<CurrentProfileState | null> {
  const supabase = await createClient();
  const {
    data: { session },
  } = await supabase.auth.getSession();
  if (!session) return null;

  const { data } = await supabase
    .from("profiles")
    .select("display_name, handle, is_anonymous")
    .eq("id", session.user.id)
    .maybeSingle();

  if (!data) return null;

  return {
    isAnonymous: data.is_anonymous,
    displayName: data.display_name,
    handle: data.handle,
  };
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
