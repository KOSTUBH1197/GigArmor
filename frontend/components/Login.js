'use client'

import { useState } from 'react'
import axios from 'axios'
import { Mail, Lock, Shield, Eye, EyeOff, AlertCircle, Loader2 } from 'lucide-react'

export default function Login({ onSwitchToRegister, onLogin }) {
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [showPassword, setShowPassword] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    try {
      const response = await axios.post('http://localhost:5000/api/auth/login', formData)
      localStorage.setItem('token', response.data.token)
      onLogin(response.data.user)
    } catch (err) {
      setError(err.response?.data?.message || 'Login failed. Please check your credentials.')
    } finally {
      setLoading(false)
    }
  }

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    })
    if (error) setError('')
  }

  return (
    <div className="card p-8 animate-fade-in">
      {/* Header */}
      <div className="text-center mb-8">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-primary-100 mb-4">
          <Shield className="w-8 h-8 text-primary-600" />
        </div>
        <h2 className="text-2xl font-bold text-surface-900">Welcome Back</h2>
        <p className="text-surface-500 mt-1">Sign in to your GigArmor account</p>
      </div>

      {/* Error Alert */}
      {error && (
        <div className="mb-6 p-4 rounded-lg bg-red-50 border border-red-100 flex items-start gap-3 animate-slide-up">
          <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
          <p className="text-sm text-red-600">{error}</p>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-5">
        {/* Email Field */}
        <div>
          <label htmlFor="email" className="label">
            Email Address
          </label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
              <Mail className="h-5 w-5 text-surface-400" />
            </div>
            <input
              id="email"
              type="email"
              name="email"
              required
              placeholder="you@example.com"
              className="input-field pl-11"
              value={formData.email}
              onChange={handleChange}
            />
          </div>
        </div>

        {/* Password Field */}
        <div>
          <label htmlFor="password" className="label">
            Password
          </label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
              <Lock className="h-5 w-5 text-surface-400" />
            </div>
            <input
              id="password"
              type={showPassword ? 'text' : 'password'}
              name="password"
              required
              placeholder="••••••••"
              className="input-field pl-11 pr-11"
              value={formData.password}
              onChange={handleChange}
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute inset-y-0 right-0 pr-4 flex items-center text-surface-400 hover:text-surface-600 transition-colors"
            >
              {showPassword ? (
                <EyeOff className="h-5 w-5" />
              ) : (
                <Eye className="h-5 w-5" />
              )}
            </button>
          </div>
        </div>

        {/* Forgot Password Link */}
        <div className="flex justify-end">
          <button
            type="button"
            className="text-sm text-primary-600 hover:text-primary-700 font-medium transition-colors"
          >
            Forgot password?
          </button>
        </div>

        {/* Submit Button */}
        <button
          type="submit"
          disabled={loading}
          className="btn-primary w-full flex items-center justify-center gap-2 py-3"
        >
          {loading ? (
            <>
              <Loader2 className="w-5 h-5 animate-spin" />
              <span>Signing in...</span>
            </>
          ) : (
            <span>Sign In</span>
          )}
        </button>
      </form>

      {/* Divider */}
      <div className="relative my-6">
        <div className="absolute inset-0 flex items-center">
          <div className="w-full border-t border-surface-200"></div>
        </div>
        <div className="relative flex justify-center text-sm">
          <span className="px-4 bg-white text-surface-500">or</span>
        </div>
      </div>

      {/* Register Link */}
      <p className="text-center text-surface-600">
        Don't have an account?{' '}
        <button
          onClick={onSwitchToRegister}
          className="text-primary-600 hover:text-primary-700 font-semibold transition-colors"
        >
          Create Account
        </button>
      </p>
    </div>
  )
}
