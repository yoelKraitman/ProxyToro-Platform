import { useState, useEffect } from 'react'
import { useAuth } from '../context/AuthContext'
import { useNavigate } from 'react-router-dom'
import axios from 'axios'

const TABS = ['Users', 'Plans', 'Proxy Health', 'Logs']

export default function Admin() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const [activeTab, setActiveTab] = useState('Users')
  const [users, setUsers] = useState([])
  const [loading, setLoading] = useState(false)

  const handleLogout = () => {
    logout()
    navigate('/login')
  }

  useEffect(() => {
    if (activeTab === 'Users') fetchUsers()
  }, [activeTab])

  const fetchUsers = async () => {
    setLoading(true)
    try {
      const token = localStorage.getItem('token')
      const res = await axios.get('/api/admin/users', {
        headers: { Authorization: `Bearer ${token}` }
      })
      setUsers(res.data)
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-950 text-white">

      {/* Navbar */}
      <nav className="border-b border-gray-800 px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <h1 className="text-xl font-bold text-purple-400">ProxyToro</h1>
          <span className="bg-purple-600/20 text-purple-400 text-xs px-2 py-1 rounded-full border border-purple-500/30">
            Admin
          </span>
        </div>
        <div className="flex items-center gap-4">
          <span className="text-gray-400 text-sm">{user?.email}</span>
          <button
            onClick={() => navigate('/dashboard')}
            className="text-sm text-gray-400 hover:text-white transition"
          >
            Dashboard
          </button>
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
        <div className="flex gap-1">
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

      <div className="max-w-6xl mx-auto px-6 py-8">

        {/* ── USERS ── */}
        {activeTab === 'Users' && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-bold mb-1">User Management</h2>
                <p className="text-gray-400">All registered users on the platform.</p>
              </div>
              <div className="bg-gray-900 border border-gray-800 rounded-xl px-4 py-2 text-center">
                <p className="text-2xl font-bold text-purple-400">{users.length}</p>
                <p className="text-xs text-gray-400">Total Users</p>
              </div>
            </div>

            <div className="bg-gray-900 border border-gray-800 rounded-2xl overflow-hidden">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-gray-800 text-gray-400">
                    <th className="text-left px-6 py-4">Email</th>
                    <th className="text-left px-6 py-4">Proxy Username</th>
                    <th className="text-left px-6 py-4">Role</th>
                    <th className="text-left px-6 py-4">Joined</th>
                  </tr>
                </thead>
                <tbody>
                  {loading ? (
                    <tr>
                      <td colSpan={4} className="text-center py-8 text-gray-500">
                        Loading users...
                      </td>
                    </tr>
                  ) : users.length === 0 ? (
                    <tr>
                      <td colSpan={4} className="text-center py-8 text-gray-500">
                        No users found
                      </td>
                    </tr>
                  ) : users.map(u => (
                    <tr key={u._id} className="border-b border-gray-800/50 hover:bg-gray-800/30 transition">
                      <td className="px-6 py-4">{u.email}</td>
                      <td className="px-6 py-4 font-mono text-purple-400">{u.proxyUsername}</td>
                      <td className="px-6 py-4">
                        <span className={`px-2 py-1 rounded-full text-xs ${
                          u.role === 'admin'
                            ? 'bg-purple-600/20 text-purple-400 border border-purple-500/30'
                            : 'bg-gray-700 text-gray-300'
                        }`}>
                          {u.role}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-gray-400">
                        {new Date(u.createdAt).toLocaleDateString()}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* ── PLANS ── */}
        {activeTab === 'Plans' && (
          <div className="space-y-6">
            <h2 className="text-2xl font-bold mb-1">Plan Management</h2>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {[
                { name: 'Starter', price: '$9', users: 0, revenue: '$0' },
                { name: 'Pro', price: '$29', users: 0, revenue: '$0' },
                { name: 'Business', price: '$79', users: 0, revenue: '$0' },
              ].map(plan => (
                <div key={plan.name} className="bg-gray-900 border border-gray-800 rounded-2xl p-6">
                  <h3 className="text-lg font-bold mb-4">{plan.name} — {plan.price}/mo</h3>
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-400">Active Users</span>
                      <span className="font-bold">{plan.users}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-400">Revenue</span>
                      <span className="font-bold text-green-400">{plan.revenue}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ── PROXY HEALTH ── */}
        {activeTab === 'Proxy Health' && (
          <div className="space-y-6">
            <h2 className="text-2xl font-bold mb-1">Proxy Health</h2>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {[
                { label: 'Provider', value: 'Webshare', status: 'online' },
                { label: 'API Status', value: 'Connected', status: 'online' },
                { label: 'Uptime', value: '99.9%', status: 'online' },
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
            <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6">
              <div className="font-mono text-sm space-y-2">
                <p className="text-green-400">[INFO] Server started on port 4000</p>
                <p className="text-green-400">[INFO] Connected to MongoDB</p>
                <p className="text-gray-500">[INFO] Webshare API connected</p>
                <p className="text-gray-500">No recent errors.</p>
              </div>
            </div>
          </div>
        )}

      </div>
    </div>
  )
}
