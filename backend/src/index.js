import express from 'express'
import cors from 'cors'
import 'dotenv/config'

const app = express()
const PORT = process.env.PORT || 4000

// Middleware — these run on every request
app.use(cors())           // Allows frontend (different port) to talk to backend
app.use(express.json())   // Lets us read JSON from request body

// Health check route — just to confirm the server is alive
app.get('/api/health', (_req, res) => {
  res.json({ status: 'ok', message: 'ProxyToro API is running' })
})

app.listen(PORT, () => {
  console.log(`ProxyToro backend running on http://localhost:${PORT}`)
})
