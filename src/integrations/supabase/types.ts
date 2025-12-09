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
    PostgrestVersion: "13.0.4"
  }
  public: {
    Tables: {
      activity_logs: {
        Row: {
          action: string
          created_at: string | null
          details: Json | null
          id: string
          ip_address: unknown
          resource_id: string | null
          resource_type: string | null
          user_agent: string | null
          user_id: string | null
        }
        Insert: {
          action: string
          created_at?: string | null
          details?: Json | null
          id?: string
          ip_address?: unknown
          resource_id?: string | null
          resource_type?: string | null
          user_agent?: string | null
          user_id?: string | null
        }
        Update: {
          action?: string
          created_at?: string | null
          details?: Json | null
          id?: string
          ip_address?: unknown
          resource_id?: string | null
          resource_type?: string | null
          user_agent?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
      affiliates: {
        Row: {
          code: string
          commission_rate: number | null
          contact_email: string | null
          created_at: string
          id: string
          is_active: boolean
          name: string
          updated_at: string
        }
        Insert: {
          code: string
          commission_rate?: number | null
          contact_email?: string | null
          created_at?: string
          id?: string
          is_active?: boolean
          name: string
          updated_at?: string
        }
        Update: {
          code?: string
          commission_rate?: number | null
          contact_email?: string | null
          created_at?: string
          id?: string
          is_active?: boolean
          name?: string
          updated_at?: string
        }
        Relationships: []
      }
      blog_categories: {
        Row: {
          color: string | null
          created_at: string | null
          description: string | null
          id: string
          name: string
          slug: string
          updated_at: string | null
        }
        Insert: {
          color?: string | null
          created_at?: string | null
          description?: string | null
          id?: string
          name: string
          slug: string
          updated_at?: string | null
        }
        Update: {
          color?: string | null
          created_at?: string | null
          description?: string | null
          id?: string
          name?: string
          slug?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      blog_posts: {
        Row: {
          author_id: string
          category_id: string | null
          content: string
          created_at: string | null
          excerpt: string | null
          featured_image_url: string | null
          id: string
          meta_description: string | null
          meta_title: string | null
          published_at: string | null
          reading_time: number | null
          slug: string
          status: string | null
          tags: string[] | null
          title: string
          updated_at: string | null
          view_count: number | null
        }
        Insert: {
          author_id: string
          category_id?: string | null
          content: string
          created_at?: string | null
          excerpt?: string | null
          featured_image_url?: string | null
          id?: string
          meta_description?: string | null
          meta_title?: string | null
          published_at?: string | null
          reading_time?: number | null
          slug: string
          status?: string | null
          tags?: string[] | null
          title: string
          updated_at?: string | null
          view_count?: number | null
        }
        Update: {
          author_id?: string
          category_id?: string | null
          content?: string
          created_at?: string | null
          excerpt?: string | null
          featured_image_url?: string | null
          id?: string
          meta_description?: string | null
          meta_title?: string | null
          published_at?: string | null
          reading_time?: number | null
          slug?: string
          status?: string | null
          tags?: string[] | null
          title?: string
          updated_at?: string | null
          view_count?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "blog_posts_category_id_fkey"
            columns: ["category_id"]
            isOneToOne: false
            referencedRelation: "blog_categories"
            referencedColumns: ["id"]
          },
        ]
      }
      company_settings: {
        Row: {
          created_at: string
          id: string
          setting_key: string
          setting_value: Json
          updated_at: string
        }
        Insert: {
          created_at?: string
          id?: string
          setting_key: string
          setting_value: Json
          updated_at?: string
        }
        Update: {
          created_at?: string
          id?: string
          setting_key?: string
          setting_value?: Json
          updated_at?: string
        }
        Relationships: []
      }
      email_automation_rules: {
        Row: {
          conditions: Json | null
          created_at: string
          created_by: string | null
          custom_recipient: string | null
          delay_minutes: number | null
          description: string | null
          id: string
          is_active: boolean
          name: string
          recipient_type: string
          sender_id: string | null
          sent_count: number | null
          template_id: string | null
          trigger_type: string
          updated_at: string
        }
        Insert: {
          conditions?: Json | null
          created_at?: string
          created_by?: string | null
          custom_recipient?: string | null
          delay_minutes?: number | null
          description?: string | null
          id?: string
          is_active?: boolean
          name: string
          recipient_type: string
          sender_id?: string | null
          sent_count?: number | null
          template_id?: string | null
          trigger_type: string
          updated_at?: string
        }
        Update: {
          conditions?: Json | null
          created_at?: string
          created_by?: string | null
          custom_recipient?: string | null
          delay_minutes?: number | null
          description?: string | null
          id?: string
          is_active?: boolean
          name?: string
          recipient_type?: string
          sender_id?: string | null
          sent_count?: number | null
          template_id?: string | null
          trigger_type?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "email_automation_rules_sender_id_fkey"
            columns: ["sender_id"]
            isOneToOne: false
            referencedRelation: "email_senders"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "email_automation_rules_template_id_fkey"
            columns: ["template_id"]
            isOneToOne: false
            referencedRelation: "email_templates"
            referencedColumns: ["id"]
          },
        ]
      }
      email_events: {
        Row: {
          clicked_at: string | null
          created_at: string
          error_message: string | null
          id: string
          metadata: Json | null
          opened_at: string | null
          recipient_email: string
          rule_id: string | null
          sent_at: string | null
          status: string
          subject: string
          template_id: string | null
        }
        Insert: {
          clicked_at?: string | null
          created_at?: string
          error_message?: string | null
          id?: string
          metadata?: Json | null
          opened_at?: string | null
          recipient_email: string
          rule_id?: string | null
          sent_at?: string | null
          status: string
          subject: string
          template_id?: string | null
        }
        Update: {
          clicked_at?: string | null
          created_at?: string
          error_message?: string | null
          id?: string
          metadata?: Json | null
          opened_at?: string | null
          recipient_email?: string
          rule_id?: string | null
          sent_at?: string | null
          status?: string
          subject?: string
          template_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "email_events_rule_id_fkey"
            columns: ["rule_id"]
            isOneToOne: false
            referencedRelation: "email_automation_rules"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "email_events_template_id_fkey"
            columns: ["template_id"]
            isOneToOne: false
            referencedRelation: "email_templates"
            referencedColumns: ["id"]
          },
        ]
      }
      email_senders: {
        Row: {
          created_at: string
          from_email: string
          from_name: string
          id: string
          is_active: boolean
          is_default: boolean
          reply_to: string | null
          updated_at: string
        }
        Insert: {
          created_at?: string
          from_email: string
          from_name: string
          id?: string
          is_active?: boolean
          is_default?: boolean
          reply_to?: string | null
          updated_at?: string
        }
        Update: {
          created_at?: string
          from_email?: string
          from_name?: string
          id?: string
          is_active?: boolean
          is_default?: boolean
          reply_to?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      email_settings: {
        Row: {
          created_at: string
          id: string
          setting_key: string
          setting_value: Json
          updated_at: string
        }
        Insert: {
          created_at?: string
          id?: string
          setting_key: string
          setting_value: Json
          updated_at?: string
        }
        Update: {
          created_at?: string
          id?: string
          setting_key?: string
          setting_value?: Json
          updated_at?: string
        }
        Relationships: []
      }
      email_templates: {
        Row: {
          content: string
          created_at: string
          created_by: string | null
          description: string | null
          id: string
          is_active: boolean
          name: string
          subject: string
          template_type: string
          updated_at: string
          variables: string[] | null
        }
        Insert: {
          content: string
          created_at?: string
          created_by?: string | null
          description?: string | null
          id?: string
          is_active?: boolean
          name: string
          subject: string
          template_type: string
          updated_at?: string
          variables?: string[] | null
        }
        Update: {
          content?: string
          created_at?: string
          created_by?: string | null
          description?: string | null
          id?: string
          is_active?: boolean
          name?: string
          subject?: string
          template_type?: string
          updated_at?: string
          variables?: string[] | null
        }
        Relationships: []
      }
      form_submissions: {
        Row: {
          affiliate_code: string | null
          attribution: Json
          company: string | null
          created_at: string | null
          cv_file_url: string | null
          email: string
          form_data: Json | null
          form_type: string
          handled_at: string | null
          handled_by: string | null
          id: string
          ip_address: unknown
          message: string | null
          name: string
          phone: string | null
          position: string | null
          promo_code: string | null
          promotion_id: string | null
          session_id: string | null
          status: string | null
          updated_at: string | null
          user_agent: string | null
        }
        Insert: {
          affiliate_code?: string | null
          attribution?: Json
          company?: string | null
          created_at?: string | null
          cv_file_url?: string | null
          email: string
          form_data?: Json | null
          form_type: string
          handled_at?: string | null
          handled_by?: string | null
          id?: string
          ip_address?: unknown
          message?: string | null
          name: string
          phone?: string | null
          position?: string | null
          promo_code?: string | null
          promotion_id?: string | null
          session_id?: string | null
          status?: string | null
          updated_at?: string | null
          user_agent?: string | null
        }
        Update: {
          affiliate_code?: string | null
          attribution?: Json
          company?: string | null
          created_at?: string | null
          cv_file_url?: string | null
          email?: string
          form_data?: Json | null
          form_type?: string
          handled_at?: string | null
          handled_by?: string | null
          id?: string
          ip_address?: unknown
          message?: string | null
          name?: string
          phone?: string | null
          position?: string | null
          promo_code?: string | null
          promotion_id?: string | null
          session_id?: string | null
          status?: string | null
          updated_at?: string | null
          user_agent?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "form_submissions_promotion_id_fkey"
            columns: ["promotion_id"]
            isOneToOne: false
            referencedRelation: "promotions"
            referencedColumns: ["id"]
          },
        ]
      }
      homepage_content: {
        Row: {
          created_at: string | null
          data: Json | null
          id: string
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          data?: Json | null
          id: string
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          data?: Json | null
          id?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      marketing_settings: {
        Row: {
          created_at: string
          id: string
          is_active: boolean
          setting_key: string
          setting_value: Json
          updated_at: string
        }
        Insert: {
          created_at?: string
          id?: string
          is_active?: boolean
          setting_key: string
          setting_value?: Json
          updated_at?: string
        }
        Update: {
          created_at?: string
          id?: string
          is_active?: boolean
          setting_key?: string
          setting_value?: Json
          updated_at?: string
        }
        Relationships: []
      }
      offer_events: {
        Row: {
          affiliate_code: string | null
          created_at: string
          event_type: string
          id: string
          ip_address: unknown
          metadata: Json
          page_path: string
          promo_code: string | null
          promotion_id: string
          session_id: string
          user_agent: string | null
          user_id: string | null
        }
        Insert: {
          affiliate_code?: string | null
          created_at?: string
          event_type: string
          id?: string
          ip_address?: unknown
          metadata?: Json
          page_path: string
          promo_code?: string | null
          promotion_id: string
          session_id: string
          user_agent?: string | null
          user_id?: string | null
        }
        Update: {
          affiliate_code?: string | null
          created_at?: string
          event_type?: string
          id?: string
          ip_address?: unknown
          metadata?: Json
          page_path?: string
          promo_code?: string | null
          promotion_id?: string
          session_id?: string
          user_agent?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "offer_events_promotion_id_fkey"
            columns: ["promotion_id"]
            isOneToOne: false
            referencedRelation: "promotions"
            referencedColumns: ["id"]
          },
        ]
      }
      portfolio_projects: {
        Row: {
          author_id: string | null
          client: string | null
          country: string | null
          cover_image_url: string | null
          created_at: string
          description: string | null
          featured: boolean
          featured_order: number | null
          gallery_urls: string[] | null
          id: string
          industry: string | null
          live_url: string | null
          metrics: Json | null
          repo_url: string | null
          results_summary: string | null
          short_description: string
          slug: string
          status: Database["public"]["Enums"]["project_status"]
          tags: string[] | null
          technologies: string[] | null
          title: string
          updated_at: string
          year: number | null
        }
        Insert: {
          author_id?: string | null
          client?: string | null
          country?: string | null
          cover_image_url?: string | null
          created_at?: string
          description?: string | null
          featured?: boolean
          featured_order?: number | null
          gallery_urls?: string[] | null
          id?: string
          industry?: string | null
          live_url?: string | null
          metrics?: Json | null
          repo_url?: string | null
          results_summary?: string | null
          short_description: string
          slug: string
          status?: Database["public"]["Enums"]["project_status"]
          tags?: string[] | null
          technologies?: string[] | null
          title: string
          updated_at?: string
          year?: number | null
        }
        Update: {
          author_id?: string | null
          client?: string | null
          country?: string | null
          cover_image_url?: string | null
          created_at?: string
          description?: string | null
          featured?: boolean
          featured_order?: number | null
          gallery_urls?: string[] | null
          id?: string
          industry?: string | null
          live_url?: string | null
          metrics?: Json | null
          repo_url?: string | null
          results_summary?: string | null
          short_description?: string
          slug?: string
          status?: Database["public"]["Enums"]["project_status"]
          tags?: string[] | null
          technologies?: string[] | null
          title?: string
          updated_at?: string
          year?: number | null
        }
        Relationships: []
      }
      profiles: {
        Row: {
          avatar_url: string | null
          company_email: string | null
          created_at: string
          full_name: string | null
          id: string
          last_login_at: string | null
          role: Database["public"]["Enums"]["app_role"]
          status: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          avatar_url?: string | null
          company_email?: string | null
          created_at?: string
          full_name?: string | null
          id?: string
          last_login_at?: string | null
          role?: Database["public"]["Enums"]["app_role"]
          status?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          avatar_url?: string | null
          company_email?: string | null
          created_at?: string
          full_name?: string | null
          id?: string
          last_login_at?: string | null
          role?: Database["public"]["Enums"]["app_role"]
          status?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      promotions: {
        Row: {
          background_color: string | null
          button_color: string | null
          button_text: string | null
          code: string | null
          created_at: string
          created_by: string | null
          description: string | null
          discount_amount: number | null
          discount_percentage: number | null
          expires_at: string | null
          id: string
          max_displays_per_user: number | null
          offer_text: string
          popup_size: string
          status: Database["public"]["Enums"]["promotion_status"]
          target_pages: string[] | null
          text_color: string | null
          theme: string
          title: string
          trigger_type: Database["public"]["Enums"]["promotion_trigger"]
          trigger_value: number | null
          updated_at: string
        }
        Insert: {
          background_color?: string | null
          button_color?: string | null
          button_text?: string | null
          code?: string | null
          created_at?: string
          created_by?: string | null
          description?: string | null
          discount_amount?: number | null
          discount_percentage?: number | null
          expires_at?: string | null
          id?: string
          max_displays_per_user?: number | null
          offer_text: string
          popup_size?: string
          status?: Database["public"]["Enums"]["promotion_status"]
          target_pages?: string[] | null
          text_color?: string | null
          theme?: string
          title: string
          trigger_type?: Database["public"]["Enums"]["promotion_trigger"]
          trigger_value?: number | null
          updated_at?: string
        }
        Update: {
          background_color?: string | null
          button_color?: string | null
          button_text?: string | null
          code?: string | null
          created_at?: string
          created_by?: string | null
          description?: string | null
          discount_amount?: number | null
          discount_percentage?: number | null
          expires_at?: string | null
          id?: string
          max_displays_per_user?: number | null
          offer_text?: string
          popup_size?: string
          status?: Database["public"]["Enums"]["promotion_status"]
          target_pages?: string[] | null
          text_color?: string | null
          theme?: string
          title?: string
          trigger_type?: Database["public"]["Enums"]["promotion_trigger"]
          trigger_value?: number | null
          updated_at?: string
        }
        Relationships: []
      }
      user_consent: {
        Row: {
          consent_categories: Json
          consent_timestamp: string
          id: string
          ip_address: unknown
          last_updated: string
          session_id: string
          user_agent: string | null
        }
        Insert: {
          consent_categories?: Json
          consent_timestamp?: string
          id?: string
          ip_address?: unknown
          last_updated?: string
          session_id: string
          user_agent?: string | null
        }
        Update: {
          consent_categories?: Json
          consent_timestamp?: string
          id?: string
          ip_address?: unknown
          last_updated?: string
          session_id?: string
          user_agent?: string | null
        }
        Relationships: []
      }
      user_roles: {
        Row: {
          assigned_at: string | null
          assigned_by: string | null
          created_at: string | null
          id: string
          role: Database["public"]["Enums"]["user_role"]
          updated_at: string | null
          user_id: string
        }
        Insert: {
          assigned_at?: string | null
          assigned_by?: string | null
          created_at?: string | null
          id?: string
          role?: Database["public"]["Enums"]["user_role"]
          updated_at?: string | null
          user_id: string
        }
        Update: {
          assigned_at?: string | null
          assigned_by?: string | null
          created_at?: string | null
          id?: string
          role?: Database["public"]["Enums"]["user_role"]
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      cleanup_old_consent_records: { Args: never; Returns: undefined }
      get_user_role: {
        Args: { user_uuid: string }
        Returns: Database["public"]["Enums"]["user_role"]
      }
      has_role:
        | { Args: { _role: string; _user_id: string }; Returns: boolean }
        | {
            Args: {
              required_role: Database["public"]["Enums"]["user_role"]
              user_uuid: string
            }
            Returns: boolean
          }
      is_admin: { Args: { user_uuid: string }; Returns: boolean }
      log_user_activity: {
        Args: {
          p_action: string
          p_details?: Json
          p_resource_id?: string
          p_resource_type?: string
          p_user_id: string
        }
        Returns: string
      }
      validate_session_access: {
        Args: { record_session_id: string }
        Returns: boolean
      }
    }
    Enums: {
      app_role: "admin" | "editor" | "user" | "super_admin"
      project_status: "draft" | "published" | "archived"
      promotion_status: "draft" | "active" | "paused" | "expired"
      promotion_trigger:
        | "page_load"
        | "exit_intent"
        | "scroll_percentage"
        | "time_delay"
      user_role: "admin" | "hr" | "editor" | "support_agent" | "user"
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
      app_role: ["admin", "editor", "user", "super_admin"],
      project_status: ["draft", "published", "archived"],
      promotion_status: ["draft", "active", "paused", "expired"],
      promotion_trigger: [
        "page_load",
        "exit_intent",
        "scroll_percentage",
        "time_delay",
      ],
      user_role: ["admin", "hr", "editor", "support_agent", "user"],
    },
  },
} as const
