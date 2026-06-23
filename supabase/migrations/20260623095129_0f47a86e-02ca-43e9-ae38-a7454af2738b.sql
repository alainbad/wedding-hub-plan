-- 1) Profile view counter: a safe, security-definer function callable by the public
CREATE OR REPLACE FUNCTION public.increment_profile_views(_supplier_id uuid)
RETURNS void
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
AS $$
  UPDATE public.suppliers
  SET profile_views = profile_views + 1
  WHERE id = _supplier_id AND status = 'approved';
$$;

GRANT EXECUTE ON FUNCTION public.increment_profile_views(uuid) TO anon, authenticated;

-- 2) Allow the public to leave reviews on approved suppliers
GRANT INSERT ON public.reviews TO anon, authenticated;

CREATE POLICY "Public can review approved suppliers"
ON public.reviews
FOR INSERT
TO anon, authenticated
WITH CHECK (supplier_is_approved(supplier_id));

-- 3) Keep supplier rating + reviews_count in sync with the reviews table
CREATE OR REPLACE FUNCTION public.recalc_supplier_rating()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  _supplier_id uuid := COALESCE(NEW.supplier_id, OLD.supplier_id);
BEGIN
  UPDATE public.suppliers s
  SET rating = COALESCE((SELECT ROUND(AVG(r.rating)::numeric, 1) FROM public.reviews r WHERE r.supplier_id = _supplier_id), 0),
      reviews_count = (SELECT COUNT(*) FROM public.reviews r WHERE r.supplier_id = _supplier_id)
  WHERE s.id = _supplier_id;
  RETURN NULL;
END;
$$;

CREATE TRIGGER reviews_recalc_rating
AFTER INSERT OR UPDATE OR DELETE ON public.reviews
FOR EACH ROW EXECUTE FUNCTION public.recalc_supplier_rating();