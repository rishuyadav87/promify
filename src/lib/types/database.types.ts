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
      brands: {
        Row: {
          company_name: string
          created_at: string
          id: string
          user_id: string
        }
        Insert: {
          company_name: string
          created_at?: string
          id?: string
          user_id: string
        }
        Update: {
          company_name?: string
          created_at?: string
          id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "brands_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: true
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      campaigns: {
        Row: {
          brand_id: string
          created_at: string
          creator_id: string
          expected_range_high: number | null
          expected_range_low: number | null
          id: string
          measurement_window_ends_at: string | null
          post_url: string | null
          price: number
          requires_approval: boolean
          status: Database["public"]["Enums"]["campaign_status"]
          usage_rights: Database["public"]["Enums"]["usage_rights_type"]
        }
        Insert: {
          brand_id: string
          created_at?: string
          creator_id: string
          expected_range_high?: number | null
          expected_range_low?: number | null
          id?: string
          measurement_window_ends_at?: string | null
          post_url?: string | null
          price: number
          requires_approval?: boolean
          status?: Database["public"]["Enums"]["campaign_status"]
          usage_rights?: Database["public"]["Enums"]["usage_rights_type"]
        }
        Update: {
          brand_id?: string
          created_at?: string
          creator_id?: string
          expected_range_high?: number | null
          expected_range_low?: number | null
          id?: string
          measurement_window_ends_at?: string | null
          post_url?: string | null
          price?: number
          requires_approval?: boolean
          status?: Database["public"]["Enums"]["campaign_status"]
          usage_rights?: Database["public"]["Enums"]["usage_rights_type"]
        }
        Relationships: [
          {
            foreignKeyName: "campaigns_brand_id_fkey"
            columns: ["brand_id"]
            isOneToOne: false
            referencedRelation: "brands"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "campaigns_creator_id_fkey"
            columns: ["creator_id"]
            isOneToOne: false
            referencedRelation: "creators"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "campaigns_creator_id_fkey"
            columns: ["creator_id"]
            isOneToOne: false
            referencedRelation: "public_creator_profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      creators: {
        Row: {
          created_at: string
          display_name: string
          engagement_rate: number | null
          follower_count: number
          handle: string
          id: string
          niche: string | null
          oauth_connected: boolean
          platform: Database["public"]["Enums"]["platform_type"]
          tier: Database["public"]["Enums"]["creator_tier"] | null
          user_id: string
        }
        Insert: {
          created_at?: string
          display_name: string
          engagement_rate?: number | null
          follower_count?: number
          handle: string
          id?: string
          niche?: string | null
          oauth_connected?: boolean
          platform: Database["public"]["Enums"]["platform_type"]
          tier?: Database["public"]["Enums"]["creator_tier"] | null
          user_id: string
        }
        Update: {
          created_at?: string
          display_name?: string
          engagement_rate?: number | null
          follower_count?: number
          handle?: string
          id?: string
          niche?: string | null
          oauth_connected?: boolean
          platform?: Database["public"]["Enums"]["platform_type"]
          tier?: Database["public"]["Enums"]["creator_tier"] | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "creators_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      disputes: {
        Row: {
          campaign_id: string
          created_at: string
          id: string
          reason: string
          status: Database["public"]["Enums"]["dispute_status"]
        }
        Insert: {
          campaign_id: string
          created_at?: string
          id?: string
          reason: string
          status?: Database["public"]["Enums"]["dispute_status"]
        }
        Update: {
          campaign_id?: string
          created_at?: string
          id?: string
          reason?: string
          status?: Database["public"]["Enums"]["dispute_status"]
        }
        Relationships: [
          {
            foreignKeyName: "disputes_campaign_id_fkey"
            columns: ["campaign_id"]
            isOneToOne: false
            referencedRelation: "campaigns"
            referencedColumns: ["id"]
          },
        ]
      }
      payouts: {
        Row: {
          amount: number
          campaign_id: string
          id: string
          released_at: string | null
          status: Database["public"]["Enums"]["payout_status"]
          tds_deducted: number
        }
        Insert: {
          amount: number
          campaign_id: string
          id?: string
          released_at?: string | null
          status?: Database["public"]["Enums"]["payout_status"]
          tds_deducted?: number
        }
        Update: {
          amount?: number
          campaign_id?: string
          id?: string
          released_at?: string | null
          status?: Database["public"]["Enums"]["payout_status"]
          tds_deducted?: number
        }
        Relationships: [
          {
            foreignKeyName: "payouts_campaign_id_fkey"
            columns: ["campaign_id"]
            isOneToOne: false
            referencedRelation: "campaigns"
            referencedColumns: ["id"]
          },
        ]
      }
      users: {
        Row: {
          created_at: string
          email: string
          id: string
          role: Database["public"]["Enums"]["user_role"]
        }
        Insert: {
          created_at?: string
          email: string
          id: string
          role: Database["public"]["Enums"]["user_role"]
        }
        Update: {
          created_at?: string
          email?: string
          id?: string
          role?: Database["public"]["Enums"]["user_role"]
        }
        Relationships: []
      }
    }
    Views: {
      public_creator_profiles: {
        Row: {
          display_name: string | null
          follower_count: number | null
          handle: string | null
          id: string | null
          niche: string | null
          platform: Database["public"]["Enums"]["platform_type"] | null
          tier: Database["public"]["Enums"]["creator_tier"] | null
        }
        Insert: {
          display_name?: string | null
          follower_count?: number | null
          handle?: string | null
          id?: string | null
          niche?: string | null
          platform?: Database["public"]["Enums"]["platform_type"] | null
          tier?: Database["public"]["Enums"]["creator_tier"] | null
        }
        Update: {
          display_name?: string | null
          follower_count?: number | null
          handle?: string | null
          id?: string | null
          niche?: string | null
          platform?: Database["public"]["Enums"]["platform_type"] | null
          tier?: Database["public"]["Enums"]["creator_tier"] | null
        }
        Relationships: []
      }
    }
    Functions: {
      current_brand_id: { Args: never; Returns: string }
      current_creator_id: { Args: never; Returns: string }
      current_user_role: {
        Args: never
        Returns: Database["public"]["Enums"]["user_role"]
      }
    }
    Enums: {
      campaign_status:
        | "pending"
        | "accepted"
        | "content_submitted"
        | "live"
        | "measuring"
        | "completed"
        | "refunded"
        | "disputed"
      creator_tier: "tier1" | "tier2"
      dispute_status: "open" | "under_review" | "resolved" | "rejected"
      payout_status: "pending" | "processing" | "released" | "failed"
      platform_type: "instagram" | "youtube"
      usage_rights_type: "none" | "30days" | "60days" | "90days"
      user_role: "creator" | "brand" | "admin"
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
      campaign_status: [
        "pending",
        "accepted",
        "content_submitted",
        "live",
        "measuring",
        "completed",
        "refunded",
        "disputed",
      ],
      creator_tier: ["tier1", "tier2"],
      dispute_status: ["open", "under_review", "resolved", "rejected"],
      payout_status: ["pending", "processing", "released", "failed"],
      platform_type: ["instagram", "youtube"],
      usage_rights_type: ["none", "30days", "60days", "90days"],
      user_role: ["creator", "brand", "admin"],
    },
  },
} as const
