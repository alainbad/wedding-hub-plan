
-- ============ ENUMS ============
CREATE TYPE public.app_role AS ENUM ('admin', 'supplier');
CREATE TYPE public.supplier_status AS ENUM ('draft', 'pending', 'approved', 'rejected', 'suspended');
CREATE TYPE public.subscription_plan AS ENUM ('Featured', 'Premium', 'Elite');
CREATE TYPE public.lead_status AS ENUM ('new', 'contacted', 'quoted', 'booked', 'lost');

-- ============ shared updated_at trigger fn ============
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

-- ============ USER ROLES ============
CREATE TABLE public.user_roles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  role public.app_role NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (user_id, role)
);
GRANT SELECT ON public.user_roles TO authenticated;
GRANT ALL ON public.user_roles TO service_role;
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

CREATE OR REPLACE FUNCTION public.has_role(_user_id uuid, _role public.app_role)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.user_roles WHERE user_id = _user_id AND role = _role
  )
$$;

CREATE POLICY "Users can read their own roles" ON public.user_roles
  FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Admins can read all roles" ON public.user_roles
  FOR SELECT TO authenticated USING (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins can manage roles" ON public.user_roles
  FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- assign supplier role on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.user_roles (user_id, role)
  VALUES (NEW.id, 'supplier')
  ON CONFLICT (user_id, role) DO NOTHING;
  RETURN NEW;
END;
$$;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- ============ SUPPLIERS ============
CREATE TABLE public.suppliers (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  owner_id uuid,
  company_name text NOT NULL DEFAULT '',
  category text NOT NULL DEFAULT 'venues',
  category_label text NOT NULL DEFAULT 'Venue',
  city text NOT NULL DEFAULT '',
  region text NOT NULL DEFAULT '',
  address text NOT NULL DEFAULT '',
  maps_location text NOT NULL DEFAULT '',
  tagline text NOT NULL DEFAULT '',
  about text NOT NULL DEFAULT '',
  phone text NOT NULL DEFAULT '',
  whatsapp text NOT NULL DEFAULT '',
  email text NOT NULL DEFAULT '',
  website text NOT NULL DEFAULT '',
  instagram text NOT NULL DEFAULT '',
  facebook text NOT NULL DEFAULT '',
  tiktok text NOT NULL DEFAULT '',
  starting_price numeric NOT NULL DEFAULT 0,
  price_range text NOT NULL DEFAULT '',
  service_areas text[] NOT NULL DEFAULT '{}',
  services text[] NOT NULL DEFAULT '{}',
  subscription_plan public.subscription_plan NOT NULL DEFAULT 'Featured',
  status public.supplier_status NOT NULL DEFAULT 'draft',
  rating numeric NOT NULL DEFAULT 0,
  reviews_count integer NOT NULL DEFAULT 0,
  image_url text NOT NULL DEFAULT '',
  verified boolean NOT NULL DEFAULT false,
  profile_views integer NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.suppliers TO authenticated;
GRANT SELECT ON public.suppliers TO anon;
GRANT ALL ON public.suppliers TO service_role;
ALTER TABLE public.suppliers ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public can view approved suppliers" ON public.suppliers
  FOR SELECT TO anon, authenticated USING (status = 'approved');
CREATE POLICY "Owners can view their own supplier" ON public.suppliers
  FOR SELECT TO authenticated USING (auth.uid() = owner_id);
CREATE POLICY "Admins can view all suppliers" ON public.suppliers
  FOR SELECT TO authenticated USING (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Owners can create their own supplier" ON public.suppliers
  FOR INSERT TO authenticated WITH CHECK (auth.uid() = owner_id);
CREATE POLICY "Owners can update their own supplier" ON public.suppliers
  FOR UPDATE TO authenticated USING (auth.uid() = owner_id) WITH CHECK (auth.uid() = owner_id);
CREATE POLICY "Admins can update any supplier" ON public.suppliers
  FOR UPDATE TO authenticated USING (public.has_role(auth.uid(), 'admin')) WITH CHECK (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins can delete suppliers" ON public.suppliers
  FOR DELETE TO authenticated USING (public.has_role(auth.uid(), 'admin'));

CREATE TRIGGER update_suppliers_updated_at BEFORE UPDATE ON public.suppliers
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- helper: does current user own this supplier
CREATE OR REPLACE FUNCTION public.owns_supplier(_supplier_id uuid)
RETURNS boolean
LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public
AS $$
  SELECT EXISTS (SELECT 1 FROM public.suppliers WHERE id = _supplier_id AND owner_id = auth.uid())
$$;

CREATE OR REPLACE FUNCTION public.supplier_is_approved(_supplier_id uuid)
RETURNS boolean
LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public
AS $$
  SELECT EXISTS (SELECT 1 FROM public.suppliers WHERE id = _supplier_id AND status = 'approved')
$$;

-- ============ SERVICES ============
CREATE TABLE public.services (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  supplier_id uuid NOT NULL REFERENCES public.suppliers(id) ON DELETE CASCADE,
  name text NOT NULL DEFAULT '',
  description text NOT NULL DEFAULT '',
  price numeric NOT NULL DEFAULT 0,
  duration text NOT NULL DEFAULT '',
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.services TO authenticated;
GRANT SELECT ON public.services TO anon;
GRANT ALL ON public.services TO service_role;
ALTER TABLE public.services ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public can view services of approved suppliers" ON public.services
  FOR SELECT TO anon, authenticated USING (public.supplier_is_approved(supplier_id));
CREATE POLICY "Owners can view their services" ON public.services
  FOR SELECT TO authenticated USING (public.owns_supplier(supplier_id));
CREATE POLICY "Admins can view all services" ON public.services
  FOR SELECT TO authenticated USING (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Owners can manage their services" ON public.services
  FOR ALL TO authenticated USING (public.owns_supplier(supplier_id)) WITH CHECK (public.owns_supplier(supplier_id));
CREATE POLICY "Admins can manage all services" ON public.services
  FOR ALL TO authenticated USING (public.has_role(auth.uid(), 'admin')) WITH CHECK (public.has_role(auth.uid(), 'admin'));
CREATE TRIGGER update_services_updated_at BEFORE UPDATE ON public.services
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- ============ PACKAGES ============
CREATE TABLE public.packages (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  supplier_id uuid NOT NULL REFERENCES public.suppliers(id) ON DELETE CASCADE,
  name text NOT NULL DEFAULT '',
  price numeric NOT NULL DEFAULT 0,
  description text NOT NULL DEFAULT '',
  includes text[] NOT NULL DEFAULT '{}',
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.packages TO authenticated;
GRANT SELECT ON public.packages TO anon;
GRANT ALL ON public.packages TO service_role;
ALTER TABLE public.packages ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public can view packages of approved suppliers" ON public.packages
  FOR SELECT TO anon, authenticated USING (public.supplier_is_approved(supplier_id));
CREATE POLICY "Owners can view their packages" ON public.packages
  FOR SELECT TO authenticated USING (public.owns_supplier(supplier_id));
CREATE POLICY "Admins can view all packages" ON public.packages
  FOR SELECT TO authenticated USING (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Owners can manage their packages" ON public.packages
  FOR ALL TO authenticated USING (public.owns_supplier(supplier_id)) WITH CHECK (public.owns_supplier(supplier_id));
CREATE POLICY "Admins can manage all packages" ON public.packages
  FOR ALL TO authenticated USING (public.has_role(auth.uid(), 'admin')) WITH CHECK (public.has_role(auth.uid(), 'admin'));
CREATE TRIGGER update_packages_updated_at BEFORE UPDATE ON public.packages
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- ============ PORTFOLIO ============
CREATE TABLE public.portfolio (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  supplier_id uuid NOT NULL REFERENCES public.suppliers(id) ON DELETE CASCADE,
  media_url text NOT NULL DEFAULT '',
  media_type text NOT NULL DEFAULT 'image',
  caption text NOT NULL DEFAULT '',
  is_cover boolean NOT NULL DEFAULT false,
  sort_order integer NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.portfolio TO authenticated;
GRANT SELECT ON public.portfolio TO anon;
GRANT ALL ON public.portfolio TO service_role;
ALTER TABLE public.portfolio ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public can view portfolio of approved suppliers" ON public.portfolio
  FOR SELECT TO anon, authenticated USING (public.supplier_is_approved(supplier_id));
CREATE POLICY "Owners can view their portfolio" ON public.portfolio
  FOR SELECT TO authenticated USING (public.owns_supplier(supplier_id));
CREATE POLICY "Admins can view all portfolio" ON public.portfolio
  FOR SELECT TO authenticated USING (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Owners can manage their portfolio" ON public.portfolio
  FOR ALL TO authenticated USING (public.owns_supplier(supplier_id)) WITH CHECK (public.owns_supplier(supplier_id));
CREATE POLICY "Admins can manage all portfolio" ON public.portfolio
  FOR ALL TO authenticated USING (public.has_role(auth.uid(), 'admin')) WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- ============ LEADS ============
CREATE TABLE public.leads (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  supplier_id uuid NOT NULL REFERENCES public.suppliers(id) ON DELETE CASCADE,
  customer_name text NOT NULL DEFAULT '',
  event_date date,
  guest_count integer,
  budget text NOT NULL DEFAULT '',
  location text NOT NULL DEFAULT '',
  message text NOT NULL DEFAULT '',
  phone text NOT NULL DEFAULT '',
  email text NOT NULL DEFAULT '',
  status public.lead_status NOT NULL DEFAULT 'new',
  notes text NOT NULL DEFAULT '',
  archived boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.leads TO authenticated;
GRANT INSERT ON public.leads TO anon;
GRANT ALL ON public.leads TO service_role;
ALTER TABLE public.leads ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can submit a lead to an approved supplier" ON public.leads
  FOR INSERT TO anon, authenticated WITH CHECK (public.supplier_is_approved(supplier_id));
CREATE POLICY "Owners can view their leads" ON public.leads
  FOR SELECT TO authenticated USING (public.owns_supplier(supplier_id));
CREATE POLICY "Admins can view all leads" ON public.leads
  FOR SELECT TO authenticated USING (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Owners can update their leads" ON public.leads
  FOR UPDATE TO authenticated USING (public.owns_supplier(supplier_id)) WITH CHECK (public.owns_supplier(supplier_id));
CREATE POLICY "Admins can manage all leads" ON public.leads
  FOR ALL TO authenticated USING (public.has_role(auth.uid(), 'admin')) WITH CHECK (public.has_role(auth.uid(), 'admin'));
CREATE TRIGGER update_leads_updated_at BEFORE UPDATE ON public.leads
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- ============ REVIEWS ============
CREATE TABLE public.reviews (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  supplier_id uuid NOT NULL REFERENCES public.suppliers(id) ON DELETE CASCADE,
  customer_name text NOT NULL DEFAULT '',
  rating integer NOT NULL DEFAULT 5,
  review text NOT NULL DEFAULT '',
  reply text NOT NULL DEFAULT '',
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.reviews TO authenticated;
GRANT SELECT ON public.reviews TO anon;
GRANT ALL ON public.reviews TO service_role;
ALTER TABLE public.reviews ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public can view reviews of approved suppliers" ON public.reviews
  FOR SELECT TO anon, authenticated USING (public.supplier_is_approved(supplier_id));
CREATE POLICY "Owners can view their reviews" ON public.reviews
  FOR SELECT TO authenticated USING (public.owns_supplier(supplier_id));
CREATE POLICY "Owners can reply to their reviews" ON public.reviews
  FOR UPDATE TO authenticated USING (public.owns_supplier(supplier_id)) WITH CHECK (public.owns_supplier(supplier_id));
CREATE POLICY "Admins can manage all reviews" ON public.reviews
  FOR ALL TO authenticated USING (public.has_role(auth.uid(), 'admin')) WITH CHECK (public.has_role(auth.uid(), 'admin'));
