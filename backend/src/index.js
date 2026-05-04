import mongoose from 'mongoose'
import 'dotenv/config'
import app from './app.js'

const PORT = process.env.PORT || 4000

mongoose.connect(process.env.MONGO_URI)
  .then(async () => {
    console.log('Connected to MongoDB')

    // Drop stale unique index on proxyUsername — removed from schema but may still exist in DB
    try {
      await mongoose.connection.collection('users').dropIndex('proxyUsername_1')
      console.log('Dropped stale proxyUsername index')
    } catch {
      // Index doesn't exist — that's fine, nothing to do
    }

    app.listen(PORT, () => {
      console.log(`ProxyToro backend running on http://localhost:${PORT}`)
    })
  })
  .catch((err) => {
    console.error('MongoDB connection failed:', err.message)
    process.exit(1)
  })
