// eslint-disable-next-line
import type { FastifyRequest } from 'fastify'

declare module 'fastify' {
  interface FastifyRequest {
    user?: {
      id: string
      session_id: string
      name: string
      created_at: string
    }
  }
}