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
      audit_log: {
        Row: {
          actor_id: string | null
          created_at: string
          details: Json | null
          election_id: string | null
          event: string
          id: string
        }
        Insert: {
          actor_id?: string | null
          created_at?: string
          details?: Json | null
          election_id?: string | null
          event: string
          id?: string
        }
        Update: {
          actor_id?: string | null
          created_at?: string
          details?: Json | null
          election_id?: string | null
          event?: string
          id?: string
        }
        Relationships: [
          {
            foreignKeyName: "audit_log_election_id_fkey"
            columns: ["election_id"]
            isOneToOne: false
            referencedRelation: "elections"
            referencedColumns: ["id"]
          },
        ]
      }
      ballots: {
        Row: {
          cast_at: string
          election_id: string
          id: string
          selections: Json
          voter_roll_id: string
        }
        Insert: {
          cast_at?: string
          election_id: string
          id?: string
          selections: Json
          voter_roll_id: string
        }
        Update: {
          cast_at?: string
          election_id?: string
          id?: string
          selections?: Json
          voter_roll_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "ballots_election_id_fkey"
            columns: ["election_id"]
            isOneToOne: false
            referencedRelation: "elections"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "ballots_voter_roll_id_fkey"
            columns: ["voter_roll_id"]
            isOneToOne: false
            referencedRelation: "voter_roll"
            referencedColumns: ["id"]
          },
        ]
      }
      candidates: {
        Row: {
          created_at: string
          display_order: number
          election_id: string
          id: string
          name: string
          photo_url: string | null
          statement: string | null
        }
        Insert: {
          created_at?: string
          display_order?: number
          election_id: string
          id?: string
          name: string
          photo_url?: string | null
          statement?: string | null
        }
        Update: {
          created_at?: string
          display_order?: number
          election_id?: string
          id?: string
          name?: string
          photo_url?: string | null
          statement?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "candidates_election_id_fkey"
            columns: ["election_id"]
            isOneToOne: false
            referencedRelation: "elections"
            referencedColumns: ["id"]
          },
        ]
      }
      elections: {
        Row: {
          allow_abstain: boolean
          anonymous: boolean
          closes_at: string | null
          created_at: string
          description: string | null
          id: string
          max_selections: number
          method: Database["public"]["Enums"]["voting_method"]
          opens_at: string | null
          organization_id: string | null
          owner_id: string
          status: Database["public"]["Enums"]["election_status"]
          title: string
          updated_at: string
        }
        Insert: {
          allow_abstain?: boolean
          anonymous?: boolean
          closes_at?: string | null
          created_at?: string
          description?: string | null
          id?: string
          max_selections?: number
          method?: Database["public"]["Enums"]["voting_method"]
          opens_at?: string | null
          organization_id?: string | null
          owner_id: string
          status?: Database["public"]["Enums"]["election_status"]
          title: string
          updated_at?: string
        }
        Update: {
          allow_abstain?: boolean
          anonymous?: boolean
          closes_at?: string | null
          created_at?: string
          description?: string | null
          id?: string
          max_selections?: number
          method?: Database["public"]["Enums"]["voting_method"]
          opens_at?: string | null
          organization_id?: string | null
          owner_id?: string
          status?: Database["public"]["Enums"]["election_status"]
          title?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "elections_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      org_api_keys: {
        Row: {
          created_at: string
          created_by: string
          id: string
          key_hash: string
          key_prefix: string
          last_used_at: string | null
          name: string
          organization_id: string
        }
        Insert: {
          created_at?: string
          created_by: string
          id?: string
          key_hash: string
          key_prefix: string
          last_used_at?: string | null
          name: string
          organization_id: string
        }
        Update: {
          created_at?: string
          created_by?: string
          id?: string
          key_hash?: string
          key_prefix?: string
          last_used_at?: string | null
          name?: string
          organization_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "org_api_keys_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      org_members_directory: {
        Row: {
          created_at: string
          email: string
          external_id: string | null
          full_name: string | null
          id: string
          invited_at: string | null
          joined_at: string | null
          metadata: Json
          organization_id: string
          status: Database["public"]["Enums"]["member_status"]
          tags: string[]
          updated_at: string
          user_id: string | null
        }
        Insert: {
          created_at?: string
          email: string
          external_id?: string | null
          full_name?: string | null
          id?: string
          invited_at?: string | null
          joined_at?: string | null
          metadata?: Json
          organization_id: string
          status?: Database["public"]["Enums"]["member_status"]
          tags?: string[]
          updated_at?: string
          user_id?: string | null
        }
        Update: {
          created_at?: string
          email?: string
          external_id?: string | null
          full_name?: string | null
          id?: string
          invited_at?: string | null
          joined_at?: string | null
          metadata?: Json
          organization_id?: string
          status?: Database["public"]["Enums"]["member_status"]
          tags?: string[]
          updated_at?: string
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "org_members_directory_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      organization_members: {
        Row: {
          created_at: string
          id: string
          organization_id: string
          role: Database["public"]["Enums"]["org_member_role"]
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          organization_id: string
          role?: Database["public"]["Enums"]["org_member_role"]
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          organization_id?: string
          role?: Database["public"]["Enums"]["org_member_role"]
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "organization_members_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      organizations: {
        Row: {
          accent_color: string | null
          brand_color: string | null
          created_at: string
          created_by: string
          id: string
          logo_url: string | null
          name: string
          parent_id: string | null
          slug: string
          tagline: string | null
          updated_at: string
        }
        Insert: {
          accent_color?: string | null
          brand_color?: string | null
          created_at?: string
          created_by: string
          id?: string
          logo_url?: string | null
          name: string
          parent_id?: string | null
          slug: string
          tagline?: string | null
          updated_at?: string
        }
        Update: {
          accent_color?: string | null
          brand_color?: string | null
          created_at?: string
          created_by?: string
          id?: string
          logo_url?: string | null
          name?: string
          parent_id?: string | null
          slug?: string
          tagline?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "organizations_parent_id_fkey"
            columns: ["parent_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          created_at: string
          display_name: string | null
          id: string
          organization: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          display_name?: string | null
          id?: string
          organization?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          display_name?: string | null
          id?: string
          organization?: string | null
          updated_at?: string
          user_id?: string
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
      voter_roll: {
        Row: {
          created_at: string
          election_id: string
          email: string | null
          has_voted: boolean
          id: string
          user_id: string | null
          voting_token: string | null
        }
        Insert: {
          created_at?: string
          election_id: string
          email?: string | null
          has_voted?: boolean
          id?: string
          user_id?: string | null
          voting_token?: string | null
        }
        Update: {
          created_at?: string
          election_id?: string
          email?: string | null
          has_voted?: boolean
          id?: string
          user_id?: string | null
          voting_token?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "voter_roll_election_id_fkey"
            columns: ["election_id"]
            isOneToOne: false
            referencedRelation: "elections"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      claim_election_admin: { Args: never; Returns: undefined }
      enroll_voters_by_tag: {
        Args: { _election_id: string; _tag: string }
        Returns: number
      }
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
      is_enrolled: {
        Args: { _election_id: string; _user_id: string }
        Returns: boolean
      }
      is_org_admin: {
        Args: { _org_id: string; _user_id: string }
        Returns: boolean
      }
      is_org_member: {
        Args: { _org_id: string; _user_id: string }
        Returns: boolean
      }
      owns_election: {
        Args: { _election_id: string; _user_id: string }
        Returns: boolean
      }
    }
    Enums: {
      app_role: "platform_admin" | "election_admin" | "voter" | "observer"
      election_status: "draft" | "scheduled" | "open" | "closed" | "certified"
      member_status: "active" | "invited" | "suspended"
      org_member_role: "owner" | "admin" | "member" | "observer"
      voting_method: "fptp" | "approval" | "ranked" | "yes_no"
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
      app_role: ["platform_admin", "election_admin", "voter", "observer"],
      election_status: ["draft", "scheduled", "open", "closed", "certified"],
      member_status: ["active", "invited", "suspended"],
      org_member_role: ["owner", "admin", "member", "observer"],
      voting_method: ["fptp", "approval", "ranked", "yes_no"],
    },
  },
} as const
