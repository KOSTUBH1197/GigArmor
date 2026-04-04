'use client'

import { useState, useEffect, useCallback } from 'react'
import axios from 'axios'
import {
  Shield, CreditCard, History, TrendingUp, LogOut,
  Bell, RefreshCw, ChevronRight,
  CheckCircle2, Clock, XCircle, AlertTriangle,
  Cloud, Waves, Navigation, Wind,
  Zap, Activity, DollarSign, Info,
  CloudRain, Thermometer, BarChart2, Eye
} from 'lucide-react'

// ─── Toast Component ───────────────────────────────────────────────
function Toast({ toasts, removeToast }) {
  return (
    <div className="fixed top-4 right-4 z-[100] flex flex-col gap-2 max-w-sm">
      {toasts.map(t => (
        <div
          key={t.id}
          className={`flex items-start gap-3 px-4 py-3 rounded-xl shadow-lg border backdrop-blur-sm
            animate-toast-in text-sm font-medium
            ${t.type === 'success' ? 'bg-green-50 border-green-200 text-green-800' :
              t.type === 'error'   ? 'bg-red-50 border-red-200 text-red-800' :
              t.type === 'warning' ? 'bg-amber-50 border-amber-200 text-amber-800' :
              'bg-blue-50 border-blue-200 text-blue-800'}`}
        >
          <span className="text-base mt-0.5">
            {t.type === 'success' ? '✅' : t.type === 'error' ? '❌' : t.type === 'warning' ? '⚠️' : 'ℹ️'}
          </span>
          <span className="flex-1 leading-relaxed">{t.message}</span>
          <button onClick={() => removeToast(t.id)} className="opacity-50 hover:opacity-100 text-lg leading-none">×</button>
        </div>
      ))}
    </div>
  )
}

// ─── Skeleton Loader ───────────────────────────────────────────────
function Skeleton({ className = '' }) {
  return <div className={`skeleton rounded-lg ${className}`} />
}

// ─── Risk Gauge ────────────────────────────────────────────────────
function RiskGauge({ score }) {
  const color = score > 70 ? '#ef4444' : score > 40 ? '#f59e0b' : '#22c55e'
  const label = score > 70 ? 'High Risk' : score > 40 ? 'Moderate Risk' : 'Low Risk'
  const pct   = Math.min(100, Math.max(0, score))

  return (
    <div className="flex flex-col items-center gap-2">
      <div className="relative w-28 h-28">
        <svg viewBox="0 0 100 100" className="w-full h-full -rotate-90">
          <circle cx="50" cy="50" r="42" fill="none" stroke="#f1f5f9" strokeWidth="10" />
          <circle
            cx="50" cy="50" r="42" fill="none"
            stroke={color} strokeWidth="10"
            strokeDasharray={`${pct * 2.638} 263.8`}
            strokeLinecap="round"
            style={{ transition: 'stroke-dasharray 1s ease' }}
          />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-2xl font-black" style={{ color }}>{score?.toFixed(0)}</span>
          <span className="text-xs text-slate-500 font-medium">/100</span>
        </div>
      </div>
      <span className="text-xs font-semibold px-2 py-0.5 rounded-full" style={{ backgroundColor: color + '20', color }}>
        {label}
      </span>
    </div>
  )
}

// ─── Factor Bar ────────────────────────────────────────────────────
function FactorBar({ label, score, maxScore = 30, icon: Icon, color }) {
  const pct = Math.min(100, (score / maxScore) * 100)
  return (
    <div className="space-y-1.5">
      <div className="flex items-center justify-between text-sm">
        <div className="flex items-center gap-1.5">
          <Icon className="w-3.5 h-3.5" style={{ color }} />
          <span className="text-slate-600 font-medium">{label}</span>
        </div>
        <span className="font-bold text-slate-800">{score?.toFixed(1)}</span>
      </div>
      <div className="h-1.5 bg-slate-100 rounded-full overflow-hidden">
        <div
          className="h-full rounded-full transition-all duration-700"
          style={{ width: `${pct}%`, backgroundColor: color }}
        />
      </div>
    </div>
  )
}

// ─── Status Badge ──────────────────────────────────────────────────
function StatusBadge({ status }) {
  const config = {
    paid:     { bg: 'bg-green-100',  text: 'text-green-700',  Icon: CheckCircle2, label: 'Paid' },
    approved: { bg: 'bg-blue-100',   text: 'text-blue-700',   Icon: CheckCircle2, label: 'Approved' },
    pending:  { bg: 'bg-amber-100',  text: 'text-amber-700',  Icon: Clock,        label: 'Pending' },
    rejected: { bg: 'bg-red-100',    text: 'text-red-700',    Icon: XCircle,      label: 'Rejected' },
  }
  const c = config[status] || config.pending
  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-semibold rounded-full ${c.bg} ${c.text}`}>
      <c.Icon className="w-3.5 h-3.5" />
      {c.label}
    </span>
  )
}

// ─── Trigger Icon ──────────────────────────────────────────────────
const TRIGGER_META = {
  rainfall:    { emoji: '🌧️', label: 'Heavy Rainfall',    color: '#3b82f6' },
  flood:       { emoji: '🌊', label: 'Flood Alert',        color: '#06b6d4' },
  aqi:         { emoji: '🏭', label: 'Air Pollution',      color: '#8b5cf6' },
  temperature: { emoji: '🌡️', label: 'Extreme Heat',      color: '#ef4444' },
  curfew:      { emoji: '🚨', label: 'Curfew',             color: '#f97316' },
}

// ═══════════════════════════════════════════════════════════════════
// MAIN COMPONENT
// ═══════════════════════════════════════════════════════════════════
export default function WorkerDashboard({ user, onLogout }) {
  const [profile, setProfile]               = useState(null)
  const [policies, setPolicies]             = useState([])
  const [claims, setClaims]                 = useState([])
  const [riskData, setRiskData]             = useState(null)
  const [loading, setLoading]               = useState(true)
  const [calculatingRisk, setCalculatingRisk] = useState(false)
  const [purchasing, setPurchasing]         = useState(false)
  const [simulating, setSimulating]         = useState(false)
  const [simResult, setSimResult]           = useState(null)
  const [activeTab, setActiveTab]           = useState('overview')
  const [toasts, setToasts]                 = useState([])
  
  // Payout Modal State
  const [showPayoutModal, setShowPayoutModal] = useState(false)
  const [payoutStep, setPayoutStep]           = useState(0)

  // ── Toast helpers ──
  const addToast = useCallback((message, type = 'info') => {
    const id = Date.now()
    setToasts(prev => [...prev, { id, message, type }])
    setTimeout(() => setToasts(prev => prev.filter(t => t.id !== id)), 5000)
  }, [])
  const removeToast = id => setToasts(prev => prev.filter(t => t.id !== id))

  // ── API base ──
  const API = process.env.NEXT_PUBLIC_API_URL
  const authHeader = () => ({
    headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
  })

  // ── Fetch dashboard data ──
  const fetchData = useCallback(async (silent = false) => {
    if (!silent) setLoading(true)
    try {
      const [profileRes, policiesRes, claimsRes] = await Promise.all([
        axios.get(`${API}/api/workers/profile`, authHeader()),
        axios.get(`${API}/api/workers/policies`, authHeader()),
        axios.get(`${API}/api/workers/claims`,   authHeader()),
      ])
      setProfile(profileRes.data)
      setPolicies(policiesRes.data)
      setClaims(claimsRes.data)
    } catch (err) {
      if (!silent) addToast('Failed to load dashboard data', 'error')
    } finally {
      setLoading(false)
    }
  }, [API])

  useEffect(() => { fetchData() }, [fetchData])

  // ── Calculate risk ──
  const calculateRisk = async () => {
    setCalculatingRisk(true)
    setRiskData(null)
    try {
      const res = await axios.post(`${API}/api/workers/calculate-risk`, {}, authHeader())
      setRiskData(res.data)
      if (res.data.usedFallback) addToast('AI service busy — showing estimated risk score.', 'warning')
      else addToast('Risk assessment complete!', 'success')
      await fetchData(true)
    } catch (err) {
      addToast('Risk calculation failed. Try again.', 'error')
    } finally {
      setCalculatingRisk(false)
    }
  }

  // ── Purchase policy ──
  const purchasePolicy = async () => {
    if (!riskData) return
    setPurchasing(true)
    try {
      await axios.post(`${API}/api/workers/purchase-policy`, {
        weeklyPremium:  riskData.weeklyPremium,
        coverageAmount: riskData.coverageAmount,
      }, authHeader())
      addToast('🎉 Policy purchased successfully!', 'success')
      setRiskData(null)
      await fetchData(true)
    } catch (err) {
      const msg = err.response?.data?.message || 'Purchase failed'
      addToast(msg, 'error')
    } finally {
      setPurchasing(false)
    }
  }

  // ── Simulate event ──
  const simulateEvent = async (triggerType) => {
    setSimulating(true)
    setSimResult(null)
    try {
      const res = await axios.post(`${API}/api/workers/simulate-event`,
        { triggerType }, authHeader()
      )
      setSimResult(res.data)
      addToast(res.data.message, 'success')
      
      if (res.data.claim?.status === 'paid' || res.data.claim?.status === 'approved') {
        setShowPayoutModal(true)
        setPayoutStep(0)
        setTimeout(() => setPayoutStep(1), 2500)
      }
      
      await fetchData(true)
    } catch (err) {
      const msg = err.response?.data?.message || 'Simulation failed'
      if (err.response?.status === 409) {
        addToast('A claim for this event already exists in the last hour.', 'warning')
      } else if (err.response?.data?.requiresPolicy) {
        addToast('Purchase a policy first to simulate events.', 'warning')
      } else {
        addToast(msg, 'error')
      }
    } finally {
      setSimulating(false)
    }
  }

  // ── Derived state ──
  const activePolicy = policies.find(p => p.status === 'active')
  const claimStats = {
    total:    claims.length,
    paid:     claims.filter(c => c.status === 'paid').length,
    pending:  claims.filter(c => c.status === 'pending').length,
    rejected: claims.filter(c => c.status === 'rejected').length,
  }
  const totalEarned = claims
    .filter(c => c.status === 'paid')
    .reduce((sum, c) => sum + (c.payoutAmount || 0), 0)

  // ── Loading skeleton ──
  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50">
        <div className="h-16 bg-white border-b border-slate-200" />
        <div className="max-w-7xl mx-auto px-4 py-8 space-y-6">
          <Skeleton className="h-28 w-full" />
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[...Array(3)].map((_, i) => <Skeleton key={i} className="h-44" />)}
          </div>
          <Skeleton className="h-64 w-full" />
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <Toast toasts={toasts} removeToast={removeToast} />

      {/* ── Header ── */}
      <header className="bg-white shadow-sm border-b border-slate-200 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-indigo-600 rounded-xl">
                <Shield className="h-5 w-5 text-white" />
              </div>
              <div>
                <h1 className="text-lg font-bold text-slate-900 leading-none">GigArmor</h1>
                <p className="text-xs text-slate-400">Worker Portal</p>
              </div>
            </div>

            {/* Nav tabs */}
            <div className="hidden md:flex items-center gap-1 bg-slate-100 rounded-xl p-1">
              {[
                { id: 'overview', label: 'Overview', icon: BarChart2 },
                { id: 'claims',   label: 'Claims',   icon: History },
                { id: 'simulate', label: '⚡ Simulate', icon: Zap },
              ].map(tab => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200
                    ${activeTab === tab.id
                      ? 'bg-white text-indigo-600 shadow-sm'
                      : 'text-slate-500 hover:text-slate-700'}`}
                >
                  <tab.icon className="w-3.5 h-3.5" />
                  {tab.label}
                </button>
              ))}
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => fetchData(true)}
                className="p-2 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-all"
                title="Refresh"
              >
                <RefreshCw className="h-4 w-4" />
              </button>
              <button className="p-2 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-all relative">
                <Bell className="h-4 w-4" />
                {claimStats.pending > 0 && (
                  <span className="absolute top-1.5 right-1.5 w-1.5 h-1.5 bg-amber-500 rounded-full" />
                )}
              </button>
              <div className="w-8 h-8 bg-indigo-100 rounded-full flex items-center justify-center">
                <span className="text-sm font-bold text-indigo-600">{user.name.charAt(0).toUpperCase()}</span>
              </div>
              <button
                onClick={onLogout}
                className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all"
                title="Logout"
              >
                <LogOut className="h-4 w-4" />
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* ── Mobile tabs ── */}
      <div className="md:hidden flex border-b border-slate-200 bg-white px-4">
        {[
          { id: 'overview', label: 'Overview' },
          { id: 'claims',   label: 'Claims' },
          { id: 'simulate', label: '⚡ Simulate' },
        ].map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex-1 py-3 text-sm font-medium border-b-2 transition-all
              ${activeTab === tab.id
                ? 'border-indigo-600 text-indigo-600'
                : 'border-transparent text-slate-500'}`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">

        {/* ════ OVERVIEW TAB ════ */}
        {activeTab === 'overview' && (
          <div className="space-y-6">

            {/* Welcome + platform badge */}
            <div className="rounded-2xl overflow-hidden bg-gradient-to-br from-indigo-600 via-indigo-700 to-violet-700 text-white p-6 relative">
              <div className="absolute right-0 top-0 w-64 h-full opacity-10 pointer-events-none"
                style={{ backgroundImage: 'radial-gradient(circle at 80% 50%, white 0%, transparent 70%)' }} />
              <div className="flex items-start justify-between">
                <div>
                  <h2 className="text-xl font-bold mb-1">Hello, {user.name.split(' ')[0]}! 👋</h2>
                  <p className="text-indigo-200 text-sm">
                    {activePolicy
                      ? `You're covered until ${new Date(activePolicy.endDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}`
                      : 'Get your policy to stay protected'}
                  </p>
                </div>
                <span className="px-3 py-1 bg-white/20 backdrop-blur text-xs font-semibold rounded-full capitalize">
                  {profile?.deliveryPlatform || 'Gig Worker'}
                </span>
              </div>
              {activePolicy && (
                <div className="mt-4 grid grid-cols-3 gap-3">
                  {[
                    { label: 'Coverage',        value: `₹${activePolicy.coverageAmount?.toLocaleString()}` },
                    { label: 'Weekly Premium',  value: `₹${activePolicy.weeklyPremium}` },
                    { label: 'Claims Paid',     value: `₹${totalEarned.toLocaleString()}` },
                  ].map(s => (
                    <div key={s.label} className="bg-white/10 rounded-xl p-3">
                      <p className="text-indigo-200 text-xs">{s.label}</p>
                      <p className="text-white font-bold text-sm">{s.value}</p>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Stat cards */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {[
                {
                  label: 'Policy Status',
                  value: activePolicy ? 'Active' : 'None',
                  sub: activePolicy ? `₹${activePolicy.coverageAmount?.toLocaleString()} coverage` : 'Get protected',
                  icon: Shield,
                  iconBg: activePolicy ? 'bg-green-100' : 'bg-slate-100',
                  iconColor: activePolicy ? 'text-green-600' : 'text-slate-400',
                  badge: activePolicy ? { label: 'Live', color: 'bg-green-500' } : null,
                },
                {
                  label: 'Risk Score',
                  value: profile?.riskScore ? profile.riskScore.toFixed(0) : '—',
                  sub: profile?.riskScore
                    ? (profile.riskScore > 70 ? 'High — renew soon' : profile.riskScore > 40 ? 'Moderate risk' : 'Low risk')
                    : 'Not assessed',
                  icon: TrendingUp,
                  iconBg: 'bg-blue-100',
                  iconColor: 'text-blue-600',
                },
                {
                  label: 'Claims Paid',
                  value: claimStats.paid,
                  sub: `₹${totalEarned.toLocaleString()} received`,
                  icon: DollarSign,
                  iconBg: 'bg-violet-100',
                  iconColor: 'text-violet-600',
                },
                {
                  label: 'Pending',
                  value: claimStats.pending,
                  sub: claimStats.pending > 0 ? 'Under review' : 'All clear',
                  icon: claimStats.pending > 0 ? Clock : CheckCircle2,
                  iconBg: claimStats.pending > 0 ? 'bg-amber-100' : 'bg-green-100',
                  iconColor: claimStats.pending > 0 ? 'text-amber-600' : 'text-green-600',
                },
              ].map(card => (
                <div key={card.label} className="bg-white rounded-2xl p-4 shadow-sm border border-slate-100 relative overflow-hidden">
                  {card.badge && (
                    <span className="absolute top-3 right-3 flex items-center gap-1 text-[10px] text-white font-bold px-1.5 py-0.5 rounded-full" style={{ background: card.badge.color === 'bg-green-500' ? '#22c55e' : '#6366f1' }}>
                      <span className="w-1 h-1 rounded-full bg-white animate-pulse" />
                      {card.badge.label}
                    </span>
                  )}
                  <div className={`w-9 h-9 rounded-xl flex items-center justify-center mb-3 ${card.iconBg}`}>
                    <card.icon className={`w-4 h-4 ${card.iconColor}`} />
                  </div>
                  <p className="text-xs text-slate-500 font-medium">{card.label}</p>
                  <p className="text-2xl font-black text-slate-900">{card.value}</p>
                  <p className="text-xs text-slate-400 mt-0.5">{card.sub}</p>
                </div>
              ))}
            </div>

            {/* Risk Assessment Section */}
            <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6">
              <div className="flex items-center justify-between mb-5">
                <div>
                  <h3 className="text-base font-bold text-slate-900">AI Risk Assessment</h3>
                  <p className="text-xs text-slate-500 mt-0.5">Powered by hybrid ML + rules engine</p>
                </div>
                <button
                  onClick={calculateRisk}
                  disabled={calculatingRisk}
                  className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-xl text-sm font-semibold hover:bg-indigo-700 transition-all disabled:opacity-50"
                >
                  {calculatingRisk
                    ? <><span className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" /> Analyzing...</>
                    : <><Activity className="w-3.5 h-3.5" /> Calculate Risk</>
                  }
                </button>
              </div>

              {riskData ? (
                <div className="space-y-6">
                  {riskData.usedFallback && (
                    <div className="flex items-center gap-2 px-3 py-2 bg-amber-50 border border-amber-200 rounded-lg text-xs text-amber-700 font-medium">
                      <AlertTriangle className="w-3.5 h-3.5 flex-shrink-0" />
                      AI service unavailable — showing estimated score (rule-based model)
                    </div>
                  )}

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Gauge + quote */}
                    <div className="flex flex-col items-center gap-4">
                      <RiskGauge score={riskData.riskScore} />
                      <div className="w-full space-y-2">
                        <div className="flex justify-between items-center p-3 bg-slate-50 rounded-xl text-sm">
                          <span className="text-slate-500">Weekly Premium</span>
                          <span className="font-bold text-indigo-600">₹{riskData.weeklyPremium}</span>
                        </div>
                        <div className="flex justify-between items-center p-3 bg-slate-50 rounded-xl text-sm">
                          <span className="text-slate-500">Coverage Amount</span>
                          <span className="font-bold text-green-600">₹{riskData.coverageAmount?.toLocaleString()}</span>
                        </div>
                        {riskData.cityZone && (
                          <div className="flex justify-between items-center p-3 bg-slate-50 rounded-xl text-sm">
                            <span className="text-slate-500">Zone Detected</span>
                            <span className="font-bold text-slate-700">{riskData.cityZone}</span>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Risk breakdown bars */}
                    <div className="space-y-4">
                      <h4 className="text-sm font-bold text-slate-700">Risk Breakdown</h4>
                      <FactorBar label="Weather / Rainfall" score={riskData.riskFactors?.weatherRisk || 0}  maxScore={30} icon={CloudRain}    color="#3b82f6" />
                      <FactorBar label="Air Pollution (AQI)" score={riskData.riskFactors?.pollutionRisk || 0} maxScore={20} icon={Wind}         color="#8b5cf6" />
                      <FactorBar label="Location / Flood"   score={riskData.riskFactors?.locationRisk || 0} maxScore={30} icon={Waves}         color="#06b6d4" />
                      <FactorBar label="Income Stability"   score={riskData.riskFactors?.behaviorRisk || 0} maxScore={20} icon={DollarSign}    color="#f59e0b" />

                      {/* Environmental snapshot */}
                      {riskData.environmentalSnapshot && (
                        <div className="mt-2 grid grid-cols-2 gap-2">
                          {[
                            { k: 'rainfall_mm',     label: 'Rainfall',    unit: 'mm',  icon: '🌧️' },
                            { k: 'aqi',             label: 'AQI',         unit: '',    icon: '🏭' },
                            { k: 'temperature_c',   label: 'Temp',        unit: '°C',  icon: '🌡️' },
                            { k: 'flood_risk_pct',  label: 'Flood Risk',  unit: '%',   icon: '🌊' },
                          ].map(s => (
                            <div key={s.k} className="bg-slate-50 rounded-lg px-3 py-2 text-xs">
                              <p className="text-slate-400">{s.icon} {s.label}</p>
                              <p className="font-bold text-slate-700">{riskData.environmentalSnapshot[s.k]}{s.unit}</p>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Explainability */}
                  {riskData.explainability?.length > 0 && (
                    <div className="bg-indigo-50 rounded-xl p-4">
                      <div className="flex items-center gap-2 mb-2">
                        <Eye className="w-4 h-4 text-indigo-500" />
                        <span className="text-sm font-bold text-indigo-700">Why is your risk scored this way?</span>
                      </div>
                      <ul className="space-y-1">
                        {riskData.explainability.map((reason, i) => (
                          <li key={i} className="flex items-start gap-2 text-sm text-indigo-700">
                            <ChevronRight className="w-4 h-4 flex-shrink-0 mt-0.5" />
                            {reason}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {/* Purchase CTA */}
                  <button
                    onClick={purchasePolicy}
                    disabled={purchasing || !!activePolicy}
                    className="w-full flex items-center justify-center gap-2 py-3.5 bg-indigo-600 text-white rounded-xl font-semibold hover:bg-indigo-700 transition-all disabled:opacity-50"
                  >
                    {purchasing ? (
                      <><span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> Processing...</>
                    ) : activePolicy ? (
                      <><CheckCircle2 className="w-4 h-4" /> Policy Already Active</>
                    ) : (
                      <><CreditCard className="w-4 h-4" /> Purchase Policy — ₹{riskData.weeklyPremium}/week</>
                    )}
                  </button>
                </div>
              ) : (
                <div className="flex flex-col items-center py-10 text-center">
                  <div className="w-16 h-16 bg-indigo-50 rounded-2xl flex items-center justify-center mb-4">
                    <TrendingUp className="w-7 h-7 text-indigo-400" />
                  </div>
                  <p className="text-slate-600 font-medium mb-1">No risk data yet</p>
                  <p className="text-sm text-slate-400">Click "Calculate Risk" to get your personalised score</p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* ════ CLAIMS TAB ════ */}
        {activeTab === 'claims' && (
          <div className="space-y-5">
            {/* Summary row */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {[
                { label: 'Total Claims', value: claimStats.total,    color: 'text-slate-800' },
                { label: 'Paid',         value: claimStats.paid,     color: 'text-green-600' },
                { label: 'Pending',      value: claimStats.pending,  color: 'text-amber-600' },
                { label: 'Rejected',     value: claimStats.rejected, color: 'text-red-600'   },
              ].map(s => (
                <div key={s.label} className="bg-white rounded-2xl p-4 shadow-sm border border-slate-100 text-center">
                  <p className={`text-3xl font-black ${s.color}`}>{s.value}</p>
                  <p className="text-xs text-slate-500 font-medium mt-0.5">{s.label}</p>
                </div>
              ))}
            </div>

            {/* Claims list */}
            <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
              <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
                <h3 className="font-bold text-slate-900">Claims History</h3>
                <span className="text-xs text-slate-400 bg-slate-100 px-2 py-0.5 rounded-full">{claims.length} total</span>
              </div>
              <div className="divide-y divide-slate-100">
                {claims.length === 0 ? (
                  <div className="flex flex-col items-center py-16 text-center">
                    <History className="w-12 h-12 text-slate-200 mb-3" />
                    <p className="text-slate-500 font-medium">No claims yet</p>
                    <p className="text-sm text-slate-400">Claims will appear here when triggered</p>
                  </div>
                ) : claims.map(claim => {
                  const meta = TRIGGER_META[claim.triggerEvent?.type] || { emoji: '⚡', label: claim.triggerEvent?.type, color: '#6366f1' }
                  return (
                    <div key={claim._id} className="flex items-center gap-4 px-6 py-4 hover:bg-slate-50 transition-colors">
                      <div className="w-10 h-10 rounded-xl flex items-center justify-center text-xl flex-shrink-0"
                        style={{ background: meta.color + '15' }}>
                        {meta.emoji}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-semibold text-slate-800 text-sm">{meta.label}</p>
                        <p className="text-xs text-slate-400">
                          {new Date(claim.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="font-bold text-slate-800 text-sm">₹{claim.payoutAmount?.toLocaleString()}</p>
                        <StatusBadge status={claim.status} />
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
          </div>
        )}

        {/* ════ SIMULATE TAB ════ */}
        {activeTab === 'simulate' && (
          <div className="space-y-5">
            {/* Alert banner */}
            {!activePolicy && (
              <div className="flex items-center gap-3 p-4 bg-amber-50 border border-amber-200 rounded-2xl">
                <AlertTriangle className="w-5 h-5 text-amber-600 flex-shrink-0" />
                <div>
                  <p className="font-semibold text-amber-800 text-sm">No active policy</p>
                  <p className="text-xs text-amber-600">Go to Overview → Calculate Risk → Purchase a policy first.</p>
                </div>
              </div>
            )}

            <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6">
              <div className="flex items-center gap-3 mb-2">
                <div className="w-9 h-9 bg-indigo-600 rounded-xl flex items-center justify-center">
                  <Zap className="w-4 h-4 text-white" />
                </div>
                <div>
                  <h3 className="font-bold text-slate-900">Parametric Trigger Simulator</h3>
                  <p className="text-xs text-slate-500">Simulate real environmental events — trigger a live claim instantly</p>
                </div>
              </div>

              <div className="mt-1 flex items-center gap-2 px-3 py-2 bg-blue-50 rounded-lg mb-5">
                <Info className="w-3.5 h-3.5 text-blue-500 flex-shrink-0" />
                <p className="text-xs text-blue-700">
                  This demo feature creates a <strong>real claim in the database</strong> and processes it through the full AI fraud-detection pipeline.
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                {Object.entries(TRIGGER_META).map(([type, meta]) => (
                  <button
                    key={type}
                    onClick={() => simulateEvent(type)}
                    disabled={simulating || !activePolicy}
                    className="flex items-center gap-3 p-4 rounded-xl border-2 border-slate-100 hover:border-indigo-300 hover:bg-indigo-50 transition-all text-left group disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <span className="text-2xl">{meta.emoji}</span>
                    <div>
                      <p className="font-semibold text-slate-800 text-sm group-hover:text-indigo-700">{meta.label}</p>
                      <p className="text-xs text-slate-400 capitalize">{type} trigger</p>
                    </div>
                    {simulating && (
                      <span className="ml-auto w-4 h-4 border-2 border-indigo-300 border-t-indigo-600 rounded-full animate-spin" />
                    )}
                  </button>
                ))}
              </div>
            </div>

            {/* Simulation Result */}
            {simResult && (
              <div className="bg-white rounded-2xl shadow-sm border-2 border-green-200 overflow-hidden animate-slide-up">
                <div className="px-6 py-4 bg-green-50 border-b border-green-200 flex items-center gap-2">
                  <CheckCircle2 className="w-5 h-5 text-green-600" />
                  <span className="font-bold text-green-800">Claim Auto-Processed!</span>
                </div>
                <div className="p-6 grid grid-cols-2 gap-4">
                  <div className="space-y-3">
                    <div>
                      <p className="text-xs text-slate-500">Trigger Event</p>
                      <p className="font-bold text-slate-800">
                        {simResult.claim?.trigger?.icon} {simResult.claim?.trigger?.label}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-slate-500">Payout Amount</p>
                      <p className="font-black text-green-600 text-2xl">
                        ₹{simResult.claim?.payoutAmount?.toLocaleString()}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-slate-500">Claim Status</p>
                      <StatusBadge status={simResult.claim?.status} />
                    </div>
                  </div>
                  <div className="space-y-3">
                    <div>
                      <p className="text-xs text-slate-500">Fraud Check</p>
                      <p className={`font-semibold text-sm ${simResult.claim?.fraudCheck?.passed ? 'text-green-600' : 'text-red-600'}`}>
                        {simResult.claim?.fraudCheck?.passed ? '✅ Passed' : '❌ Flagged'}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-slate-500">Fraud Probability</p>
                      <p className="font-bold text-slate-700">
                        {((simResult.claim?.fraudCheck?.probability || 0) * 100).toFixed(1)}%
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-slate-500">Payment ID</p>
                      <p className="text-xs font-mono text-slate-500 truncate">{simResult.claim?.paymentId || '—'}</p>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

      </div>

      {/* ── Razorpay Payment Modal Overlay ── */}
      {showPayoutModal && simResult && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm animate-fade-in">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm overflow-hidden animate-slide-up">
            {/* Header */}
            <div className="px-5 py-4 bg-[#0a2342] text-white flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-6 h-6 bg-blue-500 rounded border border-blue-400 flex items-center justify-center font-bold text-xs">R</div>
                <span className="font-semibold tracking-wider text-sm">Razorpay</span>
              </div>
              <span className="text-[10px] bg-white/20 px-2 py-1 rounded text-white/90 uppercase tracking-widest font-bold">IMPS Transfer</span>
            </div>
            {/* Body */}
            <div className="p-8 flex flex-col items-center text-center pb-6">
              {payoutStep === 0 ? (
                <>
                  <div className="w-14 h-14 border-4 border-slate-100 border-t-blue-600 rounded-full animate-spin mb-5"></div>
                  <h3 className="font-bold text-slate-800 text-lg mb-1">Processing Payout</h3>
                  <p className="text-xs text-slate-500 font-medium">Transferring to Bank Account ending in **0492</p>
                  <p className="text-3xl font-black text-slate-900 mt-4">₹{simResult.claim?.payoutAmount?.toLocaleString()}</p>
                </>
              ) : (
                <>
                  <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-4">
                    <CheckCircle2 className="w-8 h-8 text-green-600" />
                  </div>
                  <h3 className="font-bold text-green-700 text-lg mb-1">Payment Successful!</h3>
                  <p className="text-xs text-slate-500 font-medium break-all bg-slate-50 px-3 py-2 rounded-lg border border-slate-100 w-full mt-3">TxID: {simResult.claim?.paymentId}</p>
                  <button 
                    onClick={() => setShowPayoutModal(false)}
                    className="mt-6 w-full py-3 bg-blue-600 text-white rounded-xl font-bold hover:bg-blue-700 transition"
                  >
                    Return to Dashboard
                  </button>
                </>
              )}
            </div>
            {/* Footer */}
            <div className="px-5 py-3 bg-slate-50 border-t border-slate-100 flex items-center justify-center gap-1.5 text-[10px] text-slate-400 font-semibold uppercase tracking-widest">
              <Shield className="w-3 h-3 text-slate-400" /> Secured by Razorpay
            </div>
          </div>
        </div>
      )}

    </div>
  )
}
