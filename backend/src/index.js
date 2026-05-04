import mongoose from 'mongoose'
import 'dotenv/config'
import app from './app.js'

const PORT = process.env.PORT || 4000

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
