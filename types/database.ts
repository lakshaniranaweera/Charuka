/**
 * Generated-style database types. Kept hand-authored so the app is fully typed
 * without requiring the Supabase CLI codegen step at build time.
 */
export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type ThemeMode = 'light' | 'dark' | 'system'

export type EventRow = {
  id: string
  event_date: string | null
  event_name: string
  cost: number
  previsit_date: string | null
  production_date: string | null
  setup_date: string | null
  location: string | null
  activation_manager: string | null
  remarks: string | null
  created_at: string
  updated_at: string
}

export type EventInsert = Omit<EventRow, 'id' | 'created_at' | 'updated_at'>
export type EventUpdate = Partial<EventInsert>

export type DashboardSettingsRow = {
  id: number
  title: string
  background_url: string | null
  logo_url: string | null
  theme: ThemeMode
  primary_color: string
  accent_color: string
  updated_at: string
}

export type DashboardSettingsUpdate = Partial<
  Omit<DashboardSettingsRow, 'id' | 'updated_at'>
>

export interface Database {
  public: {
    Tables: {
      events: {
        Row: EventRow
        Insert: EventInsert
        Update: EventUpdate
        Relationships: []
      }
      dashboard_settings: {
        Row: DashboardSettingsRow
        Insert: Partial<DashboardSettingsRow>
        Update: DashboardSettingsUpdate
        Relationships: []
      }
    }
    Views: { [_ in never]: never }
    Functions: { [_ in never]: never }
    Enums: { [_ in never]: never }
    CompositeTypes: { [_ in never]: never }
  }
}
