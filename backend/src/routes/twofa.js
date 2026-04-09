import express from 'express'
import speakeasy from 'speakeasy'
import QRCode from 'qrcode'
import { authMiddleware } from '../middleware/auth.js'
import User from '../models/User.js'

const router = express.Router()

// POST /api/2fa/setup — generate a QR code for the user to scan
router.post('/setup', authMiddleware, async (req, res) => {
  try {
    const user = await User.findById(req.user.id)

    // Generate a secret key for this user
    const secret = speakeasy.generateSecret({
      name: `ProxyToro (${user.email})`,
      length: 20
    })

    // Save the secret temporarily (not enabled yet until they verify)
    user.twoFactorSecret = secret.base32
    await user.save()

    // Generate QR code image the user scans with Google Authenticator
    const qrCodeUrl = await QRCode.toDataURL(secret.otpauth_url)

    res.json({ qrCode: qrCodeUrl, secret: secret.base32 })
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
})

// POST /api/2fa/verify — user scans QR and enters first code to confirm setup
router.post('/verify', authMiddleware, async (req, res) => {
  try {
    const { token } = req.body
    const user = await User.findById(req.user.id)

    if (!user.twoFactorSecret)
      return res.status(400).json({ message: '2FA setup not started' })

    // Check if the code they entered is correct
    const valid = speakeasy.totp.verify({
      secret: user.twoFactorSecret,
      encoding: 'base32',
      token,
      window: 1 // allow 30 seconds tolerance
    })

    if (!valid)
      return res.status(400).json({ message: 'Invalid code. Try again.' })

    // Code is correct — enable 2FA
    user.twoFactorEnabled = true
    await user.save()

    res.json({ message: '2FA enabled successfully!' })
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
})

// POST /api/2fa/disable — turn off 2FA
router.post('/disable', authMiddleware, async (req, res) => {
  try {
    const { token } = req.body
    const user = await User.findById(req.user.id)

    const valid = speakeasy.totp.verify({
      secret: user.twoFactorSecret,
      encoding: 'base32',
      token,
      window: 1
    })

    if (!valid)
      return res.status(400).json({ message: 'Invalid code' })

    user.twoFactorEnabled = false
    user.twoFactorSecret = undefined
    await user.save()

    res.json({ message: '2FA disabled' })
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
})

export default router
