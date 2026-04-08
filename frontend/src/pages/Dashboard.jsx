import { useState } from 'react'
import { useAuth } from '../context/AuthContext'
import { useNavigate } from 'react-router-dom'

const TABS = ['Overview', 'Proxy Generator', 'Billing', 'Account']

export default function Dashboard() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const [activeTab, setActiveTab] = useState('Overview')
  const [copied, setCopied] = useState('')

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
                <p className="text-xl font-bold text-purple-400">Free Trial</p>
              </div>
              <div className="bg-gray-900 border border-gray-800 rounded-2xl p-5">
                <p className="text-gray-400 text-sm mb-1">Bandwidth Used</p>
                <p className="text-xl font-bold">0 GB</p>
              </div>
              <div className="bg-gray-900 border border-gray-800 rounded-2xl p-5">
                <p className="text-gray-400 text-sm mb-1">Proxies Generated</p>
                <p className="text-xl font-bold">0</p>
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
                <select className="w-full bg-gray-800 border border-gray-700 text-white rounded-lg px-4 py-3 focus:outline-none focus:border-purple-500">
                  <option>United States</option>
                  <option>United Kingdom</option>
                  <option>Germany</option>
                  <option>France</option>
                  <option>Israel</option>
                  <option>Any</option>
                </select>
              </div>

              {/* Amount */}
              <div>
                <label className="block text-sm text-gray-400 mb-2">Amount</label>
                <input
                  type="number"
                  defaultValue={10}
                  min={1}
                  max={100}
                  className="w-full bg-gray-800 border border-gray-700 text-white rounded-lg px-4 py-3 focus:outline-none focus:border-purple-500"
                />
              </div>

              <button className="w-full bg-purple-600 hover:bg-purple-700 text-white font-semibold py-3 rounded-lg transition">
                Generate Proxies
              </button>
            </div>

            {/* Output placeholder */}
            <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-sm font-medium text-gray-400">Output</h3>
                <button className="text-xs text-purple-400 hover:text-purple-300">Copy All</button>
              </div>
              <div className="bg-gray-800 rounded-lg p-4 min-h-32 font-mono text-sm text-gray-500">
                Your proxies will appear here...
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
                { name: 'Starter', price: '$9', bandwidth: '10 GB', proxies: '100', color: 'gray' },
                { name: 'Pro', price: '$29', bandwidth: '50 GB', proxies: '500', color: 'purple', popular: true },
                { name: 'Business', price: '$79', bandwidth: '200 GB', proxies: 'Unlimited', color: 'gray' },
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
                  <button className={`w-full py-2 rounded-lg text-sm font-semibold transition ${
                    plan.popular
                      ? 'bg-purple-600 hover:bg-purple-700 text-white'
                      : 'border border-gray-700 hover:border-purple-500 text-gray-300'
                  }`}>
                    Get Started
                  </button>
                </div>
              ))}
            </div>

            {/* Invoice history */}
            <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6">
              <h3 className="text-lg font-semibold mb-4">Invoice History</h3>
              <p className="text-gray-500 text-sm">No invoices yet.</p>
            </div>
          </div>
        )}

        {/* ── ACCOUNT ── */}
        {activeTab === 'Account' && (
          <div className="space-y-6">
            <div>
              <h2 className="text-2xl font-bold mb-1">Account Settings</h2>
              <p className="text-gray-400">Manage your account details.</p>
            </div>

            <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6 space-y-4">
              <div>
                <label className="block text-sm text-gray-400 mb-2">Email</label>
                <input
                  type="email"
                  defaultValue={user?.email}
                  disabled
                  className="w-full bg-gray-800 border border-gray-700 text-gray-400 rounded-lg px-4 py-3 cursor-not-allowed"
                />
              </div>
              <div>
                <label className="block text-sm text-gray-400 mb-2">New Password</label>
                <input
                  type="password"
                  placeholder="Enter new password"
                  className="w-full bg-gray-800 border border-gray-700 text-white rounded-lg px-4 py-3 focus:outline-none focus:border-purple-500"
                />
              </div>
              <button className="bg-purple-600 hover:bg-purple-700 text-white font-semibold px-6 py-2 rounded-lg transition text-sm">
                Save Changes
              </button>
            </div>

            <div className="bg-gray-900 border border-red-900/30 rounded-2xl p-6">
              <h3 className="text-lg font-semibold text-red-400 mb-2">Danger Zone</h3>
              <p className="text-gray-400 text-sm mb-4">Once you delete your account, there is no going back.</p>
              <button className="border border-red-500/50 text-red-400 hover:bg-red-500/10 px-6 py-2 rounded-lg text-sm transition">
                Delete Account
              </button>
            </div>
          </div>
        )}

      </div>
    </div>
  )
}
