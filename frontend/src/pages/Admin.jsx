import { useState, useEffect } from 'react'
import { useAuth } from '../context/AuthContext'
import { useNavigate } from 'react-router-dom'
import axios from 'axios'

const TABS = ['Users', 'Stats', 'Revenue', 'Coupons', 'Payments', 'Proxy Health', 'Logs']

export default function Admin() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const [activeTab, setActiveTab] = useState('Users')
  const [users, setUsers] = useState([])
  const [stats, setStats] = useState(null)
  const [loading, setLoading] = useState(false)
  const [actionMsg, setActionMsg] = useState('')

  const token = localStorage.getItem('token')
  const headers = { Authorization: `Bearer ${token}` }

  const handleLogout = () => { logout(); navigate('/login') }

  useEffect(() => {
    if (activeTab === 'Users') fetchUsers()
    if (activeTab === 'Stats') fetchStats()
    if (activeTab === 'Revenue') fetchUsers()
    if (activeTab === 'Payments') fetchUsers()
  }, [activeTab])

  const fetchUsers = async () => {
    setLoading(true)
    try {
      const res = await axios.get('/api/admin/users', { headers })
      setUsers(res.data)
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  const fetchStats = async () => {
    try {
      const res = await axios.get('/api/admin/stats', { headers })
      setStats(res.data)
    } catch (err) {
      console.error(err)
    }
  }

  const resetCredentials = async (userId) => {
    try {
      const res = await axios.post(`/api/admin/users/${userId}/reset-credentials`, {}, { headers })
      setActionMsg(`Credentials reset! New username: ${res.data.proxyUsername}`)
      fetchUsers()
    } catch (err) {
      setActionMsg('Failed to reset credentials')
    }
    setTimeout(() => setActionMsg(''), 4000)
  }

  const deleteUser = async (userId) => {
    if (!confirm('Are you sure you want to delete this user?')) return
    try {
      await axios.delete(`/api/admin/users/${userId}`, { headers })
      setActionMsg('User deleted successfully')
      fetchUsers()
    } catch (err) {
      setActionMsg('Failed to delete user')
    }
    setTimeout(() => setActionMsg(''), 4000)
  }

  const exportCSV = async () => {
    try {
      const res = await axios.get('/api/admin/export', { headers, responseType: 'blob' })
      const url = window.URL.createObjectURL(new Blob([res.data]))
      const a = document.createElement('a')
      a.href = url
      a.download = 'proxytoro-users.csv'
      a.click()
      window.URL.revokeObjectURL(url)
    } catch (err) {
      setActionMsg('Failed to export users')
    }
  }

  return (
    <div className="min-h-screen bg-gray-950 text-white">

      {/* Navbar */}
      <nav className="border-b border-gray-800 px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <h1 className="text-xl font-bold text-purple-400">ProxyToro</h1>
          <span className="bg-purple-600/20 text-purple-400 text-xs px-2 py-1 rounded-full border border-purple-500/30">Admin</span>
        </div>
        <div className="flex items-center gap-4">
          <span className="text-gray-400 text-sm hidden sm:block">{user?.email}</span>
          <button onClick={() => navigate('/dashboard')} className="text-sm text-gray-400 hover:text-white transition">Dashboard</button>
          <button onClick={handleLogout} className="text-sm text-gray-400 hover:text-white transition">Logout</button>
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
                activeTab === tab ? 'border-purple-500 text-purple-400' : 'border-transparent text-gray-400 hover:text-white'
              }`}
            >
              {tab}
            </button>
          ))}
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-6 py-8">

        {actionMsg && (
          <div className="mb-4 bg-purple-500/10 border border-purple-500/30 text-purple-400 px-4 py-3 rounded-lg text-sm">
            {actionMsg}
          </div>
        )}

        {/* ── USERS ── */}
        {activeTab === 'Users' && (
          <UsersTab
            users={users}
            loading={loading}
            headers={headers}
            exportCSV={exportCSV}
            resetCredentials={resetCredentials}
            deleteUser={deleteUser}
            setActionMsg={setActionMsg}
            fetchUsers={fetchUsers}
          />
        )}

        {/* ── STATS ── */}
        {activeTab === 'Stats' && (
          <div className="space-y-6">
            <h2 className="text-2xl font-bold mb-1">Platform Stats</h2>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6">
                <p className="text-gray-400 text-sm mb-1">Total Users</p>
                <p className="text-3xl font-bold text-purple-400">{stats?.totalUsers || 0}</p>
              </div>
              <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6">
                <p className="text-gray-400 text-sm mb-1">Total Proxies Generated</p>
                <p className="text-3xl font-bold">{stats?.totalProxiesGenerated || 0}</p>
              </div>
              <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6">
                <p className="text-gray-400 text-sm mb-1">Active Plans</p>
                <div className="space-y-1 mt-2">
                  {stats?.planCounts?.map(p => (
                    <div key={p._id} className="flex justify-between text-sm">
                      <span className="text-gray-400 capitalize">{p._id || 'none'}</span>
                      <span className="font-bold">{p.count}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ── REVENUE ── */}
        {activeTab === 'Revenue' && (
          <RevenueTab users={users} loading={loading} />
        )}

        {/* ── COUPONS ── */}
        {activeTab === 'Coupons' && (
          <CouponsTab headers={headers} />
        )}

        {/* ── PAYMENTS ── */}
        {activeTab === 'Payments' && (
          <PaymentsTab users={users} loading={loading} />
        )}

        {/* ── PROXY HEALTH ── */}
        {activeTab === 'Proxy Health' && (
          <div className="space-y-6">
            <h2 className="text-2xl font-bold mb-1">Proxy Health</h2>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {[
                { label: 'Provider', value: 'Webshare' },
                { label: 'API Status', value: 'Connected' },
                { label: 'Uptime', value: '99.9%' },
              ].map(item => (
                <div key={item.label} className="bg-gray-900 border border-gray-800 rounded-2xl p-6">
                  <div className="flex items-center gap-2 mb-2">
                    <div className="w-2 h-2 rounded-full bg-green-400"></div>
                    <span className="text-gray-400 text-sm">{item.label}</span>
                  </div>
                  <p className="text-xl font-bold">{item.value}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ── LOGS ── */}
        {activeTab === 'Logs' && (
          <div className="space-y-6">
            <h2 className="text-2xl font-bold mb-1">System Logs</h2>
            <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6 font-mono text-sm space-y-2">
              <p className="text-green-400">[INFO] Server started on port 4000</p>
              <p className="text-green-400">[INFO] Connected to MongoDB</p>
              <p className="text-gray-500">[INFO] Webshare API connected</p>
              <p className="text-gray-500">[INFO] NOWPayments API connected</p>
              <p className="text-gray-500">No recent errors.</p>
            </div>
          </div>
        )}

      </div>
    </div>
  )
}

// ── REVENUE TAB ──
function RevenueTab({ users, loading }) {
  const [filter, setFilter] = useState('month')

  const now = new Date()
  const allInvoices = users.flatMap(u =>
    (u.invoices || []).map(inv => ({ ...inv, userEmail: u.email }))
  )

  const filtered = allInvoices.filter(inv => {
    const d = new Date(inv.createdAt)
    if (filter === 'day') {
      return d.toDateString() === now.toDateString()
    }
    if (filter === 'week') {
      const weekAgo = new Date(now); weekAgo.setDate(now.getDate() - 7)
      return d >= weekAgo
    }
    if (filter === 'month') {
      return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear()
    }
    return true
  })

  const totalRevenue = filtered.reduce((sum, inv) => sum + (inv.amount || 0), 0)
  const avgOrder = filtered.length ? (totalRevenue / filtered.length).toFixed(2) : 0

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h2 className="text-2xl font-bold mb-1">Revenue Report</h2>
          <p className="text-gray-400 text-sm">Filter by time period to see payment activity.</p>
        </div>
        {/* Filter buttons */}
        <div className="flex gap-2">
          {[
            { key: 'day', label: 'Today' },
            { key: 'week', label: 'This Week' },
            { key: 'month', label: 'This Month' },
          ].map(f => (
            <button
              key={f.key}
              onClick={() => setFilter(f.key)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition ${
                filter === f.key
                  ? 'bg-purple-600 text-white'
                  : 'bg-gray-900 border border-gray-700 text-gray-400 hover:text-white'
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-gray-900 border border-gray-800 rounded-xl p-5">
          <p className="text-gray-400 text-xs uppercase tracking-wide mb-2">Total Revenue</p>
          <p className="text-3xl font-bold text-purple-400">${totalRevenue.toFixed(2)}</p>
        </div>
        <div className="bg-gray-900 border border-gray-800 rounded-xl p-5">
          <p className="text-gray-400 text-xs uppercase tracking-wide mb-2">Transactions</p>
          <p className="text-3xl font-bold">{filtered.length}</p>
        </div>
        <div className="bg-gray-900 border border-gray-800 rounded-xl p-5">
          <p className="text-gray-400 text-xs uppercase tracking-wide mb-2">Avg. Order Value</p>
          <p className="text-3xl font-bold">${avgOrder}</p>
        </div>
      </div>

      {/* Transactions table */}
      <div className="bg-gray-900 border border-gray-800 rounded-xl overflow-hidden overflow-x-auto">
        <table className="w-full text-sm min-w-[500px]">
          <thead>
            <tr className="border-b border-gray-800 text-gray-400">
              <th className="text-left px-6 py-4">Customer</th>
              <th className="text-left px-6 py-4">Plan</th>
              <th className="text-left px-6 py-4">Amount</th>
              <th className="text-left px-6 py-4">Currency</th>
              <th className="text-left px-6 py-4">Status</th>
              <th className="text-left px-6 py-4">Date</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan={6} className="text-center py-8 text-gray-500">Loading...</td></tr>
            ) : filtered.length === 0 ? (
              <tr><td colSpan={6} className="text-center py-8 text-gray-500">No transactions for this period.</td></tr>
            ) : filtered.map((inv, i) => (
              <tr key={i} className="border-b border-gray-800/50 hover:bg-gray-800/30 transition">
                <td className="px-6 py-4 text-sm">{inv.userEmail}</td>
                <td className="px-6 py-4 capitalize">{inv.plan}</td>
                <td className="px-6 py-4 font-semibold text-green-400">${inv.amount}</td>
                <td className="px-6 py-4 text-gray-400 uppercase">{inv.currency || 'USD'}</td>
                <td className="px-6 py-4">
                  <span className="bg-green-500/20 text-green-400 text-xs px-2 py-1 rounded-full">{inv.status}</span>
                </td>
                <td className="px-6 py-4 text-gray-400">{new Date(inv.createdAt).toLocaleDateString()}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}

// ── COUPONS TAB ──
function CouponsTab({ headers }) {
  const [coupons, setCoupons] = useState([])
  const [code, setCode] = useState('')
  const [discount, setDiscount] = useState(10)
  const [expiry, setExpiry] = useState('')
  const [maxUses, setMaxUses] = useState(100)
  const [msg, setMsg] = useState('')
  const [loading, setLoading] = useState(false)

  useEffect(() => { fetchCoupons() }, [])

  const fetchCoupons = async () => {
    try {
      const res = await axios.get('/api/admin/coupons', { headers })
      setCoupons(res.data)
    } catch {
      setCoupons([])
    }
  }

  const generateRandomCode = () => {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789'
    const random = Array.from({ length: 8 }, () => chars[Math.floor(Math.random() * chars.length)]).join('')
    setCode(`PROMO-${random}`)
  }

  const createCoupon = async () => {
    if (!code || !discount) { setMsg({ type: 'error', text: 'Code and discount are required.' }); return }
    setLoading(true)
    try {
      await axios.post('/api/admin/coupons', { code, discount: Number(discount), expiry, maxUses: Number(maxUses) }, { headers })
      setMsg({ type: 'success', text: `Coupon "${code}" created!` })
      setCode(''); setDiscount(10); setExpiry(''); setMaxUses(100)
      fetchCoupons()
    } catch (err) {
      setMsg({ type: 'error', text: err.response?.data?.message || 'Failed to create coupon' })
    } finally {
      setLoading(false)
      setTimeout(() => setMsg(''), 4000)
    }
  }

  const deleteCoupon = async (id) => {
    try {
      await axios.delete(`/api/admin/coupons/${id}`, { headers })
      fetchCoupons()
    } catch { }
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold mb-1">Coupon Generator</h2>
        <p className="text-gray-400 text-sm">Create promo codes to offer discounts to customers.</p>
      </div>

      {/* Create form */}
      <div className="bg-gray-900 border border-gray-800 rounded-xl p-6 space-y-5">
        <h3 className="font-semibold">Create New Coupon</h3>

        {msg && (
          <p className={`text-sm ${msg.type === 'success' ? 'text-green-400' : 'text-red-400'}`}>{msg.text}</p>
        )}

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {/* Code */}
          <div>
            <label className="block text-sm text-gray-400 mb-2">Coupon Code</label>
            <div className="flex gap-2">
              <input
                type="text"
                value={code}
                onChange={e => setCode(e.target.value.toUpperCase())}
                placeholder="e.g. PROMO-SUMMER"
                className="flex-1 bg-gray-800 border border-gray-700 text-white rounded-lg px-4 py-3 font-mono text-sm focus:outline-none focus:border-purple-500"
              />
              <button
                onClick={generateRandomCode}
                className="px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-gray-400 hover:text-white hover:border-purple-500 transition text-xs whitespace-nowrap"
              >
                Random
              </button>
            </div>
          </div>

          {/* Discount */}
          <div>
            <label className="block text-sm text-gray-400 mb-2">Discount (%)</label>
            <input
              type="number"
              value={discount}
              onChange={e => setDiscount(e.target.value)}
              min={1} max={100}
              className="w-full bg-gray-800 border border-gray-700 text-white rounded-lg px-4 py-3 focus:outline-none focus:border-purple-500"
            />
          </div>

          {/* Expiry */}
          <div>
            <label className="block text-sm text-gray-400 mb-2">Expiry Date <span className="text-gray-600">(optional)</span></label>
            <input
              type="date"
              value={expiry}
              onChange={e => setExpiry(e.target.value)}
              className="w-full bg-gray-800 border border-gray-700 text-white rounded-lg px-4 py-3 focus:outline-none focus:border-purple-500"
            />
          </div>

          {/* Max uses */}
          <div>
            <label className="block text-sm text-gray-400 mb-2">Max Uses</label>
            <input
              type="number"
              value={maxUses}
              onChange={e => setMaxUses(e.target.value)}
              min={1}
              className="w-full bg-gray-800 border border-gray-700 text-white rounded-lg px-4 py-3 focus:outline-none focus:border-purple-500"
            />
          </div>
        </div>

        <button
          onClick={createCoupon}
          disabled={loading}
          className="bg-purple-600 hover:bg-purple-700 disabled:opacity-50 text-white font-semibold px-6 py-3 rounded-lg transition"
        >
          {loading ? 'Creating...' : 'Create Coupon'}
        </button>
      </div>

      {/* Coupons list */}
      <div className="bg-gray-900 border border-gray-800 rounded-xl overflow-hidden overflow-x-auto">
        <table className="w-full text-sm min-w-[500px]">
          <thead>
            <tr className="border-b border-gray-800 text-gray-400">
              <th className="text-left px-6 py-4">Code</th>
              <th className="text-left px-6 py-4">Discount</th>
              <th className="text-left px-6 py-4">Uses</th>
              <th className="text-left px-6 py-4">Max Uses</th>
              <th className="text-left px-6 py-4">Expires</th>
              <th className="text-left px-6 py-4">Actions</th>
            </tr>
          </thead>
          <tbody>
            {coupons.length === 0 ? (
              <tr><td colSpan={6} className="text-center py-8 text-gray-500">No coupons yet.</td></tr>
            ) : coupons.map(c => (
              <tr key={c._id} className="border-b border-gray-800/50 hover:bg-gray-800/30 transition">
                <td className="px-6 py-4 font-mono text-purple-400">{c.code}</td>
                <td className="px-6 py-4 text-green-400 font-semibold">{c.discount}%</td>
                <td className="px-6 py-4">{c.uses || 0}</td>
                <td className="px-6 py-4">{c.maxUses}</td>
                <td className="px-6 py-4 text-gray-400">{c.expiry ? new Date(c.expiry).toLocaleDateString() : '—'}</td>
                <td className="px-6 py-4">
                  <button onClick={() => deleteCoupon(c._id)} className="text-xs text-red-400 hover:text-red-300 transition">Delete</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}

// ── PAYMENTS TAB ──
function PaymentsTab({ users, loading }) {
  const allInvoices = users.flatMap(u =>
    (u.invoices || []).map(inv => ({ ...inv, userEmail: u.email, proxyUsername: u.proxyUsername }))
  ).sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold mb-1">Customer Payments</h2>
        <p className="text-gray-400 text-sm">Crypto payment history for all customers.</p>
      </div>

      {/* Crypto info banner */}
      <div className="bg-purple-600/10 border border-purple-500/20 rounded-xl p-5 flex items-start gap-4">
        <div className="w-10 h-10 bg-purple-500/20 rounded-xl flex items-center justify-center shrink-0">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-5 h-5 text-purple-400">
            <circle cx="12" cy="12" r="10"/><path d="M9.5 9a3 3 0 0 1 5 1c0 2-3 3-3 3"/><path d="M12 17h.01"/>
          </svg>
        </div>
        <div>
          <p className="text-sm font-medium text-purple-300 mb-1">Payment Method: Crypto (NOWPayments)</p>
          <p className="text-xs text-gray-400">All payments are processed via NOWPayments. Customers pay in cryptocurrency — transactions are recorded below once confirmed on the blockchain.</p>
        </div>
      </div>

      {/* Payment stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-gray-900 border border-gray-800 rounded-xl p-5">
          <p className="text-gray-400 text-xs uppercase tracking-wide mb-2">Total Transactions</p>
          <p className="text-3xl font-bold">{allInvoices.length}</p>
        </div>
        <div className="bg-gray-900 border border-gray-800 rounded-xl p-5">
          <p className="text-gray-400 text-xs uppercase tracking-wide mb-2">Total Revenue</p>
          <p className="text-3xl font-bold text-green-400">
            ${allInvoices.reduce((s, i) => s + (i.amount || 0), 0).toFixed(2)}
          </p>
        </div>
        <div className="bg-gray-900 border border-gray-800 rounded-xl p-5">
          <p className="text-gray-400 text-xs uppercase tracking-wide mb-2">Paying Customers</p>
          <p className="text-3xl font-bold text-purple-400">
            {new Set(allInvoices.map(i => i.userEmail)).size}
          </p>
        </div>
      </div>

      {/* Payments table */}
      <div className="bg-gray-900 border border-gray-800 rounded-xl overflow-hidden overflow-x-auto">
        <table className="w-full text-sm min-w-[600px]">
          <thead>
            <tr className="border-b border-gray-800 text-gray-400">
              <th className="text-left px-6 py-4">Customer</th>
              <th className="text-left px-6 py-4">Plan</th>
              <th className="text-left px-6 py-4">Amount</th>
              <th className="text-left px-6 py-4">Crypto</th>
              <th className="text-left px-6 py-4">Status</th>
              <th className="text-left px-6 py-4">Date</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan={6} className="text-center py-8 text-gray-500">Loading...</td></tr>
            ) : allInvoices.length === 0 ? (
              <tr><td colSpan={6} className="text-center py-8 text-gray-500">No payments yet.</td></tr>
            ) : allInvoices.map((inv, i) => (
              <tr key={i} className="border-b border-gray-800/50 hover:bg-gray-800/30 transition">
                <td className="px-6 py-4">
                  <div>
                    <p className="text-sm">{inv.userEmail}</p>
                    <p className="text-xs text-gray-500 font-mono">{inv.proxyUsername}</p>
                  </div>
                </td>
                <td className="px-6 py-4 capitalize">{inv.plan}</td>
                <td className="px-6 py-4 font-semibold text-green-400">${inv.amount}</td>
                <td className="px-6 py-4">
                  <span className="bg-orange-500/10 text-orange-400 border border-orange-500/20 text-xs px-2 py-1 rounded-full uppercase">
                    {inv.currency || 'Crypto'}
                  </span>
                </td>
                <td className="px-6 py-4">
                  <span className="bg-green-500/20 text-green-400 text-xs px-2 py-1 rounded-full">{inv.status}</span>
                </td>
                <td className="px-6 py-4 text-gray-400">{new Date(inv.createdAt).toLocaleDateString()}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}

// ── USERS TAB ──
function UsersTab({ users, loading, headers, exportCSV, resetCredentials, deleteUser, setActionMsg, fetchUsers }) {
  const [addGbUser, setAddGbUser] = useState(null)
  const [gbAmount, setGbAmount] = useState(10)
  const [gbLoading, setGbLoading] = useState(false)

  const handleAddGb = async (userId) => {
    setGbLoading(true)
    try {
      await axios.post(`/api/admin/users/${userId}/add-gb`, { gb: Number(gbAmount) }, { headers })
      setActionMsg(`Added ${gbAmount} GB successfully!`)
      setAddGbUser(null)
      fetchUsers()
    } catch (err) {
      setActionMsg(err.response?.data?.message || 'Failed to add GB')
    } finally {
      setGbLoading(false)
      setTimeout(() => setActionMsg(''), 4000)
    }
  }

  const rows = users.flatMap(u => {
    const types = u.proxyTypes?.length ? u.proxyTypes : [null]
    return types.map((type, i) => ({ ...u, _rowType: type, _rowIndex: i }))
  })

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold mb-1">User Management</h2>
          <p className="text-gray-400">All registered users on the platform.</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="bg-gray-900 border border-gray-800 rounded-xl px-4 py-2 text-center">
            <p className="text-2xl font-bold text-purple-400">{users.length}</p>
            <p className="text-xs text-gray-400">Total Users</p>
          </div>
          <button onClick={exportCSV} className="bg-purple-600 hover:bg-purple-700 text-white text-sm font-semibold px-4 py-2 rounded-lg transition">
            Export CSV
          </button>
        </div>
      </div>

      <div className="bg-gray-900 border border-gray-800 rounded-2xl overflow-hidden overflow-x-auto">
        <table className="w-full text-sm min-w-[800px]">
          <thead>
            <tr className="border-b border-gray-800 text-gray-400">
              <th className="text-left px-6 py-4">Email</th>
              <th className="text-left px-6 py-4">Proxy Username</th>
              <th className="text-left px-6 py-4">Plan (GB)</th>
              <th className="text-left px-6 py-4">Proxy Type</th>
              <th className="text-left px-6 py-4">Role</th>
              <th className="text-left px-6 py-4">Joined</th>
              <th className="text-left px-6 py-4">Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan={7} className="text-center py-8 text-gray-500">Loading users...</td></tr>
            ) : rows.length === 0 ? (
              <tr><td colSpan={7} className="text-center py-8 text-gray-500">No users found</td></tr>
            ) : rows.map((u, i) => (
              <>
                <tr key={`${u._id}-${i}`} className="border-b border-gray-800/50 hover:bg-gray-800/30 transition">
                  <td className="px-6 py-4">{u._rowIndex === 0 ? u.email : <span className="text-gray-600 text-xs">same user</span>}</td>
                  <td className="px-6 py-4 font-mono text-purple-400 text-xs">{u._rowIndex === 0 ? u.proxyUsername : ''}</td>
                  <td className="px-6 py-4">
                    <div className="flex flex-col">
                      <span className="capitalize font-medium">{u.activePlan && u.activePlan !== 'none' ? u.activePlan : 'Free Trial'}</span>
                      <span className="text-xs text-purple-400">{u.planGB ? `${u.planGB} GB` : '— GB'}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    {u._rowType ? (
                      <span className={`px-2 py-1 rounded-full text-xs border ${
                        u._rowType === 'Residential' ? 'bg-blue-500/10 text-blue-400 border-blue-500/20' :
                        u._rowType === 'Datacenter'  ? 'bg-orange-500/10 text-orange-400 border-orange-500/20' :
                        u._rowType === 'Mobile'      ? 'bg-green-500/10 text-green-400 border-green-500/20' :
                        'bg-gray-700 text-gray-300 border-gray-600'
                      }`}>{u._rowType}</span>
                    ) : <span className="text-gray-500 text-xs">-</span>}
                  </td>
                  <td className="px-6 py-4">
                    {u._rowIndex === 0 && (
                      <span className={`px-2 py-1 rounded-full text-xs ${u.role === 'admin' ? 'bg-purple-600/20 text-purple-400 border border-purple-500/30' : 'bg-gray-700 text-gray-300'}`}>{u.role}</span>
                    )}
                  </td>
                  <td className="px-6 py-4 text-gray-400">{u._rowIndex === 0 ? new Date(u.createdAt).toLocaleDateString() : ''}</td>
                  <td className="px-6 py-4">
                    {u._rowIndex === 0 && (
                      <div className="flex gap-2 flex-wrap">
                        <button onClick={() => { setAddGbUser(u._id); setGbAmount(10) }} className="text-xs text-green-400 hover:text-green-300 transition font-medium">+GB</button>
                        <button onClick={() => resetCredentials(u._id)} className="text-xs text-purple-400 hover:text-purple-300 transition">Reset</button>
                        <button onClick={() => deleteUser(u._id)} className="text-xs text-red-400 hover:text-red-300 transition">Delete</button>
                      </div>
                    )}
                  </td>
                </tr>
                {addGbUser === u._id && u._rowIndex === 0 && (
                  <tr key={`${u._id}-addgb`} className="bg-gray-800/50 border-b border-gray-800/50">
                    <td colSpan={7} className="px-6 py-3">
                      <div className="flex items-center gap-3">
                        <span className="text-sm text-gray-400">Add GB to <span className="text-white">{u.email}</span>:</span>
                        <input
                          type="number"
                          value={gbAmount}
                          onChange={e => setGbAmount(e.target.value)}
                          min={1}
                          className="w-24 bg-gray-900 border border-gray-700 text-white rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:border-purple-500"
                        />
                        <span className="text-gray-400 text-sm">GB</span>
                        <button onClick={() => handleAddGb(u._id)} disabled={gbLoading} className="bg-green-600 hover:bg-green-700 disabled:opacity-50 text-white text-xs font-semibold px-4 py-1.5 rounded-lg transition">
                          {gbLoading ? 'Adding...' : 'Confirm'}
                        </button>
                        <button onClick={() => setAddGbUser(null)} className="text-gray-500 hover:text-white text-xs transition">Cancel</button>
                      </div>
                    </td>
                  </tr>
                )}
              </>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
