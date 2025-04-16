export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  public: {
    Tables: {
      activity_logs: {
        Row: {
          action_type: string
          created_at: string
          details: string | null
          id: string
          ip_address: string | null
          resource_id: string | null
          resource_type: string
          user_id: string | null
        }
        Insert: {
          action_type: string
          created_at?: string
          details?: string | null
          id?: string
          ip_address?: string | null
          resource_id?: string | null
          resource_type: string
          user_id?: string | null
        }
        Update: {
          action_type?: string
          created_at?: string
          details?: string | null
          id?: string
          ip_address?: string | null
          resource_id?: string | null
          resource_type?: string
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "activity_logs_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      alerts: {
        Row: {
          acknowledged: boolean | null
          acknowledged_at: string | null
          acknowledged_by: string | null
          created_at: string
          data_id: string
          id: string
          message: string
          severity: string
          type: string
        }
        Insert: {
          acknowledged?: boolean | null
          acknowledged_at?: string | null
          acknowledged_by?: string | null
          created_at?: string
          data_id: string
          id?: string
          message: string
          severity: string
          type: string
        }
        Update: {
          acknowledged?: boolean | null
          acknowledged_at?: string | null
          acknowledged_by?: string | null
          created_at?: string
          data_id?: string
          id?: string
          message?: string
          severity?: string
          type?: string
        }
        Relationships: [
          {
            foreignKeyName: "alerts_acknowledged_by_fkey"
            columns: ["acknowledged_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "alerts_data_id_fkey"
            columns: ["data_id"]
            isOneToOne: false
            referencedRelation: "water_quality_data"
            referencedColumns: ["id"]
          },
        ]
      }
      mining_sites: {
        Row: {
          active_monitoring: boolean | null
          created_at: string
          description: string | null
          id: string
          latitude: number
          longitude: number
          name: string
          updated_at: string
        }
        Insert: {
          active_monitoring?: boolean | null
          created_at?: string
          description?: string | null
          id?: string
          latitude: number
          longitude: number
          name: string
          updated_at?: string
        }
        Update: {
          active_monitoring?: boolean | null
          created_at?: string
          description?: string | null
          id?: string
          latitude?: number
          longitude?: number
          name?: string
          updated_at?: string
        }
        Relationships: []
      }
      pges_plans: {
        Row: {
          active: boolean | null
          approved_by: string | null
          created_at: string
          created_by: string
          description: string | null
          effective_date: string | null
          expiry_date: string | null
          file_path: string | null
          id: string
          site_id: string
          title: string
          updated_at: string
        }
        Insert: {
          active?: boolean | null
          approved_by?: string | null
          created_at?: string
          created_by: string
          description?: string | null
          effective_date?: string | null
          expiry_date?: string | null
          file_path?: string | null
          id?: string
          site_id: string
          title: string
          updated_at?: string
        }
        Update: {
          active?: boolean | null
          approved_by?: string | null
          created_at?: string
          created_by?: string
          description?: string | null
          effective_date?: string | null
          expiry_date?: string | null
          file_path?: string | null
          id?: string
          site_id?: string
          title?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "pges_plans_approved_by_fkey"
            columns: ["approved_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "pges_plans_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "pges_plans_site_id_fkey"
            columns: ["site_id"]
            isOneToOne: false
            referencedRelation: "mining_sites"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          avatar: string | null
          created_at: string
          email: string
          id: string
          name: string
          role: string
          updated_at: string
        }
        Insert: {
          avatar?: string | null
          created_at?: string
          email: string
          id: string
          name: string
          role: string
          updated_at?: string
        }
        Update: {
          avatar?: string | null
          created_at?: string
          email?: string
          id?: string
          name?: string
          role?: string
          updated_at?: string
        }
        Relationships: []
      }
      site_access: {
        Row: {
          site_id: string
          user_id: string
        }
        Insert: {
          site_id: string
          user_id: string
        }
        Update: {
          site_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "site_access_site_id_fkey"
            columns: ["site_id"]
            isOneToOne: false
            referencedRelation: "mining_sites"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "site_access_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      thresholds: {
        Row: {
          created_at: string
          id: string
          max_value: number | null
          min_value: number | null
          parameter: string
          site_id: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          id?: string
          max_value?: number | null
          min_value?: number | null
          parameter: string
          site_id: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          id?: string
          max_value?: number | null
          min_value?: number | null
          parameter?: string
          site_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "thresholds_site_id_fkey"
            columns: ["site_id"]
            isOneToOne: false
            referencedRelation: "mining_sites"
            referencedColumns: ["id"]
          },
        ]
      }
      water_quality_data: {
        Row: {
          ammonium: number | null
          arsenic: number | null
          cadmium: number | null
          chromium: number | null
          collected_by: string
          conductivity: number | null
          copper: number | null
          created_at: string
          dissolved_oxygen: number | null
          e_coli: number | null
          fecal_coliforms: number | null
          hydrocarbons: number | null
          ibgn: number | null
          id: string
          latitude: number
          lead: number | null
          longitude: number
          mercury: number | null
          nitrates: number | null
          nitrites: number | null
          notes: string | null
          organic_solvents: number | null
          pathogens: string | null
          pesticides: number | null
          ph: number | null
          phosphates: number | null
          salinity: number | null
          site_id: string
          status: string
          suspended_solids: number | null
          temperature: number | null
          timestamp: string
          turbidity: number | null
          zinc: number | null
        }
        Insert: {
          ammonium?: number | null
          arsenic?: number | null
          cadmium?: number | null
          chromium?: number | null
          collected_by: string
          conductivity?: number | null
          copper?: number | null
          created_at?: string
          dissolved_oxygen?: number | null
          e_coli?: number | null
          fecal_coliforms?: number | null
          hydrocarbons?: number | null
          ibgn?: number | null
          id?: string
          latitude: number
          lead?: number | null
          longitude: number
          mercury?: number | null
          nitrates?: number | null
          nitrites?: number | null
          notes?: string | null
          organic_solvents?: number | null
          pathogens?: string | null
          pesticides?: number | null
          ph?: number | null
          phosphates?: number | null
          salinity?: number | null
          site_id: string
          status?: string
          suspended_solids?: number | null
          temperature?: number | null
          timestamp?: string
          turbidity?: number | null
          zinc?: number | null
        }
        Update: {
          ammonium?: number | null
          arsenic?: number | null
          cadmium?: number | null
          chromium?: number | null
          collected_by?: string
          conductivity?: number | null
          copper?: number | null
          created_at?: string
          dissolved_oxygen?: number | null
          e_coli?: number | null
          fecal_coliforms?: number | null
          hydrocarbons?: number | null
          ibgn?: number | null
          id?: string
          latitude?: number
          lead?: number | null
          longitude?: number
          mercury?: number | null
          nitrates?: number | null
          nitrites?: number | null
          notes?: string | null
          organic_solvents?: number | null
          pathogens?: string | null
          pesticides?: number | null
          ph?: number | null
          phosphates?: number | null
          salinity?: number | null
          site_id?: string
          status?: string
          suspended_solids?: number | null
          temperature?: number | null
          timestamp?: string
          turbidity?: number | null
          zinc?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "water_quality_data_collected_by_fkey"
            columns: ["collected_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "water_quality_data_site_id_fkey"
            columns: ["site_id"]
            isOneToOne: false
            referencedRelation: "mining_sites"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DefaultSchema = Database[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
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
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
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
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
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
    | { schema: keyof Database },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof Database },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends { schema: keyof Database }
  ? Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {},
  },
} as const
