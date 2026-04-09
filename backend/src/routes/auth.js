import express from 'express'
import jwt from 'jsonwebtoken'
import crypto from 'crypto'
import speakeasy from 'speakeasy'
import User from '../models/User.js'
import { sendVerificationEmail } from '../services/email.js'

const router = express.Router()

// Generate unique proxy credentials for each user
function generateProxyCredentials(email) {
  const base = email.split('@')[0].replace(/[^a-z0-9]/gi, '').toLowerCase()
  const suffix = Math.random().toString(36).substring(2, 7)
  return {
    proxyUsername: `pt_${base}_${suffix}`,
    proxyPassword: Math.random().toString(36).substring(2, 14)
  }
}

// POST /api/auth/register
router.post('/register', async (req, res) => {
  try {
    const { email, password } = req.body

    if (!email || !password)
      return res.status(400).json({ message: 'Email and password are required' })

    if (password.length < 6)
      return res.status(400).json({ message: 'Password must be at least 6 characters' })

    const exists = await User.findOne({ email })
    if (exists)
      return res.status(400).json({ message: 'Email already registered' })

    const { proxyUsername, proxyPassword } = generateProxyCredentials(email)

    // Generate a random verification token
    const verificationToken = crypto.randomBytes(32).toString('hex')

    const user = await User.create({
      email, password, proxyUsername, proxyPassword,
      verificationToken
    })

    // Send verification email (don't block registration if it fails)
    try {
      await sendVerificationEmail(email, verificationToken)
    } catch (emailErr) {
      console.error('Failed to send verification email:', emailErr.message)
    }

    const token = jwt.sign({ id: user._id, role: user.role }, process.env.JWT_SECRET, { expiresIn: '7d' })

    res.status(201).json({
      token,
      user: { id: user._id, email: user.email, role: user.role, proxyUsername: user.proxyUsername, isVerified: user.isVerified },
      message: 'Account created! Please check your email to verify your account.'
    })
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message })
  }
})

// POST /api/auth/login
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body

    if (!email || !password)
      return res.status(400).json({ message: 'Email and password are required' })

    const user = await User.findOne({ email })
    if (!user)
      return res.status(401).json({ message: 'Invalid email or password' })

    const match = await user.comparePassword(password)
    if (!match)
      return res.status(401).json({ message: 'Invalid email or password' })

    // If 2FA is enabled, don't give token yet — ask for 2FA code
    if (user.twoFactorEnabled) {
      return res.json({ requires2FA: true, userId: user._id })
    }

    const token = jwt.sign({ id: user._id, role: user.role }, process.env.JWT_SECRET, { expiresIn: '7d' })

    res.json({
      token,
      user: { id: user._id, email: user.email, role: user.role, proxyUsername: user.proxyUsername, isVerified: user.isVerified }
    })
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message })
  }
})

// POST /api/auth/2fa-login — complete login with 2FA code
router.post('/2fa-login', async (req, res) => {
  try {
    const { userId, token } = req.body
    const user = await User.findById(userId)

    if (!user || !user.twoFactorEnabled)
      return res.status(400).json({ message: 'Invalid request' })

    const valid = speakeasy.totp.verify({
      secret: user.twoFactorSecret,
      encoding: 'base32',
      token,
      window: 1
    })

    if (!valid)
      return res.status(401).json({ message: 'Invalid 2FA code' })

    const jwtToken = jwt.sign({ id: user._id, role: user.role }, process.env.JWT_SECRET, { expiresIn: '7d' })

    res.json({
      token: jwtToken,
      user: { id: user._id, email: user.email, role: user.role, proxyUsername: user.proxyUsername, isVerified: user.isVerified }
    })
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
})

// GET /api/auth/verify/:token — user clicks the link in their email
router.get('/verify/:token', async (req, res) => {
  try {
    const user = await User.findOne({ verificationToken: req.params.token })

    if (!user)
      return res.status(400).send('<h2>Invalid or expired verification link.</h2>')

    user.isVerified = true
    user.verificationToken = undefined
    await user.save()

    // Redirect to frontend login page with success message
    res.redirect(`${process.env.FRONTEND_URL || 'http://localhost:3000'}/login?verified=true`)
  } catch (err) {
    res.status(500).send('<h2>Something went wrong.</h2>')
  }
})

export default router
