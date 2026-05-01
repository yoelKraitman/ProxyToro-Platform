import express from 'express'
import { authMiddleware } from '../middleware/auth.js'
import User from '../models/User.js'
import { fetch, ProxyAgent } from 'undici'

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
router.get('/test', authMiddleware, async (req, res) => {
  try {
    const host     = process.env.PROXY_HOST || 'gate.proxytoro.com'
    const port     = process.env.PROXY_PORT || '8080'
    const username = process.env.GLOBEDATA_USERNAME
    const password = process.env.GLOBEDATA_PASSWORD

    if (!username || !password)
      return res.status(500).json({ message: 'Proxy credentials not configured on server.' })

    const proxyUrl = `http://${username}:${password}@${host}:${port}`
    const agent    = new ProxyAgent(proxyUrl)

    const start    = Date.now()
    const response = await fetch('https://api.ipify.org?format=json', {
      dispatcher: agent,
    })
    const latencyMs = Date.now() - start
    const data      = await response.json()

    res.json({
      success:    true,
      ip:         data.ip,
      statusCode: response.status,
      latencyMs,
      host,
      port,
    })
  } catch (err) {
    res.status(502).json({ success: false, message: err.message })
  }
})

export default router
