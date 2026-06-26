
ALTER TABLE public.products
  ADD COLUMN IF NOT EXISTS side_image_url TEXT,
  ADD COLUMN IF NOT EXISTS texture_image_url TEXT;

DROP POLICY IF EXISTS "Auth read product images" ON storage.objects;
CREATE POLICY "Auth read product images" ON storage.objects
  FOR SELECT TO authenticated
  USING (bucket_id = 'product-images');

DROP POLICY IF EXISTS "Anon read product images" ON storage.objects;
CREATE POLICY "Anon read product images" ON storage.objects
  FOR SELECT TO anon
  USING (bucket_id = 'product-images');

DROP POLICY IF EXISTS "Admins manage product images" ON storage.objects;
CREATE POLICY "Admins manage product images" ON storage.objects
  FOR ALL TO authenticated
  USING (bucket_id = 'product-images' AND public.is_admin(auth.uid()))
  WITH CHECK (bucket_id = 'product-images' AND public.is_admin(auth.uid()));
