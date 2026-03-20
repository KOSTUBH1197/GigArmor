'use client'

import { useState, useEffect } from 'react'
import axios from 'axios'
import { 
  Shield, CreditCard, History, TrendingUp, LogOut, 
  MapPin, Bell, RefreshCw, ChevronRight, 
  CheckCircle2, Clock, XCircle, AlertTriangle,
  Cloud, CloudRain, Waves, Navigation
} from 'lucide-react'

export default function WorkerDashboard({ user, onLogout }) {
  const [profile, setProfile] = useState(null)
  const [policies, setPolicies] = useState([])
  const [claims, setClaims] = useState([])
  const [riskData, setRiskData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [calculatingRisk, setCalculatingRisk] = useState(false)
  const [purchasing, setPurchasing] = useState(false)

  const fetchDashboardData = async () => {
    setLoading(true)
    try {
      const token = localStorage.getItem('token')
      const config = { headers: { Authorization: `Bearer ${token}` } }

      const [profileRes, policiesRes, claimsRes] = await Promise.all([
        axios.get(`${process.env.NEXT_PUBLIC_API_URL}/api/workers/profile`, config)
        axios.get(`${process.env.NEXT_PUBLIC_API_URL}/api/workers/policies`, config)
        axios.get(`${process.env.NEXT_PUBLIC_API_URL}/api/workers/claims`, config)
      ])

      setProfile(profileRes.data)
      setPolicies(policiesRes.data)
      setClaims(claimsRes.data)
    } catch (error) {
      console.error('Error fetching dashboard data:', error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchDashboardData()
  }, [])

  const calculateRisk = async () => {
    setCalculatingRisk(true)
    try {
      const token = localStorage.getItem('token')
      const response = await axios.post(`${process.env.NEXT_PUBLIC_API_URL}/api/workers/calculate-risk`, {}, {
        headers: { Authorization: `Bearer ${token}` }
      })
      setRiskData(response.data)
    } catch (error) {
      console.error('Error calculating risk:', error)
    } finally {
      setCalculatingRisk(false)
    }
  }

  const purchasePolicy = async () => {
    if (!riskData) return

    setPurchasing(true)
    try {
      const token = localStorage.getItem('token')
      await axios.post(`${process.env.NEXT_PUBLIC_API_URL}/api/workers/purchase-policy`, {
        weeklyPremium: riskData.weeklyPremium,
        coverageAmount: riskData.coverageAmount,
      }, {
        headers: { Authorization: `Bearer ${token}` }
      })
      await fetchDashboardData()
      setRiskData(null)
    } catch (error) {
      console.error('Error purchasing policy:', error)
    } finally {
      setPurchasing(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-surface-50 flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-primary-200 border-t-primary-600 rounded-full animate-spin"></div>
          <p className="text-surface-500 font-medium">Loading your dashboard...</p>
        </div>
      </div>
    )
  }

  const activePolicy = policies.find(p => p.status === 'active')
  const claimStats = {
    total: claims.length,
    paid: claims.filter(c => c.status === 'paid').length,
    pending: claims.filter(c => c.status === 'pending').length,
    rejected: claims.filter(c => c.status === 'rejected').length,
  }

  const getStatusBadge = (status) => {
    const styles = {
      paid: 'bg-green-100 text-green-700',
      pending: 'bg-amber-100 text-amber-700',
      rejected: 'bg-red-100 text-red-700',
    }
    const icons = {
      paid: CheckCircle2,
      pending: Clock,
      rejected: XCircle,
    }
    const Icon = icons[status] || AlertTriangle
    
    return (
      <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-semibold rounded-full ${styles[status]}`}>
        <Icon className="w-3.5 h-3.5" />
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </span>
    )
  }

  return (
    <div className="min-h-screen bg-surface-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-surface-200 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            {/* Logo & Title */}
            <div className="flex items-center gap-3">
              <div className="p-2 bg-primary-100 rounded-lg">
                <Shield className="h-6 w-6 text-primary-600" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-surface-900">GigArmor</h1>
                <p className="text-xs text-surface-500 hidden sm:block">Worker Portal</p>
              </div>
            </div>

            {/* Right Section */}
            <div className="flex items-center gap-3">
              {/* Refresh */}
              <button
                onClick={fetchDashboardData}
                className="p-2 text-surface-500 hover:text-primary-600 hover:bg-primary-50 rounded-lg transition-colors"
                title="Refresh"
              >
                <RefreshCw className="h-5 w-5" />
              </button>
              
              {/* Notifications */}
              <button className="p-2 text-surface-500 hover:text-primary-600 hover:bg-primary-50 rounded-lg transition-colors relative">
                <Bell className="h-5 w-5" />
                {claimStats.pending > 0 && (
                  <span className="absolute top-1 right-1 w-2 h-2 bg-amber-500 rounded-full"></span>
                )}
              </button>

              {/* User Info */}
              <div className="flex items-center gap-2 pl-3 border-l border-surface-200">
                <div className="w-8 h-8 bg-primary-100 rounded-full flex items-center justify-center">
                  <span className="text-sm font-semibold text-primary-600">
                    {user.name.charAt(0).toUpperCase()}
                  </span>
                </div>
                <span className="text-sm font-medium text-surface-700 hidden sm:block">{user.name}</span>
              </div>

              {/* Logout */}
              <button
                onClick={onLogout}
                className="p-2 text-surface-500 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                title="Logout"
              >
                <LogOut className="h-5 w-5" />
              </button>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Welcome Banner */}
        <div className="mb-8 p-6 rounded-2xl bg-gradient-to-r from-primary-600 to-brand-600 text-white">
          <h2 className="text-2xl font-bold mb-2">Welcome back, {user.name}! 👋</h2>
          <p className="text-primary-100">Your protection is our priority. Stay safe on every delivery.</p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          {/* Active Policy Card */}
          <div className="card p-6 animate-slide-up">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 bg-green-50 rounded-xl">
                <Shield className="h-6 w-6 text-green-600" />
              </div>
              {activePolicy && (
                <span className="px-2.5 py-1 text-xs font-medium bg-green-100 text-green-700 rounded-full">
                  Active
                </span>
              )}
            </div>
            <h3 className="text-lg font-semibold text-surface-900 mb-1">Your Policy</h3>
            {activePolicy ? (
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-sm text-surface-500">Weekly Premium</span>
                  <span className="text-sm font-medium text-surface-900">₹{activePolicy.weeklyPremium}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-surface-500">Coverage</span>
                  <span className="text-sm font-medium text-surface-900">₹{activePolicy.coverageAmount}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-surface-500">Status</span>
                  <span className="text-sm font-medium text-green-600">✓ Active</span>
                </div>
              </div>
            ) : (
              <p className="text-sm text-surface-500">No active policy yet</p>
            )}
          </div>

          {/* Risk Score Card */}
          <div className="card p-6 animate-slide-up animate-delay-100">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 bg-blue-50 rounded-xl">
                <TrendingUp className="h-6 w-6 text-blue-600" />
              </div>
            </div>
            <h3 className="text-lg font-semibold text-surface-900 mb-1">Risk Score</h3>
            {profile?.riskScore ? (
              <div className="space-y-3">
                <div className="flex items-end gap-2">
                  <span className="text-3xl font-bold text-surface-900">
                    {profile.riskScore.toFixed(1)}
                  </span>
                  <span className="text-sm text-surface-500 mb-1">/ 100</span>
                </div>
                <div className="w-full h-2 bg-surface-100 rounded-full overflow-hidden">
                  <div 
                    className={`h-full rounded-full ${
                      profile.riskScore > 70 ? 'bg-red-500' :
                      profile.riskScore > 40 ? 'bg-amber-500' :
                      'bg-green-500'
                    }`}
                    style={{ width: `${profile.riskScore}%` }}
                  ></div>
                </div>
                <button
                  onClick={calculateRisk}
                  disabled={calculatingRisk}
                  className="btn-secondary w-full text-sm"
                >
                  {calculatingRisk ? 'Calculating...' : 'Recalculate Risk'}
                </button>
              </div>
            ) : (
              <div>
                <p className="text-sm text-surface-500 mb-3">Calculate your risk to get personalized coverage</p>
                <button
                  onClick={calculateRisk}
                  disabled={calculatingRisk}
                  className="btn-primary w-full text-sm"
                >
                  {calculatingRisk ? 'Calculating...' : 'Calculate Now'}
                </button>
              </div>
            )}
          </div>

          {/* Claims Summary Card */}
          <div className="card p-6 animate-slide-up animate-delay-200">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 bg-purple-50 rounded-xl">
                <History className="h-6 w-6 text-purple-600" />
              </div>
            </div>
            <h3 className="text-lg font-semibold text-surface-900 mb-1">Claims</h3>
            <div className="grid grid-cols-2 gap-3">
              <div className="text-center p-3 bg-surface-50 rounded-lg">
                <p className="text-2xl font-bold text-surface-900">{claimStats.total}</p>
                <p className="text-xs text-surface-500">Total</p>
              </div>
              <div className="text-center p-3 bg-green-50 rounded-lg">
                <p className="text-2xl font-bold text-green-600">{claimStats.paid}</p>
                <p className="text-xs text-green-600">Paid</p>
              </div>
              <div className="text-center p-3 bg-amber-50 rounded-lg">
                <p className="text-2xl font-bold text-amber-600">{claimStats.pending}</p>
                <p className="text-xs text-amber-600">Pending</p>
              </div>
              <div className="text-center p-3 bg-red-50 rounded-lg">
                <p className="text-2xl font-bold text-red-600">{claimStats.rejected}</p>
                <p className="text-xs text-red-600">Rejected</p>
              </div>
            </div>
          </div>
        </div>

        {/* Risk Calculation Result */}
        {riskData && (
          <div className="card p-6 mb-8 animate-slide-up border-2 border-primary-200">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-semibold text-surface-900">Your Personalized Quote</h3>
              <button 
                onClick={() => setRiskData(null)}
                className="text-surface-400 hover:text-surface-600"
              >
                ✕
              </button>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {/* Quote Details */}
              <div className="space-y-4">
                <div className="flex justify-between p-4 bg-surface-50 rounded-xl">
                  <span className="text-surface-600">Risk Score</span>
                  <span className="font-bold text-surface-900">{riskData.riskScore}</span>
                </div>
                <div className="flex justify-between p-4 bg-surface-50 rounded-xl">
                  <span className="text-surface-600">Weekly Premium</span>
                  <span className="font-bold text-primary-600">₹{riskData.weeklyPremium}</span>
                </div>
                <div className="flex justify-between p-4 bg-surface-50 rounded-xl">
                  <span className="text-surface-600">Coverage Amount</span>
                  <span className="font-bold text-green-600">₹{riskData.coverageAmount}</span>
                </div>
              </div>

              {/* Risk Factors */}
              <div>
                <h4 className="text-sm font-semibold text-surface-700 mb-3">Risk Factors</h4>
                <div className="space-y-3">
                  <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
                    <div className="flex items-center gap-2">
                      <Cloud className="w-4 h-4 text-blue-600" />
                      <span className="text-sm text-surface-700">Weather Risk</span>
                    </div>
                    <span className="text-sm font-medium text-blue-700">{riskData.riskFactors?.weatherRisk || 'N/A'}</span>
                  </div>
                  <div className="flex items-center justify-between p-3 bg-purple-50 rounded-lg">
                    <div className="flex items-center gap-2">
                      <CloudRain className="w-4 h-4 text-purple-600" />
                      <span className="text-sm text-surface-700">Pollution Risk</span>
                    </div>
                    <span className="text-sm font-medium text-purple-700">{riskData.riskFactors?.pollutionRisk || 'N/A'}</span>
                  </div>
                  <div className="flex items-center justify-between p-3 bg-cyan-50 rounded-lg">
                    <div className="flex items-center gap-2">
                      <Waves className="w-4 h-4 text-cyan-600" />
                      <span className="text-sm text-surface-700">Flood Risk</span>
                    </div>
                    <span className="text-sm font-medium text-cyan-700">{riskData.riskFactors?.floodRisk || 'N/A'}</span>
                  </div>
                  <div className="flex items-center justify-between p-3 bg-amber-50 rounded-lg">
                    <div className="flex items-center gap-2">
                      <Navigation className="w-4 h-4 text-amber-600" />
                      <span className="text-sm text-surface-700">Location Risk</span>
                    </div>
                    <span className="text-sm font-medium text-amber-700">{riskData.riskFactors?.locationRisk || 'N/A'}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Purchase Button */}
            <div className="mt-6 pt-6 border-t border-surface-200">
              <button
                onClick={purchasePolicy}
                disabled={purchasing || activePolicy}
                className="btn-primary w-full flex items-center justify-center gap-2 py-3"
              >
                {purchasing ? (
                  <>
                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                    <span>Processing...</span>
                  </>
                ) : activePolicy ? (
                  <>
                    <CheckCircle2 className="w-5 h-5" />
                    <span>Policy Already Active</span>
                  </>
                ) : (
                  <>
                    <CreditCard className="w-5 h-5" />
                    <span>Purchase Policy - ₹{riskData.weeklyPremium}/week</span>
                  </>
                )}
              </button>
            </div>
          </div>
        )}

        {/* Claims History Table */}
        <div className="card overflow-hidden animate-fade-in">
          <div className="px-6 py-4 border-b border-surface-200 flex items-center justify-between">
            <h3 className="text-lg font-semibold text-surface-900">Recent Claims</h3>
            <button className="flex items-center gap-1 text-sm text-primary-600 hover:text-primary-700 font-medium">
              View All <ChevronRight className="h-4 w-4" />
            </button>
          </div>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-surface-200">
              <thead className="bg-surface-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-surface-500 uppercase tracking-wider">
                    Date
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-surface-500 uppercase tracking-wider">
                    Trigger Event
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-surface-500 uppercase tracking-wider">
                    Amount
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-surface-500 uppercase tracking-wider">
                    Status
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-surface-200">
                {claims.slice(0, 10).map((claim) => (
                  <tr key={claim._id} className="hover:bg-surface-50 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="text-sm text-surface-900">
                        {new Date(claim.createdAt).toLocaleDateString('en-IN', {
                          day: 'numeric',
                          month: 'short',
                          year: 'numeric'
                        })}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <AlertTriangle className="w-4 h-4 text-surface-400" />
                        <span className="text-sm text-surface-900">
                          {claim.triggerEvent?.type || 'N/A'}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="text-sm font-semibold text-surface-900">
                        ₹{claim.payoutAmount?.toLocaleString() || 0}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {getStatusBadge(claim.status)}
                    </td>
                  </tr>
                ))}
                {claims.length === 0 && (
                  <tr>
                    <td colSpan="4" className="px-6 py-12 text-center">
                      <div className="flex flex-col items-center gap-2">
                        <History className="w-12 h-12 text-surface-300" />
                        <p className="text-surface-500">No claims yet</p>
                        <p className="text-sm text-surface-400">Your claims will appear here</p>
                      </div>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  )
}
