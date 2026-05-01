import express from 'express'
import http from 'node:http'
import { authMiddleware } from '../middleware/auth.js'
import User from '../models/User.js'

const router = express.Router()

const GLOBEDATA_HOST = process.env.PROXY_HOST || 'gate.proxytoro.com'
const GLOBEDATA_PORT = process.env.PROXY_PORT || '8080'

// GET /api/proxy/list?country=US&state=california&city=losangeles&type=rotating&count=5&protocol=http
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

    const baseUsername = process.env.GLOBEDATA_USERNAME
    const password     = process.env.GLOBEDATA_PASSWORD

    if (!baseUsername || !password) {
      return res.status(500).json({ message: 'Proxy credentials not configured on server.' })
    }

    // For rotating proxies every string is identical — just return 1
    // For sticky each one gets a unique session ID — return up to 100
    const isSticky = type === 'sticky'
    const num = isSticky ? Math.min(parseInt(count) || 1, 100) : 1

    const proxies = []

    for (let i = 0; i < num; i++) {
      let username = baseUsername

      // Append location targeting to username
      if (country) username += `-country-${country.toUpperCase()}`
      if (state)   username += `-state-${state.toLowerCase().replace(/\s+/g, '')}`
      if (city)    username += `-city-${city.toLowerCase().replace(/\s+/g, '')}`

      // Sticky session gets a unique ID so each connection locks to a different IP
      if (isSticky) {
        const sessionId = Math.random().toString(36).substring(2, 10)
        username += `-session-${sessionId}`
      }

      proxies.push({
        host:      GLOBEDATA_HOST,
        port:      GLOBEDATA_PORT,
        username,
        password,
        protocol,
        // Standard format:  host:port:user:pass
        formatted: `${GLOBEDATA_HOST}:${GLOBEDATA_PORT}:${username}:${password}`,
        // URL format for curl / browsers:  protocol://user:pass@host:port
        curl:      `${protocol}://${username}:${password}@${GLOBEDATA_HOST}:${GLOBEDATA_PORT}`,
      })
    }

    // Track usage
    await User.findByIdAndUpdate(req.user.id, {
      $inc: { 'usage.proxiesGenerated': proxies.length },
      $set: { 'usage.lastActive': new Date() },
    })

    res.json({ count: proxies.length, proxies })
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message })
  }
})

// GET /api/proxy/test — send a real request through GlobeData and return IP + status
router.get('/test', authMiddleware, (req, res) => {
  const host     = 'proxy.globedata.io'
  const port     = parseInt(process.env.PROXY_PORT || '8080')
  const username = process.env.GLOBEDATA_USERNAME
  const password = process.env.GLOBEDATA_PASSWORD

  if (!username || !password)
    return res.status(500).json({ message: 'Proxy credentials not configured on server.' })

  const auth  = Buffer.from(`${username}:${password}`).toString('base64')
  const start = Date.now()

  const request = http.request({
    host,
    port,
    method: 'GET',
    path: 'http://api.ipify.org/?format=json',
    headers: {
      'Host': 'api.ipify.org',
      'Proxy-Authorization': `Basic ${auth}`,
    },
  }, (proxyRes) => {
    let body = ''
    proxyRes.on('data', chunk => body += chunk)
    proxyRes.on('end', () => {
      try {
        const data = JSON.parse(body)
        res.json({
          success:    true,
          ip:         data.ip,
          statusCode: proxyRes.statusCode,
          latencyMs:  Date.now() - start,
          host,
          port,
        })
      } catch {
        res.status(502).json({ success: false, message: 'Bad response from proxy: ' + body })
      }
    })
  })

  request.setTimeout(10000, () => {
    request.destroy()
    res.status(504).json({ success: false, message: 'Proxy connection timed out' })
  })

  request.on('error', err => {
    res.status(502).json({ success: false, message: err.message })
  })

  request.end()
})

export default router
