import express from 'express'
import { authMiddleware } from '../middleware/auth.js'
import User from '../models/User.js'

const router = express.Router()

function adminOnly(req, res, next) {
  if (req.user.role !== 'admin')
    return res.status(403).json({ message: 'Admin access required' })
  next()
}

// GET /api/admin/users
router.get('/users', authMiddleware, adminOnly, async (req, res) => {
  try {
    const users = await User.find().select('-password -proxyPassword').sort({ createdAt: -1 })
    res.json(users)
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message })
  }
})

// POST /api/admin/users/:id/reset-credentials
router.post('/users/:id/reset-credentials', authMiddleware, adminOnly, async (req, res) => {
  try {
    const user = await User.findById(req.params.id)
    if (!user) return res.status(404).json({ message: 'User not found' })

    const base = user.email.split('@')[0].replace(/[^a-z0-9]/gi, '').toLowerCase()
    const suffix = Math.random().toString(36).substring(2, 7)
    user.proxyUsername = `pt_${base}_${suffix}`
    user.proxyPassword = Math.random().toString(36).substring(2, 14)
    await user.save()

    res.json({ message: 'Credentials reset', proxyUsername: user.proxyUsername })
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
})

// PUT /api/admin/users/:id/role
router.put('/users/:id/role', authMiddleware, adminOnly, async (req, res) => {
  try {
    const { role } = req.body
    if (!['user', 'admin'].includes(role))
      return res.status(400).json({ message: 'Invalid role' })

    const user = await User.findByIdAndUpdate(req.params.id, { role }, { new: true })
      .select('-password -proxyPassword')

    res.json(user)
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
})

// DELETE /api/admin/users/:id
router.delete('/users/:id', authMiddleware, adminOnly, async (req, res) => {
  try {
    await User.findByIdAndDelete(req.params.id)
    res.json({ message: 'User deleted' })
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
})

// GET /api/admin/export — export all users as CSV
router.get('/export', authMiddleware, adminOnly, async (req, res) => {
  try {
    const users = await User.find().select('-password -proxyPassword')

    const csv = [
      'Email,ProxyUsername,Role,Plan,ProxiesGenerated,JoinedAt',
      ...users.map(u =>
        `${u.email},${u.proxyUsername},${u.role},${u.activePlan || 'none'},${u.usage?.proxiesGenerated || 0},${new Date(u.createdAt).toLocaleDateString()}`
      )
    ].join('\n')

    res.setHeader('Content-Type', 'text/csv')
    res.setHeader('Content-Disposition', 'attachment; filename=proxytoro-users.csv')
    res.send(csv)
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
})

// GET /api/admin/stats
router.get('/stats', authMiddleware, adminOnly, async (req, res) => {
  try {
    const totalUsers = await User.countDocuments()
    const totalProxiesGenerated = await User.aggregate([
      { $group: { _id: null, total: { $sum: '$usage.proxiesGenerated' } } }
    ])
    const planCounts = await User.aggregate([
      { $group: { _id: '$activePlan', count: { $sum: 1 } } }
    ])

    res.json({
      totalUsers,
      totalProxiesGenerated: totalProxiesGenerated[0]?.total || 0,
      planCounts
    })
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
})

export default router
