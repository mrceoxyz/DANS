'use client';
import { useEffect, useState } from 'react';
import { subscriptionAPI } from '@/lib/api';
import Layout from '@/components/Layout';
import { redirect } from 'next/navigation'
import { useAuth } from '@/context/AuthContext';
import { Crown, Check, Zap, AlertCircle, TrendingUp, Users, ShoppingBag, Package } from 'lucide-react';

export default function SubscriptionPage() {
  const [subscription, setSubscription] = useState<any>(null);
  const [limits, setLimits] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [upgrading, setUpgrading] = useState(false);

  const formatter = new Intl.NumberFormat('en-US');
  const { token } = useAuth();

  useEffect(() => {
    // if (!token) {
    //   redirect('/login')
    // }
    loadSubscriptionData();
  }, [token]);

  const loadSubscriptionData = async () => {
    try {
      const [subRes, limitsRes] = await Promise.all([
        subscriptionAPI.getCurrent(),
        subscriptionAPI.checkLimits(),
      ]);
      setSubscription(subRes.data[0]);
      setLimits(limitsRes.data);
    } catch (error) {
      console.error('Failed to load subscription:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleUpgrade = async (plan: string) => {
    if (confirm(`Upgrade to ${plan} plan?`)) {
      setUpgrading(true);
      try {
        await subscriptionAPI.upgrade(plan);
        await loadSubscriptionData();
        alert('Successfully upgraded!');
      } catch (error) {
        console.error('Failed to upgrade:', error);
        alert('Upgrade failed');
      } finally {
        setUpgrading(false);
      }
    }
  };

  const handleCancel = async () => {
    if (confirm('Are you sure you want to cancel your subscription?')) {
      try {
        await subscriptionAPI.cancel();
        await loadSubscriptionData();
        alert('Subscription cancelled');
      } catch (error) {
        console.error('Failed to cancel:', error);
      }
    }
  };

  const plans = [
    {
      name: 'Free',
      plan: 'free',
      price: '₦0',
      period: 'forever',
      description: 'Perfect for getting started',
      features: [
        'Up to 10 customers',
        'Up to 20 orders',
        'Up to 15 fabrics',
        'Basic measurements',
        'Payment tracking',
      ],
      limits: { customers: 10, orders: 20, fabrics: 15 },
      color: 'from-gray-500 to-gray-600',
      icon: Users,
    },
    {
      name: 'Basic',
      plan: 'basic',
      price: `₦`+formatter.format(2500),
      period: 'per month',
      description: 'Best for growing businesses',
      features: [
        'Up to 100 customers',
        'Up to 500 orders',
        'Up to 200 fabrics',
        'Advanced measurements',
        'Payment tracking',
        'Priority support',
        'Export reports',
      ],
      limits: { customers: 100, orders: 500, fabrics: 200 },
      color: 'from-blue-500 to-blue-600',
      icon: TrendingUp,
      popular: true,
    },
    {
      name: 'Enterprise',
      plan: 'enterprise',
      price: `₦`+formatter.format(5000),
      period: 'per month',
      description: 'For established businesses',
      features: [
        'Unlimited customers',
        'Unlimited orders',
        'Unlimited fabrics',
        'All measurements features',
        'Advanced analytics',
        'Priority support 24/7',
        'Custom integrations',
        'Dedicated account manager',
      ],
      limits: { customers: 999999, orders: 999999, fabrics: 999999 },
      color: 'from-purple-500 to-purple-600',
      icon: Crown,
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
      <div className="space-y-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Subscription</h1>
          <p className="mt-1 text-sm text-gray-500">Manage your subscription plan</p>
        </div>

        {/* Current Plan Status */}
        {subscription && (
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between">
              <div>
                <div className="flex items-center gap-3">
                  <Crown className="h-8 w-8 text-primary-600" />
                  <div>
                    <h2 className="text-2xl font-bold text-gray-900 capitalize">
                      {subscription.plan} Plan
                    </h2>
                    <p className="text-sm text-gray-500">
                      Status: <span className={`font-semibold ${subscription.status === 'active' ? 'text-green-600' : 'text-red-600'}`}>
                        {subscription.status}
                      </span>
                    </p>
                  </div>
                </div>
              </div>
              {subscription.end_date && (
                <div className="text-right">
                  <p className="text-sm text-gray-500">Renews in</p>
                  <p className="text-2xl font-bold text-gray-900">{subscription.days_remaining} days</p>
                </div>
              )}
            </div>

            {subscription.plan !== 'free' && (
              <button
                onClick={handleCancel}
                className="bg-green-500 text-white text-xs font-bold p-3 rounded-full flex items-center gap-1"
              >
                Cancel Subscription
              </button>
            )}
          </div>
        )}

        {/* Usage Statistics */}
        {limits && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <div className="flex items-center justify-between mb-4">
                <Users className="h-8 w-8 text-blue-500" />
                <span className={`text-sm font-semibold ${limits.customers.can_add ? 'text-green-600' : 'text-red-600'}`}>
                  {limits.customers.can_add ? 'Available' : 'Limit Reached'}
                </span>
              </div>
              <h3 className="text-lg font-semibold text-gray-900">Customers</h3>
              <div className="mt-2">
                <div className="flex justify-between text-sm text-gray-600 mb-1">
                  <span>{limits.customers.current} used</span>
                  <span>{limits.customers.max} limit</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className={`h-2 rounded-full ${limits.customers.current >= limits.customers.max ? 'bg-red-500' : 'bg-blue-500'}`}
                    style={{ width: `${Math.min((limits.customers.current / limits.customers.max) * 100, 100)}%` }}
                  />
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <div className="flex items-center justify-between mb-4">
                <ShoppingBag className="h-8 w-8 text-purple-500" />
                <span className={`text-sm font-semibold ${limits.orders.can_add ? 'text-green-600' : 'text-red-600'}`}>
                  {limits.orders.can_add ? 'Available' : 'Limit Reached'}
                </span>
              </div>
              <h3 className="text-lg font-semibold text-gray-900">Orders</h3>
              <div className="mt-2">
                <div className="flex justify-between text-sm text-gray-600 mb-1">
                  <span>{limits.orders.current} used</span>
                  <span>{limits.orders.max} limit</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className={`h-2 rounded-full ${limits.orders.current >= limits.orders.max ? 'bg-red-500' : 'bg-purple-500'}`}
                    style={{ width: `${Math.min((limits.orders.current / limits.orders.max) * 100, 100)}%` }}
                  />
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <div className="flex items-center justify-between mb-4">
                <Package className="h-8 w-8 text-green-500" />
                <span className={`text-sm font-semibold ${limits.fabrics.can_add ? 'text-green-600' : 'text-red-600'}`}>
                  {limits.fabrics.can_add ? 'Available' : 'Limit Reached'}
                </span>
              </div>
              <h3 className="text-lg font-semibold text-gray-900">Fabrics</h3>
              <div className="mt-2">
                <div className="flex justify-between text-sm text-gray-600 mb-1">
                  <span>{limits.fabrics.current} used</span>
                  <span>{limits.fabrics.max} limit</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className={`h-2 rounded-full ${limits.fabrics.current >= limits.fabrics.max ? 'bg-red-500' : 'bg-green-500'}`}
                    style={{ width: `${Math.min((limits.fabrics.current / limits.fabrics.max) * 100, 100)}%` }}
                  />
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Upgrade Warning */}
        {limits && (!limits.customers.can_add || !limits.orders.can_add || !limits.fabrics.can_add) && (
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 flex items-start gap-3">
            <AlertCircle className="h-5 w-5 text-yellow-600 flex-shrink-0 mt-0.5" />
            <div>
              <h3 className="text-sm font-semibold text-yellow-900">Limit Reached</h3>
              <p className="text-sm text-yellow-700 mt-1">
                You've reached your plan limit. Upgrade to continue adding more items.
              </p>
            </div>
          </div>
        )}

        {/* Pricing Plans */}
        <div>
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Available Plans</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {plans.map((planItem) => {
              const isCurrent = subscription?.plan === planItem.plan;
              const Icon = planItem.icon;

              return (
                <div
                  key={planItem.plan}
                  className={`relative bg-white rounded-xl shadow-lg border-2 ${
                    planItem.popular ? 'border-gray-200' : 'border-gray-200'
                  } p-6 hover:shadow-xl transition-shadow ${
                    isCurrent ? 'ring-2 ring-green-500' : ''
                  }`}
                >
                  {planItem.popular && (
                    <div className="absolute top-0 right-6 -translate-y-1/2">
                      <span className="bg-amber-500 text-white text-xs font-bold px-3 py-1 rounded-full flex items-center gap-1">
                        POPULAR
                      </span>
                    </div>
                  )}

                  {isCurrent && (
                    <div className="absolute top-0 left-6 -translate-y-1/2">
                      <span className="bg-green-500 text-white text-xs font-bold px-3 py-1 rounded-full flex items-center gap-1">
                        <Check className="h-3 w-3" /> CURRENT
                      </span>
                    </div>
                  )}

                  <div className={`inline-flex p-3 rounded-xl bg-gradient-to-br ${planItem.color} mb-4`}>
                    <Icon className="h-6 w-6 text-white" />
                  </div>

                  <h3 className="text-2xl font-bold text-gray-900">{planItem.name}</h3>
                  <p className="text-sm text-gray-500 mt-1">{planItem.description}</p>

                  <div className="mt-4 mb-6">
                    <span className="text-4xl font-bold text-gray-900">{planItem.price}</span>
                    <span className="text-gray-500 ml-2">{planItem.period}</span>
                  </div>

                  <ul className="space-y-3 mb-6">
                    {planItem.features.map((feature, index) => (
                      <li key={index} className="flex items-start gap-2">
                        <Check className="h-5 w-5 text-green-500 flex-shrink-0 mt-0.5" />
                        <span className="text-sm text-gray-600">{feature}</span>
                      </li>
                    ))}
                  </ul>

                  <button
                    onClick={() => handleUpgrade(planItem.plan)}
                    disabled={isCurrent || upgrading}
                    className={`w-full py-3 px-4 rounded-lg font-medium transition ${
                      isCurrent
                        ? 'bg-gray-300 text-gray-400 cursor-not-allowed mt-25'
                        : planItem.popular
                        ? 'bg-gray-900 text-white hover:bg-gray-800 mt-8'
                        : 'bg-gray-900 text-white hover:bg-gray-800'
                    }`}
                  >
                    {upgrading ? 'Processing...' : isCurrent ? 'Current Plan' : 'Upgrade Now'}
                  </button>
                </div>
              );
            })}
          </div>
        </div>

        {/* FAQ Section */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h2 className="text-xl font-bold text-gray-900 mb-4">Frequently Asked Questions</h2>
          <div className="space-y-4">
            <div>
              <h3 className="font-semibold text-gray-900">Can I change my plan anytime?</h3>
              <p className="text-sm text-gray-600 mt-1">
                Yes, you can upgrade or downgrade your plan at any time. Changes take effect immediately.
              </p>
            </div>
            <div>
              <h3 className="font-semibold text-gray-900">What happens when I reach my limit?</h3>
              <p className="text-sm text-gray-600 mt-1">
                You'll need to upgrade to a higher plan to continue adding new items. Your existing data remains safe.
              </p>
            </div>
            <div>
              <h3 className="font-semibold text-gray-900">Is there a free trial?</h3>
              <p className="text-sm text-gray-600 mt-1">
                The Free plan is available forever with no credit card required. Upgrade when you're ready.
              </p>
            </div>
            <div>
              <h3 className="font-semibold text-gray-900">Can I cancel my subscription?</h3>
              <p className="text-sm text-gray-600 mt-1">
                Yes, you can cancel anytime. You'll continue to have access until the end of your billing period.
              </p>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}