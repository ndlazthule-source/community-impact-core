export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "14.5"
  }
  public: {
    Tables: {
      audit_logs: {
        Row: {
          action: string
          actor_id: string | null
          created_at: string
          entity_id: string | null
          entity_type: string | null
          id: string
          metadata: Json | null
        }
        Insert: {
          action: string
          actor_id?: string | null
          created_at?: string
          entity_id?: string | null
          entity_type?: string | null
          id?: string
          metadata?: Json | null
        }
        Update: {
          action?: string
          actor_id?: string | null
          created_at?: string
          entity_id?: string | null
          entity_type?: string | null
          id?: string
          metadata?: Json | null
        }
        Relationships: []
      }
      buyer_payment_methods: {
        Row: {
          brand: string
          cardholder_name: string
          created_at: string
          exp_month: number
          exp_year: number
          id: string
          is_default: boolean
          last4: string
          updated_at: string
          user_id: string
        }
        Insert: {
          brand: string
          cardholder_name: string
          created_at?: string
          exp_month: number
          exp_year: number
          id?: string
          is_default?: boolean
          last4: string
          updated_at?: string
          user_id: string
        }
        Update: {
          brand?: string
          cardholder_name?: string
          created_at?: string
          exp_month?: number
          exp_year?: number
          id?: string
          is_default?: boolean
          last4?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      buyer_profiles: {
        Row: {
          created_at: string
          delivery_city: string | null
          delivery_postal_code: string | null
          delivery_street: string | null
          delivery_suburb: string | null
          first_name: string | null
          last_name: string | null
          phone: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          delivery_city?: string | null
          delivery_postal_code?: string | null
          delivery_street?: string | null
          delivery_suburb?: string | null
          first_name?: string | null
          last_name?: string | null
          phone?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          delivery_city?: string | null
          delivery_postal_code?: string | null
          delivery_street?: string | null
          delivery_suburb?: string | null
          first_name?: string | null
          last_name?: string | null
          phone?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      cart_items: {
        Row: {
          course_id: string | null
          created_at: string
          id: string
          item_type: Database["public"]["Enums"]["cart_item_type"]
          product_id: string | null
          quantity: number
          user_id: string
        }
        Insert: {
          course_id?: string | null
          created_at?: string
          id?: string
          item_type: Database["public"]["Enums"]["cart_item_type"]
          product_id?: string | null
          quantity?: number
          user_id: string
        }
        Update: {
          course_id?: string | null
          created_at?: string
          id?: string
          item_type?: Database["public"]["Enums"]["cart_item_type"]
          product_id?: string | null
          quantity?: number
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "cart_items_course_id_fkey"
            columns: ["course_id"]
            isOneToOne: false
            referencedRelation: "courses"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "cart_items_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
        ]
      }
      course_categories: {
        Row: {
          created_at: string
          description: string | null
          id: string
          name: string
          slug: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          id?: string
          name: string
          slug: string
        }
        Update: {
          created_at?: string
          description?: string | null
          id?: string
          name?: string
          slug?: string
        }
        Relationships: []
      }
      courses: {
        Row: {
          allow_waitlist: boolean
          archived_at: string | null
          category_id: string | null
          cover_image: string | null
          created_at: string
          created_by: string | null
          description: string | null
          end_date: string | null
          enrolled_count: number
          id: string
          instructor: string | null
          max_capacity: number
          price: number
          registration_deadline: string | null
          slug: string
          start_date: string | null
          status: Database["public"]["Enums"]["course_status"]
          title: string
          updated_at: string
        }
        Insert: {
          allow_waitlist?: boolean
          archived_at?: string | null
          category_id?: string | null
          cover_image?: string | null
          created_at?: string
          created_by?: string | null
          description?: string | null
          end_date?: string | null
          enrolled_count?: number
          id?: string
          instructor?: string | null
          max_capacity?: number
          price?: number
          registration_deadline?: string | null
          slug: string
          start_date?: string | null
          status?: Database["public"]["Enums"]["course_status"]
          title: string
          updated_at?: string
        }
        Update: {
          allow_waitlist?: boolean
          archived_at?: string | null
          category_id?: string | null
          cover_image?: string | null
          created_at?: string
          created_by?: string | null
          description?: string | null
          end_date?: string | null
          enrolled_count?: number
          id?: string
          instructor?: string | null
          max_capacity?: number
          price?: number
          registration_deadline?: string | null
          slug?: string
          start_date?: string | null
          status?: Database["public"]["Enums"]["course_status"]
          title?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "courses_category_id_fkey"
            columns: ["category_id"]
            isOneToOne: false
            referencedRelation: "course_categories"
            referencedColumns: ["id"]
          },
        ]
      }
      donations: {
        Row: {
          amount: number
          created_at: string
          currency: string
          donor_email: string | null
          donor_id: string | null
          donor_name: string | null
          id: string
          is_recurring: boolean
          message: string | null
          receipt_url: string | null
          sponsorship_id: string | null
          status: Database["public"]["Enums"]["donation_status"]
          stripe_session_id: string | null
        }
        Insert: {
          amount: number
          created_at?: string
          currency?: string
          donor_email?: string | null
          donor_id?: string | null
          donor_name?: string | null
          id?: string
          is_recurring?: boolean
          message?: string | null
          receipt_url?: string | null
          sponsorship_id?: string | null
          status?: Database["public"]["Enums"]["donation_status"]
          stripe_session_id?: string | null
        }
        Update: {
          amount?: number
          created_at?: string
          currency?: string
          donor_email?: string | null
          donor_id?: string | null
          donor_name?: string | null
          id?: string
          is_recurring?: boolean
          message?: string | null
          receipt_url?: string | null
          sponsorship_id?: string | null
          status?: Database["public"]["Enums"]["donation_status"]
          stripe_session_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "donations_sponsorship_id_fkey"
            columns: ["sponsorship_id"]
            isOneToOne: false
            referencedRelation: "sponsorships"
            referencedColumns: ["id"]
          },
        ]
      }
      enrollments: {
        Row: {
          approved_at: string | null
          approved_by: string | null
          archived_at: string | null
          certificate_url: string | null
          completed_at: string | null
          course_id: string
          created_at: string
          enrollment_year: number
          id: string
          notes: string | null
          status: Database["public"]["Enums"]["enrollment_status"]
          student_id: string
          updated_at: string
        }
        Insert: {
          approved_at?: string | null
          approved_by?: string | null
          archived_at?: string | null
          certificate_url?: string | null
          completed_at?: string | null
          course_id: string
          created_at?: string
          enrollment_year?: number
          id?: string
          notes?: string | null
          status?: Database["public"]["Enums"]["enrollment_status"]
          student_id: string
          updated_at?: string
        }
        Update: {
          approved_at?: string | null
          approved_by?: string | null
          archived_at?: string | null
          certificate_url?: string | null
          completed_at?: string | null
          course_id?: string
          created_at?: string
          enrollment_year?: number
          id?: string
          notes?: string | null
          status?: Database["public"]["Enums"]["enrollment_status"]
          student_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "enrollments_course_id_fkey"
            columns: ["course_id"]
            isOneToOne: false
            referencedRelation: "courses"
            referencedColumns: ["id"]
          },
        ]
      }
      event_feedback: {
        Row: {
          archived_at: string | null
          author_name: string | null
          comment: string | null
          created_at: string
          event_id: string
          id: string
          is_approved: boolean
          rating: number | null
          user_id: string | null
        }
        Insert: {
          archived_at?: string | null
          author_name?: string | null
          comment?: string | null
          created_at?: string
          event_id: string
          id?: string
          is_approved?: boolean
          rating?: number | null
          user_id?: string | null
        }
        Update: {
          archived_at?: string | null
          author_name?: string | null
          comment?: string | null
          created_at?: string
          event_id?: string
          id?: string
          is_approved?: boolean
          rating?: number | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "event_feedback_event_id_fkey"
            columns: ["event_id"]
            isOneToOne: false
            referencedRelation: "events"
            referencedColumns: ["id"]
          },
        ]
      }
      event_images: {
        Row: {
          caption: string | null
          created_at: string
          event_id: string
          id: string
          image_url: string
          is_featured: boolean
        }
        Insert: {
          caption?: string | null
          created_at?: string
          event_id: string
          id?: string
          image_url: string
          is_featured?: boolean
        }
        Update: {
          caption?: string | null
          created_at?: string
          event_id?: string
          id?: string
          image_url?: string
          is_featured?: boolean
        }
        Relationships: [
          {
            foreignKeyName: "event_images_event_id_fkey"
            columns: ["event_id"]
            isOneToOne: false
            referencedRelation: "events"
            referencedColumns: ["id"]
          },
        ]
      }
      events: {
        Row: {
          archived_at: string | null
          attendees_count: number | null
          category: string | null
          created_at: string
          created_by: string | null
          description: string | null
          end_time: string | null
          event_date: string
          featured_image: string | null
          id: string
          location: string | null
          objectives: string | null
          organizer: string | null
          outcomes: string | null
          slug: string
          start_time: string | null
          status: Database["public"]["Enums"]["event_status"]
          title: string
          updated_at: string
        }
        Insert: {
          archived_at?: string | null
          attendees_count?: number | null
          category?: string | null
          created_at?: string
          created_by?: string | null
          description?: string | null
          end_time?: string | null
          event_date: string
          featured_image?: string | null
          id?: string
          location?: string | null
          objectives?: string | null
          organizer?: string | null
          outcomes?: string | null
          slug: string
          start_time?: string | null
          status?: Database["public"]["Enums"]["event_status"]
          title: string
          updated_at?: string
        }
        Update: {
          archived_at?: string | null
          attendees_count?: number | null
          category?: string | null
          created_at?: string
          created_by?: string | null
          description?: string | null
          end_time?: string | null
          event_date?: string
          featured_image?: string | null
          id?: string
          location?: string | null
          objectives?: string | null
          organizer?: string | null
          outcomes?: string | null
          slug?: string
          start_time?: string | null
          status?: Database["public"]["Enums"]["event_status"]
          title?: string
          updated_at?: string
        }
        Relationships: []
      }
      notifications: {
        Row: {
          body: string | null
          created_at: string
          id: string
          is_read: boolean
          link: string | null
          title: string
          user_id: string
        }
        Insert: {
          body?: string | null
          created_at?: string
          id?: string
          is_read?: boolean
          link?: string | null
          title: string
          user_id: string
        }
        Update: {
          body?: string | null
          created_at?: string
          id?: string
          is_read?: boolean
          link?: string | null
          title?: string
          user_id?: string
        }
        Relationships: []
      }
      order_items: {
        Row: {
          course_id: string | null
          id: string
          item_type: Database["public"]["Enums"]["cart_item_type"]
          order_id: string
          product_id: string | null
          quantity: number
          unit_price: number
        }
        Insert: {
          course_id?: string | null
          id?: string
          item_type: Database["public"]["Enums"]["cart_item_type"]
          order_id: string
          product_id?: string | null
          quantity?: number
          unit_price?: number
        }
        Update: {
          course_id?: string | null
          id?: string
          item_type?: Database["public"]["Enums"]["cart_item_type"]
          order_id?: string
          product_id?: string | null
          quantity?: number
          unit_price?: number
        }
        Relationships: [
          {
            foreignKeyName: "order_items_course_id_fkey"
            columns: ["course_id"]
            isOneToOne: false
            referencedRelation: "courses"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "order_items_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: false
            referencedRelation: "orders"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "order_items_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
        ]
      }
      orders: {
        Row: {
          created_at: string
          currency: string
          delivery_city: string | null
          delivery_postal_code: string | null
          delivery_street: string | null
          delivery_suburb: string | null
          fulfillment_status: Database["public"]["Enums"]["fulfillment_status"]
          id: string
          status: Database["public"]["Enums"]["order_status"]
          stripe_session_id: string | null
          total_amount: number
          tracking_number: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          currency?: string
          delivery_city?: string | null
          delivery_postal_code?: string | null
          delivery_street?: string | null
          delivery_suburb?: string | null
          fulfillment_status?: Database["public"]["Enums"]["fulfillment_status"]
          id?: string
          status?: Database["public"]["Enums"]["order_status"]
          stripe_session_id?: string | null
          total_amount?: number
          tracking_number?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          currency?: string
          delivery_city?: string | null
          delivery_postal_code?: string | null
          delivery_street?: string | null
          delivery_suburb?: string | null
          fulfillment_status?: Database["public"]["Enums"]["fulfillment_status"]
          id?: string
          status?: Database["public"]["Enums"]["order_status"]
          stripe_session_id?: string | null
          total_amount?: number
          tracking_number?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      product_categories: {
        Row: {
          created_at: string
          description: string | null
          id: string
          name: string
          slug: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          id?: string
          name: string
          slug: string
        }
        Update: {
          created_at?: string
          description?: string | null
          id?: string
          name?: string
          slug?: string
        }
        Relationships: []
      }
      products: {
        Row: {
          archived_at: string | null
          category_id: string | null
          created_at: string
          description: string | null
          designer_bio: string | null
          designer_name: string | null
          id: string
          image_url: string | null
          name: string
          price: number
          side_image_url: string | null
          slug: string
          status: Database["public"]["Enums"]["product_status"]
          stock: number
          texture_image_url: string | null
          updated_at: string
          visibility: string
        }
        Insert: {
          archived_at?: string | null
          category_id?: string | null
          created_at?: string
          description?: string | null
          designer_bio?: string | null
          designer_name?: string | null
          id?: string
          image_url?: string | null
          name: string
          price?: number
          side_image_url?: string | null
          slug: string
          status?: Database["public"]["Enums"]["product_status"]
          stock?: number
          texture_image_url?: string | null
          updated_at?: string
          visibility?: string
        }
        Update: {
          archived_at?: string | null
          category_id?: string | null
          created_at?: string
          description?: string | null
          designer_bio?: string | null
          designer_name?: string | null
          id?: string
          image_url?: string | null
          name?: string
          price?: number
          side_image_url?: string | null
          slug?: string
          status?: Database["public"]["Enums"]["product_status"]
          stock?: number
          texture_image_url?: string | null
          updated_at?: string
          visibility?: string
        }
        Relationships: [
          {
            foreignKeyName: "products_category_id_fkey"
            columns: ["category_id"]
            isOneToOne: false
            referencedRelation: "product_categories"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          address: string | null
          avatar_url: string | null
          bio: string | null
          city: string | null
          country: string | null
          created_at: string
          email: string | null
          full_name: string | null
          id: string
          phone: string | null
          suspended: boolean
          updated_at: string
        }
        Insert: {
          address?: string | null
          avatar_url?: string | null
          bio?: string | null
          city?: string | null
          country?: string | null
          created_at?: string
          email?: string | null
          full_name?: string | null
          id: string
          phone?: string | null
          suspended?: boolean
          updated_at?: string
        }
        Update: {
          address?: string | null
          avatar_url?: string | null
          bio?: string | null
          city?: string | null
          country?: string | null
          created_at?: string
          email?: string | null
          full_name?: string | null
          id?: string
          phone?: string | null
          suspended?: boolean
          updated_at?: string
        }
        Relationships: []
      }
      sponsorships: {
        Row: {
          archived_at: string | null
          child_age: number | null
          child_name: string
          created_at: string
          id: string
          image_url: string | null
          is_sponsored: boolean
          location: string | null
          monthly_amount: number
          story: string | null
        }
        Insert: {
          archived_at?: string | null
          child_age?: number | null
          child_name: string
          created_at?: string
          id?: string
          image_url?: string | null
          is_sponsored?: boolean
          location?: string | null
          monthly_amount?: number
          story?: string | null
        }
        Update: {
          archived_at?: string | null
          child_age?: number | null
          child_name?: string
          created_at?: string
          id?: string
          image_url?: string | null
          is_sponsored?: boolean
          location?: string | null
          monthly_amount?: number
          story?: string | null
        }
        Relationships: []
      }
      user_roles: {
        Row: {
          created_at: string
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
      is_admin: { Args: { _user_id: string }; Returns: boolean }
    }
    Enums: {
      app_role: "administrator" | "student" | "donor" | "buyer"
      cart_item_type: "product" | "course"
      course_status:
        | "draft"
        | "open"
        | "full"
        | "in_progress"
        | "completed"
        | "archived"
      donation_status: "pending" | "completed" | "failed" | "refunded"
      enrollment_status:
        | "pending"
        | "approved"
        | "rejected"
        | "waitlisted"
        | "completed"
        | "cancelled"
      event_status:
        | "upcoming"
        | "ongoing"
        | "completed"
        | "cancelled"
        | "archived"
      fulfillment_status:
        | "processing"
        | "shipped"
        | "out_for_delivery"
        | "delivered"
        | "cancelled"
      order_status: "pending" | "paid" | "fulfilled" | "cancelled" | "refunded"
      product_status: "draft" | "active" | "sold_out" | "archived"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {
      app_role: ["administrator", "student", "donor", "buyer"],
      cart_item_type: ["product", "course"],
      course_status: [
        "draft",
        "open",
        "full",
        "in_progress",
        "completed",
        "archived",
      ],
      donation_status: ["pending", "completed", "failed", "refunded"],
      enrollment_status: [
        "pending",
        "approved",
        "rejected",
        "waitlisted",
        "completed",
        "cancelled",
      ],
      event_status: [
        "upcoming",
        "ongoing",
        "completed",
        "cancelled",
        "archived",
      ],
      fulfillment_status: [
        "processing",
        "shipped",
        "out_for_delivery",
        "delivered",
        "cancelled",
      ],
      order_status: ["pending", "paid", "fulfilled", "cancelled", "refunded"],
      product_status: ["draft", "active", "sold_out", "archived"],
    },
  },
} as const
