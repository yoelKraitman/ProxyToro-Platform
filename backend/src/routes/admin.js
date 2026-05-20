import express from 'express'
import { authMiddleware } from '../middleware/auth.js'
import User from '../models/User.js'
import {
  createSubuser,
  allocateGb,
  toggleSubuser,
  deleteSubuser,
  getSubuserLogs,
  getSubuserUsage,
} from '../services/globedata.js'

const router = express.Router()

function adminOnly(req, res, next) {
  if (req.user.role !== 'admin')
    return res.status(403).json({ message: 'Admin access required' })
  next()
}

// GET /api/admin/users
router.get('/users', authMiddleware, adminOnly, async (req, res) => {
  try {
    const users = await User.find({ role: { $ne: 'admin' } }).select('-password').sort({ createdAt: -1 })
    res.json(users)
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message })
  }
})

// PUT /api/admin/users/:id/role
router.put('/users/:id/role', authMiddleware, adminOnly, async (req, res) => {
  try {
    const { role } = req.body
    if (!['user', 'admin'].includes(role))
      return res.status(400).json({ message: 'Invalid role' })

    const user = await User.findByIdAndUpdate(req.params.id, { role }, { new: true }).select('-password')
    res.json(user)
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
})

// PUT /api/admin/users/:id/toggle-status — enable or disable (syncs to GlobeData)
router.put('/users/:id/toggle-status', authMiddleware, adminOnly, async (req, res) => {
  try {
    const user = await User.findById(req.params.id)
    if (!user) return res.status(404).json({ message: 'User not found' })

    user.isDisabled = !user.isDisabled
    await user.save()

    // Sync to GlobeData if this user has a sub-user account
    if (user.globedataId) {
      try { await toggleSubuser(user.globedataId, !user.isDisabled) } catch (e) {
        console.error('GlobeData toggle failed:', e.message)
      }
    }

    res.json({ message: user.isDisabled ? 'User disabled' : 'User enabled', isDisabled: user.isDisabled })
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
})

// DELETE /api/admin/users/:id — also removes GlobeData sub-user
router.delete('/users/:id', authMiddleware, adminOnly, async (req, res) => {
  try {
    const user = await User.findById(req.params.id)
    if (!user) return res.status(404).json({ message: 'User not found' })

    if (user.globedataId) {
      try { await deleteSubuser(user.globedataId) } catch (e) {
        console.error('GlobeData delete failed:', e.message)
      }
    }

    await User.findByIdAndDelete(req.params.id)
    res.json({ message: 'User deleted' })
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
})

// POST /api/admin/add-package — add GB to user, creates GlobeData sub-user if needed
router.post('/add-package', authMiddleware, adminOnly, async (req, res) => {
  try {
    const { email, gb, expirationDays } = req.body
    if (!email || !gb) return res.status(400).json({ message: 'Email and GB are required' })

    const user = await User.findOne({ email: email.toLowerCase().trim() })
    if (!user) return res.status(404).json({ message: 'User not found' })

    const expiry = new Date()
    expiry.setDate(expiry.getDate() + (Number(expirationDays) || 365))
    const gbNum = Number(gb)

    let globedataUpdate = {}

    if (!user.globedataId) {
      // First time: create a GlobeData sub-user for this customer
      try {
        const subuser = await createSubuser({ email: user.email, gb: gbNum, label: user.email })
        if (subuser) {
          globedataUpdate = {
            globedataId:       subuser.id,
            globedataUsername: subuser.proxy_username,
            globedataPassword: subuser.proxy_password,
          }
        }
      } catch (e) {
        console.error('GlobeData createSubuser failed:', e.message)
      }
    } else {
      // Already has a sub-user — just top up their GB
      try { await allocateGb(user.globedataId, gbNum) } catch (e) {
        console.error('GlobeData allocateGb failed:', e.message)
      }
    }

    await User.findByIdAndUpdate(user._id, {
      $inc: { bandwidthPurchased: gbNum },
      bandwidthExpiry: expiry,
      $push: { packages: { name: `${gbNum}GB Package`, gb: gbNum, usedMB: 0, expiresAt: expiry, active: true } },
      ...globedataUpdate,
    })

    res.json({ message: `Added ${gbNum} GB to ${email}`, ...globedataUpdate })
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
})

// POST /api/admin/users/:id/add-gb — inline +GB button
router.post('/users/:id/add-gb', authMiddleware, adminOnly, async (req, res) => {
  try {
    const { gb } = req.body
    if (!gb) return res.status(400).json({ message: 'GB required' })

    const user = await User.findById(req.params.id)
    if (!user) return res.status(404).json({ message: 'User not found' })

    if (user.globedataId) {
      try { await allocateGb(user.globedataId, Number(gb)) } catch (e) {
        console.error('GlobeData allocateGb failed:', e.message)
      }
    }

    await User.findByIdAndUpdate(req.params.id, { $inc: { bandwidthPurchased: Number(gb) } })
    res.json({ message: `Added ${gb} GB` })
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
})

// PUT /api/admin/users/:id/plan-label — rename the plan label for a user
router.put('/users/:id/plan-label', authMiddleware, adminOnly, async (req, res) => {
  try {
    const { planLabel } = req.body
    const user = await User.findByIdAndUpdate(req.params.id, { planLabel }, { new: true })
    if (!user) return res.status(404).json({ message: 'User not found' })
    res.json({ planLabel: user.planLabel })
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
})

// GET /api/admin/users/:id/logs — real proxy request logs from GlobeData
router.get('/users/:id/logs', authMiddleware, adminOnly, async (req, res) => {
  try {
    const user = await User.findById(req.params.id)
    if (!user) return res.status(404).json({ message: 'User not found' })

    if (!user.globedataId)
      return res.json({ logs: [], message: 'No GlobeData account yet — add a package first.' })

    const logs = await getSubuserLogs(user.globedataId, Number(req.query.limit) || 50)
    res.json({ logs })
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
})

// GET /api/admin/users/:id/usage — daily bandwidth usage from GlobeData
router.get('/users/:id/usage', authMiddleware, adminOnly, async (req, res) => {
  try {
    const user = await User.findById(req.params.id)
    if (!user) return res.status(404).json({ message: 'User not found' })

    if (!user.globedataId)
      return res.json({ usage: [], message: 'No GlobeData account yet.' })

    const usage = await getSubuserUsage(user.globedataId, Number(req.query.days) || 30)
    res.json({ usage })
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
})

// GET /api/admin/export
router.get('/export', authMiddleware, adminOnly, async (req, res) => {
  try {
    const users = await User.find().select('-password')
    const csv = [
      'Email,Role,GB Purchased,GlobeData ID,ProxiesGenerated,JoinedAt',
      ...users.map(u =>
        `${u.email},${u.role},${u.bandwidthPurchased || 0},${u.globedataId || '—'},${u.usage?.proxiesGenerated || 0},${new Date(u.createdAt).toLocaleDateString()}`
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
    res.json({ totalUsers, totalProxiesGenerated: totalProxiesGenerated[0]?.total || 0, planCounts })
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
})

export default router
