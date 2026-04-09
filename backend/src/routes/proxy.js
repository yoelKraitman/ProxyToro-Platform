import express from 'express'
import { authMiddleware } from '../middleware/auth.js'
import User from '../models/User.js'

const router = express.Router()
const WEBSHARE_API = 'https://proxy.webshare.io/api/v2'

// GET /api/proxy/list?country=US&type=residential&count=10
router.get('/list', authMiddleware, async (req, res) => {
  try {
    const { country = '', count = 10 } = req.query

    // Build the URL to fetch proxies from Webshare
    let url = `${WEBSHARE_API}/proxy/list/?mode=direct&page=1&page_size=${count}`
    if (country) url += `&country_code__in=${country}`

    const response = await fetch(url, {
      headers: {
        Authorization: `Token ${process.env.WEBSHARE_API_KEY}`
      }
    })

    if (!response.ok) {
      const err = await response.json()
      return res.status(502).json({ message: 'Failed to fetch proxies', detail: err })
    }

    const data = await response.json()

    // Format the proxies for our frontend
    const proxies = data.results.map(p => ({
      host: p.proxy_address,
      port: p.port,
      username: p.username,
      password: p.password,
      country: p.country_code,
      // Format as ip:port:user:pass — standard proxy format
      formatted: `${p.proxy_address}:${p.port}:${p.username}:${p.password}`
    }))

    // Track usage — increment proxies generated count
    await User.findByIdAndUpdate(req.user.id, {
      $inc: { 'usage.proxiesGenerated': proxies.length },
      $set: { 'usage.lastActive': new Date() }
    })

    res.json({ count: proxies.length, proxies })
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message })
  }
})

export default router
