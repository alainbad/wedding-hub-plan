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
      leads: {
        Row: {
          archived: boolean
          budget: string
          created_at: string
          customer_name: string
          email: string
          event_date: string | null
          guest_count: number | null
          id: string
          location: string
          message: string
          notes: string
          phone: string
          status: Database["public"]["Enums"]["lead_status"]
          supplier_id: string
          updated_at: string
        }
        Insert: {
          archived?: boolean
          budget?: string
          created_at?: string
          customer_name?: string
          email?: string
          event_date?: string | null
          guest_count?: number | null
          id?: string
          location?: string
          message?: string
          notes?: string
          phone?: string
          status?: Database["public"]["Enums"]["lead_status"]
          supplier_id: string
          updated_at?: string
        }
        Update: {
          archived?: boolean
          budget?: string
          created_at?: string
          customer_name?: string
          email?: string
          event_date?: string | null
          guest_count?: number | null
          id?: string
          location?: string
          message?: string
          notes?: string
          phone?: string
          status?: Database["public"]["Enums"]["lead_status"]
          supplier_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "leads_supplier_id_fkey"
            columns: ["supplier_id"]
            isOneToOne: false
            referencedRelation: "suppliers"
            referencedColumns: ["id"]
          },
        ]
      }
      packages: {
        Row: {
          created_at: string
          description: string
          id: string
          includes: string[]
          name: string
          price: number
          supplier_id: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          description?: string
          id?: string
          includes?: string[]
          name?: string
          price?: number
          supplier_id: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          description?: string
          id?: string
          includes?: string[]
          name?: string
          price?: number
          supplier_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "packages_supplier_id_fkey"
            columns: ["supplier_id"]
            isOneToOne: false
            referencedRelation: "suppliers"
            referencedColumns: ["id"]
          },
        ]
      }
      portfolio: {
        Row: {
          caption: string
          created_at: string
          id: string
          is_cover: boolean
          media_type: string
          media_url: string
          sort_order: number
          supplier_id: string
        }
        Insert: {
          caption?: string
          created_at?: string
          id?: string
          is_cover?: boolean
          media_type?: string
          media_url?: string
          sort_order?: number
          supplier_id: string
        }
        Update: {
          caption?: string
          created_at?: string
          id?: string
          is_cover?: boolean
          media_type?: string
          media_url?: string
          sort_order?: number
          supplier_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "portfolio_supplier_id_fkey"
            columns: ["supplier_id"]
            isOneToOne: false
            referencedRelation: "suppliers"
            referencedColumns: ["id"]
          },
        ]
      }
      reviews: {
        Row: {
          created_at: string
          customer_name: string
          id: string
          rating: number
          reply: string
          review: string
          supplier_id: string
        }
        Insert: {
          created_at?: string
          customer_name?: string
          id?: string
          rating?: number
          reply?: string
          review?: string
          supplier_id: string
        }
        Update: {
          created_at?: string
          customer_name?: string
          id?: string
          rating?: number
          reply?: string
          review?: string
          supplier_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "reviews_supplier_id_fkey"
            columns: ["supplier_id"]
            isOneToOne: false
            referencedRelation: "suppliers"
            referencedColumns: ["id"]
          },
        ]
      }
      services: {
        Row: {
          created_at: string
          description: string
          duration: string
          id: string
          name: string
          price: number
          supplier_id: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          description?: string
          duration?: string
          id?: string
          name?: string
          price?: number
          supplier_id: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          description?: string
          duration?: string
          id?: string
          name?: string
          price?: number
          supplier_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "services_supplier_id_fkey"
            columns: ["supplier_id"]
            isOneToOne: false
            referencedRelation: "suppliers"
            referencedColumns: ["id"]
          },
        ]
      }
      suppliers: {
        Row: {
          about: string
          address: string
          category: string
          category_label: string
          city: string
          company_name: string
          created_at: string
          email: string
          facebook: string
          id: string
          image_url: string
          instagram: string
          maps_location: string
          owner_id: string | null
          phone: string
          price_range: string
          profile_views: number
          rating: number
          region: string
          reviews_count: number
          service_areas: string[]
          services: string[]
          starting_price: number
          status: Database["public"]["Enums"]["supplier_status"]
          subscription_plan: Database["public"]["Enums"]["subscription_plan"]
          tagline: string
          tiktok: string
          updated_at: string
          verified: boolean
          website: string
          whatsapp: string
        }
        Insert: {
          about?: string
          address?: string
          category?: string
          category_label?: string
          city?: string
          company_name?: string
          created_at?: string
          email?: string
          facebook?: string
          id?: string
          image_url?: string
          instagram?: string
          maps_location?: string
          owner_id?: string | null
          phone?: string
          price_range?: string
          profile_views?: number
          rating?: number
          region?: string
          reviews_count?: number
          service_areas?: string[]
          services?: string[]
          starting_price?: number
          status?: Database["public"]["Enums"]["supplier_status"]
          subscription_plan?: Database["public"]["Enums"]["subscription_plan"]
          tagline?: string
          tiktok?: string
          updated_at?: string
          verified?: boolean
          website?: string
          whatsapp?: string
        }
        Update: {
          about?: string
          address?: string
          category?: string
          category_label?: string
          city?: string
          company_name?: string
          created_at?: string
          email?: string
          facebook?: string
          id?: string
          image_url?: string
          instagram?: string
          maps_location?: string
          owner_id?: string | null
          phone?: string
          price_range?: string
          profile_views?: number
          rating?: number
          region?: string
          reviews_count?: number
          service_areas?: string[]
          services?: string[]
          starting_price?: number
          status?: Database["public"]["Enums"]["supplier_status"]
          subscription_plan?: Database["public"]["Enums"]["subscription_plan"]
          tagline?: string
          tiktok?: string
          updated_at?: string
          verified?: boolean
          website?: string
          whatsapp?: string
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
      increment_profile_views: {
        Args: { _supplier_id: string }
        Returns: undefined
      }
      owns_supplier: { Args: { _supplier_id: string }; Returns: boolean }
      supplier_is_approved: { Args: { _supplier_id: string }; Returns: boolean }
    }
    Enums: {
      app_role: "admin" | "supplier"
      lead_status: "new" | "contacted" | "quoted" | "booked" | "lost"
      subscription_plan: "Featured" | "Premium" | "Elite"
      supplier_status:
        | "draft"
        | "pending"
        | "approved"
        | "rejected"
        | "suspended"
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
      app_role: ["admin", "supplier"],
      lead_status: ["new", "contacted", "quoted", "booked", "lost"],
      subscription_plan: ["Featured", "Premium", "Elite"],
      supplier_status: [
        "draft",
        "pending",
        "approved",
        "rejected",
        "suspended",
      ],
    },
  },
} as const
