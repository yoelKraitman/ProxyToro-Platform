import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider, useAuth } from './context/AuthContext'
import Landing from './pages/Landing'
import Login from './pages/Login'
import Register from './pages/Register'
import Dashboard from './pages/Dashboard'
import Admin from './pages/Admin'
import UseCases from './pages/UseCases'
import UseCase from './pages/UseCase'
import ForgotPassword from './pages/ForgotPassword'
import ResetPassword from './pages/ResetPassword'
import Setup2FA from './pages/Setup2FA'
import VerifyEmail from './pages/VerifyEmail'
import VerifySuccess from './pages/VerifySuccess'
import ContactSales from './pages/ContactSales'
import Integration from './pages/Integration'
import About from './pages/About'

function PrivateRoute({ children }) {
  const { user } = useAuth()
  if (!user) return <Navigate to="/login" />
  if (!user.isVerified) return <Navigate to="/verify-email" />
  return children
}

function VerifyEmailRoute({ children }) {
  const { user } = useAuth()
  if (!user) return <Navigate to="/login" />
  if (user.isVerified) return <Navigate to="/dashboard" />
  return children
}

function Setup2FARoute({ children }) {
  const { user } = useAuth()
  if (!user) return <Navigate to="/login" />
  if (user.twoFactorEnabled) return <Navigate to="/dashboard" />
  return children
}

function AdminRoute({ children }) {
  const { user } = useAuth()
  if (!user) return <Navigate to="/login" />
  if (!user.isVerified) return <Navigate to="/verify-email" />
  if (user.role !== 'admin') return <Navigate to="/dashboard" />
  return children
}

function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<Landing />} />
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route path="/verify-email" element={
        <VerifyEmailRoute><VerifyEmail /></VerifyEmailRoute>
      } />
      <Route path="/setup-2fa" element={
        <Setup2FARoute><Setup2FA /></Setup2FARoute>
      } />
      <Route path="/dashboard" element={
        <PrivateRoute><Dashboard /></PrivateRoute>
      } />
      <Route path="/admin" element={
        <AdminRoute><Admin /></AdminRoute>
      } />
      <Route path="/use-cases" element={<UseCases />} />
      <Route path="/use-cases/:slug" element={<UseCase />} />
      <Route path="/verify-success" element={<VerifySuccess />} />
      <Route path="/contact" element={<ContactSales />} />
      <Route path="/integration" element={<Integration />} />
      <Route path="/about" element={<About />} />
      <Route path="/forgot-password" element={<ForgotPassword />} />
      <Route path="/reset-password" element={<ResetPassword />} />
      <Route path="*" element={<Navigate to="/" />} />
    </Routes>
  )
}

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <AppRoutes />
      </AuthProvider>
    </BrowserRouter>
  )
}
