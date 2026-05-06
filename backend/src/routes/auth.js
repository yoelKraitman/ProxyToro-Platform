import express from 'express'
import jwt from 'jsonwebtoken'
import crypto from 'crypto'
import speakeasy from 'speakeasy'
import { createRequire } from 'module'
import User from '../models/User.js'
import { sendVerificationEmail, sendPasswordResetEmail } from '../services/email.js'

const require = createRequire(import.meta.url)
const disposableDomains = new Set(require('disposable-email-domains'))

const router = express.Router()


// POST /api/auth/register
router.post('/register', async (req, res) => {
  try {
    const { email, password } = req.body

    if (!email || !password)
      return res.status(400).json({ message: 'Email and password are required' })

    if (password.length < 6)
      return res.status(400).json({ message: 'Password must be at least 6 characters' })

    const domain = email.split('@')[1]?.toLowerCase()
    if (!domain || disposableDomains.has(domain))
      return res.status(400).json({ message: 'Temporary email addresses are not allowed. Please use a real email.' })

    const exists = await User.findOne({ email })
    if (exists)
      return res.status(400).json({ message: 'Email already registered' })

    const verificationToken = crypto.randomBytes(32).toString('hex')

    const user = await User.create({ email, password, verificationToken })

    // Send verification email (don't block registration if it fails)
    try {
      await sendVerificationEmail(email, verificationToken)
    } catch (emailErr) {
      console.error('Failed to send verification email:', emailErr.message)
    }

    const token = jwt.sign({ id: user._id, role: user.role }, process.env.JWT_SECRET, { expiresIn: '7d' })

    res.status(201).json({
      token,
      user: { id: user._id, email: user.email, role: user.role, isVerified: user.isVerified, twoFactorEnabled: false },
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

    if (user.isDisabled)
      return res.status(403).json({ message: 'Your account has been disabled. Please contact support.' })

    // If 2FA is enabled, don't give token yet — ask for 2FA code
    if (user.twoFactorEnabled) {
      return res.json({ requires2FA: true, userId: user._id })
    }

    await User.findByIdAndUpdate(user._id, { lastLogin: new Date() })

    const token = jwt.sign({ id: user._id, role: user.role }, process.env.JWT_SECRET, { expiresIn: '7d' })

    res.json({
      token,
      user: { id: user._id, email: user.email, role: user.role, isVerified: user.isVerified, twoFactorEnabled: user.twoFactorEnabled }
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

    await User.findByIdAndUpdate(user._id, { lastLogin: new Date() })

    const jwtToken = jwt.sign({ id: user._id, role: user.role }, process.env.JWT_SECRET, { expiresIn: '7d' })

    res.json({
      token: jwtToken,
      user: { id: user._id, email: user.email, role: user.role, isVerified: user.isVerified, twoFactorEnabled: true }
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

// POST /api/auth/forgot-password
router.post('/forgot-password', async (req, res) => {
  try {
    const { email } = req.body
    if (!email) return res.status(400).json({ message: 'Email is required' })

    const user = await User.findOne({ email: email.toLowerCase() })

    // Always return success — don't reveal if email exists
    if (!user) return res.json({ message: 'If that email exists, a reset link has been sent.' })

    const token  = crypto.randomBytes(32).toString('hex')
    const expiry = new Date(Date.now() + 60 * 60 * 1000) // 1 hour

    await User.findByIdAndUpdate(user._id, {
      resetPasswordToken:  token,
      resetPasswordExpiry: expiry,
    })

    await sendPasswordResetEmail(email, token)
    res.json({ message: 'If that email exists, a reset link has been sent.' })
  } catch (err) {
    res.status(500).json({ message: 'Server error' })
  }
})

// POST /api/auth/reset-password
router.post('/reset-password', async (req, res) => {
  try {
    const { token, newPassword } = req.body
    if (!token || !newPassword) return res.status(400).json({ message: 'Token and new password are required' })
    if (newPassword.length < 6) return res.status(400).json({ message: 'Password must be at least 6 characters' })

    const user = await User.findOne({
      resetPasswordToken:  token,
      resetPasswordExpiry: { $gt: new Date() },
    })

    if (!user) return res.status(400).json({ message: 'Reset link is invalid or has expired' })

    user.password            = newPassword
    user.resetPasswordToken  = undefined
    user.resetPasswordExpiry = undefined
    await user.save()

    res.json({ message: 'Password reset successfully. You can now log in.' })
  } catch (err) {
    res.status(500).json({ message: 'Server error' })
  }
})

export default router
