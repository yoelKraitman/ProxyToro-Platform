import { describe, it, expect, beforeAll, afterAll, afterEach } from 'vitest'
import request from 'supertest'
import mongoose from 'mongoose'
import { MongoMemoryServer } from 'mongodb-memory-server'
import app from '../app.js'
import User from '../models/User.js'

let mongod
let userToken
let adminToken

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

async function createAdmin() {
  const res = await request(app)
    .post('/api/auth/register')
    .send({ email: 'admin@test.com', password: 'password123' })
  await User.findOneAndUpdate({ email: 'admin@test.com' }, { role: 'admin' })
  const loginRes = await request(app)
    .post('/api/auth/login')
    .send({ email: 'admin@test.com', password: 'password123' })
  return loginRes.body.token
}

async function createUser() {
  const res = await request(app)
    .post('/api/auth/register')
    .send({ email: 'user@test.com', password: 'password123' })
  return res.body.token
}

// ── GET /api/admin/users ───────────────────────────────────
describe('GET /api/admin/users', () => {
  it('rejects request without token', async () => {
    const res = await request(app).get('/api/admin/users')
    expect(res.status).toBe(401)
  })

  it('rejects regular user — admin only', async () => {
    userToken = await createUser()
    const res = await request(app)
      .get('/api/admin/users')
      .set('Authorization', `Bearer ${userToken}`)

    expect(res.status).toBe(403)
  })

  it('allows admin to get all users', async () => {
    adminToken = await createAdmin()
    await createUser()

    const res = await request(app)
      .get('/api/admin/users')
      .set('Authorization', `Bearer ${adminToken}`)

    expect(res.status).toBe(200)
    expect(Array.isArray(res.body)).toBe(true)
    expect(res.body.length).toBe(2)
    expect(res.body[0].password).toBeUndefined()
  })
})

// ── POST /api/admin/add-package ────────────────────────────
describe('POST /api/admin/add-package', () => {
  it('adds GB to a user by email', async () => {
    adminToken = await createAdmin()
    await createUser()

    const res = await request(app)
      .post('/api/admin/add-package')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ email: 'user@test.com', gb: 10, expirationDays: 30 })

    expect(res.status).toBe(200)

    const user = await User.findOne({ email: 'user@test.com' })
    expect(user.bandwidthPurchased).toBe(10)
    expect(user.packages.length).toBe(1)
    expect(user.packages[0].gb).toBe(10)
    expect(user.packages[0].name).toBe('10GB Package')
  })

  it('rejects non-existent email', async () => {
    adminToken = await createAdmin()

    const res = await request(app)
      .post('/api/admin/add-package')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ email: 'nobody@test.com', gb: 10, expirationDays: 30 })

    expect(res.status).toBe(404)
  })

  it('rejects regular user', async () => {
    userToken = await createUser()

    const res = await request(app)
      .post('/api/admin/add-package')
      .set('Authorization', `Bearer ${userToken}`)
      .send({ email: 'user@test.com', gb: 10, expirationDays: 30 })

    expect(res.status).toBe(403)
  })
})

// ── PUT /api/admin/users/:id/toggle-status ─────────────────
describe('PUT /api/admin/users/:id/toggle-status', () => {
  it('disables then re-enables a user', async () => {
    adminToken = await createAdmin()
    await createUser()
    const user = await User.findOne({ email: 'user@test.com' })

    const disableRes = await request(app)
      .put(`/api/admin/users/${user._id}/toggle-status`)
      .set('Authorization', `Bearer ${adminToken}`)
    expect(disableRes.status).toBe(200)
    expect(disableRes.body.isDisabled).toBe(true)

    const enableRes = await request(app)
      .put(`/api/admin/users/${user._id}/toggle-status`)
      .set('Authorization', `Bearer ${adminToken}`)
    expect(enableRes.body.isDisabled).toBe(false)
  })
})
