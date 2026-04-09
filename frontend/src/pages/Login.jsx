import { useState } from 'react'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import axios from 'axios'
import { useAuth } from '../context/AuthContext'
import OTPInput from '../components/OTPInput'

export default function Login() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  // 2FA state
  const [requires2FA, setRequires2FA] = useState(false)
  const [userId, setUserId] = useState(null)
  const [twoFACode, setTwoFACode] = useState('')

  const { login } = useAuth()
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const justVerified = searchParams.get('verified') === 'true'

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      const res = await axios.post('/api/auth/login', { email, password })

      if (res.data.requires2FA) {
        // Server says this user has 2FA — show the code input
        setRequires2FA(true)
        setUserId(res.data.userId)
      } else {
        login(res.data.user, res.data.token)
        navigate('/dashboard')
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Something went wrong')
    } finally {
      setLoading(false)
    }
  }

  const handle2FASubmit = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      const res = await axios.post('/api/auth/2fa-login', { userId, token: twoFACode })
      login(res.data.user, res.data.token)
      navigate('/dashboard')
    } catch (err) {
      setError(err.response?.data?.message || 'Invalid code')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-950 flex items-center justify-center px-4">
      <div className="w-full max-w-md">

        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-purple-400">ProxyToro</h1>
          <p className="text-gray-400 mt-2">
            {requires2FA ? 'Enter your 2FA code' : 'Sign in to your account'}
          </p>
        </div>

        <div className="bg-gray-900 border border-gray-800 rounded-2xl p-8">

          {/* Normal login form */}
          {!requires2FA && (
            <form onSubmit={handleSubmit} className="space-y-5">
              {justVerified && (
                <div className="bg-green-500/10 border border-green-500/30 text-green-400 px-4 py-3 rounded-lg text-sm">
                  Email verified successfully! You can now sign in.
                </div>
              )}
              {error && (
                <div className="bg-red-500/10 border border-red-500/30 text-red-400 px-4 py-3 rounded-lg text-sm">
                  {error}
                </div>
              )}
              <div>
                <label className="block text-sm text-gray-400 mb-2">Email</label>
                <input
                  type="email"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  placeholder="you@example.com"
                  required
                  className="w-full bg-gray-800 border border-gray-700 text-white rounded-lg px-4 py-3 focus:outline-none focus:border-purple-500 transition"
                />
              </div>
              <div>
                <label className="block text-sm text-gray-400 mb-2">Password</label>
                <input
                  type="password"
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  placeholder="Your password"
                  required
                  className="w-full bg-gray-800 border border-gray-700 text-white rounded-lg px-4 py-3 focus:outline-none focus:border-purple-500 transition"
                />
              </div>
              <button
                type="submit"
                disabled={loading}
                className="w-full bg-purple-600 hover:bg-purple-700 disabled:opacity-50 text-white font-semibold py-3 rounded-lg transition"
              >
                {loading ? 'Signing in...' : 'Sign In'}
              </button>
            </form>
          )}

          {/* 2FA form */}
          {requires2FA && (
            <form onSubmit={handle2FASubmit} className="space-y-5">
              <p className="text-gray-400 text-sm">
                Open Google Authenticator and enter the 6-digit code for ProxyToro.
              </p>
              {error && (
                <div className="bg-red-500/10 border border-red-500/30 text-red-400 px-4 py-3 rounded-lg text-sm">
                  {error}
                </div>
              )}
              <div>
                <label className="block text-sm text-gray-400 mb-2 text-center">6-digit code</label>
                <OTPInput
                  value={twoFACode}
                  onChange={setTwoFACode}
                  onComplete={async (code) => {
                    setTwoFACode(code)
                    setError('')
                    setLoading(true)
                    try {
                      const res = await axios.post('/api/auth/2fa-login', { userId, token: code })
                      login(res.data.user, res.data.token)
                      navigate('/dashboard')
                    } catch (err) {
                      setError(err.response?.data?.message || 'Invalid code')
                    } finally {
                      setLoading(false)
                    }
                  }}
                />
              </div>
              <button
                id="verify-btn"
                type="submit"
                disabled={loading}
                className="w-full bg-purple-600 hover:bg-purple-700 disabled:opacity-50 text-white font-semibold py-3 rounded-lg transition"
              >
                {loading ? 'Verifying...' : 'Verify'}
              </button>
              <button
                type="button"
                onClick={() => { setRequires2FA(false); setError('') }}
                className="w-full text-sm text-gray-500 hover:text-gray-300 transition"
              >
                ← Back to login
              </button>
            </form>
          )}

          {!requires2FA && (
            <p className="text-center text-gray-500 text-sm mt-6">
              Don't have an account?{' '}
              <Link to="/register" className="text-purple-400 hover:underline">Create one</Link>
            </p>
          )}
        </div>
      </div>
    </div>
  )
}
