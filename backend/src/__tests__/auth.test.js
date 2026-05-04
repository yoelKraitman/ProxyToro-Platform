import { describe, it, expect, beforeAll, afterAll, afterEach } from 'vitest'
import request from 'supertest'
import mongoose from 'mongoose'
import { MongoMemoryServer } from 'mongodb-memory-server'
import app from '../app.js'
import User from '../models/User.js'

let mongod

beforeAll(async () => {
  mongod = await MongoMemoryServer.create()
  await mongoose.connect(mongod.getUri())
})

afterAll(async () => {
  await mongoose.disconnect()
  await mongod.stop()
})

afterEach(async () => {
  await User.deleteMany({})
})

// ── REGISTER ──────────────────────────────────────────────
describe('POST /api/auth/register', () => {
  it('creates a new user and returns a token', async () => {
    const res = await request(app)
      .post('/api/auth/register')
      .send({ email: 'test@test.com', password: 'password123' })

    expect(res.status).toBe(201)
    expect(res.body.token).toBeDefined()
    expect(res.body.user.email).toBe('test@test.com')
    expect(res.body.user.role).toBe('user')
  })

  it('rejects duplicate email', async () => {
    await request(app)
      .post('/api/auth/register')
      .send({ email: 'test@test.com', password: 'password123' })

    const res = await request(app)
      .post('/api/auth/register')
      .send({ email: 'test@test.com', password: 'anotherpass' })

    expect(res.status).toBe(400)
    expect(res.body.message).toBe('Email already registered')
  })

  it('rejects password shorter than 6 characters', async () => {
    const res = await request(app)
      .post('/api/auth/register')
      .send({ email: 'test@test.com', password: '123' })

    expect(res.status).toBe(400)
    expect(res.body.message).toBe('Password must be at least 6 characters')
  })

  it('rejects missing email', async () => {
    const res = await request(app)
      .post('/api/auth/register')
      .send({ password: 'password123' })

    expect(res.status).toBe(400)
  })
})

// ── LOGIN ──────────────────────────────────────────────────
describe('POST /api/auth/login', () => {
  beforeAll(async () => {
    await request(app)
      .post('/api/auth/register')
      .send({ email: 'login@test.com', password: 'password123' })
  })

  it('logs in with correct credentials', async () => {
    const res = await request(app)
      .post('/api/auth/login')
      .send({ email: 'login@test.com', password: 'password123' })

    expect(res.status).toBe(200)
    expect(res.body.token).toBeDefined()
    expect(res.body.user.email).toBe('login@test.com')
  })

  it('rejects wrong password', async () => {
    const res = await request(app)
      .post('/api/auth/login')
      .send({ email: 'login@test.com', password: 'wrongpassword' })

    expect(res.status).toBe(401)
    expect(res.body.message).toBe('Invalid email or password')
  })

  it('rejects non-existent email', async () => {
    const res = await request(app)
      .post('/api/auth/login')
      .send({ email: 'nobody@test.com', password: 'password123' })

    expect(res.status).toBe(401)
  })

  it('blocks disabled account', async () => {
    await request(app)
      .post('/api/auth/register')
      .send({ email: 'disabled@test.com', password: 'password123' })
    await User.findOneAndUpdate({ email: 'disabled@test.com' }, { isDisabled: true })

    const res = await request(app)
      .post('/api/auth/login')
      .send({ email: 'disabled@test.com', password: 'password123' })

    expect(res.status).toBe(403)
    expect(res.body.message).toContain('disabled')
  })
})

// ── HEALTH ─────────────────────────────────────────────────
describe('GET /api/health', () => {
  it('returns ok', async () => {
    const res = await request(app).get('/api/health')
    expect(res.status).toBe(200)
    expect(res.body.status).toBe('ok')
  })
})
