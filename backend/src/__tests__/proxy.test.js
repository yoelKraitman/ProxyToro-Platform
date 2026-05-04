import { describe, it, expect, beforeAll, afterAll, afterEach } from 'vitest'
import request from 'supertest'
import mongoose from 'mongoose'
import { MongoMemoryServer } from 'mongodb-memory-server'
import app from '../app.js'
import User from '../models/User.js'

let mongod
let token

beforeAll(async () => {
  mongod = await MongoMemoryServer.create()
  await mongoose.connect(mongod.getUri())

  const res = await request(app)
    .post('/api/auth/register')
    .send({ email: 'proxy@test.com', password: 'password123' })
  token = res.body.token
})

afterAll(async () => {
  await mongoose.disconnect()
  await mongod.stop()
})

describe('GET /api/proxy/list', () => {
  it('rejects request without token', async () => {
    const res = await request(app).get('/api/proxy/list')
    expect(res.status).toBe(401)
  })

  it('returns a proxy with correct fields', async () => {
    const res = await request(app)
      .get('/api/proxy/list')
      .set('Authorization', `Bearer ${token}`)

    expect(res.status).toBe(200)
    expect(res.body.count).toBe(1)
    expect(res.body.proxies[0]).toMatchObject({
      host:      expect.any(String),
      port:      expect.any(String),
      username:  expect.any(String),
      password:  expect.any(String),
      formatted: expect.any(String),
      curl:      expect.any(String),
    })
  })

  it('adds country targeting to username', async () => {
    const res = await request(app)
      .get('/api/proxy/list?country=US')
      .set('Authorization', `Bearer ${token}`)

    expect(res.status).toBe(200)
    expect(res.body.proxies[0].username).toContain('-country-US')
  })

  it('adds city targeting to username', async () => {
    const res = await request(app)
      .get('/api/proxy/list?country=US&city=losangeles')
      .set('Authorization', `Bearer ${token}`)

    expect(res.body.proxies[0].username).toContain('-country-US')
    expect(res.body.proxies[0].username).toContain('-city-losangeles')
  })

  it('returns multiple proxies for sticky type', async () => {
    const res = await request(app)
      .get('/api/proxy/list?type=sticky&count=5')
      .set('Authorization', `Bearer ${token}`)

    expect(res.status).toBe(200)
    expect(res.body.count).toBe(5)
    expect(res.body.proxies[0].username).toContain('-session-')
  })

  it('caps sticky count at 100', async () => {
    const res = await request(app)
      .get('/api/proxy/list?type=sticky&count=999')
      .set('Authorization', `Bearer ${token}`)

    expect(res.body.count).toBe(100)
  })

  it('formatted string has correct host:port:user:pass format', async () => {
    const res = await request(app)
      .get('/api/proxy/list')
      .set('Authorization', `Bearer ${token}`)

    const { formatted, host, port, username, password } = res.body.proxies[0]
    expect(formatted).toBe(`${host}:${port}:${username}:${password}`)
  })

  it('increments proxiesGenerated on user after each call', async () => {
    await request(app)
      .get('/api/proxy/list')
      .set('Authorization', `Bearer ${token}`)

    const user = await User.findOne({ email: 'proxy@test.com' })
    expect(user.usage.proxiesGenerated).toBeGreaterThan(0)
  })
})
