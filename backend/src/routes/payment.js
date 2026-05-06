import express from 'express'
import { authMiddleware } from '../middleware/auth.js'
import User from '../models/User.js'
import { allocateGb, createSubuser } from '../services/globedata.js'

const router = express.Router()

// POST /api/payment/create — user buys GB of bandwidth
router.post('/create', authMiddleware, async (req, res) => {
  try {
    const { gb, total } = req.body

    if (!gb || !total || gb < 1)
      return res.status(400).json({ message: 'Invalid purchase amount' })

    const response = await fetch('https://api.nowpayments.io/v1/payment', {
      method: 'POST',
      headers: {
        'x-api-key': process.env.NOWPAYMENTS_API_KEY,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        price_amount: total,
        price_currency: 'usd',
        pay_currency: 'usdtsol',
        order_id: `${req.user.id}_${gb}_${Date.now()}`,
        order_description: `ProxyToro — ${gb} GB residential proxy bandwidth`,
        ipn_callback_url: `${process.env.BACKEND_URL}/api/payment/webhook`,
      })
    })

    const data = await response.json()

    if (!response.ok)
      return res.status(502).json({ message: 'Payment creation failed', detail: data })

    res.json({
      paymentId: data.payment_id,
      paymentUrl: `https://nowpayments.io/payment/?iid=${data.payment_id}`,
      amount: data.pay_amount,
      currency: data.pay_currency,
      address: data.pay_address,
      status: data.payment_status
    })
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message })
  }
})

// POST /api/payment/webhook — NOWPayments calls this when payment is confirmed
router.post('/webhook', express.json(), async (req, res) => {
  try {
    const { payment_status, order_id } = req.body

    if (payment_status === 'confirmed' || payment_status === 'finished') {
      const parts = order_id.split('_')
      const userId = parts[0]
      const gb = parseFloat(parts[1])

      if (userId && gb) {
        const user = await User.findById(userId)
        if (!user) return res.sendStatus(200)

        await User.findByIdAndUpdate(userId, {
          $inc: { bandwidthPurchased: gb },
          $push: {
            invoices: {
              plan: `${gb} GB`,
              amount: req.body.price_amount,
              currency: 'USDT',
              paymentId: req.body.payment_id,
              status: 'paid',
              createdAt: new Date()
            }
          }
        })

        // GlobeData: create sub-user on first payment, allocate GB on repeat payments
        try {
          if (user.globedataId) {
            await allocateGb(user.globedataId, gb)
          } else {
            const sub = await createSubuser({ email: user.email, gb, label: user.email })
            if (sub) {
              await User.findByIdAndUpdate(userId, {
                $set: {
                  globedataId:       sub.id,
                  globedataUsername: sub.proxy_username,
                  globedataPassword: sub.proxy_password,
                }
              })
            }
          }
        } catch (gdErr) {
          console.error('GlobeData error on payment:', gdErr.message)
        }
      }
    }

    res.sendStatus(200)
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
})

export default router
