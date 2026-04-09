import express from 'express'
import cors from 'cors'
import mongoose from 'mongoose'
import 'dotenv/config'
import authRoutes from './routes/auth.js'
import proxyRoutes from './routes/proxy.js'
import adminRoutes from './routes/admin.js'
import paymentRoutes from './routes/payment.js'
import userRoutes from './routes/user.js'
import twofaRoutes from './routes/twofa.js'

const app = express()
const PORT = process.env.PORT || 4000

// Middleware
app.use(cors())
app.use(express.json())

// Health check
app.get('/api/health', (_req, res) => {
  res.json({ status: 'ok', message: 'ProxyToro API is running' })
})

// Routes
app.use('/api/auth', authRoutes)
app.use('/api/proxy', proxyRoutes)
app.use('/api/admin', adminRoutes)
app.use('/api/payment', paymentRoutes)
app.use('/api/user', userRoutes)
app.use('/api/2fa', twofaRoutes)

// Connect to MongoDB, then start the server
mongoose.connect(process.env.MONGO_URI)
  .then(() => {
    console.log('Connected to MongoDB')
    app.listen(PORT, () => {
      console.log(`ProxyToro backend running on http://localhost:${PORT}`)
    })
  })
  .catch((err) => {
    console.error('MongoDB connection failed:', err.message)
    process.exit(1)
  })
