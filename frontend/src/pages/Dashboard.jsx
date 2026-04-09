import { useState, useEffect } from 'react'
import { useAuth } from '../context/AuthContext'
import { useNavigate } from 'react-router-dom'
import axios from 'axios'

const TABS = ['Overview', 'Proxy Generator', 'Billing', 'Account']

export default function Dashboard() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const [activeTab, setActiveTab] = useState('Overview')
  const [copied, setCopied] = useState('')

  // Full profile state (usage + invoices)
  const [profile, setProfile] = useState(null)

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const token = localStorage.getItem('token')
        const res = await axios.get('/api/user/me', {
          headers: { Authorization: `Bearer ${token}` }
        })
        setProfile(res.data)
      } catch (err) {
        console.error('Failed to load profile', err)
      }
    }
    fetchProfile()
  }, [])

  // Payment state
  const [paymentLoading, setPaymentLoading] = useState('')

  const handlePurchase = async (plan) => {
    setPaymentLoading(plan)
    try {
      const token = localStorage.getItem('token')
      const res = await axios.post('/api/payment/create', { plan }, {
        headers: { Authorization: `Bearer ${token}` }
      })
      // Open the payment page in a new tab
      window.open(res.data.paymentUrl, '_blank')
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to create payment')
    } finally {
      setPaymentLoading('')
    }
  }

  // Proxy generator state
  const [proxyCountry, setProxyCountry] = useState('US')
  const [proxyCount, setProxyCount] = useState(10)
  const [proxies, setProxies] = useState([])
  const [proxyLoading, setProxyLoading] = useState(false)
  const [proxyError, setProxyError] = useState('')

  const generateProxies = async () => {
    setProxyLoading(true)
    setProxyError('')
    setProxies([])
    try {
      const token = localStorage.getItem('token')
      const res = await axios.get(`/api/proxy/list?country=${proxyCountry}&count=${proxyCount}`, {
        headers: { Authorization: `Bearer ${token}` }
      })
      setProxies(res.data.proxies)
    } catch (err) {
      setProxyError(err.response?.data?.message || 'Failed to fetch proxies')
    } finally {
      setProxyLoading(false)
    }
  }

  const handleLogout = () => {
    logout()
    navigate('/login')
  }

  const copyToClipboard = (text, label) => {
    navigator.clipboard.writeText(text)
    setCopied(label)
    setTimeout(() => setCopied(''), 2000)
  }

  return (
    <div className="min-h-screen bg-gray-950 text-white">

      {/* Navbar */}
      <nav className="border-b border-gray-800 px-6 py-4 flex items-center justify-between">
        <h1 className="text-xl font-bold text-purple-400">ProxyToro</h1>
        <div className="flex items-center gap-4">
          <span className="text-gray-400 text-sm hidden sm:block">{user?.email}</span>
          <button
            onClick={handleLogout}
            className="text-sm text-gray-400 hover:text-white transition"
          >
            Logout
          </button>
        </div>
      </nav>

      {/* Tabs */}
      <div className="border-b border-gray-800 px-6">
        <div className="flex gap-1 overflow-x-auto">
          {TABS.map(tab => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-4 py-3 text-sm font-medium whitespace-nowrap transition border-b-2 ${
                activeTab === tab
                  ? 'border-purple-500 text-purple-400'
                  : 'border-transparent text-gray-400 hover:text-white'
              }`}
            >
              {tab}
            </button>
          ))}
        </div>
      </div>

      {/* Page Content */}
      <div className="max-w-5xl mx-auto px-6 py-8">

        {/* ── OVERVIEW ── */}
        {activeTab === 'Overview' && (
          <div className="space-y-6">
            <div>
              <h2 className="text-2xl font-bold mb-1">Welcome back!</h2>
              <p className="text-gray-400">Here's a summary of your account.</p>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="bg-gray-900 border border-gray-800 rounded-2xl p-5">
                <p className="text-gray-400 text-sm mb-1">Active Plan</p>
                <p className="text-xl font-bold text-purple-400 capitalize">
                  {profile?.activePlan === 'none' ? 'Free Trial' : profile?.activePlan || 'Free Trial'}
                </p>
              </div>
              <div className="bg-gray-900 border border-gray-800 rounded-2xl p-5">
                <p className="text-gray-400 text-sm mb-1">Bandwidth Used</p>
                <p className="text-xl font-bold">{profile?.usage?.bandwidthUsed || 0} MB</p>
              </div>
              <div className="bg-gray-900 border border-gray-800 rounded-2xl p-5">
                <p className="text-gray-400 text-sm mb-1">Proxies Generated</p>
                <p className="text-xl font-bold">{profile?.usage?.proxiesGenerated || 0}</p>
              </div>
            </div>

            {/* Credentials */}
            <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6">
              <h3 className="text-lg font-semibold mb-4 text-purple-400">Your Proxy Credentials</h3>
              <div className="space-y-3">
                {[
                  { label: 'Username', value: user?.proxyUsername },
                  { label: 'Email', value: user?.email },
                  { label: 'Role', value: user?.role },
                ].map(({ label, value }) => (
                  <div key={label} className="flex justify-between items-center bg-gray-800 rounded-lg px-4 py-3">
                    <span className="text-gray-400 text-sm">{label}</span>
                    <div className="flex items-center gap-3">
                      <span className="font-mono text-white text-sm">{value}</span>
                      {label === 'Username' && (
                        <button
                          onClick={() => copyToClipboard(value, label)}
                          className="text-xs text-purple-400 hover:text-purple-300 transition"
                        >
                          {copied === label ? 'Copied!' : 'Copy'}
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* ── PROXY GENERATOR ── */}
        {activeTab === 'Proxy Generator' && (
          <div className="space-y-6">
            <div>
              <h2 className="text-2xl font-bold mb-1">Proxy Generator</h2>
              <p className="text-gray-400">Select your options and generate proxies.</p>
            </div>

            <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6 space-y-5">

              {/* Proxy Type */}
              <div>
                <label className="block text-sm text-gray-400 mb-2">Proxy Type</label>
                <div className="grid grid-cols-3 gap-3">
                  {['Residential', 'Datacenter', 'Mobile'].map(type => (
                    <button
                      key={type}
                      className="border border-gray-700 hover:border-purple-500 text-gray-300 hover:text-white rounded-lg py-3 text-sm transition"
                    >
                      {type}
                    </button>
                  ))}
                </div>
              </div>

              {/* Location */}
              <div>
                <label className="block text-sm text-gray-400 mb-2">Location</label>
                <select
                  value={proxyCountry}
                  onChange={e => setProxyCountry(e.target.value)}
                  className="w-full bg-gray-800 border border-gray-700 text-white rounded-lg px-4 py-3 focus:outline-none focus:border-purple-500"
                >
                  <option value="US">United States</option>
                  <option value="GB">United Kingdom</option>
                  <option value="DE">Germany</option>
                  <option value="FR">France</option>
                  <option value="IL">Israel</option>
                  <option value="">Any</option>
                </select>
              </div>

              {/* Amount */}
              <div>
                <label className="block text-sm text-gray-400 mb-2">Amount</label>
                <input
                  type="number"
                  value={proxyCount}
                  onChange={e => setProxyCount(e.target.value)}
                  min={1}
                  max={100}
                  className="w-full bg-gray-800 border border-gray-700 text-white rounded-lg px-4 py-3 focus:outline-none focus:border-purple-500"
                />
              </div>

              {proxyError && (
                <div className="bg-red-500/10 border border-red-500/30 text-red-400 px-4 py-3 rounded-lg text-sm">
                  {proxyError}
                </div>
              )}

              <button
                onClick={generateProxies}
                disabled={proxyLoading}
                className="w-full bg-purple-600 hover:bg-purple-700 disabled:opacity-50 text-white font-semibold py-3 rounded-lg transition"
              >
                {proxyLoading ? 'Fetching proxies...' : 'Generate Proxies'}
              </button>
            </div>

            {/* Output */}
            <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-sm font-medium text-gray-400">
                  Output {proxies.length > 0 && `(${proxies.length} proxies)`}
                </h3>
                {proxies.length > 0 && (
                  <button
                    onClick={() => copyToClipboard(proxies.map(p => p.formatted).join('\n'), 'all')}
                    className="text-xs text-purple-400 hover:text-purple-300"
                  >
                    {copied === 'all' ? 'Copied!' : 'Copy All'}
                  </button>
                )}
              </div>
              <div className="bg-gray-800 rounded-lg p-4 min-h-32 font-mono text-sm">
                {proxies.length === 0
                  ? <span className="text-gray-500">Your proxies will appear here...</span>
                  : proxies.map((p, i) => (
                    <div key={i} className="text-green-400 leading-relaxed">{p.formatted}</div>
                  ))
                }
              </div>
            </div>
          </div>
        )}

        {/* ── BILLING ── */}
        {activeTab === 'Billing' && (
          <div className="space-y-6">
            <div>
              <h2 className="text-2xl font-bold mb-1">Plans & Billing</h2>
              <p className="text-gray-400">Choose a plan that fits your needs.</p>
            </div>

            {/* Plans */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {[
                { id: 'starter', name: 'Starter', price: '$9', bandwidth: '10 GB', proxies: '100', color: 'gray' },
                { id: 'pro', name: 'Pro', price: '$29', bandwidth: '50 GB', proxies: '500', color: 'purple', popular: true },
                { id: 'business', name: 'Business', price: '$79', bandwidth: '200 GB', proxies: 'Unlimited', color: 'gray' },
              ].map(plan => (
                <div
                  key={plan.name}
                  className={`bg-gray-900 rounded-2xl p-6 border ${
                    plan.popular ? 'border-purple-500' : 'border-gray-800'
                  } relative`}
                >
                  {plan.popular && (
                    <span className="absolute -top-3 left-1/2 -translate-x-1/2 bg-purple-600 text-white text-xs px-3 py-1 rounded-full">
                      Most Popular
                    </span>
                  )}
                  <h3 className="text-lg font-bold mb-1">{plan.name}</h3>
                  <p className="text-3xl font-bold text-purple-400 mb-4">{plan.price}<span className="text-sm text-gray-400">/mo</span></p>
                  <ul className="space-y-2 text-sm text-gray-400 mb-6">
                    <li>✓ {plan.bandwidth} bandwidth</li>
                    <li>✓ {plan.proxies} proxies</li>
                    <li>✓ All locations</li>
                    <li>✓ 24/7 support</li>
                  </ul>
                  <button
                    onClick={() => handlePurchase(plan.id)}
                    disabled={paymentLoading === plan.id}
                    className={`w-full py-2 rounded-lg text-sm font-semibold transition disabled:opacity-50 ${
                      plan.popular
                        ? 'bg-purple-600 hover:bg-purple-700 text-white'
                        : 'border border-gray-700 hover:border-purple-500 text-gray-300'
                    }`}>
                    {paymentLoading === plan.id ? 'Loading...' : 'Get Started'}
                  </button>
                </div>
              ))}
            </div>

            {/* Invoice history */}
            <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6">
              <h3 className="text-lg font-semibold mb-4">Invoice History</h3>
              {!profile?.invoices?.length
                ? <p className="text-gray-500 text-sm">No invoices yet.</p>
                : <table className="w-full text-sm">
                    <thead>
                      <tr className="text-gray-400 border-b border-gray-800">
                        <th className="text-left py-2">Plan</th>
                        <th className="text-left py-2">Amount</th>
                        <th className="text-left py-2">Status</th>
                        <th className="text-left py-2">Date</th>
                      </tr>
                    </thead>
                    <tbody>
                      {profile.invoices.map((inv, i) => (
                        <tr key={i} className="border-b border-gray-800/50">
                          <td className="py-3 capitalize">{inv.plan}</td>
                          <td className="py-3">${inv.amount} {inv.currency}</td>
                          <td className="py-3">
                            <span className="bg-green-500/20 text-green-400 text-xs px-2 py-1 rounded-full">
                              {inv.status}
                            </span>
                          </td>
                          <td className="py-3 text-gray-400">
                            {new Date(inv.createdAt).toLocaleDateString()}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
              }
            </div>
          </div>
        )}

        {/* ── ACCOUNT ── */}
        {activeTab === 'Account' && (
          <AccountTab user={user} profile={profile} />
        )}

      </div>
    </div>
  )
}

function AccountTab({ user, profile }) {
  const [currentPassword, setCurrentPassword] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [pwMsg, setPwMsg] = useState('')
  const [pwLoading, setPwLoading] = useState(false)
  const [credMsg, setCredMsg] = useState('')
  const [credLoading, setCredLoading] = useState(false)

  const changePassword = async () => {
    setPwLoading(true)
    setPwMsg('')
    try {
      const token = localStorage.getItem('token')
      const res = await axios.put('/api/user/password', { currentPassword, newPassword }, {
        headers: { Authorization: `Bearer ${token}` }
      })
      setPwMsg({ type: 'success', text: res.data.message })
      setCurrentPassword('')
      setNewPassword('')
    } catch (err) {
      setPwMsg({ type: 'error', text: err.response?.data?.message || 'Failed to update password' })
    } finally {
      setPwLoading(false)
    }
  }

  const resetCredentials = async () => {
    setCredLoading(true)
    setCredMsg('')
    try {
      const token = localStorage.getItem('token')
      const res = await axios.post('/api/user/reset-credentials', {}, {
        headers: { Authorization: `Bearer ${token}` }
      })
      setCredMsg({ type: 'success', text: `New username: ${res.data.proxyUsername}` })
    } catch (err) {
      setCredMsg({ type: 'error', text: 'Failed to reset credentials' })
    } finally {
      setCredLoading(false)
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold mb-1">Account Settings</h2>
        <p className="text-gray-400">Manage your account details.</p>
      </div>

      {/* Change Password */}
      <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6 space-y-4">
        <h3 className="text-lg font-semibold">Change Password</h3>
        <div>
          <label className="block text-sm text-gray-400 mb-2">Email</label>
          <input
            type="email"
            value={user?.email}
            disabled
            className="w-full bg-gray-800 border border-gray-700 text-gray-400 rounded-lg px-4 py-3 cursor-not-allowed"
          />
        </div>
        <div>
          <label className="block text-sm text-gray-400 mb-2">Current Password</label>
          <input
            type="password"
            value={currentPassword}
            onChange={e => setCurrentPassword(e.target.value)}
            placeholder="Enter current password"
            className="w-full bg-gray-800 border border-gray-700 text-white rounded-lg px-4 py-3 focus:outline-none focus:border-purple-500"
          />
        </div>
        <div>
          <label className="block text-sm text-gray-400 mb-2">New Password</label>
          <input
            type="password"
            value={newPassword}
            onChange={e => setNewPassword(e.target.value)}
            placeholder="At least 6 characters"
            className="w-full bg-gray-800 border border-gray-700 text-white rounded-lg px-4 py-3 focus:outline-none focus:border-purple-500"
          />
        </div>
        {pwMsg && (
          <p className={`text-sm ${pwMsg.type === 'success' ? 'text-green-400' : 'text-red-400'}`}>
            {pwMsg.text}
          </p>
        )}
        <button
          onClick={changePassword}
          disabled={pwLoading}
          className="bg-purple-600 hover:bg-purple-700 disabled:opacity-50 text-white font-semibold px-6 py-2 rounded-lg transition text-sm"
        >
          {pwLoading ? 'Saving...' : 'Save Changes'}
        </button>
      </div>

      {/* Reset Proxy Credentials */}
      <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6">
        <h3 className="text-lg font-semibold mb-2">Proxy Credentials</h3>
        <p className="text-gray-400 text-sm mb-4">
          Current username: <span className="font-mono text-purple-400">{profile?.proxyUsername}</span>
        </p>
        {credMsg && (
          <p className={`text-sm mb-3 ${credMsg.type === 'success' ? 'text-green-400' : 'text-red-400'}`}>
            {credMsg.text}
          </p>
        )}
        <button
          onClick={resetCredentials}
          disabled={credLoading}
          className="border border-gray-700 hover:border-purple-500 text-gray-300 hover:text-white disabled:opacity-50 px-6 py-2 rounded-lg text-sm transition"
        >
          {credLoading ? 'Regenerating...' : 'Regenerate Credentials'}
        </button>
      </div>

      {/* Danger Zone */}
      <div className="bg-gray-900 border border-red-900/30 rounded-2xl p-6">
        <h3 className="text-lg font-semibold text-red-400 mb-2">Danger Zone</h3>
        <p className="text-gray-400 text-sm mb-4">Once you delete your account, there is no going back.</p>
        <button className="border border-red-500/50 text-red-400 hover:bg-red-500/10 px-6 py-2 rounded-lg text-sm transition">
          Delete Account
        </button>
      </div>
    </div>
  )
}
