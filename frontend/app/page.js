'use client'

import { useState } from 'react'
import Login from '../components/Login'
import Register from '../components/Register'
import WorkerDashboard from '../components/WorkerDashboard'
import AdminDashboard from '../components/AdminDashboard'
import { Shield, Star, Zap, Heart, ArrowRight, Activity } from 'lucide-react'

export default function Home() {
  const [currentView, setCurrentView] = useState('login')
  const [user, setUser] = useState(null)

  const handleLogin = (userData) => {
    setUser(userData)
    setCurrentView(userData.role === 'admin' ? 'admin' : 'worker')
  }

  const handleLogout = () => {
    setUser(null)
    setCurrentView('login')
    localStorage.removeItem('token')
  }

  // Dashboard view
  if (user) {
    return (
      <div className="min-h-screen bg-surface-50">
        {user.role === 'admin' ? (
          <AdminDashboard user={user} onLogout={handleLogout} />
        ) : (
          <WorkerDashboard user={user} onLogout={handleLogout} />
        )}
      </div>
    )
  }

  // Auth page view
  return (
    <div className="min-h-screen relative overflow-hidden">
      {/* Animated Background */}
      <div className="absolute inset-0 bg-gradient-to-br from-primary-900 via-primary-800 to-brand-700">
        {/* Abstract shapes */}
        <div className="absolute top-0 left-0 w-96 h-96 bg-primary-500/20 rounded-full blur-3xl -translate-x-1/2 -translate-y-1/2 animate-pulse-soft"></div>
        <div className="absolute bottom-0 right-0 w-[500px] h-[500px] bg-brand-500/20 rounded-full blur-3xl translate-x-1/3 translate-y-1/3 animate-pulse-soft animate-delay-200"></div>
        <div className="absolute top-1/2 left-1/2 w-64 h-64 bg-primary-400/10 rounded-full blur-2xl animate-float"></div>
        
        {/* Grid pattern overlay */}
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxwYXRoIGQ9Ik0zNiAxOGMtOS45NDEgMC0xOCA4LjA1OS0xOCAxOHM4LjA1OSAxOCAxOCAxOCAxOC04LjA1OSAxOC0xOC04LjA1OS0xOC0xOC0xOHptMCAzMmMtNy43MzIgMC0xNC02LjI2OC0xNC0xNHM2LjI2OC0xNCAxNC0xNCAxNCA2LjI2OCAxNCAxNC02LjI2OCAxNC0xNCAxNHoiIGZpbGw9IiNmZmYiIGZpbGwtb3BhY2l0eT0iLjAyIi8+PC9nPjwvc3ZnPg==')] opacity-30"></div>
      </div>

      {/* Main Content */}
      <div className="relative min-h-screen flex items-center justify-center px-4 py-12">
        {/* Brand Section - Left Side on Large Screens */}
        <div className="hidden lg:flex flex-col justify-center max-w-lg mr-16 text-white">
          <div className="flex items-center gap-3 mb-6 animate-fade-in">
            <div className="p-3 bg-white/10 rounded-xl backdrop-blur-sm">
              <Shield className="w-10 h-10 text-brand-400" />
            </div>
            <span className="text-3xl font-bold tracking-tight">GigArmor</span>
          </div>
          
          <h1 className="text-5xl font-bold mb-6 leading-tight animate-slide-up">
            Protection for Every <span className="text-brand-400">Delivery</span> Journey
          </h1>
          
          <p className="text-lg text-primary-100 mb-8 animate-slide-up animate-delay-100">
            AI-powered parametric insurance designed specifically for gig workers. 
            Get instant coverage, hassle-free claims, and peace of mind on every delivery.
          </p>

          {/* Features List */}
          <div className="space-y-4 animate-slide-up animate-delay-200">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-brand-500/20 rounded-lg">
                <Zap className="w-5 h-5 text-brand-400" />
              </div>
              <span className="text-primary-50">Instant coverage with AI risk assessment</span>
            </div>
            <div className="flex items-center gap-3">
              <div className="p-2 bg-brand-500/20 rounded-lg">
                <Activity className="w-5 h-5 text-brand-400" />
              </div>
              <span className="text-primary-50">Automated claims processing</span>
            </div>
            <div className="flex items-center gap-3">
              <div className="p-2 bg-brand-500/20 rounded-lg">
                <Heart className="w-5 h-5 text-brand-400" />
              </div>
              <span className="text-primary-50">Tailored for Swiggy, Zomato, Zepto & more</span>
            </div>
          </div>

          {/* Trust Indicators */}
          <div className="mt-12 pt-6 border-t border-white/10 animate-fade-in animate-delay-300">
            <p className="text-sm text-primary-200 mb-3">Trusted by 10,000+ delivery partners</p>
            <div className="flex items-center gap-1">
              {[...Array(5)].map((_, i) => (
                <Star key={i} className="w-5 h-5 text-yellow-400 fill-yellow-400" />
              ))}
              <span className="ml-2 text-sm text-primary-100">4.9/5 rating</span>
            </div>
          </div>
        </div>

        {/* Auth Card */}
        <div className="w-full max-w-md">
          {/* Mobile Brand Header */}
          <div className="lg:hidden text-center mb-8">
            <div className="inline-flex items-center gap-2 mb-4">
              <div className="p-2 bg-white/10 rounded-xl backdrop-blur-sm">
                <Shield className="w-8 h-8 text-brand-400" />
              </div>
              <span className="text-2xl font-bold text-white">GigArmor</span>
            </div>
            <p className="text-primary-100">Insurance for delivery workers</p>
          </div>

          <div className="glass rounded-2xl shadow-2xl">
            {currentView === 'login' ? (
              <Login 
                onSwitchToRegister={() => setCurrentView('register')} 
                onLogin={handleLogin} 
              />
            ) : (
              <Register 
                onSwitchToLogin={() => setCurrentView('login')} 
                onRegister={handleLogin} 
              />
            )}
          </div>

          {/* Mobile CTA */}
          <div className="lg:hidden mt-8 text-center text-white/80">
            <p className="text-sm">
              AI-powered protection for gig workers
            </p>
            <div className="flex items-center justify-center gap-1 mt-2">
              <Star className="w-4 h-4 text-yellow-400 fill-yellow-400" />
              <span className="text-sm text-primary-100">4.9/5 from 10,000+ users</span>
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="absolute bottom-4 left-0 right-0 text-center">
        <p className="text-xs text-primary-300/60">
          © 2024 GigArmor. Secured with enterprise-grade encryption.
        </p>
      </div>
    </div>
  )
}
