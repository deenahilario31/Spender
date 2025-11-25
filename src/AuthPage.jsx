import { useState } from 'react'
import { DollarSign, Mail, Lock, User, ArrowRight, Sparkles, LogIn, UserPlus, ArrowLeft, KeyRound } from 'lucide-react'
import { API_URL } from './config'

export default function AuthPage({ onLogin, onGuestMode }) {
  const [isLogin, setIsLogin] = useState(true)
  const [showForgotPassword, setShowForgotPassword] = useState(false)
  const [showResetForm, setShowResetForm] = useState(false)
  const [showGuestForm, setShowGuestForm] = useState(false)
  const [guestName, setGuestName] = useState('')
  const [formData, setFormData] = useState({
    email: '',
    phone: '',
    password: '',
    name: ''
  })
  const [resetData, setResetData] = useState({
    email: '',
    resetCode: '',
    newPassword: ''
  })
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [loading, setLoading] = useState(false)
  const [resetCodeSent, setResetCodeSent] = useState(false)
  const [rememberMe, setRememberMe] = useState(true) // Default to true

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      const endpoint = isLogin ? '/api/auth/login' : '/api/auth/signup'
      const body = isLogin 
        ? { email: formData.email, password: formData.password }
        : formData

      const res = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body)
      })

      const data = await res.json()

      if (!res.ok) {
        setError(data.error || 'Something went wrong')
        setLoading(false)
        return
      }

      // Store user in localStorage or sessionStorage based on rememberMe
      const userData = { ...data.user, rememberMe }
      
      if (rememberMe) {
        // Persistent storage - stays even after browser closes
        localStorage.setItem('spender_user', JSON.stringify(userData))
        localStorage.setItem('spender_remember', 'true')
      } else {
        // Session storage - cleared when browser closes
        sessionStorage.setItem('spender_user', JSON.stringify(userData))
        localStorage.removeItem('spender_remember')
      }
      
      onLogin(data.user)
    } catch (err) {
      console.error('Auth error:', err)
      setError(`Network error: ${err.message}. Make sure the server is running on port 3001.`)
      setLoading(false)
    }
  }

  const handleForgotPassword = async (e) => {
    e.preventDefault()
    setError('')
    setSuccess('')
    setLoading(true)

    try {
      const res = await fetch(`${API_URL}/api/auth/forgot-password`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: resetData.email })
      })

      const data = await res.json()
      
      setSuccess(`Reset code sent! Check your email (or console in dev mode).\n\nYour code: ${data.resetCode}`)
      setResetCodeSent(true)
      setShowResetForm(true)
      setLoading(false)
    } catch (err) {
      console.error('Forgot password error:', err)
      setError(`Network error: ${err.message}. Make sure the server is running.`)
      setLoading(false)
    }
  }

  const handleResetPassword = async (e) => {
    e.preventDefault()
    setError('')
    setSuccess('')
    setLoading(true)

    try {
      const res = await fetch(`${API_URL}/api/auth/reset-password`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(resetData)
      })

      const data = await res.json()

      if (!res.ok) {
        setError(data.error || 'Something went wrong')
        setLoading(false)
        return
      }

      setSuccess('Password reset successful! You can now login with your new password.')
      setTimeout(() => {
        setShowForgotPassword(false)
        setShowResetForm(false)
        setResetCodeSent(false)
        setResetData({ email: '', resetCode: '', newPassword: '' })
        setIsLogin(true)
      }, 2000)
    } catch (err) {
      console.error('Reset password error:', err)
      setError(`Network error: ${err.message}. Make sure the server is running.`)
      setLoading(false)
    }
  }

  const handleGuestSubmit = (e) => {
    e.preventDefault()
    if (!guestName.trim()) {
      setError('Please enter your name')
      return
    }
    onGuestMode(guestName)
  }

  // If showing guest form
  if (showGuestForm) {
    return (
      <div className="min-h-screen relative overflow-hidden">
        {/* Animated Background */}
        <div className="absolute inset-0 bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900"></div>
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGRlZnM+PHBhdHRlcm4gaWQ9ImdyaWQiIHdpZHRoPSI2MCIgaGVpZ2h0PSI2MCIgcGF0dGVyblVuaXRzPSJ1c2VyU3BhY2VPblVzZSI+PHBhdGggZD0iTSAxMCAwIEwgMCAwIDAgMTAiIGZpbGw9Im5vbmUiIHN0cm9rZT0id2hpdGUiIHN0cm9rZS1vcGFjaXR5PSIwLjAzIiBzdHJva2Utd2lkdGg9IjEiLz48L3BhdHRlcm4+PC9kZWZzPjxyZWN0IHdpZHRoPSIxMDAlIiBoZWlnaHQ9IjEwMCUiIGZpbGw9InVybCgjZ3JpZCkiLz48L3N2Zz4=')] opacity-40"></div>
        
        {/* Floating orbs */}
        <div className="absolute top-20 left-20 w-72 h-72 bg-purple-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-float"></div>
        <div className="absolute top-40 right-20 w-72 h-72 bg-indigo-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-float" style={{ animationDelay: '2s' }}></div>

        {/* Content */}
        <div className="relative z-10 min-h-screen flex items-center justify-center p-4">
          <div className="max-w-md w-full">
            {/* Logo/Header */}
            <div className="text-center mb-8">
              <div className="inline-flex items-center justify-center gap-3 mb-4 px-6 py-3 glass-card-dark rounded-3xl">
                <div className="p-3 gradient-primary rounded-2xl">
                  <User className="w-8 h-8 text-white" />
                </div>
                <h1 className="text-4xl font-bold bg-gradient-to-r from-indigo-200 via-purple-200 to-pink-200 bg-clip-text text-transparent">
                  Try as Guest
                </h1>
              </div>
              <p className="text-gray-300 text-lg">Start tracking expenses instantly</p>
            </div>

            {/* Guest Form */}
            <div className="glass-card rounded-3xl shadow-2xl p-8 border border-white/20">
              <form onSubmit={handleGuestSubmit} className="space-y-6">
                <div>
                  <label className="block text-sm font-bold text-gray-200 mb-2">What's your name?</label>
                  <div className="relative">
                    <User className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                    <input
                      type="text"
                      value={guestName}
                      onChange={(e) => setGuestName(e.target.value)}
                      placeholder="Enter your name"
                      className="w-full pl-12 pr-4 py-4 bg-white/10 border-2 border-white/20 rounded-xl focus:outline-none focus:border-indigo-400 focus:ring-4 focus:ring-indigo-400/20 transition-all duration-200 font-semibold text-white placeholder-gray-400"
                    />
                  </div>
                </div>

                {error && (
                  <div className="p-4 bg-red-500/20 border-2 border-red-500/50 rounded-xl text-red-200 text-sm">
                    {error}
                  </div>
                )}

                <div className="bg-amber-500/20 border-2 border-amber-500/50 rounded-xl p-4">
                  <p className="text-amber-200 text-sm font-medium">
                    ⚠️ Guest Mode Limitations:
                  </p>
                  <ul className="mt-2 space-y-1 text-amber-200/80 text-xs">
                    <li>• Data is temporary and won't be saved</li>
                    <li>• Limited to basic features</li>
                    <li>• Create account after first use to save data</li>
                  </ul>
                </div>

                <button
                  type="submit"
                  className="w-full px-6 py-4 gradient-primary text-white rounded-xl hover:shadow-2xl hover:shadow-indigo-500/50 transition-all duration-200 font-bold text-lg flex items-center justify-center gap-2"
                >
                  <User className="w-5 h-5" />
                  Continue as Guest
                </button>

                <button
                  type="button"
                  onClick={() => setShowGuestForm(false)}
                  className="w-full px-6 py-3 bg-white/10 text-gray-200 rounded-xl hover:bg-white/20 transition-all duration-200 font-semibold flex items-center justify-center gap-2"
                >
                  <ArrowLeft className="w-5 h-5" />
                  Back to Login
                </button>
              </form>
            </div>
          </div>
        </div>
      </div>
    )
  }

  // If showing forgot password flow
  if (showForgotPassword) {
    return (
      <div className="min-h-screen relative overflow-hidden">
        {/* Animated Background */}
        <div className="absolute inset-0 bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900"></div>
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGRlZnM+PHBhdHRlcm4gaWQ9ImdyaWQiIHdpZHRoPSI2MCIgaGVpZ2h0PSI2MCIgcGF0dGVyblVuaXRzPSJ1c2VyU3BhY2VPblVzZSI+PHBhdGggZD0iTSAxMCAwIEwgMCAwIDAgMTAiIGZpbGw9Im5vbmUiIHN0cm9rZT0id2hpdGUiIHN0cm9rZS1vcGFjaXR5PSIwLjAzIiBzdHJva2Utd2lkdGg9IjEiLz48L3BhdHRlcm4+PC9kZWZzPjxyZWN0IHdpZHRoPSIxMDAlIiBoZWlnaHQ9IjEwMCUiIGZpbGw9InVybCgjZ3JpZCkiLz48L3N2Zz4=')] opacity-40"></div>
        
        {/* Floating orbs */}
        <div className="absolute top-20 left-20 w-72 h-72 bg-purple-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-float"></div>
        <div className="absolute top-40 right-20 w-72 h-72 bg-indigo-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-float" style={{ animationDelay: '2s' }}></div>

        {/* Content */}
        <div className="relative z-10 min-h-screen flex items-center justify-center p-4">
          <div className="max-w-md w-full">
            {/* Logo/Header */}
            <div className="text-center mb-8">
              <div className="inline-flex items-center justify-center gap-3 mb-4 px-6 py-3 glass-card-dark rounded-3xl">
                <div className="p-3 gradient-primary rounded-2xl">
                  <KeyRound className="w-8 h-8 text-white" />
                </div>
                <h1 className="text-4xl font-bold bg-gradient-to-r from-indigo-200 via-purple-200 to-pink-200 bg-clip-text text-transparent">
                  Reset Password
                </h1>
              </div>
            </div>

            {/* Reset Card */}
            <div className="glass-card rounded-3xl shadow-2xl p-8 border border-white/20">
              <button
                onClick={() => {
                  setShowForgotPassword(false)
                  setShowResetForm(false)
                  setResetCodeSent(false)
                  setError('')
                  setSuccess('')
                }}
                className="mb-6 flex items-center gap-2 text-gray-600 hover:text-indigo-600 transition"
              >
                <ArrowLeft className="w-4 h-4" />
                Back to Login
              </button>

              {!showResetForm ? (
                <form onSubmit={handleForgotPassword} className="space-y-4">
                  <div className="text-center mb-6">
                    <h3 className="text-xl font-bold text-gray-900 mb-2">Forgot your password?</h3>
                    <p className="text-sm text-gray-600">Enter your email and we'll send you a reset code</p>
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2 uppercase tracking-wide">
                      Email Address
                    </label>
                    <div className="relative">
                      <Mail className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                      <input
                        type="email"
                        value={resetData.email}
                        onChange={(e) => setResetData({ ...resetData, email: e.target.value })}
                        placeholder="you@example.com"
                        required
                        className="w-full pl-12 pr-4 py-4 bg-white border-2 border-gray-200 rounded-xl focus:outline-none focus:border-indigo-400 focus:ring-4 focus:ring-indigo-100 transition-all duration-200"
                      />
                    </div>
                  </div>

                  {success && (
                    <div className="p-4 bg-green-50 border-2 border-green-200 rounded-xl">
                      <p className="text-green-600 text-sm font-semibold whitespace-pre-line">{success}</p>
                    </div>
                  )}

                  {error && (
                    <div className="p-4 bg-red-50 border-2 border-red-200 rounded-xl">
                      <p className="text-red-600 text-sm font-semibold">{error}</p>
                    </div>
                  )}

                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full px-6 py-4 gradient-primary text-white rounded-xl hover:shadow-2xl hover:shadow-indigo-500/50 transition-all duration-200 font-bold text-lg disabled:opacity-50"
                  >
                    {loading ? 'Sending...' : 'Send Reset Code'}
                  </button>
                </form>
              ) : (
                <form onSubmit={handleResetPassword} className="space-y-4">
                  <div className="text-center mb-6">
                    <h3 className="text-xl font-bold text-gray-900 mb-2">Enter Reset Code</h3>
                    <p className="text-sm text-gray-600">Check your email for the 6-digit code</p>
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2 uppercase tracking-wide">
                      Reset Code
                    </label>
                    <div className="relative">
                      <KeyRound className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                      <input
                        type="text"
                        value={resetData.resetCode}
                        onChange={(e) => setResetData({ ...resetData, resetCode: e.target.value })}
                        placeholder="123456"
                        required
                        maxLength="6"
                        className="w-full pl-12 pr-4 py-4 bg-white border-2 border-gray-200 rounded-xl focus:outline-none focus:border-indigo-400 focus:ring-4 focus:ring-indigo-100 transition-all duration-200 text-center text-2xl tracking-widest font-bold"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2 uppercase tracking-wide">
                      New Password
                    </label>
                    <div className="relative">
                      <Lock className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                      <input
                        type="password"
                        value={resetData.newPassword}
                        onChange={(e) => setResetData({ ...resetData, newPassword: e.target.value })}
                        placeholder="••••••••"
                        required
                        minLength="6"
                        className="w-full pl-12 pr-4 py-4 bg-white border-2 border-gray-200 rounded-xl focus:outline-none focus:border-indigo-400 focus:ring-4 focus:ring-indigo-100 transition-all duration-200"
                      />
                    </div>
                    <p className="text-xs text-gray-500 mt-1">Minimum 6 characters</p>
                  </div>

                  {success && (
                    <div className="p-4 bg-green-50 border-2 border-green-200 rounded-xl">
                      <p className="text-green-600 text-sm font-semibold">{success}</p>
                    </div>
                  )}

                  {error && (
                    <div className="p-4 bg-red-50 border-2 border-red-200 rounded-xl">
                      <p className="text-red-600 text-sm font-semibold">{error}</p>
                    </div>
                  )}

                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full px-6 py-4 gradient-primary text-white rounded-xl hover:shadow-2xl hover:shadow-indigo-500/50 transition-all duration-200 font-bold text-lg disabled:opacity-50"
                  >
                    {loading ? 'Resetting...' : 'Reset Password'}
                  </button>
                </form>
              )}
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen relative overflow-hidden">
      {/* Animated Background */}
      <div className="absolute inset-0 bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900"></div>
      <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGRlZnM+PHBhdHRlcm4gaWQ9ImdyaWQiIHdpZHRoPSI2MCIgaGVpZ2h0PSI2MCIgcGF0dGVyblVuaXRzPSJ1c2VyU3BhY2VPblVzZSI+PHBhdGggZD0iTSAxMCAwIEwgMCAwIDAgMTAiIGZpbGw9Im5vbmUiIHN0cm9rZT0id2hpdGUiIHN0cm9rZS1vcGFjaXR5PSIwLjAzIiBzdHJva2Utd2lkdGg9IjEiLz48L3BhdHRlcm4+PC9kZWZzPjxyZWN0IHdpZHRoPSIxMDAlIiBoZWlnaHQ9IjEwMCUiIGZpbGw9InVybCgjZ3JpZCkiLz48L3N2Zz4=')] opacity-40"></div>
      
      {/* Floating orbs */}
      <div className="absolute top-20 left-20 w-72 h-72 bg-purple-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-float"></div>
      <div className="absolute top-40 right-20 w-72 h-72 bg-indigo-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-float" style={{ animationDelay: '2s' }}></div>
      <div className="absolute bottom-20 left-1/2 w-72 h-72 bg-pink-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-float" style={{ animationDelay: '4s' }}></div>

      {/* Content */}
      <div className="relative z-10 min-h-screen flex items-center justify-center p-4">
        <div className="max-w-md w-full">
          {/* Logo/Header */}
          <div className="text-center mb-8 animate-float">
            <div className="inline-flex items-center justify-center gap-3 mb-4 px-6 py-3 glass-card-dark rounded-3xl">
              <div className="p-3 gradient-primary rounded-2xl animate-glow">
                <DollarSign className="w-8 h-8 text-white" />
              </div>
              <h1 className="text-5xl font-bold bg-gradient-to-r from-indigo-200 via-purple-200 to-pink-200 bg-clip-text text-transparent">
                Spender
              </h1>
            </div>
            <p className="text-gray-300 text-lg">Track shared expenses with elegance</p>
          </div>

          {/* Auth Card */}
          <div className="glass-card rounded-3xl shadow-2xl p-8 border border-white/20">
            {/* Tab Switcher */}
            <div className="flex gap-2 mb-6 p-1 bg-gray-100 rounded-xl">
              <button
                onClick={() => {
                  setIsLogin(true)
                  setError('')
                }}
                className={`flex-1 px-4 py-3 rounded-lg font-bold transition-all duration-200 ${
                  isLogin
                    ? 'gradient-primary text-white shadow-lg'
                    : 'text-gray-600 hover:bg-gray-200'
                }`}
              >
                <LogIn className="w-4 h-4 inline mr-2" />
                Login
              </button>
              <button
                onClick={() => {
                  setIsLogin(false)
                  setError('')
                }}
                className={`flex-1 px-4 py-3 rounded-lg font-bold transition-all duration-200 ${
                  !isLogin
                    ? 'gradient-primary text-white shadow-lg'
                    : 'text-gray-600 hover:bg-gray-200'
                }`}
              >
                <UserPlus className="w-4 h-4 inline mr-2" />
                Sign Up
              </button>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} className="space-y-4">
              {!isLogin && (
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2 uppercase tracking-wide">
                    Full Name
                  </label>
                  <div className="relative">
                    <User className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <input
                      type="text"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      placeholder="John Doe"
                      required={!isLogin}
                      className="w-full pl-12 pr-4 py-4 bg-white border-2 border-gray-200 rounded-xl focus:outline-none focus:border-indigo-400 focus:ring-4 focus:ring-indigo-100 transition-all duration-200"
                    />
                  </div>
                </div>
              )}

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2 uppercase tracking-wide">
                  Email Address
                </label>
                <div className="relative">
                  <Mail className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    placeholder="you@example.com"
                    required
                    className="w-full pl-12 pr-4 py-4 bg-white border-2 border-gray-200 rounded-xl focus:outline-none focus:border-indigo-400 focus:ring-4 focus:ring-indigo-100 transition-all duration-200"
                  />
                </div>
              </div>

              {!isLogin && (
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2 uppercase tracking-wide">
                    Phone Number
                  </label>
                  <div className="relative">
                    <Phone className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <input
                      type="tel"
                      value={formData.phone}
                      onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                      placeholder="+1 (555) 123-4567"
                      required={!isLogin}
                      className="w-full pl-12 pr-4 py-4 bg-white border-2 border-gray-200 rounded-xl focus:outline-none focus:border-indigo-400 focus:ring-4 focus:ring-indigo-100 transition-all duration-200"
                    />
                  </div>
                </div>
              )}

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2 uppercase tracking-wide">
                  Password
                </label>
                <div className="relative">
                  <Lock className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    type="password"
                    value={formData.password}
                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                    placeholder="••••••••"
                    required
                    minLength="6"
                    className="w-full pl-12 pr-4 py-4 bg-white border-2 border-gray-200 rounded-xl focus:outline-none focus:border-indigo-400 focus:ring-4 focus:ring-indigo-100 transition-all duration-200"
                  />
                </div>
                {!isLogin && (
                  <p className="text-xs text-gray-500 mt-1">Minimum 6 characters</p>
                )}
              </div>

              {error && (
                <div className="p-4 bg-red-50 border-2 border-red-200 rounded-xl">
                  <p className="text-red-600 text-sm font-semibold">{error}</p>
                </div>
              )}

              {/* Remember Me Checkbox */}
              {isLogin && (
                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    id="rememberMe"
                    checked={rememberMe}
                    onChange={(e) => setRememberMe(e.target.checked)}
                    className="w-5 h-5 text-indigo-600 border-2 border-gray-300 rounded focus:ring-2 focus:ring-indigo-500 cursor-pointer"
                  />
                  <label htmlFor="rememberMe" className="text-sm text-gray-700 font-medium cursor-pointer select-none">
                    Remember me (Stay logged in)
                  </label>
                </div>
              )}

              <button
                type="submit"
                disabled={loading}
                className="w-full px-6 py-4 gradient-primary text-white rounded-xl hover:shadow-2xl hover:shadow-indigo-500/50 transition-all duration-200 font-bold text-lg disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? 'Please wait...' : isLogin ? 'Login to Account' : 'Create Account'}
              </button>
            </form>

            {/* Forgot Password Link */}
            {isLogin && (
              <div className="mt-4 text-center">
                <button
                  onClick={() => setShowForgotPassword(true)}
                  className="text-sm text-indigo-600 font-semibold hover:text-indigo-700 flex items-center gap-1 mx-auto"
                >
                  <KeyRound className="w-4 h-4" />
                  Forgot Password?
                </button>
              </div>
            )}

            {/* Guest Mode Button */}
            <div className="mt-4">
              <button
                type="button"
                onClick={() => setShowGuestForm(true)}
                className="w-full px-6 py-3 bg-amber-100 text-amber-700 rounded-xl hover:bg-amber-200 transition-all duration-200 font-semibold flex items-center justify-center gap-2 border-2 border-amber-300"
              >
                <User className="w-5 h-5" />
                Try as Guest (No Account Needed)
              </button>
            </div>

            {/* Footer */}
            <div className="mt-6 text-center text-sm text-gray-600">
              {isLogin ? (
                <p>
                  Don't have an account?{' '}
                  <button
                    onClick={() => setIsLogin(false)}
                    className="text-indigo-600 font-semibold hover:text-indigo-700"
                  >
                    Sign up
                  </button>
                </p>
              ) : (
                <p>
                  Already have an account?{' '}
                  <button
                    onClick={() => setIsLogin(true)}
                    className="text-indigo-600 font-semibold hover:text-indigo-700"
                  >
                    Login
                  </button>
                </p>
              )}
            </div>
          </div>

          {/* Security Note */}
          <div className="mt-6 text-center">
            <p className="text-gray-400 text-xs">
              🔒 Your data is secure and encrypted
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
