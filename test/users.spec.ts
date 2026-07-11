import { it, expect, beforeAll, afterAll, describe, beforeEach } from 'vitest'
import request from 'supertest'
import { app } from '../src/app'
import { execSync } from 'node:child_process'

describe('User routes', () => {
  beforeEach(async () => {
    execSync('npm run knex migrate:rollback --all')
    execSync('npm run knex migrate:latest')
  })

  beforeAll(async () => {
    await app.ready()
  })

  afterAll(async () => {
    await app.close()
  })

  it('should be able to create a new user', async () => {
    const response = await request(app.server).post('/users').send({
      name: 'João Victor',
    })

    expect(response.statusCode).toEqual(201)
  })

  it('should be able to list all users', async () => {
    await request(app.server).post('/users').send({
      name: 'João Victor',
    })

    await request(app.server).post('/users').send({
      name: 'Maria Eduarda',
    })

    const response = await request(app.server).get('/users')

    expect(response.statusCode).toEqual(200)
    expect(response.body.users).toHaveLength(2)
    expect(response.body.users).toEqual([
      expect.objectContaining({
        name: 'João Victor',
      }),
      expect.objectContaining({
        name: 'Maria Eduarda',
      }),
    ])
  })
})