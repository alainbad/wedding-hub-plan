
-- Switch ownership/approval helpers to SECURITY INVOKER (safe: rely on caller RLS)
CREATE OR REPLACE FUNCTION public.owns_supplier(_supplier_id uuid)
RETURNS boolean
LANGUAGE sql STABLE SECURITY INVOKER SET search_path = public
AS $$
  SELECT EXISTS (SELECT 1 FROM public.suppliers WHERE id = _supplier_id AND owner_id = auth.uid())
$$;

CREATE OR REPLACE FUNCTION public.supplier_is_approved(_supplier_id uuid)
RETURNS boolean
LANGUAGE sql STABLE SECURITY INVOKER SET search_path = public
AS $$
  SELECT EXISTS (SELECT 1 FROM public.suppliers WHERE id = _supplier_id AND status = 'approved')
$$;

-- Trigger-only functions: not callable directly by API roles
REVOKE EXECUTE ON FUNCTION public.handle_new_user() FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.update_updated_at_column() FROM PUBLIC, anon, authenticated;

-- has_role must stay SECURITY DEFINER (prevents RLS recursion on user_roles);
-- limit it to signed-in users only.
REVOKE EXECUTE ON FUNCTION public.has_role(uuid, public.app_role) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.has_role(uuid, public.app_role) TO authenticated;
