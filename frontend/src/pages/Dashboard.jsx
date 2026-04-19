import { useState, useEffect } from 'react'
import { useAuth } from '../context/AuthContext'
import { useNavigate } from 'react-router-dom'
import axios from 'axios'
import OTPInput from '../components/OTPInput'
import Footer from '../components/Footer'
import PricingCalculator from '../components/PricingCalculator'

const TABS = ['Dashboard', 'Proxy Generator', 'Payment History', 'Usage', 'Become an Affiliate', 'Account']

const NAV_LINKS = [
  { label: 'Home', href: '/' },
  { label: 'Contact Sales', href: '#' },
  { label: 'Pricing', href: '/#pricing' },
  { label: 'Integrations', href: '#' },
  { label: 'Use Cases', href: '#' },
  { label: 'Referral Program', href: '#' },
]

export default function Dashboard() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const [activeTab, setActiveTab] = useState('Dashboard')
  const [copied, setCopied] = useState('')
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

  const [proxyType, setProxyType] = useState('Residential')
  const [proxyCountry, setProxyCountry] = useState('US')
  const [proxyState, setProxyState] = useState('')
  const [proxyCity, setProxyCity] = useState('')
  const [proxyCount, setProxyCount] = useState(10)
  const [proxySticky, setProxySticky] = useState(false)
  const [proxies, setProxies] = useState([])
  const [proxyLoading, setProxyLoading] = useState(false)
  const [proxyError, setProxyError] = useState('')

  const generateProxies = async () => {
    setProxyLoading(true)
    setProxyError('')
    setProxies([])
    try {
      const token = localStorage.getItem('token')
      const params = new URLSearchParams({
        country: proxyCountry,
        count: proxyCount,
        type: proxyType.toLowerCase(),
        ...(proxyState && { state: proxyState }),
        ...(proxyCity  && { city:  proxyCity  }),
        ...(proxyType === 'Residential' && { sticky: proxySticky }),
      })
      const res = await axios.get(`/api/proxy/list?${params}`, {
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

  const bandwidthUsed = profile?.usage?.bandwidthUsed || 0
  const bandwidthGB = (bandwidthUsed / 1024).toFixed(2)
  const planName = profile?.activePlan === 'none' ? 'Free Trial' : (profile?.activePlan || 'Free Trial')

  return (
    <div className="min-h-screen bg-gray-950 text-white flex flex-col">

      {/* Top Navbar */}
      <nav className="border-b border-gray-800 bg-gray-950 px-6 py-3 flex items-center">
        {/* Logo — left */}
        <div className="flex-1">
          <h1 className="text-xl font-bold text-purple-400">ProxyToro</h1>
        </div>
        {/* Nav links — center */}
        <div className="hidden lg:flex items-center gap-6">
          {NAV_LINKS.map(link => (
            <a
              key={link.label}
              href={link.href}
              className="text-sm text-gray-400 hover:text-white transition whitespace-nowrap"
            >
              {link.label}
            </a>
          ))}
        </div>
        {/* Right side — right */}
        <div className="flex-1 flex items-center justify-end gap-4">
          <span className="text-gray-400 text-sm hidden sm:block">{user?.email}</span>
          {user?.role === 'admin' && (
            <button
              onClick={() => navigate('/admin')}
              className="text-sm bg-purple-600 hover:bg-purple-700 text-white px-3 py-1 rounded-lg transition"
            >
              Admin Panel
            </button>
          )}
          <button
            onClick={handleLogout}
            className="text-sm border border-gray-700 hover:border-gray-500 text-gray-300 hover:text-white px-3 py-1.5 rounded-lg transition flex items-center gap-1.5"
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-4 h-4">
              <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/>
              <polyline points="16 17 21 12 16 7"/>
              <line x1="21" y1="12" x2="9" y2="12"/>
            </svg>
            Logout
          </button>
        </div>
      </nav>

      {/* Tab Bar */}
      <div className="border-b border-gray-800 bg-gray-950 px-6">
        <div className="flex gap-1 overflow-x-auto justify-center">
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

      {/* Email verification warning */}
      {profile && !profile.isVerified && (
        <div className="bg-yellow-500/10 border-b border-yellow-500/30 px-6 py-3 text-yellow-400 text-sm text-center">
          Your email is not verified. Check your inbox and click the verification link.
        </div>
      )}

      {/* Page Content */}
      <div className="flex-1 max-w-6xl mx-auto w-full px-4 sm:px-6 py-6 sm:py-8">

        {/* ── DASHBOARD (Overview) ── */}
        {activeTab === 'Dashboard' && (
          <div className="space-y-6">
            <div>
              <h2 className="text-2xl font-bold mb-1">Dashboard</h2>
              <p className="text-gray-400 text-sm">Welcome to your proxy service dashboard</p>
            </div>

            {/* 4 Stat Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">

              {/* Total Usage */}
              <div className="bg-gray-900 border border-gray-800 rounded-xl p-5">
                <div className="flex items-center justify-between mb-3">
                  <p className="text-gray-400 text-xs font-medium uppercase tracking-wide">Total Usage</p>
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-4 h-4 text-gray-500">
                    <polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/>
                  </svg>
                </div>
                <p className="text-2xl font-bold">{bandwidthGB} GB</p>
                <p className="text-xs text-gray-500 mt-1">{bandwidthUsed} MB used</p>
              </div>

              {/* Active Plan */}
              <div className="bg-gray-900 border border-gray-800 rounded-xl p-5">
                <div className="flex items-center justify-between mb-3">
                  <p className="text-gray-400 text-xs font-medium uppercase tracking-wide">Active Plan</p>
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-4 h-4 text-gray-500">
                    <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/>
                    <polyline points="15 3 21 3 21 9"/>
                    <line x1="10" y1="14" x2="21" y2="3"/>
                  </svg>
                </div>
                <p className="text-2xl font-bold text-purple-400 capitalize">{planName}</p>
                <p className="text-xs text-gray-500 mt-1">{profile?.usage?.proxiesGenerated || 0} proxies generated</p>
              </div>

              {/* Quick Actions */}
              <div className="bg-gray-900 border border-gray-800 rounded-xl p-5 flex flex-col justify-between">
                <p className="text-gray-400 text-xs font-medium uppercase tracking-wide mb-3">Quick Actions</p>
                <button
                  onClick={() => setActiveTab('Proxy Generator')}
                  className="flex items-center justify-center gap-2 w-full border border-gray-700 hover:border-purple-500 hover:text-purple-400 text-white text-sm font-medium py-2.5 rounded-lg transition"
                >
                  Generate Proxies
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-4 h-4">
                    <line x1="5" y1="12" x2="19" y2="12"/>
                    <polyline points="12 5 19 12 12 19"/>
                  </svg>
                </button>
              </div>

              {/* Renewal Date */}
              <div className="bg-gray-900 border border-gray-800 rounded-xl p-5">
                <div className="flex items-center justify-between mb-3">
                  <p className="text-gray-400 text-xs font-medium uppercase tracking-wide">Renewal Date</p>
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-4 h-4 text-gray-500">
                    <circle cx="12" cy="12" r="10"/>
                    <polyline points="12 6 12 12 16 14"/>
                  </svg>
                </div>
                <p className="text-2xl font-bold">—</p>
                <p className="text-xs text-gray-500 mt-1">Next billing cycle</p>
              </div>

            </div>

            {/* Recent Activity + Subscription Status */}
            <div className="grid grid-cols-1 lg:grid-cols-5 gap-4">

              {/* Recent Activity */}
              <div className="lg:col-span-3 bg-gray-900 border border-gray-800 rounded-xl p-6">
                <h3 className="font-semibold mb-1">Recent Activity</h3>
                <p className="text-gray-500 text-xs mb-5">Your recent proxy usage and generations</p>
                <div className="space-y-3">
                  {profile?.usage?.proxiesGenerated > 0 ? (
                    <div className="flex items-center justify-between py-3 border-b border-gray-800">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-green-500/10 flex items-center justify-center shrink-0">
                          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="w-4 h-4 text-green-400">
                            <polyline points="20 6 9 17 4 12"/>
                          </svg>
                        </div>
                        <div>
                          <p className="text-sm font-medium">Proxy Generated</p>
                          <p className="text-xs text-gray-500">Recently</p>
                        </div>
                      </div>
                      <span className="text-sm text-gray-400">{profile.usage.proxiesGenerated} proxies</span>
                    </div>
                  ) : (
                    <p className="text-gray-500 text-sm py-6 text-center">No activity yet. Generate your first proxies!</p>
                  )}
                </div>
              </div>

              {/* Subscription Status */}
              <div className="lg:col-span-2 bg-gray-900 border border-gray-800 rounded-xl p-6">
                <h3 className="font-semibold mb-1">Subscription Status</h3>
                <p className="text-gray-500 text-xs mb-5">Manage your subscription and billing</p>
                <div className="space-y-3 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-400">Plan</span>
                    <span className="font-medium capitalize">{planName}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Status</span>
                    <span className="text-green-400 font-medium">Active</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Renewal Date</span>
                    <span className="font-medium">—</span>
                  </div>
                  <div className="pt-2">
                    <div className="flex justify-between text-xs text-gray-500 mb-1.5">
                      <span>Usage</span>
                      <span>{bandwidthGB} GB</span>
                    </div>
                    <div className="w-full bg-gray-800 rounded-full h-2">
                      <div
                        className="bg-purple-500 h-2 rounded-full transition-all"
                        style={{ width: `${Math.min((bandwidthUsed / (50 * 1024)) * 100, 100).toFixed(1)}%` }}
                      />
                    </div>
                  </div>
                </div>
                <button
                  onClick={() => setActiveTab('Payment History')}
                  className="mt-5 w-full border border-gray-700 hover:border-purple-500 text-sm text-gray-300 hover:text-white py-2.5 rounded-lg transition font-medium"
                >
                  Manage Subscription
                </button>
              </div>

            </div>

            {/* Credentials */}
            <div className="bg-gray-900 border border-gray-800 rounded-xl p-6">
              <h3 className="font-semibold mb-4 text-purple-400">Your Proxy Credentials</h3>
              <div className="space-y-3">
                {[
                  { label: 'Proxy Username', value: profile?.proxyUsername || user?.proxyUsername },
                  { label: 'Proxy Password', value: profile?.proxyPassword },
                  { label: 'Email', value: user?.email },
                  { label: 'Role', value: user?.role },
                ].map(({ label, value }) => (
                  <div key={label} className="flex justify-between items-center bg-gray-800 rounded-lg px-4 py-3">
                    <span className="text-gray-400 text-sm">{label}</span>
                    <div className="flex items-center gap-3">
                      <span className="font-mono text-white text-sm">{value}</span>
                      {(label === 'Proxy Username' || label === 'Proxy Password') && (
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
              <p className="text-gray-400 text-sm">Select your options and generate proxies.</p>
            </div>

            <div className="bg-gray-900 border border-gray-800 rounded-xl p-6 space-y-5">

              {/* Proxy Type */}
              <div>
                <label className="block text-sm text-gray-400 mb-2">Proxy Type</label>
                <div className="grid grid-cols-3 gap-3">
                  {['Residential', 'Datacenter', 'Mobile'].map(type => (
                    <button
                      key={type}
                      onClick={() => setProxyType(type)}
                      className={`rounded-lg py-3 text-sm transition border ${
                        proxyType === type
                          ? 'border-purple-500 text-white bg-purple-500/10'
                          : 'border-gray-700 text-gray-300 hover:border-purple-500 hover:text-white'
                      }`}
                    >
                      {type}
                    </button>
                  ))}
                </div>
              </div>

              {/* Credentials */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm text-gray-400 mb-2">Username</label>
                  <input
                    type="text"
                    value={profile?.proxyUsername || ''}
                    readOnly
                    className="w-full bg-gray-800 border border-gray-700 text-gray-300 rounded-lg px-4 py-3 font-mono text-sm cursor-default focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-sm text-gray-400 mb-2">Password</label>
                  <input
                    type="text"
                    value={profile?.proxyPassword || ''}
                    readOnly
                    className="w-full bg-gray-800 border border-gray-700 text-gray-300 rounded-lg px-4 py-3 font-mono text-sm cursor-default focus:outline-none"
                  />
                </div>
              </div>

              {/* Location */}
              <div>
                <label className="block text-sm text-gray-400 mb-2">Country</label>
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

              {/* State & City */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm text-gray-400 mb-2">State <span className="text-gray-600">(optional)</span></label>
                  <input
                    type="text"
                    value={proxyState}
                    onChange={e => setProxyState(e.target.value)}
                    placeholder="e.g. California"
                    className="w-full bg-gray-800 border border-gray-700 text-white rounded-lg px-4 py-3 focus:outline-none focus:border-purple-500"
                  />
                </div>
                <div>
                  <label className="block text-sm text-gray-400 mb-2">City <span className="text-gray-600">(optional)</span></label>
                  <input
                    type="text"
                    value={proxyCity}
                    onChange={e => setProxyCity(e.target.value)}
                    placeholder="e.g. Los Angeles"
                    className="w-full bg-gray-800 border border-gray-700 text-white rounded-lg px-4 py-3 focus:outline-none focus:border-purple-500"
                  />
                </div>
              </div>

              {/* Amount */}
              <div>
                <label className="block text-sm text-gray-400 mb-2">Amount <span className="text-gray-600">(max 1000)</span></label>
                <input
                  type="number"
                  value={proxyCount}
                  onChange={e => setProxyCount(e.target.value)}
                  min={1}
                  max={1000}
                  className="w-full bg-gray-800 border border-gray-700 text-white rounded-lg px-4 py-3 focus:outline-none focus:border-purple-500"
                />
              </div>

              {/* Sticky session */}
              {proxyType === 'Residential' && (
                <div className="flex items-center justify-between bg-gray-800 border border-gray-700 rounded-lg px-4 py-3">
                  <div>
                    <p className="text-sm text-white font-medium">Sticky Session</p>
                    <p className="text-xs text-gray-400 mt-0.5">Keep the same IP for the entire session</p>
                  </div>
                  <button
                    onClick={() => setProxySticky(v => !v)}
                    className={`relative w-11 h-6 rounded-full transition-colors duration-200 focus:outline-none ${
                      proxySticky ? 'bg-purple-600' : 'bg-gray-600'
                    }`}
                  >
                    <span className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform duration-200 ${
                      proxySticky ? 'translate-x-5' : 'translate-x-0'
                    }`} />
                  </button>
                </div>
              )}

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
            <div className="bg-gray-900 border border-gray-800 rounded-xl p-6">
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

        {/* ── PAYMENT HISTORY ── */}
        {activeTab === 'Payment History' && (
          <div className="space-y-6">
            <div>
              <h2 className="text-2xl font-bold mb-1">Plans & Billing</h2>
              <p className="text-gray-400 text-sm">Pick your proxy type and bandwidth — price updates instantly.</p>
            </div>

            <PricingCalculator
              showBuyButton
              onBuy={({ type, gb, total }) => {
                alert(`Redirecting to payment for ${gb} GB of ${type} proxies — $${total}\n\nPayment integration coming soon.`)
              }}
            />

            {/* Invoice history */}
            <div className="bg-gray-900 border border-gray-800 rounded-xl p-6">
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

        {/* ── USAGE ── */}
        {activeTab === 'Usage' && (
          <div className="space-y-6">
            <div>
              <h2 className="text-2xl font-bold mb-1">Usage</h2>
              <p className="text-gray-400 text-sm">Monitor your proxy usage and bandwidth consumption.</p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="bg-gray-900 border border-gray-800 rounded-xl p-5">
                <p className="text-gray-400 text-xs font-medium uppercase tracking-wide mb-3">Bandwidth Used</p>
                <p className="text-3xl font-bold">{bandwidthGB} <span className="text-lg text-gray-400">GB</span></p>
                <p className="text-xs text-gray-500 mt-1">{bandwidthUsed} MB total</p>
              </div>
              <div className="bg-gray-900 border border-gray-800 rounded-xl p-5">
                <p className="text-gray-400 text-xs font-medium uppercase tracking-wide mb-3">Proxies Generated</p>
                <p className="text-3xl font-bold">{profile?.usage?.proxiesGenerated || 0}</p>
                <p className="text-xs text-gray-500 mt-1">All time</p>
              </div>
              <div className="bg-gray-900 border border-gray-800 rounded-xl p-5">
                <p className="text-gray-400 text-xs font-medium uppercase tracking-wide mb-3">Active Plan</p>
                <p className="text-3xl font-bold text-purple-400 capitalize">{planName}</p>
                <p className="text-xs text-gray-500 mt-1">Current subscription</p>
              </div>
            </div>

            <div className="bg-gray-900 border border-gray-800 rounded-xl p-6">
              <h3 className="font-semibold mb-4">Bandwidth Overview</h3>
              <div className="space-y-3">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-400">Used</span>
                  <span>{bandwidthGB} GB</span>
                </div>
                <div className="w-full bg-gray-800 rounded-full h-3">
                  <div
                    className="bg-gradient-to-r from-purple-600 to-purple-400 h-3 rounded-full transition-all"
                    style={{ width: `${Math.min((bandwidthUsed / (50 * 1024)) * 100, 100).toFixed(1)}%` }}
                  />
                </div>
                <div className="flex justify-between text-xs text-gray-500">
                  <span>0 GB</span>
                  <span>50 GB (plan limit)</span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ── BECOME AN AFFILIATE ── */}
        {activeTab === 'Become an Affiliate' && (
          <div className="space-y-6">
            <div>
              <h2 className="text-2xl font-bold mb-1">Affiliate Program</h2>
              <p className="text-gray-400 text-sm">Earn commissions by referring new customers to ProxyToro.</p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">

              {/* Become an Affiliate */}
              <div className="bg-gray-900 border border-gray-800 rounded-xl p-6 flex flex-col justify-between gap-4">
                <div>
                  <div className="w-10 h-10 bg-purple-500/10 rounded-xl flex items-center justify-center mb-4">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-5 h-5 text-purple-400">
                      <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/>
                      <circle cx="9" cy="7" r="4"/>
                      <path d="M23 21v-2a4 4 0 0 0-3-3.87"/>
                      <path d="M16 3.13a4 4 0 0 1 0 7.75"/>
                    </svg>
                  </div>
                  <h3 className="text-lg font-semibold mb-2">Become an Affiliate</h3>
                  <p className="text-gray-400 text-sm leading-relaxed">
                    Earn commissions by referring new customers to ProxyToro. Our team will reach out with full details about your affiliate dashboard, referral links, and payment structure.
                  </p>
                </div>
                <a
                  href="mailto:affiliates@proxytoro.com"
                  className="inline-block text-center bg-purple-600 hover:bg-purple-700 text-white font-semibold px-5 py-2.5 rounded-lg text-sm transition"
                >
                  Become an Affiliate
                </a>
              </div>

              {/* Talk with Sales */}
              <div className="bg-gray-900 border border-gray-800 rounded-xl p-6 flex flex-col justify-between gap-4">
                <div>
                  <div className="w-10 h-10 bg-purple-500/10 rounded-xl flex items-center justify-center mb-4">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-5 h-5 text-purple-400">
                      <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
                    </svg>
                  </div>
                  <h3 className="text-lg font-semibold mb-2">Talk with Sales</h3>
                  <p className="text-gray-400 text-sm leading-relaxed">
                    Need a custom plan or have questions? Our sales team is ready to help you find the right solution for your business.
                  </p>
                </div>
                <a
                  href="mailto:sales@proxytoro.com"
                  className="inline-block text-center border border-purple-500 hover:bg-purple-500/10 text-purple-400 hover:text-white font-semibold px-5 py-2.5 rounded-lg text-sm transition"
                >
                  Talk with Sales
                </a>

                {/* Communication channels */}
                <div className="border-t border-gray-800 pt-4">
                  <p className="text-xs text-gray-500 mb-3">Reach us directly:</p>
                  <div className="flex items-center gap-4">
                    <a href="#" aria-label="Telegram" className="text-gray-400 hover:text-purple-400 transition">
                      <svg viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5">
                        <path d="M11.944 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0a12 12 0 0 0-.056 0zm4.962 7.224c.1-.002.321.023.465.14a.506.506 0 0 1 .171.325c.016.093.036.306.02.472-.18 1.898-.962 6.502-1.36 8.627-.168.9-.499 1.201-.82 1.23-.696.065-1.225-.46-1.9-.902-1.056-.693-1.653-1.124-2.678-1.8-1.185-.78-.417-1.21.258-1.91.177-.184 3.247-2.977 3.307-3.23.007-.032.014-.15-.056-.212s-.174-.041-.249-.024c-.106.024-1.793 1.14-5.061 3.345-.48.33-.913.49-1.302.48-.428-.008-1.252-.241-1.865-.44-.752-.245-1.349-.374-1.297-.789.027-.216.325-.437.893-.663 3.498-1.524 5.83-2.529 6.998-3.014 3.332-1.386 4.025-1.627 4.476-1.635z"/>
                      </svg>
                    </a>
                    <a href="#" aria-label="Discord" className="text-gray-400 hover:text-purple-400 transition">
                      <svg viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5">
                        <path d="M20.317 4.37a19.791 19.791 0 0 0-4.885-1.515.074.074 0 0 0-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 0 0-5.487 0 12.64 12.64 0 0 0-.617-1.25.077.077 0 0 0-.079-.037A19.736 19.736 0 0 0 3.677 4.37a.07.07 0 0 0-.032.027C.533 9.046-.32 13.58.099 18.057a.082.082 0 0 0 .031.057 19.9 19.9 0 0 0 5.993 3.03.078.078 0 0 0 .084-.028 14.09 14.09 0 0 0 1.226-1.994.076.076 0 0 0-.041-.106 13.107 13.107 0 0 1-1.872-.892.077.077 0 0 1-.008-.128 10.2 10.2 0 0 0 .372-.292.074.074 0 0 1 .077-.01c3.928 1.793 8.18 1.793 12.062 0a.074.074 0 0 1 .078.01c.12.098.246.198.373.292a.077.077 0 0 1-.006.127 12.299 12.299 0 0 1-1.873.892.077.077 0 0 0-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 0 0 .084.028 19.839 19.839 0 0 0 6.002-3.03.077.077 0 0 0 .032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 0 0-.031-.03zM8.02 15.33c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.956-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.956 2.418-2.157 2.418zm7.975 0c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.955-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.946 2.418-2.157 2.418z"/>
                      </svg>
                    </a>
                    <a href="mailto:sales@proxytoro.com" aria-label="Email" className="text-gray-400 hover:text-purple-400 transition">
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5">
                        <rect x="2" y="4" width="20" height="16" rx="2"/>
                        <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"/>
                      </svg>
                    </a>
                    <a href="tel:+1234567890" aria-label="Phone" className="text-gray-400 hover:text-purple-400 transition">
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5">
                        <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.69 12a19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 3.6 1.27h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L7.91 8.82a16 16 0 0 0 6.29 6.29l.82-.82a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 22 16.92z"/>
                      </svg>
                    </a>
                  </div>
                </div>
              </div>

            </div>
          </div>
        )}

        {/* ── ACCOUNT ── */}
        {activeTab === 'Account' && (
          <AccountTab user={user} profile={profile} />
        )}

      </div>

      <Footer />
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
        <p className="text-gray-400 text-sm">Manage your account details.</p>
      </div>

      {/* Change Password */}
      <div className="bg-gray-900 border border-gray-800 rounded-xl p-6 space-y-4">
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
      <div className="bg-gray-900 border border-gray-800 rounded-xl p-6">
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

      {/* 2FA Section */}
      <TwoFASection profile={profile} />

      {/* Danger Zone */}
      <div className="bg-gray-900 border border-red-900/30 rounded-xl p-6">
        <h3 className="text-lg font-semibold text-red-400 mb-2">Danger Zone</h3>
        <p className="text-gray-400 text-sm mb-4">Once you delete your account, there is no going back.</p>
        <button className="border border-red-500/50 text-red-400 hover:bg-red-500/10 px-6 py-2 rounded-lg text-sm transition">
          Delete Account
        </button>
      </div>
    </div>
  )
}

function TwoFASection({ profile }) {
  const [qrCode, setQrCode] = useState(null)
  const [code, setCode] = useState('')
  const [msg, setMsg] = useState('')
  const [loading, setLoading] = useState(false)
  const [step, setStep] = useState('idle')

  const token = localStorage.getItem('token')
  const headers = { Authorization: `Bearer ${token}` }

  const startSetup = async () => {
    setLoading(true)
    try {
      const res = await axios.post('/api/2fa/setup', {}, { headers })
      setQrCode(res.data.qrCode)
      setStep('setup')
    } catch (err) {
      setMsg({ type: 'error', text: 'Failed to start 2FA setup' })
    } finally {
      setLoading(false)
    }
  }

  const verifySetup = async () => {
    setLoading(true)
    try {
      await axios.post('/api/2fa/verify', { token: code }, { headers })
      setMsg({ type: 'success', text: '2FA enabled! You will need your authenticator app at next login.' })
      setStep('idle')
      setQrCode(null)
      setCode('')
    } catch (err) {
      setMsg({ type: 'error', text: err.response?.data?.message || 'Invalid code' })
    } finally {
      setLoading(false)
    }
  }

  const disable2FA = async () => {
    setLoading(true)
    try {
      await axios.post('/api/2fa/disable', { token: code }, { headers })
      setMsg({ type: 'success', text: '2FA disabled.' })
      setStep('idle')
      setCode('')
    } catch (err) {
      setMsg({ type: 'error', text: err.response?.data?.message || 'Invalid code' })
    } finally {
      setLoading(false)
    }
  }

  const is2FAEnabled = profile?.twoFactorEnabled

  return (
    <div className="bg-gray-900 border border-gray-800 rounded-xl p-6">
      <h3 className="text-lg font-semibold mb-1">Two-Factor Authentication</h3>
      <p className="text-gray-400 text-sm mb-4">
        {is2FAEnabled ? '2FA is currently enabled on your account.' : 'Add an extra layer of security to your account.'}
      </p>

      {msg && (
        <p className={`text-sm mb-4 ${msg.type === 'success' ? 'text-green-400' : 'text-red-400'}`}>
          {msg.text}
        </p>
      )}

      {step === 'setup' && qrCode && (
        <div className="space-y-4 mb-4">
          <p className="text-sm text-gray-400">
            1. Open <strong className="text-white">Google Authenticator</strong> on your phone<br />
            2. Tap <strong className="text-white">"+"</strong> → <strong className="text-white">"Scan QR code"</strong><br />
            3. Scan the QR code below<br />
            4. Enter the 6-digit code shown in the app
          </p>
          <img src={qrCode} alt="QR Code" className="w-48 h-48 rounded-xl" />
          <OTPInput value={code} onChange={setCode} onComplete={async (c) => {
            setCode(c)
            setLoading(true)
            try {
              await axios.post('/api/2fa/verify', { token: c }, { headers })
              setMsg({ type: 'success', text: '2FA enabled successfully!' })
              setStep('idle')
              setQrCode(null)
              setCode('')
            } catch (err) {
              setMsg({ type: 'error', text: err.response?.data?.message || 'Invalid code' })
            } finally {
              setLoading(false)
            }
          }} />
          <div className="flex gap-3">
            <button
              onClick={verifySetup}
              disabled={loading || code.length !== 6}
              className="bg-purple-600 hover:bg-purple-700 disabled:opacity-50 text-white font-semibold px-6 py-2 rounded-lg text-sm transition"
            >
              {loading ? 'Verifying...' : 'Enable 2FA'}
            </button>
            <button
              onClick={() => { setStep('idle'); setQrCode(null) }}
              className="text-gray-400 hover:text-white text-sm transition"
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {step === 'disable' && (
        <div className="space-y-4 mb-4">
          <p className="text-sm text-gray-400">Enter your current 2FA code to disable it.</p>
          <OTPInput value={code} onChange={setCode} onComplete={setCode} />
          <div className="flex gap-3">
            <button
              onClick={disable2FA}
              disabled={loading || code.length !== 6}
              className="border border-red-500/50 text-red-400 hover:bg-red-500/10 disabled:opacity-50 px-6 py-2 rounded-lg text-sm transition"
            >
              {loading ? 'Disabling...' : 'Disable 2FA'}
            </button>
            <button
              onClick={() => { setStep('idle'); setCode('') }}
              className="text-gray-400 hover:text-white text-sm transition"
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {step === 'idle' && (
        is2FAEnabled
          ? <button
              onClick={() => setStep('disable')}
              className="border border-red-500/50 text-red-400 hover:bg-red-500/10 px-6 py-2 rounded-lg text-sm transition"
            >
              Disable 2FA
            </button>
          : <button
              onClick={startSetup}
              disabled={loading}
              className="bg-purple-600 hover:bg-purple-700 disabled:opacity-50 text-white font-semibold px-6 py-2 rounded-lg text-sm transition"
            >
              {loading ? 'Loading...' : 'Enable 2FA'}
            </button>
      )}
    </div>
  )
}
