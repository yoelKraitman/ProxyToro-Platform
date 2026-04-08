import { useAuth } from '../context/AuthContext'
import { useNavigate } from 'react-router-dom'

export default function Dashboard() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()

  const handleLogout = () => {
    logout()
    navigate('/login')
  }

  return (
    <div className="min-h-screen bg-gray-950 text-white">

      {/* Navbar */}
      <nav className="border-b border-gray-800 px-6 py-4 flex items-center justify-between">
        <h1 className="text-xl font-bold text-purple-400">ProxyToro</h1>
        <div className="flex items-center gap-4">
          <span className="text-gray-400 text-sm">{user?.email}</span>
          <button
            onClick={handleLogout}
            className="text-sm text-gray-400 hover:text-white transition"
          >
            Logout
          </button>
        </div>
      </nav>

      {/* Content */}
      <div className="max-w-5xl mx-auto px-6 py-10">
        <h2 className="text-2xl font-bold mb-2">Welcome back!</h2>
        <p className="text-gray-400 mb-8">Here are your proxy credentials.</p>

        {/* Credentials Card */}
        <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6">
          <h3 className="text-lg font-semibold mb-4 text-purple-400">Your Proxy Credentials</h3>
          <div className="space-y-3">
            <div className="flex justify-between items-center bg-gray-800 rounded-lg px-4 py-3">
              <span className="text-gray-400 text-sm">Username</span>
              <span className="font-mono text-white">{user?.proxyUsername}</span>
            </div>
            <div className="flex justify-between items-center bg-gray-800 rounded-lg px-4 py-3">
              <span className="text-gray-400 text-sm">Role</span>
              <span className="font-mono text-white">{user?.role}</span>
            </div>
          </div>
        </div>
      </div>

    </div>
  )
}
