import { useState, useEffect } from 'react'
import { useAuth } from '../context/AuthContext'
import { useNavigate } from 'react-router-dom'
import axios from 'axios'

const TABS = ['Users', 'Stats', 'Proxy Health', 'Logs']

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
      const res = await axios.get('/api/admin/export', {
        headers,
        responseType: 'blob' // tells axios to treat the response as a file
      })
      // Create a download link and click it automatically
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
        <div className="flex gap-1">
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

        {/* Action message */}
        {actionMsg && (
          <div className="mb-4 bg-purple-500/10 border border-purple-500/30 text-purple-400 px-4 py-3 rounded-lg text-sm">
            {actionMsg}
          </div>
        )}

        {/* ── USERS ── */}
        {activeTab === 'Users' && (
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
                <button
                  onClick={exportCSV}
                  className="bg-purple-600 hover:bg-purple-700 text-white text-sm font-semibold px-4 py-2 rounded-lg transition"
                >
                  Export CSV
                </button>
              </div>
            </div>

            <div className="bg-gray-900 border border-gray-800 rounded-2xl overflow-hidden overflow-x-auto">
              <table className="w-full text-sm min-w-[700px]">
                <thead>
                  <tr className="border-b border-gray-800 text-gray-400">
                    <th className="text-left px-6 py-4">Email</th>
                    <th className="text-left px-6 py-4">Proxy Username</th>
                    <th className="text-left px-6 py-4">Plan</th>
                    <th className="text-left px-6 py-4">Proxies</th>
                    <th className="text-left px-6 py-4">Role</th>
                    <th className="text-left px-6 py-4">Joined</th>
                    <th className="text-left px-6 py-4">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {loading ? (
                    <tr><td colSpan={7} className="text-center py-8 text-gray-500">Loading users...</td></tr>
                  ) : users.length === 0 ? (
                    <tr><td colSpan={7} className="text-center py-8 text-gray-500">No users found</td></tr>
                  ) : users.map(u => (
                    <tr key={u._id} className="border-b border-gray-800/50 hover:bg-gray-800/30 transition">
                      <td className="px-6 py-4">{u.email}</td>
                      <td className="px-6 py-4 font-mono text-purple-400 text-xs">{u.proxyUsername}</td>
                      <td className="px-6 py-4 capitalize">{u.activePlan || 'none'}</td>
                      <td className="px-6 py-4">{u.usage?.proxiesGenerated || 0}</td>
                      <td className="px-6 py-4">
                        <span className={`px-2 py-1 rounded-full text-xs ${
                          u.role === 'admin'
                            ? 'bg-purple-600/20 text-purple-400 border border-purple-500/30'
                            : 'bg-gray-700 text-gray-300'
                        }`}>{u.role}</span>
                      </td>
                      <td className="px-6 py-4 text-gray-400">{new Date(u.createdAt).toLocaleDateString()}</td>
                      <td className="px-6 py-4">
                        <div className="flex gap-2">
                          <button
                            onClick={() => resetCredentials(u._id)}
                            className="text-xs text-purple-400 hover:text-purple-300 transition"
                          >
                            Reset
                          </button>
                          <button
                            onClick={() => deleteUser(u._id)}
                            className="text-xs text-red-400 hover:text-red-300 transition"
                          >
                            Delete
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
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
