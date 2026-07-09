
-- Add visibility to products: 'members_only' (default, registered users only) or 'public' (everyone).
ALTER TABLE public.products
  ADD COLUMN IF NOT EXISTS visibility text NOT NULL DEFAULT 'members_only'
  CHECK (visibility IN ('members_only','public'));

-- Preserve prior behaviour: existing products stay publicly visible.
UPDATE public.products SET visibility = 'public' WHERE visibility = 'members_only';

-- Anon can only see public + active + not archived.
DROP POLICY IF EXISTS "Public read active products" ON public.products;
CREATE POLICY "Public read active products"
  ON public.products FOR SELECT
  TO anon
  USING (archived_at IS NULL AND status = 'active'::product_status AND visibility = 'public');

-- Any authenticated user can see all active products (members_only + public).
DROP POLICY IF EXISTS "Authenticated read active products" ON public.products;
CREATE POLICY "Authenticated read active products"
  ON public.products FOR SELECT
  TO authenticated
  USING (archived_at IS NULL AND status = 'active'::product_status);
