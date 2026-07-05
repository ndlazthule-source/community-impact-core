GRANT SELECT, INSERT, UPDATE, DELETE ON TABLE public.cart_items TO authenticated;
GRANT ALL ON TABLE public.cart_items TO service_role;

GRANT SELECT, INSERT, UPDATE, DELETE ON TABLE public.orders TO authenticated;
GRANT ALL ON TABLE public.orders TO service_role;

GRANT SELECT, INSERT, UPDATE, DELETE ON TABLE public.order_items TO authenticated;
GRANT ALL ON TABLE public.order_items TO service_role;