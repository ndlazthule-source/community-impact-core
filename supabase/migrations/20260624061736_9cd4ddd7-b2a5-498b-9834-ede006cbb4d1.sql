
-- 1. Add 'buyer' to app_role enum
ALTER TYPE public.app_role ADD VALUE IF NOT EXISTS 'buyer';

-- 2. Add fulfillment_status enum + columns on orders
DO $$ BEGIN
  CREATE TYPE public.fulfillment_status AS ENUM ('processing','shipped','out_for_delivery','delivered','cancelled');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

ALTER TABLE public.orders
  ADD COLUMN IF NOT EXISTS fulfillment_status public.fulfillment_status NOT NULL DEFAULT 'processing',
  ADD COLUMN IF NOT EXISTS delivery_street TEXT,
  ADD COLUMN IF NOT EXISTS delivery_suburb TEXT,
  ADD COLUMN IF NOT EXISTS delivery_city TEXT,
  ADD COLUMN IF NOT EXISTS delivery_postal_code TEXT,
  ADD COLUMN IF NOT EXISTS tracking_number TEXT;

-- 3. Buyer profile (extends profiles for IDW-specific delivery details)
CREATE TABLE IF NOT EXISTS public.buyer_profiles (
  user_id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  first_name TEXT,
  last_name TEXT,
  phone TEXT,
  delivery_street TEXT,
  delivery_suburb TEXT,
  delivery_city TEXT,
  delivery_postal_code TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.buyer_profiles TO authenticated;
GRANT ALL ON public.buyer_profiles TO service_role;

ALTER TABLE public.buyer_profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Buyers manage own profile" ON public.buyer_profiles
  FOR ALL TO authenticated
  USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Admins view all buyer profiles" ON public.buyer_profiles
  FOR SELECT TO authenticated
  USING (public.has_role(auth.uid(), 'administrator'));

CREATE TRIGGER buyer_profiles_updated_at BEFORE UPDATE ON public.buyer_profiles
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- 4. Safe payment method metadata (NEVER store PAN or CVV)
CREATE TABLE IF NOT EXISTS public.buyer_payment_methods (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  cardholder_name TEXT NOT NULL,
  brand TEXT NOT NULL,           -- visa, mastercard, amex, etc (derived from BIN client-side)
  last4 TEXT NOT NULL CHECK (char_length(last4) = 4),
  exp_month SMALLINT NOT NULL CHECK (exp_month BETWEEN 1 AND 12),
  exp_year SMALLINT NOT NULL CHECK (exp_year BETWEEN 2024 AND 2099),
  is_default BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.buyer_payment_methods TO authenticated;
GRANT ALL ON public.buyer_payment_methods TO service_role;

ALTER TABLE public.buyer_payment_methods ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Buyers manage own payment methods" ON public.buyer_payment_methods
  FOR ALL TO authenticated
  USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

CREATE TRIGGER buyer_payment_methods_updated_at BEFORE UPDATE ON public.buyer_payment_methods
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE INDEX IF NOT EXISTS idx_buyer_payment_methods_user ON public.buyer_payment_methods(user_id);
