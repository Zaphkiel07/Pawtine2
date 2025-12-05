export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export interface Database {
  public: {
    Tables: {
      users: {
        Row: {
          id: string;
          email: string;
          name: string | null;
          timezone: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          email: string;
          name?: string | null;
          timezone?: string;
          created_at?: string;
        };
        Update: {
          id?: string;
          email?: string;
          name?: string | null;
          timezone?: string;
          created_at?: string;
        };
      };
      dogs: {
        Row: {
          id: string;
          user_id: string;
          name: string;
          breed: string | null;
          age_months: number | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          name: string;
          breed?: string | null;
          age_months?: number | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          name?: string;
          breed?: string | null;
          age_months?: number | null;
          created_at?: string;
        };
      };
      routines: {
        Row: {
          id: string;
          dog_id: string;
          type: "feed" | "walk" | "water" | "custom";
          label: string;
          scheduled_time: string;
          status: "active" | "paused";
          created_at: string;
          last_completed_at: string | null;
        };
        Insert: {
          id?: string;
          dog_id: string;
          type: "feed" | "walk" | "water" | "custom";
          label?: string;
          scheduled_time: string;
          status?: "active" | "paused";
          created_at?: string;
          last_completed_at?: string | null;
        };
        Update: {
          id?: string;
          dog_id?: string;
          type?: "feed" | "walk" | "water" | "custom";
          label?: string;
          scheduled_time?: string;
          status?: "active" | "paused";
          created_at?: string;
          last_completed_at?: string | null;
        };
      };
      history: {
        Row: {
          id: string;
          routine_id: string;
          occurred_on: string;
          status: "done" | "missed" | "snoozed";
          notes: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          routine_id: string;
          occurred_on: string;
          status?: "done" | "missed" | "snoozed";
          notes?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          routine_id?: string;
          occurred_on?: string;
          status?: "done" | "missed" | "snoozed";
          notes?: string | null;
          created_at?: string;
        };
      };
    };
    Functions: {
      get_weekly_routine_summary: {
        Args: {
          p_dog_id: string;
          p_week_start: string;
        };
        Returns: {
          routine_id: string;
          label: string;
          type: string;
          day: string;
          status: string;
        }[];
      };
    };
  };
}
