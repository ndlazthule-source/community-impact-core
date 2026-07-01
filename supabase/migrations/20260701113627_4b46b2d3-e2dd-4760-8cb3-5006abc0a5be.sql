
CREATE POLICY "Public read event-images"
ON storage.objects FOR SELECT
USING (bucket_id = 'event-images');

CREATE POLICY "Admins upload event-images"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'event-images' AND public.is_admin(auth.uid()));

CREATE POLICY "Admins update event-images"
ON storage.objects FOR UPDATE
TO authenticated
USING (bucket_id = 'event-images' AND public.is_admin(auth.uid()));

CREATE POLICY "Admins delete event-images"
ON storage.objects FOR DELETE
TO authenticated
USING (bucket_id = 'event-images' AND public.is_admin(auth.uid()));
