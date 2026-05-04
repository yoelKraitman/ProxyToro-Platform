import express from 'express'
import cors from 'cors'
import authRoutes from './routes/auth.js'
import proxyRoutes from './routes/proxy.js'
import adminRoutes from './routes/admin.js'
import paymentRoutes from './routes/payment.js'
import userRoutes from './routes/user.js'
import twofaRoutes from './routes/twofa.js'

const app = express()

app.use(cors())
app.use(express.json())

app.get('/api/health', (_req, res) => {
  res.json({ status: 'ok', message: 'ProxyToro API is running' })
})

app.use('/api/auth', authRoutes)
app.use('/api/proxy', proxyRoutes)
app.use('/api/admin', adminRoutes)
app.use('/api/payment', paymentRoutes)
app.use('/api/user', userRoutes)
app.use('/api/2fa', twofaRoutes)

export default app
