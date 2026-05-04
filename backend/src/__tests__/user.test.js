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
})

afterAll(async () => {
  await mongoose.disconnect()
  await mongod.stop()
})

afterEach(async () => {
  await User.deleteMany({})
  token = null
})

async function registerAndLogin(email = 'user@test.com', password = 'password123') {
  const res = await request(app)
    .post('/api/auth/register')
    .send({ email, password })
  return res.body.token
}

// ── GET /api/user/me ───────────────────────────────────────
describe('GET /api/user/me', () => {
  it('returns user profile when logged in', async () => {
    token = await registerAndLogin()
    const res = await request(app)
      .get('/api/user/me')
      .set('Authorization', `Bearer ${token}`)

    expect(res.status).toBe(200)
    expect(res.body.email).toBe('user@test.com')
    expect(res.body.password).toBeUndefined()
  })

  it('rejects request without token', async () => {
    const res = await request(app).get('/api/user/me')
    expect(res.status).toBe(401)
  })
})

// ── PUT /api/user/password ─────────────────────────────────
describe('PUT /api/user/password', () => {
  it('changes password with correct current password', async () => {
    token = await registerAndLogin()
    const res = await request(app)
      .put('/api/user/password')
      .set('Authorization', `Bearer ${token}`)
      .send({ currentPassword: 'password123', newPassword: 'newpassword456' })

    expect(res.status).toBe(200)

    // Verify new password works
    const loginRes = await request(app)
      .post('/api/auth/login')
      .send({ email: 'user@test.com', password: 'newpassword456' })
    expect(loginRes.status).toBe(200)
  })

  it('rejects wrong current password', async () => {
    token = await registerAndLogin()
    const res = await request(app)
      .put('/api/user/password')
      .set('Authorization', `Bearer ${token}`)
      .send({ currentPassword: 'wrongpassword', newPassword: 'newpassword456' })

    expect(res.status).toBe(401)
    expect(res.body.message).toBe('Current password is incorrect')
  })

  it('rejects new password shorter than 6 characters', async () => {
    token = await registerAndLogin()
    const res = await request(app)
      .put('/api/user/password')
      .set('Authorization', `Bearer ${token}`)
      .send({ currentPassword: 'password123', newPassword: '123' })

    expect(res.status).toBe(400)
  })

  it('rejects without token', async () => {
    const res = await request(app)
      .put('/api/user/password')
      .send({ currentPassword: 'password123', newPassword: 'newpassword456' })

    expect(res.status).toBe(401)
  })
})

// ── DELETE /api/user/me ────────────────────────────────────
describe('DELETE /api/user/me', () => {
  it('deletes account — user cannot login after', async () => {
    token = await registerAndLogin()

    const deleteRes = await request(app)
      .delete('/api/user/me')
      .set('Authorization', `Bearer ${token}`)
    expect(deleteRes.status).toBe(200)

    const loginRes = await request(app)
      .post('/api/auth/login')
      .send({ email: 'user@test.com', password: 'password123' })
    expect(loginRes.status).toBe(401)
  })

  it('rejects without token', async () => {
    const res = await request(app).delete('/api/user/me')
    expect(res.status).toBe(401)
  })
})
