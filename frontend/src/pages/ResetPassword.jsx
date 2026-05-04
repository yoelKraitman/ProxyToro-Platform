import { useState } from 'react'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import axios from 'axios'

export default function ResetPassword() {
  const [searchParams]          = useSearchParams()
  const token                   = searchParams.get('token')
  const navigate                = useNavigate()
  const [newPassword, setNewPassword] = useState('')
  const [confirm, setConfirm]   = useState('')
  const [loading, setLoading]   = useState(false)
  const [error, setError]       = useState('')
  const [done, setDone]         = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (newPassword !== confirm) return setError('Passwords do not match')
    setLoading(true)
    setError('')
    try {
      await axios.post('/api/auth/reset-password', { token, newPassword })
      setDone(true)
      setTimeout(() => navigate('/login'), 3000)
    } catch (err) {
      setError(err.response?.data?.message || 'Something went wrong')
    } finally {
      setLoading(false)
    }
  }

  if (!token) return (
    <div className="min-h-screen bg-gray-950 flex items-center justify-center px-4">
      <div className="text-center">
        <p className="text-red-400 mb-4">Invalid reset link.</p>
        <Link to="/forgot-password" className="text-purple-400 hover:underline">Request a new one</Link>
      </div>
    </div>
  )

  return (
    <div className="min-h-screen bg-gray-950 flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-purple-400">ProxyToro</h1>
          <p className="text-gray-400 mt-2">Set a new password</p>
        </div>

        <div className="bg-gray-900 border border-gray-800 rounded-2xl p-8">
          {done ? (
            <div className="text-center space-y-4">
              <div className="w-14 h-14 bg-green-500/10 rounded-full flex items-center justify-center mx-auto">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-7 h-7 text-green-400">
                  <polyline points="20 6 9 17 4 12"/>
                </svg>
              </div>
              <p className="text-white font-semibold">Password reset!</p>
              <p className="text-gray-400 text-sm">Redirecting to login...</p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-5">
              {error && <p className="bg-red-500/10 border border-red-500/30 text-red-400 px-4 py-3 rounded-lg text-sm">{error}</p>}
              <div>
                <label className="block text-sm text-gray-400 mb-2">New Password</label>
                <input
                  type="password"
                  value={newPassword}
                  onChange={e => setNewPassword(e.target.value)}
                  placeholder="At least 6 characters"
                  required
                  autoComplete="new-password"
                  className="w-full bg-gray-800 border border-gray-700 text-white rounded-lg px-4 py-3 focus:outline-none focus:border-purple-500 transition"
                />
              </div>
              <div>
                <label className="block text-sm text-gray-400 mb-2">Confirm Password</label>
                <input
                  type="password"
                  value={confirm}
                  onChange={e => setConfirm(e.target.value)}
                  placeholder="Same password again"
                  required
                  autoComplete="new-password"
                  className="w-full bg-gray-800 border border-gray-700 text-white rounded-lg px-4 py-3 focus:outline-none focus:border-purple-500 transition"
                />
              </div>
              <button
                type="submit"
                disabled={loading}
                className="w-full bg-purple-600 hover:bg-purple-700 disabled:opacity-50 text-white font-semibold py-3 rounded-lg transition"
              >
                {loading ? 'Resetting...' : 'Reset Password'}
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  )
}
