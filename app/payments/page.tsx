'use client';
import { useEffect, useState } from 'react';
import { paymentAPI, orderAPI } from '@/lib/api';
import Layout from '@/components/Layout';
import { redirect, useRouter } from 'next/navigation'
import { useAuth } from '@/context/AuthContext';
import { Plus, CreditCard, X, Trash2, Search } from 'lucide-react';
import { format } from 'date-fns';
import { Dialog, DialogPanel } from '@headlessui/react';

export default function PaymentsPage() {
  const [payments, setPayments] = useState<any[]>([]);
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState({
    order: '',
    amount: '',
    payment_method: 'cash',
    transaction_reference: '',
    notes: '',
  });

  const formatter = new Intl.NumberFormat('en-US');
  const router = useRouter();
  const { token, hasPermission } = useAuth();

  useEffect(() => {
   if (!hasPermission('can_manage_users')) {
      router.push('/dashboard');
      return;
    }
    loadData();
  }, [token]);

  const loadData = async () => {
    try {
      const [paymentsRes, ordersRes] = await Promise.all([
        paymentAPI.getAll(),
        orderAPI.getAll(),
      ]);
      setPayments(paymentsRes.data);
      setOrders(ordersRes.data);
    } catch (error) {
      console.error('Failed to load data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await paymentAPI.create(formData);
      loadData();
      setShowModal(false);
      setFormData({
        order: '',
        amount: '',
        payment_method: 'cash',
        transaction_reference: '',
        notes: '',
      });
    } catch (error) {
      console.error('Failed to save payment:', error);
      alert('Failed to save payment');
    }
  };

  const handleDelete = async (id: number) => {
    if (confirm('Are you sure you want to delete this payment?')) {
      try {
        await paymentAPI.delete(id);
        loadData();
      } catch (error) {
        console.error('Failed to delete payment:', error);
      }
    }
  };

  const filteredPayments = payments.filter(payment =>
    `${payment.transaction_reference} ${payment.order}`
      .toLowerCase()
      .includes(searchTerm.toLowerCase())
  );

  const paymentMethodColors: any = {
    cash: 'bg-green-100 text-green-800',
    bank_transfer: 'bg-blue-100 text-blue-800',
    card: 'bg-purple-100 text-purple-800',
    mobile_money: 'bg-orange-100 text-orange-800',
    other: 'bg-gray-100 text-gray-800',
  };

  const getOrderNumber = (orderId: number) => {
    const order = orders.find(o => o.id === orderId);
    return order?.order_number || `#${orderId}`;
  };

  return (
    <Layout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Payments</h1>
            <p className="mt-1 text-sm text-gray-500">Track all payment transactions</p>
          </div>
          <button 
            onClick={() => setShowModal(true)}
            className="flex items-center gap-2 bg-amber-200 text-gray-600 px-4 py-2 rounded-lg hover:bg-primary-700 transition font-medium"
          >
            <Plus className="h-5 w-5" />
            Record Payment
          </button>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search orders..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            />
          </div>
          {loading ? (
            <div className="flex items-center justify-center h-64">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Order
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Amount
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Method
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Date
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Reference
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {filteredPayments.map((payment) => (
                    <tr key={payment.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <CreditCard className="h-5 w-5 text-gray-400 mr-2" />
                          <span className="text-sm font-medium text-gray-900">{getOrderNumber(payment.order)}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="text-sm font-semibold text-green-600">
                          ₦{formatter.format(payment.amount.toLocaleString())}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${paymentMethodColors[payment.payment_method]}`}>
                          {payment.payment_method.replace('_', ' ')}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {format(new Date(payment.payment_date), 'MMM dd, yyyy HH:mm')}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {payment.transaction_reference || 'N/A'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <button
                          onClick={() => handleDelete(payment.id)}
                          className="text-red-600 hover:text-red-900"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {payments.length === 0 && (
                <div className="text-center py-12 text-gray-500">
                  No payments found
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Payment Modal */}
      {/* {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl max-w-md w-full">
            <div className="flex items-center justify-between p-6 border-b border-gray-200">
              <h3 className="text-xl font-bold text-gray-900">Record Payment</h3>
              <button onClick={() => setShowModal(false)} className="text-gray-400 hover:text-gray-600">
                <X className="h-6 w-6" />
              </button>
            </div>
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Order *</label>
                <select
                  value={formData.order}
                  onChange={(e) => setFormData({...formData, order: e.target.value})}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  required
                >
                  <option value="">Select Order</option>
                  {orders.map(order => (
                    <option key={order.id} value={order.id}>
                      {order.order_number} - {order.customer_name}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Amount (₦) *</label>
                <input
                  type="number"
                  step="0.01"
                  value={formData.amount}
                  onChange={(e) => setFormData({...formData, amount: e.target.value})}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Payment Method *</label>
                <select
                  value={formData.payment_method}
                  onChange={(e) => setFormData({...formData, payment_method: e.target.value})}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  required
                >
                  <option value="cash">Cash</option>
                  <option value="bank_transfer">Bank Transfer</option>
                  <option value="card">Card</option>
                  <option value="mobile_money">Mobile Money</option>
                  <option value="other">Other</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Transaction Reference</label>
                <input
                  type="text"
                  value={formData.transaction_reference}
                  onChange={(e) => setFormData({...formData, transaction_reference: e.target.value})}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Notes</label>
                <textarea
                  value={formData.notes}
                  onChange={(e) => setFormData({...formData, notes: e.target.value})}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  rows={2}
                />
              </div>
              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 font-medium"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 px-4 py-2 bg-amber-200 text-gray-600 rounded-lg hover:bg-primary-700 font-medium"
                >
                  Record Payment
                </button>
              </div>
            </form>
          </div>
        </div>
      )} */}
      <Dialog open={showModal} onClose={() => setShowModal(false)} transition className="relative z-50 bg-black/30 p-4 transition duration-300 ease-out data-closed:opacity-0">
        <div className="fixed inset-0 w-screen overflow-y-auto p-4">
          <div className="flex min-h-full items-center justify-center">
            <DialogPanel className="max-w-lg space-y-4 shadow-2xl bg-white p-12">
              <div className="px-4 sm:px-0">
                <h3 className="text-xl font-bold text-gray-900">Record Payment</h3>
                {/* <p className="mt-1 max-w-2xl text-sm/6 text-gray-600">Personal details</p> */}
              </div>
              <div className="mt-6">
                <form onSubmit={handleSubmit} className="p-6 space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Order *</label>
                    <select
                      value={formData.order}
                      onChange={(e) => setFormData({...formData, order: e.target.value})}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                      required
                    >
                      <option value="">Select Order</option>
                      {orders.map(order => (
                        <option key={order.id} value={order.id}>
                          {order.order_number} - {order.customer_name}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Amount (₦) *</label>
                    <input
                      type="number"
                      step="0.01"
                      value={formData.amount}
                      onChange={(e) => setFormData({...formData, amount: e.target.value})}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Payment Method *</label>
                    <select
                      value={formData.payment_method}
                      onChange={(e) => setFormData({...formData, payment_method: e.target.value})}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                      required
                    >
                      <option value="cash">Cash</option>
                      <option value="bank_transfer">Bank Transfer</option>
                      <option value="card">Card</option>
                      <option value="mobile_money">Mobile Money</option>
                      <option value="other">Other</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Transaction Reference</label>
                    <input
                      type="text"
                      value={formData.transaction_reference}
                      onChange={(e) => setFormData({...formData, transaction_reference: e.target.value})}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Notes</label>
                    <textarea
                      value={formData.notes}
                      onChange={(e) => setFormData({...formData, notes: e.target.value})}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                      rows={2}
                    />
                  </div>
                  <div className="flex gap-3 pt-4">
                    <button
                      type="button"
                      onClick={() => setShowModal(false)}
                      className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 font-medium"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="flex-1 px-4 py-2 bg-amber-200 text-gray-600 rounded-lg hover:bg-primary-700 font-medium"
                    >
                      Record Payment
                    </button>
                  </div>
                </form>
              </div> 
              {/* <div className="flex gap-4">
                <button onClick={() => setShowModal(false)} className='w-full bg-amber-200 text-gray-600 py-3 px-4 rounded-lg font-medium transition'>Close</button>
                <button onClick={() => setshowModal(false)}>Deactivate</button>
              </div> */}
            </DialogPanel>
          </div>
        </div>
      </Dialog>
    </Layout>
  );
}