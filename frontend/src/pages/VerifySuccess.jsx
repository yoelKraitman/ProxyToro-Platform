import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import axios from 'axios'
import { useAuth } from '../context/AuthContext'

export default function VerifySuccess() {
  const { updateUser } = useAuth()
  const navigate = useNavigate()
  const [countdown, setCountdown] = useState(3)

  useEffect(() => {
    const finalize = async () => {
      try {
        const token = localStorage.getItem('token')
        if (token) {
          const res = await axios.get('/api/user/me', {
            headers: { Authorization: `Bearer ${token}` }
          })
          if (res.data.isVerified) updateUser({ isVerified: true })
        }
      } catch {}
    }
    finalize()

    const timer = setInterval(() => {
      setCountdown(c => {
        if (c <= 1) {
          clearInterval(timer)
          navigate('/dashboard')
        }
        return c - 1
      })
    }, 1000)

    return () => clearInterval(timer)
  }, [])

  return (
    <div className="min-h-screen bg-gray-950 flex items-center justify-center px-4">
      <div className="text-center space-y-5">
        <div className="w-16 h-16 bg-green-500/10 rounded-full flex items-center justify-center mx-auto">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="w-8 h-8 text-green-400">
            <polyline points="20 6 9 17 4 12"/>
          </svg>
        </div>
        <h1 className="text-3xl font-bold text-purple-400">ProxyToro</h1>
        <h2 className="text-2xl font-bold text-white">Email verified!</h2>
        <p className="text-gray-400">Taking you to your dashboard in {countdown}...</p>
        <button
          onClick={() => navigate('/dashboard')}
          className="inline-block bg-purple-600 hover:bg-purple-700 text-white font-semibold px-8 py-3 rounded-lg transition"
        >
          Go to Dashboard now
        </button>
      </div>
    </div>
  )
}
