
-- Suspension details on profiles
ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS suspension_type text,
  ADD COLUMN IF NOT EXISTS suspension_reason text,
  ADD COLUMN IF NOT EXISTS suspended_at timestamptz,
  ADD COLUMN IF NOT EXISTS suspended_until timestamptz;

DO $$ BEGIN
  ALTER TABLE public.profiles
    ADD CONSTRAINT profiles_suspension_type_check
    CHECK (suspension_type IS NULL OR suspension_type IN ('temporary','permanent'));
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

-- Notify members when a new members-only product becomes available
CREATE OR REPLACE FUNCTION public.notify_members_new_product()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  should_notify boolean := false;
BEGIN
  IF TG_OP = 'INSERT' THEN
    should_notify := NEW.visibility = 'members_only'
                     AND NEW.status = 'active'
                     AND NEW.archived_at IS NULL;
  ELSIF TG_OP = 'UPDATE' THEN
    should_notify := NEW.visibility = 'members_only'
                     AND NEW.status = 'active'
                     AND NEW.archived_at IS NULL
                     AND (
                       OLD.visibility IS DISTINCT FROM NEW.visibility
                       OR OLD.status IS DISTINCT FROM NEW.status
                       OR (OLD.archived_at IS NOT NULL AND NEW.archived_at IS NULL)
                     );
  END IF;

  IF should_notify THEN
    INSERT INTO public.notifications (user_id, title, body, link)
    SELECT DISTINCT ur.user_id,
           'Exclusive new product: ' || NEW.name,
           COALESCE(NULLIF(NEW.description, ''), 'A new members-only product is now available in the IDW marketplace.'),
           '/idw'
    FROM public.user_roles ur
    WHERE ur.role IN ('student','buyer','donor');
  END IF;

  RETURN NEW;
END; $$;

DROP TRIGGER IF EXISTS notify_members_new_product_trg ON public.products;
CREATE TRIGGER notify_members_new_product_trg
AFTER INSERT OR UPDATE ON public.products
FOR EACH ROW EXECUTE FUNCTION public.notify_members_new_product();
