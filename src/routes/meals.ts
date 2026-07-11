import type { FastifyInstance } from 'fastify'
import { z } from 'zod'
import { randomUUID } from 'node:crypto'
import { knex } from '../database'
import { checkSessionIdExists } from '../middlewares/check-session-id-exists'

export async function mealRoutes(app: FastifyInstance) {
  app.addHook('preHandler', checkSessionIdExists)

  app.post('/', async (request, reply) => {
    const createMealBodySchema = z.object({
      name: z.string(),
      description: z.string(),
      date_time: z.coerce.date(),
      is_on_diet: z.boolean(),
    })

    const { name, description, date_time, is_on_diet } =
      createMealBodySchema.parse(request.body)

    await knex('meals').insert({
      id: randomUUID(),
      user_id: request.user!.id,
      name,
      description,
      date_time: date_time.toISOString(),
      is_on_diet,
    })

    return reply.status(201).send()
  })

  app.get('/', async (request) => {
    const meals = await knex('meals')
      .where('user_id', request.user!.id)
      .select()

    return { meals }
  })

  app.get('/:id', async (request) => {
    const getMealParamsSchema = z.object({
      id: z.string().uuid(),
    })

    const { id } = getMealParamsSchema.parse(request.params)

    const meal = await knex('meals')
      .where({
        id,
        user_id: request.user!.id,
      })
      .first()

    return { meal }
  })

  app.put('/:id', async (request, reply) => {
    const getMealParamsSchema = z.object({
      id: z.string().uuid(),
    })

    const { id } = getMealParamsSchema.parse(request.params)

    const updateMealBodySchema = z.object({
      name: z.string(),
      description: z.string(),
      date_time: z.coerce.date(),
      is_on_diet: z.boolean(),
    })

    const { name, description, date_time, is_on_diet } =
      updateMealBodySchema.parse(request.body)

    const meal = await knex('meals')
      .where({
        id,
        user_id: request.user!.id,
      })
      .first()

    if (!meal) {
      return reply.status(404).send({ message: 'Meal not found' })
    }

    await knex('meals')
      .where({
        id,
        user_id: request.user!.id,
      })
      .update({
        name,
        description,
        date_time: date_time.toISOString(),
        is_on_diet,
      })

    return reply.status(204).send()
  })

  app.delete('/:id', async (request, reply) => {
    const getMealParamsSchema = z.object({
      id: z.string().uuid(),
    })

    const { id } = getMealParamsSchema.parse(request.params)

    const meal = await knex('meals')
      .where({
        id,
        user_id: request.user!.id,
      })
      .first()

    if (!meal) {
      return reply.status(404).send({ message: 'Meal not found' })
    }

    await knex('meals')
      .where({
        id,
        user_id: request.user!.id,
      })
      .delete()

    return reply.status(204).send()
  })
}