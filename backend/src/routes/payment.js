import express from 'express'
import { authMiddleware } from '../middleware/auth.js'
import User from '../models/User.js'

const router = express.Router()

const PLANS = {
  starter: { name: 'Starter', price: 9, bandwidth: '10GB', proxies: 100 },
  pro:     { name: 'Pro',     price: 29, bandwidth: '50GB', proxies: 500 },
  business:{ name: 'Business',price: 79, bandwidth: '200GB', proxies: -1 },
}

// POST /api/payment/create — user clicks "Get Started" on a plan
router.post('/create', authMiddleware, async (req, res) => {
  try {
    const { plan } = req.body
    const planData = PLANS[plan]

    if (!planData)
      return res.status(400).json({ message: 'Invalid plan' })

    // Create a payment with NOWPayments
    const response = await fetch('https://api.nowpayments.io/v1/payment', {
      method: 'POST',
      headers: {
        'x-api-key': process.env.NOWPAYMENTS_API_KEY,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        price_amount: planData.price,
        price_currency: 'usd',
        pay_currency: 'usdtsol',
        order_id: `${req.user.id}_${plan}_${Date.now()}`,
        order_description: `ProxyToro ${planData.name} Plan`,
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

// POST /api/payment/webhook — NOWPayments notifies us when payment is confirmed
router.post('/webhook', express.json(), async (req, res) => {
  try {
    const { payment_status, order_id } = req.body

    if (payment_status === 'confirmed' || payment_status === 'finished') {
      const [userId, plan] = order_id.split('_')
      const planData = PLANS[plan]

      if (userId && planData) {
        await User.findByIdAndUpdate(userId, {
          activePlan: plan,
          planActivatedAt: new Date(),
          $push: {
            invoices: {
              plan: planData.name,
              amount: planData.price,
              currency: 'USDT',
              paymentId: req.body.payment_id,
              status: 'paid',
              createdAt: new Date()
            }
          }
        })
      }
    }

    res.sendStatus(200)
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
})

export default router
