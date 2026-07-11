import fastify from 'fastify'
import cookie from '@fastify/cookie'

export const app = fastify()

app.register(cookie)

// app.register(userRoutes, { prefix: 'users' })
// app.register(mealRoutes, { prefix: 'meals' })