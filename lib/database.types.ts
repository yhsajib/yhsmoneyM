export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      accounts: {
        Row: {
          id: string
          user_id: string
          name: string
          type: 'checking' | 'savings' | 'credit'
          balance: number
          currency: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          name: string
          type: 'checking' | 'savings' | 'credit'
          balance?: number
          currency?: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          name?: string
          type?: 'checking' | 'savings' | 'credit'
          balance?: number
          currency?: string
          created_at?: string
          updated_at?: string
        }
      }
      transactions: {
        Row: {
          id: string
          user_id: string
          account_id: string
          amount: number
          description: string
          category: string
          type: 'income' | 'expense'
          date: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          account_id: string
          amount: number
          description: string
          category: string
          type: 'income' | 'expense'
          date?: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          account_id?: string
          amount?: number
          description?: string
          category?: string
          type?: 'income' | 'expense'
          date?: string
          created_at?: string
          updated_at?: string
        }
      }
      budget_categories: {
        Row: {
          id: string
          user_id: string
          name: string
          budgeted: number
          spent: number
          color: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          name: string
          budgeted?: number
          spent?: number
          color?: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          name?: string
          budgeted?: number
          spent?: number
          color?: string
          created_at?: string
          updated_at?: string
        }
      }
      give_take: {
        Row: {
          id: string
          user_id: string
          name: string
          amount: number
          date: string
          type: 'give' | 'take'
          status: 'pending' | 'settled'
          description: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          name: string
          amount: number
          date?: string
          type: 'give' | 'take'
          status?: 'pending' | 'settled'
          description?: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          name?: string
          amount?: number
          date?: string
          type?: 'give' | 'take'
          status?: 'pending' | 'settled'
          description?: string
          created_at?: string
          updated_at?: string
        }
      }
    }
  }
}