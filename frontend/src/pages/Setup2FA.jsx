import { useState, useEffect } from 'react'
import axios from 'axios'
import { useAuth } from '../context/AuthContext'

const STEPS = ['Download App', 'Scan QR Code', 'Verify Code']

export default function Setup2FA() {
  const { updateUser } = useAuth()
  const [step, setStep]       = useState(1)
  const [qrCode, setQrCode]   = useState('')
  const [secret, setSecret]   = useState('')
  const [code, setCode]       = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError]     = useState('')
  const [done, setDone]       = useState(false)

  useEffect(() => {
    const token = localStorage.getItem('token')
    axios.post('/api/2fa/setup', {}, { headers: { Authorization: `Bearer ${token}` } })
      .then(res => { setQrCode(res.data.qrCode); setSecret(res.data.secret) })
      .catch(() => {})
  }, [])

  const handleVerify = async (codeOverride) => {
    const codeToUse = codeOverride ?? code
    if (codeToUse.length !== 6) return setError('Please enter the 6-digit code')
    setLoading(true)
    setError('')
    try {
      const token = localStorage.getItem('token')
      await axios.post('/api/2fa/verify', { token: codeToUse }, { headers: { Authorization: `Bearer ${token}` } })
      updateUser({ twoFactorEnabled: true })
      setDone(true)
    } catch (err) {
      setError(err.response?.data?.message || 'Invalid code. Try again.')
    } finally {
      setLoading(false)
    }
  }

  if (done) {
    return (
      <div className="min-h-screen bg-gray-950 flex items-center justify-center px-4">
        <div className="text-center space-y-5">
          <div className="w-16 h-16 bg-green-500/10 rounded-full flex items-center justify-center mx-auto">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-8 h-8 text-green-400">
              <polyline points="20 6 9 17 4 12"/>
            </svg>
          </div>
          <h2 className="text-2xl font-bold text-white">You're all set!</h2>
          <p className="text-gray-400">Your account is now protected with two-factor authentication.</p>
          <a
            href="/dashboard"
            className="inline-block bg-purple-600 hover:bg-purple-700 text-white font-semibold px-8 py-3 rounded-lg transition"
          >
            Go to Dashboard
          </a>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-950 flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-lg">

        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-purple-400">ProxyToro</h1>
          <p className="text-white font-semibold text-lg mt-3">Secure your account</p>
          <p className="text-gray-400 text-sm mt-1">
            Two-factor authentication is required to use ProxyToro.
            It only takes 2 minutes to set up.
          </p>
        </div>

        {/* Step progress bar */}
        <div className="flex items-center justify-between mb-8 px-2">
          {STEPS.map((label, i) => {
            const num = i + 1
            const active = step === num
            const done   = step > num
            return (
              <div key={label} className="flex-1 flex flex-col items-center gap-1">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold transition
                  ${done  ? 'bg-green-500 text-white' :
                    active ? 'bg-purple-600 text-white' :
                             'bg-gray-800 text-gray-500'}`}>
                  {done
                    ? <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" className="w-4 h-4"><polyline points="20 6 9 17 4 12"/></svg>
                    : num}
                </div>
                <span className={`text-xs ${active ? 'text-white' : 'text-gray-500'}`}>{label}</span>
                {i < STEPS.length - 1 && (
                  <div className="absolute" />
                )}
              </div>
            )
          })}
        </div>

        <div className="bg-gray-900 border border-gray-800 rounded-2xl p-8 space-y-6">

          {/* ── STEP 1: Download app ── */}
          {step === 1 && (
            <div className="space-y-5">
              <h2 className="text-white text-xl font-semibold">Step 1 — Download an authenticator app</h2>
              <p className="text-gray-400 text-sm leading-relaxed">
                An authenticator app generates a new 6-digit code every 30 seconds.
                You'll use this code every time you log in — it keeps your account safe even if your password is stolen.
              </p>
              <div className="grid grid-cols-2 gap-4">
                <a
                  href="https://apps.apple.com/app/google-authenticator/id388497605"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-3 bg-gray-800 hover:bg-gray-700 border border-gray-700 rounded-xl px-4 py-3 transition group"
                >
                  <div className="w-9 h-9 bg-white rounded-lg flex items-center justify-center shrink-0">
                    <svg viewBox="0 0 24 24" className="w-5 h-5" fill="none">
                      <circle cx="12" cy="12" r="10" fill="#4285F4"/>
                      <path d="M12 6.5a5.5 5.5 0 1 0 0 11 5.5 5.5 0 0 0 0-11zm0 9a3.5 3.5 0 1 1 0-7 3.5 3.5 0 0 1 0 7z" fill="white"/>
                    </svg>
                  </div>
                  <div>
                    <p className="text-white text-sm font-medium group-hover:text-purple-400 transition">Google Authenticator</p>
                    <p className="text-gray-500 text-xs">iOS & Android</p>
                  </div>
                </a>
                <a
                  href="https://authy.com/download/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-3 bg-gray-800 hover:bg-gray-700 border border-gray-700 rounded-xl px-4 py-3 transition group"
                >
                  <div className="w-9 h-9 bg-red-500 rounded-lg flex items-center justify-center shrink-0">
                    <svg viewBox="0 0 24 24" fill="white" className="w-5 h-5">
                      <path d="M12 1L3 5v6c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V5l-9-4z"/>
                    </svg>
                  </div>
                  <div>
                    <p className="text-white text-sm font-medium group-hover:text-purple-400 transition">Authy</p>
                    <p className="text-gray-500 text-xs">iOS, Android & Desktop</p>
                  </div>
                </a>
              </div>
              <p className="text-gray-500 text-xs text-center">
                Already have one? You can skip this step.
              </p>
              <button
                onClick={() => setStep(2)}
                className="w-full bg-purple-600 hover:bg-purple-700 text-white font-semibold py-3 rounded-lg transition"
              >
                I have an app — Next
              </button>
            </div>
          )}

          {/* ── STEP 2: Scan QR code ── */}
          {step === 2 && (
            <div className="space-y-5">
              <h2 className="text-white text-xl font-semibold">Step 2 — Scan the QR code</h2>
              <p className="text-gray-400 text-sm leading-relaxed">
                Open your authenticator app, tap the <span className="text-white font-medium">+</span> button,
                then choose <span className="text-white font-medium">"Scan QR code"</span> and point your camera at this code.
              </p>
              <div className="flex justify-center">
                {qrCode
                  ? <img src={qrCode} alt="2FA QR code" className="w-48 h-48 rounded-xl border-4 border-purple-500/30" />
                  : <div className="w-48 h-48 bg-gray-800 rounded-xl flex items-center justify-center">
                      <span className="text-gray-500 text-sm">Loading QR code...</span>
                    </div>
                }
              </div>
              <div className="bg-gray-800 rounded-xl p-4">
                <p className="text-gray-400 text-xs mb-1">Can't scan the QR code? Enter this code manually instead:</p>
                <p className="text-white font-mono text-sm break-all tracking-widest">{secret}</p>
              </div>
              <div className="flex gap-3">
                <button
                  onClick={() => setStep(1)}
                  className="flex-1 bg-gray-800 hover:bg-gray-700 text-gray-300 font-semibold py-3 rounded-lg transition"
                >
                  Back
                </button>
                <button
                  onClick={() => setStep(3)}
                  className="flex-1 bg-purple-600 hover:bg-purple-700 text-white font-semibold py-3 rounded-lg transition"
                >
                  I scanned it — Next
                </button>
              </div>
            </div>
          )}

          {/* ── STEP 3: Enter code ── */}
          {step === 3 && (
            <div className="space-y-5">
              <h2 className="text-white text-xl font-semibold">Step 3 — Enter the 6-digit code</h2>
              <p className="text-gray-400 text-sm leading-relaxed">
                Open your authenticator app and find <span className="text-purple-400 font-medium">ProxyToro</span>.
                Type the 6-digit code you see there below. The code changes every 30 seconds — if it expires, just use the new one.
              </p>
              {error && (
                <p className="bg-red-500/10 border border-red-500/30 text-red-400 px-4 py-3 rounded-lg text-sm">{error}</p>
              )}
              <input
                type="text"
                inputMode="numeric"
                maxLength={6}
                value={code}
                onChange={e => {
                  const val = e.target.value.replace(/\D/g, '')
                  setCode(val)
                  setError('')
                  if (val.length === 6) handleVerify(val)
                }}
                placeholder="000000"
                className="w-full bg-gray-800 border border-gray-700 text-white text-center text-3xl font-mono tracking-[0.5em] rounded-lg px-4 py-4 focus:outline-none focus:border-purple-500 transition placeholder:text-gray-600 placeholder:tracking-widest"
              />
              <p className="text-gray-500 text-xs text-center">
                The code refreshes every 30 seconds — enter it quickly
              </p>
              <div className="flex gap-3">
                <button
                  onClick={() => setStep(2)}
                  className="flex-1 bg-gray-800 hover:bg-gray-700 text-gray-300 font-semibold py-3 rounded-lg transition"
                >
                  Back
                </button>
                <button
                  onClick={handleVerify}
                  disabled={loading || code.length !== 6}
                  className="flex-1 bg-purple-600 hover:bg-purple-700 disabled:opacity-50 text-white font-semibold py-3 rounded-lg transition"
                >
                  {loading ? 'Verifying...' : 'Activate 2FA'}
                </button>
              </div>
            </div>
          )}

        </div>
      </div>
    </div>
  )
}
