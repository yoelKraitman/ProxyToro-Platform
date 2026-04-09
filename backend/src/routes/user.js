import express from 'express'
import { authMiddleware } from '../middleware/auth.js'
import User from '../models/User.js'
import bcrypt from 'bcryptjs'

const router = express.Router()

// GET /api/user/me — get full profile including usage and invoices
router.get('/me', authMiddleware, async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('-password')
    if (!user) return res.status(404).json({ message: 'User not found' })
    res.json(user)
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
})

// PUT /api/user/password — change password
router.put('/password', authMiddleware, async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body

    if (!currentPassword || !newPassword)
      return res.status(400).json({ message: 'Both fields are required' })

    if (newPassword.length < 6)
      return res.status(400).json({ message: 'Password must be at least 6 characters' })

    const user = await User.findById(req.user.id)
    const match = await user.comparePassword(currentPassword)
    if (!match)
      return res.status(401).json({ message: 'Current password is incorrect' })

    user.password = newPassword
    await user.save()

    res.json({ message: 'Password updated successfully' })
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
})

// POST /api/user/reset-credentials — regenerate proxy credentials
router.post('/reset-credentials', authMiddleware, async (req, res) => {
  try {
    const user = await User.findById(req.user.id)
    const base = user.email.split('@')[0].replace(/[^a-z0-9]/gi, '').toLowerCase()
    const suffix = Math.random().toString(36).substring(2, 7)

    user.proxyUsername = `pt_${base}_${suffix}`
    user.proxyPassword = Math.random().toString(36).substring(2, 14)
    await user.save()

    res.json({
      message: 'Credentials regenerated',
      proxyUsername: user.proxyUsername,
      proxyPassword: user.proxyPassword
    })
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
})

export default router
