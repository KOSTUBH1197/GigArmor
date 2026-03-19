'use client'

import { useState } from 'react'
import axios from 'axios'
import { 
  User, Mail, Lock, Phone, MapPin, DollarSign, 
  Globe, Eye, EyeOff, AlertCircle, Loader2, 
  CheckCircle2, ChevronDown, ChevronUp 
} from 'lucide-react'

export default function Register({ onSwitchToLogin, onRegister }) {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    phone: '',
    deliveryPlatform: 'swiggy',
    averageWeeklyIncome: '',
    location: {
      latitude: '',
      longitude: '',
      address: ''
    }
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [showLocationFields, setShowLocationFields] = useState(false)
  const [success, setSuccess] = useState(false)

  const platforms = [
    { value: 'swiggy', label: 'Swiggy' },
    { value: 'zomato', label: 'Zomato' },
    { value: 'zepto', label: 'Zepto' },
    { value: 'amazon', label: 'Amazon Flex' },
    { value: 'flipkart', label: 'Flipkart' },
    { value: 'other', label: 'Other' },
  ]

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    try {
      const response = await axios.post('http://localhost:5000/api/auth/register', formData)
      setSuccess(true)
      localStorage.setItem('token', response.data.token)
      setTimeout(() => {
        onRegister(response.data.user)
      }, 1000)
    } catch (err) {
      setError(err.response?.data?.message || 'Registration failed. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const handleChange = (e) => {
    const { name, value } = e.target
    if (name.includes('location.')) {
      const field = name.split('.')[1]
      setFormData({
        ...formData,
        location: {
          ...formData.location,
          [field]: value
        }
      })
    } else {
      setFormData({
        ...formData,
        [name]: value
      })
    }
    if (error) setError('')
  }

  const getCurrentLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setFormData({
            ...formData,
            location: {
              ...formData.location,
              latitude: position.coords.latitude.toFixed(6),
              longitude: position.coords.longitude.toFixed(6),
            }
          })
        },
        (error) => {
          console.error('Error getting location:', error)
          setError('Unable to get your location. Please enter manually.')
        }
      )
    } else {
      setError('Geolocation is not supported by this browser.')
    }
  }

  return (
    <div className="card p-8 animate-fade-in max-h-[90vh] overflow-y-auto">
      {/* Header */}
      <div className="text-center mb-6">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-brand-100 mb-4">
          <User className="w-8 h-8 text-brand-600" />
        </div>
        <h2 className="text-2xl font-bold text-surface-900">Join GigArmor</h2>
        <p className="text-surface-500 mt-1">Create your worker account</p>
      </div>

      {/* Success Message */}
      {success && (
        <div className="mb-6 p-4 rounded-lg bg-green-50 border border-green-100 flex items-center gap-3 animate-slide-up">
          <CheckCircle2 className="w-5 h-5 text-green-500 flex-shrink-0" />
          <p className="text-sm text-green-700">Account created! Redirecting...</p>
        </div>
      )}

      {/* Error Alert */}
      {error && (
        <div className="mb-6 p-4 rounded-lg bg-red-50 border border-red-100 flex items-start gap-3 animate-slide-up">
          <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
          <p className="text-sm text-red-600">{error}</p>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Name Field */}
        <div>
          <label htmlFor="name" className="label">
            Full Name
          </label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
              <User className="h-5 w-5 text-surface-400" />
            </div>
            <input
              id="name"
              type="text"
              name="name"
              required
              placeholder="John Doe"
              className="input-field pl-11"
              value={formData.name}
              onChange={handleChange}
            />
          </div>
        </div>

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
              minLength={6}
              placeholder="Min 6 characters"
              className="input-field pl-11 pr-11"
              value={formData.password}
              onChange={handleChange}
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute inset-y-0 right-0 pr-4 flex items-center text-surface-400 hover:text-surface-600 transition-colors"
            >
              {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
            </button>
          </div>
        </div>

        {/* Phone & Platform Row */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Phone Field */}
          <div>
            <label htmlFor="phone" className="label">
              Phone Number
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                <Phone className="h-5 w-5 text-surface-400" />
              </div>
              <input
                id="phone"
                type="tel"
                name="phone"
                required
                placeholder="+91 9876543210"
                className="input-field pl-11"
                value={formData.phone}
                onChange={handleChange}
              />
            </div>
          </div>

          {/* Platform Select */}
          <div>
            <label htmlFor="deliveryPlatform" className="label">
              Delivery Platform
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                <Globe className="h-5 w-5 text-surface-400" />
              </div>
              <select
                id="deliveryPlatform"
                name="deliveryPlatform"
                className="input-field pl-11 pr-10 appearance-none cursor-pointer"
                value={formData.deliveryPlatform}
                onChange={handleChange}
              >
                {platforms.map((platform) => (
                  <option key={platform.value} value={platform.value}>
                    {platform.label}
                  </option>
                ))}
              </select>
              <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 h-5 w-5 text-surface-400 pointer-events-none" />
            </div>
          </div>
        </div>

        {/* Income Field */}
        <div>
          <label htmlFor="averageWeeklyIncome" className="label">
            Average Weekly Income (₹)
          </label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
              <DollarSign className="h-5 w-5 text-surface-400" />
            </div>
            <input
              id="averageWeeklyIncome"
              type="number"
              name="averageWeeklyIncome"
              required
              min="0"
              placeholder="5000"
              className="input-field pl-11"
              value={formData.averageWeeklyIncome}
              onChange={handleChange}
            />
          </div>
        </div>

        {/* Location Section Toggle */}
        <div>
          <button
            type="button"
            onClick={() => setShowLocationFields(!showLocationFields)}
            className="w-full flex items-center justify-between p-3 rounded-lg bg-surface-50 hover:bg-surface-100 transition-colors"
          >
            <div className="flex items-center gap-2 text-surface-700 font-medium">
              <MapPin className="w-5 h-5 text-primary-600" />
              <span>Location Details</span>
            </div>
            {showLocationFields ? (
              <ChevronUp className="w-5 h-5 text-surface-500" />
            ) : (
              <ChevronDown className="w-5 h-5 text-surface-500" />
            )}
          </button>

          {showLocationFields && (
            <div className="mt-4 space-y-4 p-4 bg-surface-50 rounded-lg animate-slide-up">
              {/* Get Location Button */}
              <button
                type="button"
                onClick={getCurrentLocation}
                className="btn-secondary w-full flex items-center justify-center gap-2"
              >
                <MapPin className="w-4 h-4" />
                Get Current Location
              </button>

              {/* Address Field */}
              <div>
                <label htmlFor="location.address" className="label">
                  Address
                </label>
                <input
                  type="text"
                  name="location.address"
                  placeholder="123 Main Street, City"
                  className="input-field"
                  value={formData.location.address}
                  onChange={handleChange}
                />
              </div>

              {/* Lat/Long Grid */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label htmlFor="location.latitude" className="label">
                    Latitude
                  </label>
                  <input
                    type="text"
                    name="location.latitude"
                    placeholder="12.9716"
                    className="input-field"
                    value={formData.location.latitude}
                    onChange={handleChange}
                  />
                </div>
                <div>
                  <label htmlFor="location.longitude" className="label">
                    Longitude
                  </label>
                  <input
                    type="text"
                    name="location.longitude"
                    placeholder="77.5946"
                    className="input-field"
                    value={formData.location.longitude}
                    onChange={handleChange}
                  />
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Submit Button */}
        <button
          type="submit"
          disabled={loading || success}
          className="btn-primary w-full flex items-center justify-center gap-2 py-3 mt-6"
        >
          {loading ? (
            <>
              <Loader2 className="w-5 h-5 animate-spin" />
              <span>Creating Account...</span>
            </>
          ) : success ? (
            <>
              <CheckCircle2 className="w-5 h-5" />
              <span>Success!</span>
            </>
          ) : (
            <span>Create Account</span>
          )}
        </button>
      </form>

      {/* Login Link */}
      <p className="text-center text-surface-600 mt-6">
        Already have an account?{' '}
        <button
          onClick={onSwitchToLogin}
          className="text-primary-600 hover:text-primary-700 font-semibold transition-colors"
        >
          Sign In
        </button>
      </p>
    </div>
  )
}
