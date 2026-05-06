import { useState } from 'react'
import axios from 'axios'
import { useAuth } from '../context/AuthContext'

export default function VerifyEmail() {
  const { user, logout } = useAuth()
  const [status, setStatus] = useState('idle') // 'idle' | 'sending' | 'sent' | 'error'

  const resend = async () => {
    setStatus('sending')
    try {
      const token = localStorage.getItem('token')
      await axios.post('/api/auth/resend-verification', {}, {
        headers: { Authorization: `Bearer ${token}` }
      })
      setStatus('sent')
    } catch {
      setStatus('error')
    }
  }

  return (
    <div className="min-h-screen bg-gray-950 flex items-center justify-center px-4">
      <div className="w-full max-w-md text-center space-y-6">

        {/* Icon */}
        <div className="w-16 h-16 bg-purple-500/10 rounded-full flex items-center justify-center mx-auto">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="w-8 h-8 text-purple-400">
            <rect x="2" y="4" width="20" height="16" rx="2"/>
            <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"/>
          </svg>
        </div>

        <div>
          <h1 className="text-2xl font-bold text-white mb-2">Check your inbox</h1>
          <p className="text-gray-400 text-sm leading-relaxed">
            We sent a verification link to{' '}
            <span className="text-white font-medium">{user?.email}</span>.
            <br />Click the link in the email to activate your account.
          </p>
        </div>

        {/* Resend */}
        <div className="bg-gray-900 border border-gray-800 rounded-xl p-5 space-y-3">
          <p className="text-gray-400 text-sm">Didn't get the email? Check your spam folder, or resend it.</p>

          {status === 'sent' && (
            <p className="text-green-400 text-sm bg-green-500/10 border border-green-500/20 rounded-lg px-4 py-2">
              Sent! Check your inbox again.
            </p>
          )}
          {status === 'error' && (
            <p className="text-red-400 text-sm bg-red-500/10 border border-red-500/20 rounded-lg px-4 py-2">
              Something went wrong. Try again in a moment.
            </p>
          )}

          <button
            onClick={resend}
            disabled={status === 'sending' || status === 'sent'}
            className="w-full bg-purple-600 hover:bg-purple-700 disabled:opacity-50 text-white font-semibold py-3 rounded-lg transition"
          >
            {status === 'sending' ? 'Sending...' : status === 'sent' ? 'Email sent!' : 'Resend verification email'}
          </button>
        </div>

        <button
          onClick={logout}
          className="text-sm text-gray-500 hover:text-gray-400 transition"
        >
          Sign out and use a different account
        </button>
      </div>
    </div>
  )
}
