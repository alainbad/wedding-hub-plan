import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "./use-auth";
import type { Tables } from "@/integrations/supabase/types";

export type CreativeRow = Tables<"suppliers">;

async function fetchOrCreate(
  userId: string,
  email: string,
  companyName: string,
): Promise<CreativeRow> {
  const { data, error } = await supabase
    .from("suppliers")
    .select("*")
    .eq("owner_id", userId)
    .maybeSingle();
  if (error) throw error;
  if (data) return data;

  const { data: created, error: insErr } = await supabase
    .from("suppliers")
    .insert({ owner_id: userId, email, company_name: companyName })
    .select("*")
    .single();
  if (insErr) throw insErr;
  return created;
}

export function useMyCreative() {
  const { user } = useAuth();
  return useQuery({
    queryKey: ["my-creative", user?.id],
    enabled: !!user,
    queryFn: () =>
      fetchOrCreate(
        user!.id,
        user!.email ?? "",
        (user!.user_metadata?.company_name as string | undefined) ?? "",
      ),
  });
}
