import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "./use-auth";
import { toast } from "sonner";

export type CartRow = {
  id: string;
  user_id: string;
  item_type: "product" | "course";
  product_id: string | null;
  course_id: string | null;
  quantity: number;
  created_at: string;
  product?: { id: string; name: string; price: number; image_url: string | null; stock: number } | null;
  course?: { id: string; title: string; price: number; cover_image: string | null } | null;
};

export function useCart() {
  const { user } = useAuth();
  const qc = useQueryClient();

  const query = useQuery({
    queryKey: ["cart", user?.id],
    enabled: !!user,
    queryFn: async (): Promise<CartRow[]> => {
      const { data, error } = await supabase
        .from("cart_items")
        .select("id, user_id, item_type, product_id, course_id, quantity, created_at, product:products(id,name,price,image_url,stock), course:courses(id,title,price,cover_image)")
        .eq("user_id", user!.id)
        .order("created_at", { ascending: false });
      if (error) throw error;
      return (data ?? []) as unknown as CartRow[];
    },
  });

  const invalidate = () => qc.invalidateQueries({ queryKey: ["cart", user?.id] });

  const addProduct = useMutation({
    mutationFn: async (productId: string) => {
      if (!user) throw new Error("Sign in to add items.");
      const { data: existing } = await supabase
        .from("cart_items")
        .select("id, quantity")
        .eq("user_id", user.id)
        .eq("product_id", productId)
        .maybeSingle();
      if (existing) {
        const { error } = await supabase
          .from("cart_items")
          .update({ quantity: existing.quantity + 1 })
          .eq("id", existing.id);
        if (error) throw error;
      } else {
        const { error } = await supabase
          .from("cart_items")
          .insert({ user_id: user.id, item_type: "product", product_id: productId, quantity: 1 });
        if (error) throw error;
      }
    },
    onSuccess: () => { invalidate(); toast.success("Added to cart."); },
    onError: (e: Error) => toast.error(e.message),
  });

  const addCourse = useMutation({
    mutationFn: async (courseId: string) => {
      if (!user) throw new Error("Sign in to enrol.");
      const { data: existing } = await supabase
        .from("cart_items")
        .select("id")
        .eq("user_id", user.id)
        .eq("course_id", courseId)
        .maybeSingle();
      if (existing) return;
      const { error } = await supabase
        .from("cart_items")
        .insert({ user_id: user.id, item_type: "course", course_id: courseId, quantity: 1 });
      if (error) throw error;
    },
    onSuccess: () => { invalidate(); toast.success("Course added to cart."); },
    onError: (e: Error) => toast.error(e.message),
  });

  const updateQty = useMutation({
    mutationFn: async ({ id, quantity }: { id: string; quantity: number }) => {
      if (quantity < 1) return;
      const { error } = await supabase.from("cart_items").update({ quantity }).eq("id", id);
      if (error) throw error;
    },
    onSuccess: invalidate,
  });

  const remove = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("cart_items").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => { invalidate(); toast.success("Removed from cart."); },
  });

  const clear = useMutation({
    mutationFn: async () => {
      if (!user) throw new Error("Sign in to clear your cart.");
      const { error } = await supabase.from("cart_items").delete().eq("user_id", user.id);
      if (error) throw error;
    },
    onSuccess: () => { invalidate(); toast.success("Your cart has been cleared."); },
    onError: (e: Error) => toast.error(e.message),
  });

  const items = query.data ?? [];
  const count = items.reduce((n, r) => n + r.quantity, 0);
  const total = items.reduce((sum, r) => {
    const price = Number(r.product?.price ?? r.course?.price ?? 0);
    return sum + price * r.quantity;
  }, 0);

  return { items, count, total, loading: query.isLoading, addProduct, addCourse, updateQty, remove, clear };
}
