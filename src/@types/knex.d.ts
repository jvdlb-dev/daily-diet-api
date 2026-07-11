import type { Knex } from 'knex'

declare module 'knex/types/tables' {
  interface Tables {
    users: {
      id: string
      session_id: string
      name: string
      created_at: string
    }
    meals: {
      id: string
      user_id: string
      name: string
      description: string
      date_time: string
      is_on_diet: boolean
      created_at: string
    }
  }
}