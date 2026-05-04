import { useState } from 'react'
import { Link } from 'react-router-dom'
import axios from 'axios'

export default function ForgotPassword() {
  const [email, setEmail]     = useState('')
  const [loading, setLoading] = useState(false)
  const [msg, setMsg]         = useState('')
  const [sent, setSent]       = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    try {
      await axios.post('/api/auth/forgot-password', { email })
      setSent(true)
      setMsg('Check your inbox — we sent a reset link if that email is registered.')
    } catch {
      setMsg('Something went wrong. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-950 flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-purple-400">ProxyToro</h1>
          <p className="text-gray-400 mt-2">Reset your password</p>
        </div>

        <div className="bg-gray-900 border border-gray-800 rounded-2xl p-8">
          {sent ? (
            <div className="text-center space-y-4">
              <div className="w-14 h-14 bg-green-500/10 rounded-full flex items-center justify-center mx-auto">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-7 h-7 text-green-400">
                  <polyline points="20 6 9 17 4 12"/>
                </svg>
              </div>
              <p className="text-white font-semibold">Email sent!</p>
              <p className="text-gray-400 text-sm">{msg}</p>
              <Link to="/login" className="block text-purple-400 hover:underline text-sm mt-4">
                Back to login
              </Link>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-5">
              <p className="text-gray-400 text-sm">Enter your email and we'll send you a link to reset your password.</p>
              {msg && <p className="text-red-400 text-sm">{msg}</p>}
              <div>
                <label className="block text-sm text-gray-400 mb-2">Email</label>
                <input
                  type="email"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  placeholder="you@example.com"
                  required
                  autoComplete="email"
                  className="w-full bg-gray-800 border border-gray-700 text-white rounded-lg px-4 py-3 focus:outline-none focus:border-purple-500 transition"
                />
              </div>
              <button
                type="submit"
                disabled={loading}
                className="w-full bg-purple-600 hover:bg-purple-700 disabled:opacity-50 text-white font-semibold py-3 rounded-lg transition"
              >
                {loading ? 'Sending...' : 'Send Reset Link'}
              </button>
              <p className="text-center text-gray-500 text-sm">
                <Link to="/login" className="text-purple-400 hover:underline">Back to login</Link>
              </p>
            </form>
          )}
        </div>
      </div>
    </div>
  )
}
