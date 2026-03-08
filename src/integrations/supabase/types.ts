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
    PostgrestVersion: "14.1"
  }
  public: {
    Tables: {
      analytics_events: {
        Row: {
          created_at: string
          id: string
          kind: string
          payload: Json | null
          user_id: string | null
        }
        Insert: {
          created_at?: string
          id?: string
          kind: string
          payload?: Json | null
          user_id?: string | null
        }
        Update: {
          created_at?: string
          id?: string
          kind?: string
          payload?: Json | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "analytics_events_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      exercises: {
        Row: {
          category: string
          chain_group: string | null
          chain_order: number | null
          created_at: string
          created_by: string | null
          cues: Json | null
          description: string | null
          difficulty_level: number | null
          equipment: string[]
          id: string
          image_url: string | null
          instagram_url: string | null
          media_url: string | null
          name: string
          primary_muscles: string[]
          progression_parent_id: string | null
          recovery_muscle: string | null
          recovery_nervous: string | null
          recovery_tendon: string | null
          secondary_muscles: string[]
          sets_reps: string | null
          slug: string
          stabilizer_muscles: string[] | null
          tendons_involved: string[] | null
          updated_at: string
          video_verified: boolean | null
          youtube_url: string | null
        }
        Insert: {
          category: string
          chain_group?: string | null
          chain_order?: number | null
          created_at?: string
          created_by?: string | null
          cues?: Json | null
          description?: string | null
          difficulty_level?: number | null
          equipment?: string[]
          id?: string
          image_url?: string | null
          instagram_url?: string | null
          media_url?: string | null
          name: string
          primary_muscles?: string[]
          progression_parent_id?: string | null
          recovery_muscle?: string | null
          recovery_nervous?: string | null
          recovery_tendon?: string | null
          secondary_muscles?: string[]
          sets_reps?: string | null
          slug: string
          stabilizer_muscles?: string[] | null
          tendons_involved?: string[] | null
          updated_at?: string
          video_verified?: boolean | null
          youtube_url?: string | null
        }
        Update: {
          category?: string
          chain_group?: string | null
          chain_order?: number | null
          created_at?: string
          created_by?: string | null
          cues?: Json | null
          description?: string | null
          difficulty_level?: number | null
          equipment?: string[]
          id?: string
          image_url?: string | null
          instagram_url?: string | null
          media_url?: string | null
          name?: string
          primary_muscles?: string[]
          progression_parent_id?: string | null
          recovery_muscle?: string | null
          recovery_nervous?: string | null
          recovery_tendon?: string | null
          secondary_muscles?: string[]
          sets_reps?: string | null
          slug?: string
          stabilizer_muscles?: string[] | null
          tendons_involved?: string[] | null
          updated_at?: string
          video_verified?: boolean | null
          youtube_url?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "exercises_progression_parent_id_fkey"
            columns: ["progression_parent_id"]
            isOneToOne: false
            referencedRelation: "exercises"
            referencedColumns: ["id"]
          },
        ]
      }
      feature_flags: {
        Row: {
          audience: Json | null
          created_at: string
          enabled: boolean
          key: string
          updated_at: string
        }
        Insert: {
          audience?: Json | null
          created_at?: string
          enabled?: boolean
          key: string
          updated_at?: string
        }
        Update: {
          audience?: Json | null
          created_at?: string
          enabled?: boolean
          key?: string
          updated_at?: string
        }
        Relationships: []
      }
      integrity_blocks: {
        Row: {
          applies_to_days: string[] | null
          created_at: string
          drills: string[] | null
          duration: string
          id: string
          key_cues: string[] | null
          slug: string
          title: string
        }
        Insert: {
          applies_to_days?: string[] | null
          created_at?: string
          drills?: string[] | null
          duration: string
          id?: string
          key_cues?: string[] | null
          slug: string
          title: string
        }
        Update: {
          applies_to_days?: string[] | null
          created_at?: string
          drills?: string[] | null
          duration?: string
          id?: string
          key_cues?: string[] | null
          slug?: string
          title?: string
        }
        Relationships: []
      }
      learning_principles: {
        Row: {
          caution: string | null
          created_at: string
          how_to_apply: string
          id: string
          micro_summary: string
          slug: string
          sources: string[] | null
          title: string
          when_to_use: string
          why_it_works: string
        }
        Insert: {
          caution?: string | null
          created_at?: string
          how_to_apply: string
          id?: string
          micro_summary: string
          slug: string
          sources?: string[] | null
          title: string
          when_to_use?: string
          why_it_works: string
        }
        Update: {
          caution?: string | null
          created_at?: string
          how_to_apply?: string
          id?: string
          micro_summary?: string
          slug?: string
          sources?: string[] | null
          title?: string
          when_to_use?: string
          why_it_works?: string
        }
        Relationships: []
      }
      non_negotiables: {
        Row: {
          applies_to: string[] | null
          created_at: string
          fix: string
          id: string
          short_cue: string
          slug: string
          title: string
          violations: string[] | null
        }
        Insert: {
          applies_to?: string[] | null
          created_at?: string
          fix: string
          id?: string
          short_cue: string
          slug: string
          title: string
          violations?: string[] | null
        }
        Update: {
          applies_to?: string[] | null
          created_at?: string
          fix?: string
          id?: string
          short_cue?: string
          slug?: string
          title?: string
          violations?: string[] | null
        }
        Relationships: []
      }
      profiles: {
        Row: {
          created_at: string
          display_name: string | null
          email: string
          id: string
          last_workout_date: string | null
          level: number | null
          music_enabled: boolean | null
          music_playlist_url: string | null
          pin_hash: string | null
          pin_salt: string | null
          role: Database["public"]["Enums"]["app_role"]
          streak_days: number | null
          total_xp: number | null
          updated_at: string
        }
        Insert: {
          created_at?: string
          display_name?: string | null
          email: string
          id: string
          last_workout_date?: string | null
          level?: number | null
          music_enabled?: boolean | null
          music_playlist_url?: string | null
          pin_hash?: string | null
          pin_salt?: string | null
          role?: Database["public"]["Enums"]["app_role"]
          streak_days?: number | null
          total_xp?: number | null
          updated_at?: string
        }
        Update: {
          created_at?: string
          display_name?: string | null
          email?: string
          id?: string
          last_workout_date?: string | null
          level?: number | null
          music_enabled?: boolean | null
          music_playlist_url?: string | null
          pin_hash?: string | null
          pin_salt?: string | null
          role?: Database["public"]["Enums"]["app_role"]
          streak_days?: number | null
          total_xp?: number | null
          updated_at?: string
        }
        Relationships: []
      }
      progressions: {
        Row: {
          created_at: string
          description: string | null
          exercise_id: string
          id: string
          level: number
          name: string
          prerequisites: Json | null
        }
        Insert: {
          created_at?: string
          description?: string | null
          exercise_id: string
          id?: string
          level: number
          name: string
          prerequisites?: Json | null
        }
        Update: {
          created_at?: string
          description?: string | null
          exercise_id?: string
          id?: string
          level?: number
          name?: string
          prerequisites?: Json | null
        }
        Relationships: [
          {
            foreignKeyName: "progressions_exercise_id_fkey"
            columns: ["exercise_id"]
            isOneToOne: false
            referencedRelation: "exercises"
            referencedColumns: ["id"]
          },
        ]
      }
      training_days: {
        Row: {
          created_at: string
          day_key: string
          emphasis: string
          exercise_categories: string[] | null
          id: string
          integrity_block_slugs: string[] | null
          label: string
          sort_order: number
          title: string
        }
        Insert: {
          created_at?: string
          day_key: string
          emphasis: string
          exercise_categories?: string[] | null
          id?: string
          integrity_block_slugs?: string[] | null
          label: string
          sort_order?: number
          title: string
        }
        Update: {
          created_at?: string
          day_key?: string
          emphasis?: string
          exercise_categories?: string[] | null
          id?: string
          integrity_block_slugs?: string[] | null
          label?: string
          sort_order?: number
          title?: string
        }
        Relationships: []
      }
      user_exercise_progress: {
        Row: {
          created_at: string | null
          exercise_id: string
          id: string
          mastered: boolean | null
          notes: string | null
          personal_best: Json | null
          updated_at: string | null
          user_id: string
          xp_earned: number | null
        }
        Insert: {
          created_at?: string | null
          exercise_id: string
          id?: string
          mastered?: boolean | null
          notes?: string | null
          personal_best?: Json | null
          updated_at?: string | null
          user_id: string
          xp_earned?: number | null
        }
        Update: {
          created_at?: string | null
          exercise_id?: string
          id?: string
          mastered?: boolean | null
          notes?: string | null
          personal_best?: Json | null
          updated_at?: string | null
          user_id?: string
          xp_earned?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "user_exercise_progress_exercise_id_fkey"
            columns: ["exercise_id"]
            isOneToOne: false
            referencedRelation: "exercises"
            referencedColumns: ["id"]
          },
        ]
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
        Relationships: [
          {
            foreignKeyName: "user_roles_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      workout_templates: {
        Row: {
          blocks: Json
          created_at: string
          id: string
          name: string
          owner_id: string
          updated_at: string
        }
        Insert: {
          blocks?: Json
          created_at?: string
          id?: string
          name: string
          owner_id: string
          updated_at?: string
        }
        Update: {
          blocks?: Json
          created_at?: string
          id?: string
          name?: string
          owner_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "workout_templates_owner_id_fkey"
            columns: ["owner_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      workouts: {
        Row: {
          created_at: string
          date: string
          entries: Json
          id: string
          notes: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          date: string
          entries?: Json
          id?: string
          notes?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          date?: string
          entries?: Json
          id?: string
          notes?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "workouts_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
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
    }
    Enums: {
      app_role: "user" | "coach" | "admin"
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
      app_role: ["user", "coach", "admin"],
    },
  },
} as const
