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


// DELETE /api/user/me — delete own account
router.delete('/me', authMiddleware, async (req, res) => {
  try {
    await User.findByIdAndDelete(req.user.id)
    res.json({ message: 'Account deleted' })
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
})

export default router
