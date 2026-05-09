import express from 'express'
import http from 'node:http'
import { authMiddleware } from '../middleware/auth.js'
import User from '../models/User.js'

const router = express.Router()

const HOST = process.env.PROXY_HOST || 'gate.proxytoro.com'
const PORT = process.env.PROXY_PORT || '8080'

// GET /api/proxy/list
router.get('/list', authMiddleware, async (req, res) => {
  try {
    const {
      country  = '',
      state    = '',
      city     = '',
      type     = 'rotating',
      count    = 1,
      protocol = 'http',
    } = req.query

    const user = await User.findById(req.user.id)

    // Use this user's own GlobeData credentials if they have them,
    // otherwise fall back to the shared account credentials
    const baseUsername = user.globedataUsername || process.env.GLOBEDATA_USERNAME
    const password     = user.globedataPassword || process.env.GLOBEDATA_PASSWORD

    if (!baseUsername || !password)
      return res.status(500).json({ message: 'Proxy credentials not configured.' })

    const isSticky = type === 'sticky'
    const num      = isSticky ? Math.min(parseInt(count) || 1, 100) : 1
    const proxies  = []

    for (let i = 0; i < num; i++) {
      let username = baseUsername

      if (country) username += `-country-${country.toLowerCase()}`
      if (state)   username += `-state-${state.toLowerCase().replace(/\s+/g, '')}`
      if (city)    username += `-city-${city.toLowerCase().replace(/\s+/g, '')}`

      if (isSticky) username += `-session-${Math.random().toString(36).substring(2, 10)}`

      proxies.push({
        host:      HOST,
        port:      PORT,
        username,
        password,
        protocol,
        formatted: `${HOST}:${PORT}:${username}:${password}`,
        curl:      `${protocol}://${username}:${password}@${HOST}:${PORT}`,
      })
    }

    await User.findByIdAndUpdate(req.user.id, {
      $inc: { 'usage.proxiesGenerated': proxies.length },
      $set: { 'usage.lastActive': new Date() },
    })

    res.json({ count: proxies.length, proxies })
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message })
  }
})

// GET /api/proxy/test — send a real request through the proxy and return IP + status
router.get('/test', authMiddleware, async (req, res) => {
  const user = await User.findById(req.user.id)

  const host        = process.env.PROXY_HOST || 'gate.proxytoro.com'
  const port        = parseInt(process.env.PROXY_PORT || '8080')
  const baseUsername = user.globedataUsername || process.env.GLOBEDATA_USERNAME
  const password     = user.globedataPassword || process.env.GLOBEDATA_PASSWORD

  if (!baseUsername || !password)
    return res.status(500).json({ message: 'Proxy credentials not configured.' })

  const { country = '' } = req.query
  const username = country ? `${baseUsername}-country-${country.toLowerCase()}` : baseUsername

  const auth = Buffer.from(`${username}:${password}`).toString('base64')
  const start = Date.now()
  let responded = false
  const reply = (status, body) => { if (!responded) { responded = true; res.status(status).json(body) } }

  const request = http.request({
    host,
    port,
    method: 'GET',
    path:   'http://api.ipify.org/?format=json',
    headers: {
      'Host':                 'api.ipify.org',
      'Proxy-Authorization':  `Basic ${auth}`,
    },
  }, (proxyRes) => {
    let body = ''
    proxyRes.on('data', chunk => body += chunk)
    proxyRes.on('end', () => {
      try {
        const data = JSON.parse(body)
        reply(200, { success: true, ip: data.ip, statusCode: proxyRes.statusCode, latencyMs: Date.now() - start, host, port })
      } catch {
        reply(502, { success: false, message: 'Bad response from proxy: ' + body })
      }
    })
  })

  request.setTimeout(10000, () => { request.destroy(); reply(504, { success: false, message: 'Proxy connection timed out' }) })
  request.on('error', err => reply(502, { success: false, message: err.message }))
  request.end()
})

export default router
