'use client';
import { useEffect, useState } from 'react';
import { dashboardAPI } from '@/lib/api';
import { redirect } from 'next/navigation'
import { useAuth } from '@/context/AuthContext';
import Layout from '@/components/Layout';
import Link from 'next/link';
import { Users, ShoppingBag, TrendingUp, AlertCircle, DollarSign, Clock, Crown, ArrowRight, Activity } from 'lucide-react';
import { formatDistanceToNow  } from 'date-fns';
// import DateFormatter from '@/components/DateFormatter';

export default function DashboardPage() {
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const { subscription, token } = useAuth();

  useEffect(() => {
    // if (!token) {
    //     redirect('/login')
    //   }
    loadStats();
    }, [])

  // if (!token) return null // or a loading spinner

  const loadStats = async () => {
    try {
      const response = await dashboardAPI.getStats();
      setStats(response.data);
    } catch (error) {
      console.error('Failed to load stats:', error);
    } finally {
      setLoading(false);
    }
  };

  const getActivityIcon = (action: string) => {
    switch (action) {
      case 'create': return '➕';
      case 'update': return '✏️';
      case 'delete': return '🗑️';
      case 'login': return '🔐';
      case 'logout': return '👋';
      default: return '📝';
    }
  };

  const getActivityColor = (action: string) => {
    switch (action) {
      case 'create': return 'text-green-600 bg-green-50';
      case 'update': return 'text-blue-600 bg-blue-50';
      case 'delete': return 'text-red-600 bg-red-50';
      case 'login': return 'text-purple-600 bg-purple-50';
      case 'logout': return 'text-gray-600 bg-gray-50';
      default: return 'text-gray-600 bg-gray-50';
    }
  };

  const statCards = [
    {
      name: 'Total Customers',
      value: stats?.total_customers || 0,
      icon: Users,
      color: 'bg-blue-500',
      bgColor: 'bg-blue-50',
    },
    {
      name: 'Total Orders',
      value: stats?.total_orders || 0,
      icon: ShoppingBag,
      color: 'bg-purple-500',
      bgColor: 'bg-purple-50',
    },
    {
      name: 'Pending Orders',
      value: stats?.pending_orders || 0,
      icon: Clock,
      color: 'bg-yellow-500',
      bgColor: 'bg-yellow-50',
    },
    {
      name: 'Completed Orders',
      value: stats?.completed_orders || 0,
      icon: TrendingUp,
      color: 'bg-green-500',
      bgColor: 'bg-green-50',
    },
    {
      name: 'Total Revenue',
      value: `₦${stats?.total_revenue?.toLocaleString() || 0}`,
      icon: DollarSign,
      color: 'bg-emerald-500',
      bgColor: 'bg-emerald-50',
    },
    {
      name: 'Pending Payments',
      value: `₦${stats?.pending_payments?.toLocaleString() || 0}`,
      icon: AlertCircle,
      color: 'bg-red-500',
      bgColor: 'bg-red-50',
    },
  ];

  if (loading) {
    return (
      <Layout>
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
          <p className="mt-1 text-sm text-gray-500">Overview of your tailor shop</p>
        </div>

        {/* Subscription Banner */}
        {stats?.subscription && (
          <div className={`rounded-xl p-6 ${
            stats.subscription.plan === 'free' 
              ? 'bg-gradient-to-r from-blue-500 to-blue-600' 
              : stats.subscription.plan === 'basic'
              ? 'bg-gradient-to-r from-purple-500 to-purple-600'
              : 'bg-gradient-to-r from-amber-500 to-amber-600'
          }`}>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="bg-white/20 p-3 rounded-xl">
                  <Crown className="h-8 w-8 text-white" />
                </div>
                <div className="text-white">
                  <h3 className="text-xl font-bold capitalize">{stats.subscription.plan} Plan</h3>
                  <p className="text-sm text-white/80">
                    {stats.subscription.plan === 'free' 
                      ? 'Upgrade to unlock more features'
                      : `${stats.subscription.max_customers} customers, ${stats.subscription.max_orders} orders`
                    }
                  </p>
                </div>
              </div>
              <Link 
                href="/subscription"
                className="flex items-center gap-2 bg-white text-gray-900 px-6 py-3 rounded-lg font-medium hover:bg-white/90 transition"
              >
                {stats.subscription.plan === 'free' ? 'Upgrade Now' : 'Manage Plan'}
                <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {statCards.map((stat) => (
            <div
              key={stat.name}
              className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow"
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">{stat.name}</p>
                  <p className="mt-2 text-3xl font-bold text-gray-900">{stat.value}</p>
                </div>
                <div className={`${stat.bgColor} p-3 rounded-xl`}>
                  <stat.icon className={`h-6 w-6 ${stat.color.replace('bg-', 'text-')}`} />
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center gap-2 mb-4">
              <Activity className="h-5 w-5 text-gray-600" />
              <h3 className="text-lg font-semibold text-gray-900">Recent Activity</h3>
            </div>
            <div className="space-y-3">
              {stats?.recent_activities && stats.recent_activities.length > 0 ? (
                stats.recent_activities.map((activity: any) => (
                  <div key={activity.id} className="flex items-start gap-3 p-3 rounded-lg hover:bg-gray-50 transition">
                    <div className={`flex-shrink-0 w-8 h-8 rounded-lg ${getActivityColor(activity.action)} flex items-center justify-center text-sm`}>
                      {getActivityIcon(activity.action)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900 truncate">
                        {activity.description}
                      </p>
                      <div className="flex items-center gap-2 mt-1">
                        <span className="text-xs text-gray-500 capitalize">{activity.resource_type}</span>
                        <span className="text-xs text-gray-400">•</span>
                        <span className="text-xs text-gray-500">
                          {formatDistanceToNow(new Date(activity.created_at), { addSuffix: true })}
                        </span>
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-sm text-gray-500 text-center py-8">No recent activity</p>
              )}
              </div>
            </div>
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h3>
            <div className="space-y-3">
              <Link href="/orders" className="block w-full text-left px-4 py-3 bg-primary-50 text-primary-700 rounded-lg hover:bg-primary-100 transition font-medium">
                + New Order
              </Link>
              <Link href="/customers" className="block w-full text-left px-4 py-3 bg-gray-50 text-gray-700 rounded-lg hover:bg-gray-100 transition font-medium">
                + New Customer
              </Link>
              <Link href="/measurements" className="block w-full text-left px-4 py-3 bg-gray-50 text-gray-700 rounded-lg hover:bg-gray-100 transition font-medium">
                + New Measurement
              </Link>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}