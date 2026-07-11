import type { FastifyInstance } from 'fastify'
import { z } from 'zod'
import { randomUUID } from 'node:crypto'
import { knex } from '../database'

export async function userRoutes(app: FastifyInstance) {
  app.post('/', async (request, reply) => {
    const createUserBodySchema = z.object({
      name: z.string(),
    })

    const { name } = createUserBodySchema.parse(request.body)

    const sessionId = randomUUID()

    reply.cookie('sessionId', sessionId, {
      path: '/',
      maxAge: 60 * 60 * 24 * 7, // 7 dias
    })

    await knex('users').insert({
      id: randomUUID(),
      session_id: sessionId,
      name,
    })

    return reply.status(201).send()
  })

  app.get('/', async () => {
    const users = await knex('users').select()
    return { users }
  })
}