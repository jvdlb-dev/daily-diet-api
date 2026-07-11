import { it, expect, beforeAll, afterAll, describe, beforeEach } from 'vitest'
import request from 'supertest'
import { app } from '../src/app'
import { execSync } from 'node:child_process'

describe('Meal routes', () => {
  beforeEach(async () => {
    execSync('npm run knex migrate:rollback --all', {
      env: { ...process.env, NODE_ENV: 'test' },
    })
    execSync('npm run knex migrate:latest', {
      env: { ...process.env, NODE_ENV: 'test' },
    })
  })

  beforeAll(async () => {
    await app.ready()
  })

  afterAll(async () => {
    await app.close()
  })

  it('should be able to create a new meal', async () => {
    const createUserResponse = await request(app.server).post('/users').send({
      name: 'João Victor',
    })

    const cookies = createUserResponse.get('Set-Cookie')

    const createMealResponse = await request(app.server)
      .post('/meals')
      .set('Cookie', cookies!)
      .send({
        name: 'Café da manhã',
        description: '2 pães com manteiga',
        date_time: '2026-08-21T09:00:00',
        is_on_diet: true,
      })

    expect(createMealResponse.statusCode).toEqual(201)
  })

  it('should be able to list all meals from a user', async () => {
    const createUserResponse = await request(app.server).post('/users').send({
      name: 'João Victor',
    })

    const cookies = createUserResponse.get('Set-Cookie')

    await request(app.server).post('/meals').set('Cookie', cookies!).send({
      name: 'Café da manhã',
      description: '2 pães com manteiga',
      date_time: '2026-08-21T09:00:00',
      is_on_diet: true,
    })

    await request(app.server).post('/meals').set('Cookie', cookies!).send({
      name: 'Bolo de chocolate',
      description: 'Fatia de bolo',
      date_time: '2026-08-21T15:00:00',
      is_on_diet: false,
    })

    const listMealsResponse = await request(app.server)
      .get('/meals')
      .set('Cookie', cookies!)

    expect(listMealsResponse.statusCode).toEqual(200)
    expect(listMealsResponse.body.meals).toHaveLength(2)
    expect(listMealsResponse.body.meals).toEqual([
      expect.objectContaining({ name: 'Café da manhã' }),
      expect.objectContaining({ name: 'Bolo de chocolate' }),
    ])
  })

  it('should not list meals from another user', async () => {
    const userAResponse = await request(app.server).post('/users').send({
      name: 'João Victor',
    })
    const userACookies = userAResponse.get('Set-Cookie')

    const userBResponse = await request(app.server).post('/users').send({
      name: 'Pedro Dias',
    })
    const userBCookies = userBResponse.get('Set-Cookie')

    await request(app.server).post('/meals').set('Cookie', userACookies!).send({
      name: 'Refeição do João',
      description: 'Descrição',
      date_time: '2026-08-21T09:00:00',
      is_on_diet: true,
    })

    const listMealsResponse = await request(app.server)
      .get('/meals')
      .set('Cookie', userBCookies!)

    expect(listMealsResponse.statusCode).toEqual(200)
    expect(listMealsResponse.body.meals).toHaveLength(0)
  })

  it('should be able to get a specific meal', async () => {
    const createUserResponse = await request(app.server).post('/users').send({
      name: 'João Victor',
    })
    const cookies = createUserResponse.get('Set-Cookie')

    await request(app.server).post('/meals').set('Cookie', cookies!).send({
      name: 'Café da manhã',
      description: '2 pães com manteiga',
      date_time: '2026-08-21T09:00:00',
      is_on_diet: true,
    })

    const listMealsResponse = await request(app.server)
      .get('/meals')
      .set('Cookie', cookies!)

    const mealId = listMealsResponse.body.meals[0].id

    const getMealResponse = await request(app.server)
      .get(`/meals/${mealId}`)
      .set('Cookie', cookies!)

    expect(getMealResponse.statusCode).toEqual(200)
    expect(getMealResponse.body.meal).toEqual(
      expect.objectContaining({
        name: 'Café da manhã',
        description: '2 pães com manteiga',
      }),
    )
  })

  it('should not be able to get a meal from another user', async () => {
    const userAResponse = await request(app.server).post('/users').send({
      name: 'João Victor',
    })
    const userACookies = userAResponse.get('Set-Cookie')

    const userBResponse = await request(app.server).post('/users').send({
      name: 'Pedro Dias',
    })
    const userBCookies = userBResponse.get('Set-Cookie')

    await request(app.server).post('/meals').set('Cookie', userACookies!).send({
      name: 'Refeição do João',
      description: 'Descrição',
      date_time: '2026-08-21T09:00:00',
      is_on_diet: true,
    })

    const listMealsResponse = await request(app.server)
      .get('/meals')
      .set('Cookie', userACookies!)

    const mealId = listMealsResponse.body.meals[0].id

    const getMealResponse = await request(app.server)
      .get(`/meals/${mealId}`)
      .set('Cookie', userBCookies!)

    expect(getMealResponse.statusCode).toEqual(404)
  })

  it('should be able to update a meal', async () => {
    const createUserResponse = await request(app.server).post('/users').send({
      name: 'João Victor',
    })
    const cookies = createUserResponse.get('Set-Cookie')

    await request(app.server).post('/meals').set('Cookie', cookies!).send({
      name: 'Café da manhã',
      description: '2 pães com manteiga',
      date_time: '2026-08-21T09:00:00',
      is_on_diet: true,
    })

    const listMealsResponse = await request(app.server)
      .get('/meals')
      .set('Cookie', cookies!)

    const mealId = listMealsResponse.body.meals[0].id

    const updateMealResponse = await request(app.server)
      .put(`/meals/${mealId}`)
      .set('Cookie', cookies!)
      .send({
        name: 'Café da manhã reforçado',
        description: '2 pães com manteiga e ovo',
        date_time: '2026-08-21T09:00:00',
        is_on_diet: false,
      })

    expect(updateMealResponse.statusCode).toEqual(204)

    const getMealResponse = await request(app.server)
      .get(`/meals/${mealId}`)
      .set('Cookie', cookies!)

    expect(getMealResponse.body.meal).toEqual(
      expect.objectContaining({
        name: 'Café da manhã reforçado',
        is_on_diet: 0, // SQLite guarda boolean como 0/1
      }),
    )
  })

  it('should not be able to update a meal from another user', async () => {
    const userAResponse = await request(app.server).post('/users').send({
      name: 'João Victor',
    })
    const userACookies = userAResponse.get('Set-Cookie')

    const userBResponse = await request(app.server).post('/users').send({
      name: 'Pedro Dias',
    })
    const userBCookies = userBResponse.get('Set-Cookie')

    await request(app.server).post('/meals').set('Cookie', userACookies!).send({
      name: 'Refeição do João',
      description: 'Descrição',
      date_time: '2026-08-21T09:00:00',
      is_on_diet: true,
    })

    const listMealsResponse = await request(app.server)
      .get('/meals')
      .set('Cookie', userACookies!)

    const mealId = listMealsResponse.body.meals[0].id

    const updateMealResponse = await request(app.server)
      .put(`/meals/${mealId}`)
      .set('Cookie', userBCookies!)
      .send({
        name: 'Tentativa de invasão',
        description: 'Descrição',
        date_time: '2026-08-21T09:00:00',
        is_on_diet: false,
      })

    expect(updateMealResponse.statusCode).toEqual(404)
  })

  it('should be able to delete a meal', async () => {
    const createUserResponse = await request(app.server).post('/users').send({
      name: 'João Victor',
    })
    const cookies = createUserResponse.get('Set-Cookie')

    await request(app.server).post('/meals').set('Cookie', cookies!).send({
      name: 'Café da manhã',
      description: '2 pães com manteiga',
      date_time: '2026-08-21T09:00:00',
      is_on_diet: true,
    })

    const listMealsResponse = await request(app.server)
      .get('/meals')
      .set('Cookie', cookies!)

    const mealId = listMealsResponse.body.meals[0].id

    const deleteMealResponse = await request(app.server)
      .delete(`/meals/${mealId}`)
      .set('Cookie', cookies!)

    expect(deleteMealResponse.statusCode).toEqual(204)

    const getMealResponse = await request(app.server)
      .get(`/meals/${mealId}`)
      .set('Cookie', cookies!)

    expect(getMealResponse.statusCode).toEqual(404)
  })

  it('should not be able to delete a meal from another user', async () => {
    const userAResponse = await request(app.server).post('/users').send({
      name: 'João Victor',
    })
    const userACookies = userAResponse.get('Set-Cookie')

    const userBResponse = await request(app.server).post('/users').send({
      name: 'Pedro Dias',
    })
    const userBCookies = userBResponse.get('Set-Cookie')

    await request(app.server).post('/meals').set('Cookie', userACookies!).send({
      name: 'Refeição do João',
      description: 'Descrição',
      date_time: '2026-08-21T09:00:00',
      is_on_diet: true,
    })

    const listMealsResponse = await request(app.server)
      .get('/meals')
      .set('Cookie', userACookies!)

    const mealId = listMealsResponse.body.meals[0].id

    const deleteMealResponse = await request(app.server)
      .delete(`/meals/${mealId}`)
      .set('Cookie', userBCookies!)

    expect(deleteMealResponse.statusCode).toEqual(404)
  })

  it('should be able to get the metrics from a user', async () => {
    const createUserResponse = await request(app.server).post('/users').send({
      name: 'João Victor',
    })
    const cookies = createUserResponse.get('Set-Cookie')

    const meals = [
      { is_on_diet: true, hour: '08:00' },
      { is_on_diet: true, hour: '12:00' },
      { is_on_diet: false, hour: '15:00' },
      { is_on_diet: true, hour: '19:00' },
      { is_on_diet: true, hour: '21:00' },
      { is_on_diet: true, hour: '23:00' },
      { is_on_diet: false, hour: '23:30' },
    ]

    for (const meal of meals) {
      await request(app.server).post('/meals').set('Cookie', cookies!).send({
        name: 'Refeição',
        description: 'Descrição',
        date_time: `2026-08-21T${meal.hour}:00`,
        is_on_diet: meal.is_on_diet,
      })
    }

    const metricsResponse = await request(app.server)
      .get('/meals/metrics')
      .set('Cookie', cookies!)

    expect(metricsResponse.statusCode).toEqual(200)
    expect(metricsResponse.body).toEqual({
      totalMeals: 7,
      totalMealsOnDiet: 5,
      totalMealsOffDiet: 2,
      bestSequence: 3,
    })
  })
})