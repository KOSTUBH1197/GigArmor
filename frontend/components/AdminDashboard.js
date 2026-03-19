'use client'

import { useState, useEffect } from 'react'
import axios from 'axios'
import { 
  Users, CreditCard, AlertTriangle, TrendingUp, MapPin, LogOut,
  BarChart3, Shield, Bell, Search, Filter, RefreshCw, ChevronRight
} from 'lucide-react'
import { Bar, Line } from 'react-chartjs-2'
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  PointElement,
} from 'chart.js'

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  PointElement
)

const chartOptions = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: {
      position: 'bottom',
      labels: {
        usePointStyle: true,
        padding: 20,
        font: { size: 12 }
      }
    }
  },
  scales: {
    x: {
      grid: { display: false },
      ticks: { font: { size: 11 } }
    },
    y: {
      grid: { color: '#f1f5f9' },
      ticks: { font: { size: 11 } }
    }
  }
}

export default function AdminDashboard({ user, onLogout }) {
  const [dashboardData, setDashboardData] = useState(null)
  const [fraudAlerts, setFraudAlerts] = useState([])
  const [riskHeatmap, setRiskHeatmap] = useState([])
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState('overview')
  const [searchQuery, setSearchQuery] = useState('')

  const fetchDashboardData = async () => {
    setLoading(true)
    try {
      const token = localStorage.getItem('token')
      const config = { headers: { Authorization: `Bearer ${token}` } }

      const [dashboardRes, fraudRes, riskRes] = await Promise.all([
        axios.get('http://localhost:5000/api/admin/dashboard', config),
        axios.get('http://localhost:5000/api/admin/fraud-alerts', config),
        axios.get('http://localhost:5000/api/admin/risk-heatmap', config),
      ])

      setDashboardData(dashboardRes.data)
      setFraudAlerts(fraudRes.data)
      setRiskHeatmap(riskRes.data)
    } catch (error) {
      console.error('Error fetching dashboard data:', error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchDashboardData()
  }, [])

  if (loading) {
    return (
      <div className="min-h-screen bg-surface-50 flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-primary-200 border-t-primary-600 rounded-full animate-spin"></div>
          <p className="text-surface-500 font-medium">Loading dashboard...</p>
        </div>
      </div>
    )
  }

  const claimsRatioChart = {
    labels: ['Approved', 'Rejected', 'Pending'],
    datasets: [{
      label: 'Claims',
      data: [
        dashboardData.claimsRatio * dashboardData.totalClaims / 100,
        (1 - dashboardData.claimsRatio / 100) * dashboardData.totalClaims * 0.7,
        dashboardData.pendingClaims
      ],
      backgroundColor: ['#10B981', '#EF4444', '#F59E0B'],
      borderRadius: 8,
    }],
  }

  const revenueChart = {
    labels: ['Week 1', 'Week 2', 'Week 3', 'Week 4'],
    datasets: [{
      label: 'Revenue',
      data: [dashboardData.weeklyRevenue * 0.8, dashboardData.weeklyRevenue * 0.9, dashboardData.weeklyRevenue, dashboardData.weeklyRevenue * 1.1],
      borderColor: '#2563eb',
      backgroundColor: 'rgba(37, 99, 235, 0.1)',
      fill: true,
      tension: 0.4,
      pointBackgroundColor: '#2563eb',
      pointRadius: 4,
    }],
  }

  const stats = [
    {
      title: 'Total Workers',
      value: dashboardData.totalWorkers,
      icon: Users,
      color: 'bg-blue-500',
      bgColor: 'bg-blue-50',
      iconColor: 'text-blue-600'
    },
    {
      title: 'Active Policies',
      value: dashboardData.totalPolicies,
      icon: Shield,
      color: 'bg-green-500',
      bgColor: 'bg-green-50',
      iconColor: 'text-green-600'
    },
    {
      title: 'Weekly Revenue',
      value: `₹${dashboardData.weeklyRevenue.toLocaleString()}`,
      icon: TrendingUp,
      color: 'bg-purple-500',
      bgColor: 'bg-purple-50',
      iconColor: 'text-purple-600'
    },
    {
      title: 'Pending Claims',
      value: dashboardData.pendingClaims,
      icon: AlertTriangle,
      color: 'bg-amber-500',
      bgColor: 'bg-amber-50',
      iconColor: 'text-amber-600'
    },
  ]

  const tabs = [
    { id: 'overview', label: 'Overview', icon: BarChart3 },
    { id: 'fraud', label: 'Fraud Alerts', icon: AlertTriangle },
    { id: 'risk', label: 'Risk Map', icon: MapPin },
  ]

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
              <h1 className="text-xl font-bold text-surface-900 hidden sm:block">GigArmor Admin</h1>
            </div>

            {/* Search Bar */}
            <div className="flex-1 max-w-md mx-4 hidden md:block">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-surface-400" />
                <input
                  type="text"
                  placeholder="Search workers, policies..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 bg-surface-50 border border-surface-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                />
              </div>
            </div>

            {/* Right Section */}
            <div className="flex items-center gap-3">
              {/* Refresh Button */}
              <button
                onClick={fetchDashboardData}
                className="p-2 text-surface-500 hover:text-primary-600 hover:bg-primary-50 rounded-lg transition-colors"
                title="Refresh data"
              >
                <RefreshCw className="h-5 w-5" />
              </button>
              
              {/* Notifications */}
              <button className="p-2 text-surface-500 hover:text-primary-600 hover:bg-primary-50 rounded-lg transition-colors relative">
                <Bell className="h-5 w-5" />
                <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
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
                className="ml-2 p-2 text-surface-500 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                title="Logout"
              >
                <LogOut className="h-5 w-5" />
              </button>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {stats.map((stat, index) => (
            <div 
              key={stat.title} 
              className="card p-5 animate-slide-up"
              style={{ animationDelay: `${index * 100}ms` }}
            >
              <div className="flex items-center justify-between">
                <div className={`p-3 rounded-xl ${stat.bgColor}`}>
                  <stat.icon className={`h-6 w-6 ${stat.iconColor}`} />
                </div>
                <span className="text-xs font-medium text-surface-400 bg-surface-100 px-2 py-1 rounded-full">
                  +12%
                </span>
              </div>
              <div className="mt-4">
                <p className="text-2xl font-bold text-surface-900">{stat.value}</p>
                <p className="text-sm text-surface-500">{stat.title}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Tabs */}
        <div className="flex gap-2 mb-6 overflow-x-auto pb-2">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-lg font-medium text-sm transition-all ${
                activeTab === tab.id
                  ? 'bg-primary-600 text-white shadow-md'
                  : 'bg-white text-surface-600 hover:bg-surface-50'
              }`}
            >
              <tab.icon className="h-4 w-4" />
              {tab.label}
            </button>
          ))}
        </div>

        {/* Content based on active tab */}
        {activeTab === 'overview' && (
          <div className="space-y-6 animate-fade-in">
            {/* Charts */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="card p-6">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-lg font-semibold text-surface-900">Claims Distribution</h3>
                  <span className="text-xs text-surface-500">This month</span>
                </div>
                <div className="h-64">
                  <Bar data={claimsRatioChart} options={chartOptions} />
                </div>
              </div>

              <div className="card p-6">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-lg font-semibold text-surface-900">Revenue Trend</h3>
                  <span className="text-xs text-surface-500">Last 4 weeks</span>
                </div>
                <div className="h-64">
                  <Line data={revenueChart} options={chartOptions} />
                </div>
              </div>
            </div>

            {/* Quick Actions */}
            <div className="card p-6">
              <h3 className="text-lg font-semibold text-surface-900 mb-4">Quick Actions</h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <button className="flex flex-col items-center gap-2 p-4 rounded-xl bg-primary-50 hover:bg-primary-100 transition-colors">
                  <Users className="h-6 w-6 text-primary-600" />
                  <span className="text-sm font-medium text-primary-700">Manage Users</span>
                </button>
                <button className="flex flex-col items-center gap-2 p-4 rounded-xl bg-green-50 hover:bg-green-100 transition-colors">
                  <CreditCard className="h-6 w-6 text-green-600" />
                  <span className="text-sm font-medium text-green-700">View Policies</span>
                </button>
                <button className="flex flex-col items-center gap-2 p-4 rounded-xl bg-amber-50 hover:bg-amber-100 transition-colors">
                  <AlertTriangle className="h-6 w-6 text-amber-600" />
                  <span className="text-sm font-medium text-amber-700">Review Claims</span>
                </button>
                <button className="flex flex-col items-center gap-2 p-4 rounded-xl bg-purple-50 hover:bg-purple-100 transition-colors">
                  <BarChart3 className="h-6 w-6 text-purple-600" />
                  <span className="text-sm font-medium text-purple-700">Analytics</span>
                </button>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'fraud' && (
          <div className="card animate-fade-in">
            <div className="px-6 py-4 border-b border-surface-200 flex items-center justify-between">
              <h3 className="text-lg font-semibold text-surface-900">Fraud Alerts</h3>
              <div className="flex items-center gap-2">
                <button className="flex items-center gap-1 px-3 py-1.5 text-sm text-surface-600 bg-surface-100 rounded-lg hover:bg-surface-200 transition-colors">
                  <Filter className="h-4 w-4" />
                  Filter
                </button>
              </div>
            </div>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-surface-200">
                <thead className="bg-surface-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-surface-500 uppercase tracking-wider">
                      Worker
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-surface-500 uppercase tracking-wider">
                      Reason
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-surface-500 uppercase tracking-wider">
                      Amount
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-surface-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-surface-500 uppercase tracking-wider">
                      Action
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-surface-200">
                  {fraudAlerts.slice(0, 10).map((alert) => (
                    <tr key={alert._id} className="hover:bg-surface-50 transition-colors">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 bg-primary-100 rounded-full flex items-center justify-center">
                            <span className="text-xs font-semibold text-primary-600">
                              {alert.workerId?.name?.charAt(0) || 'U'}
                            </span>
                          </div>
                          <span className="text-sm font-medium text-surface-900">
                            {alert.workerId?.name || 'Unknown'}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <p className="text-sm text-surface-600 line-clamp-1">
                          {alert.fraudCheck?.reasons?.join(', ') || 'No reason specified'}
                        </p>
                      </td>
                      <td className="px-6 py-4 text-sm font-medium text-surface-900">
                        ₹{alert.payoutAmount?.toLocaleString() || 0}
                      </td>
                      <td className="px-6 py-4">
                        <span className="inline-flex px-2.5 py-1 text-xs font-semibold rounded-full bg-red-100 text-red-700">
                          Flagged
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <button className="flex items-center gap-1 text-sm text-primary-600 hover:text-primary-700 font-medium">
                          Review <ChevronRight className="h-4 w-4" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {activeTab === 'risk' && (
          <div className="card animate-fade-in">
            <div className="px-6 py-4 border-b border-surface-200">
              <h3 className="text-lg font-semibold text-surface-900">Risk Heatmap</h3>
            </div>
            <div className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {riskHeatmap.slice(0, 9).map((worker) => (
                  <div 
                    key={worker._id} 
                    className="flex items-center justify-between p-4 border border-surface-200 rounded-xl hover:shadow-md transition-shadow"
                  >
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-surface-100 rounded-lg">
                        <MapPin className="h-5 w-5 text-surface-500" />
                      </div>
                      <div>
                        <p className="text-sm font-medium text-surface-900">{worker.name}</p>
                        <p className="text-xs text-surface-500">
                          {worker.location?.latitude?.toFixed(2)}, {worker.location?.longitude?.toFixed(2)}
                        </p>
                      </div>
                    </div>
                    <div className={`px-3 py-1.5 rounded-full text-xs font-bold ${
                      worker.riskScore > 70 ? 'bg-red-100 text-red-700' :
                      worker.riskScore > 40 ? 'bg-yellow-100 text-yellow-700' :
                      'bg-green-100 text-green-700'
                    }`}>
                      {worker.riskScore?.toFixed(1)}%
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
