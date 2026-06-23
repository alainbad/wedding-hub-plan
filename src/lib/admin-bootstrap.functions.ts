import { createServerFn } from "@tanstack/react-start";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

/**
 * Lets the very first signed-in user claim the admin role, but only while no
 * admin exists yet. Once an admin exists this is a no-op. Privileged work runs
 * with the service-role client loaded inside the handler.
 */
export const bootstrapAdmin = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");

    const { count, error: countError } = await supabaseAdmin
      .from("user_roles")
      .select("*", { count: "exact", head: true })
      .eq("role", "admin");

    if (countError) throw new Error(countError.message);
    if ((count ?? 0) > 0) {
      return { granted: false, reason: "admin_exists" as const };
    }

    const { error } = await supabaseAdmin
      .from("user_roles")
      .insert({ user_id: context.userId, role: "admin" });

    if (error) throw new Error(error.message);
    return { granted: true, reason: "granted" as const };
  });
