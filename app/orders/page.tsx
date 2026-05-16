// app/orders/page.tsx - Complete with CRUD
'use client';
import { useEffect, useState } from 'react';
import { orderAPI, customerAPI, fabricAPI, measurementAPI, financialsAPI } from '@/lib/api';
import Layout from '@/components/Layout';
import { useRouter } from 'next/navigation'
import { useAuth } from '@/context/AuthContext';
import { Plus, Search, X, Pencil, Trash2, ViewIcon, EyeIcon } from 'lucide-react';
import { Button, Dialog, DialogPanel, DialogTitle, Description } from '@headlessui/react'
import { format } from 'date-fns';
// import { log } from 'console';

interface Order {
  order_number: string;
  customer_name: string;
  garment_type: string;
  status: string;
  order_date: number;
  due_date: number;
  total_amount: number;
  amount_paid: number;
  fabric: number;

}

export default function OrdersPage() {
  const [orders, setOrders] = useState<any[]>([]);
  const [orderView, setOrder] = useState<Order | null>(null);
  const [customers, setCustomers] = useState<any[]>([]);
  const [fabrics, setFabrics] = useState<any[]>([]);
  const [measurements, setMeasurements] = useState<any[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [showViewModal, setShowViewModal] = useState(false);
  const [editingOrder, setEditingOrder] = useState<any>(null);
  const [formData, setFormData] = useState({
    customer: '',
    garment_type: 'shirt',
    status: 'pending',
    measurement: '',
    fabric: '',
    fabric_quantity_used: '',
    due_date: '',
    description: '',
    special_instructions: '',
    total_amount: '',
    amount_paid: '',
  });
  const { token,hasPermission } = useAuth();

  const [financialsData, setFinancialsData] = useState({
    material_cost: '',
    labor_cost: '',
    additional_cost: '',
    total_cost: '',
    quoted_price: '',
    discount: '',
    final_price: '',
  });

  const formatter = new Intl.NumberFormat('en-US');
  const router = useRouter();

  useEffect(() => {
    if (!hasPermission('can_manage_orders')) {
      router.push('/dashboard');
      return;
    }
  }, [token])

  useEffect(() => {
    loadData();
  }, [statusFilter]);

  useEffect(() => {
    if (editingOrder) {
      setFormData({
        customer: editingOrder.customer,
        garment_type: editingOrder.garment_type,
        status: editingOrder.status,
        measurement: editingOrder.measurement || '',
        fabric: editingOrder.fabric || '',
        fabric_quantity_used: editingOrder.fabric_quantity_used || '',
        due_date: editingOrder.due_date,
        description: editingOrder.description || '',
        special_instructions: editingOrder.special_instructions || '',
        total_amount: editingOrder.total_amount || '',
        amount_paid: editingOrder.amount_paid || '',
      });
      if (editingOrder.financials) {
        setFinancialsData({
          material_cost: editingOrder.financials.material_cost || '',
          labor_cost: editingOrder.financials.labor_cost || '',
          additional_cost: editingOrder.financials.additional_cost || '',
          total_cost: editingOrder.financials.total_cost || '',
          quoted_price: editingOrder.financials.quoted_price || '',
          discount: editingOrder.financials.discount || '',
          final_price: editingOrder.financials.final_price || '',
        });
      }
    } else {
      setFormData({
        customer: '',
        garment_type: 'shirt',
        status: 'pending',
        measurement: '',
        fabric: '',
        fabric_quantity_used: '',
        due_date: '',
        description: '',
        special_instructions: '',
        total_amount: '',
        amount_paid: '',
      });
      setFinancialsData({
        material_cost: '',
        labor_cost: '',
        additional_cost: '',
        total_cost: '',
        quoted_price: '',
        discount: '',
        final_price: '',
      });
    }
  }, [editingOrder]);

  const loadData = async () => {
    try {
      const [ordersRes, customersRes, fabricsRes, measurementsRes] = await Promise.all([
        orderAPI.getAll(statusFilter || undefined),
        customerAPI.getAll(),
        fabricAPI.getAll(),
        measurementAPI.getAll(),
      ]);
      setOrders(ordersRes.data);
      console.log(ordersRes.data);
      setCustomers(customersRes.data);
      setFabrics(fabricsRes.data);
      setMeasurements(measurementsRes.data);
    } catch (error) {
      console.error('Failed to load data:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadOrder = async (id: number) => {
    try {
      const orderView = await orderAPI.getOne(id);
      setOrder(orderView.data);
      console.log(orderView);
      
    } catch (error) {
      console.error('Failed to load data:', error);
    } finally {
      setLoading(false);
    }
  };


  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const orderData = {
        ...formData,
        measurement: formData.measurement || null,
        fabric: formData.fabric || null,
        // total_amount: formData.total_amount || null,
        // amount_paid: formData.amount_paid || null,
        fabric_quantity_used: formData.fabric_quantity_used || null,
      };

      let orderId;
      if (editingOrder) {
        await orderAPI.update(editingOrder.id, orderData);
        orderId = editingOrder.id;
      } else {
        const response = await orderAPI.create(orderData);
        orderId = response.data.id;
        // console.log(orderData);
        
      }

      // Create or update financials if provided
      if (financialsData.quoted_price && financialsData.final_price) {
        const finData = {
          order: orderId,
          ...financialsData,
          material_cost: financialsData.material_cost || 0,
          labor_cost: financialsData.labor_cost || 0,
          additional_cost: financialsData.additional_cost || 0,
          total_cost: financialsData.total_cost || 0,
          discount: financialsData.discount || 0,
        };

        if (editingOrder?.financials) {
          await financialsAPI.update(editingOrder.financials.id, finData);
        } else {
          await financialsAPI.create(finData);
        }
      }

      loadData();
      setShowModal(false);
      setEditingOrder(null);
    } catch (error) {
      console.error('Failed to save order:', error);
      alert('Failed to save order');
    }
  };

  const handleDelete = async (id: number) => {
    if (confirm('Are you sure you want to delete this order?')) {
      try {
        await orderAPI.delete(id);
        loadData();
      } catch (error) {
        console.error('Failed to delete order:', error);
      }
    }
  };

  const filteredOrders = orders.filter(order =>
    `${order.order_number} ${order.customer_name} ${order.garment_type}`
      .toLowerCase()
      .includes(searchTerm.toLowerCase())
  );

  const statusColors: any = {
    pending: 'bg-yellow-100 text-yellow-800',
    measuring: 'bg-blue-100 text-blue-800',
    cutting: 'bg-purple-100 text-purple-800',
    stitching: 'bg-indigo-100 text-indigo-800',
    fitting: 'bg-pink-100 text-pink-800',
    completed: 'bg-green-100 text-green-800',
    delivered: 'bg-gray-100 text-gray-800',
    cancelled: 'bg-red-100 text-red-800',
  };

  return (
    <Layout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Orders</h1>
            <p className="mt-1 text-sm text-gray-500">Manage all customer orders</p>
          </div>
          <button 
            onClick={() => { setEditingOrder(null); setShowModal(true); }}
            className="flex items-center gap-2 bg-amber-200 text-gray-600 px-4 py-2 rounded-lg hover:bg-primary-700 transition font-medium"
          >
            <Plus className="h-5 w-5" />
            New Order
          </button>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200">
          <div className="p-4 border-b border-gray-200 flex gap-4">
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
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            >
              <option value="">All Status</option>
              <option value="pending">Pending</option>
              <option value="measuring">Measuring</option>
              <option value="cutting">Cutting</option>
              <option value="stitching">Stitching</option>
              <option value="fitting">Fitting</option>
              <option value="completed">Completed</option>
              <option value="delivered">Delivered</option>
            </select>
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
                      Order #
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Customer
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Garment
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Due Date
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Amount
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {filteredOrders.map((order) => (
                    <tr key={order.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="text-sm font-medium text-gray-900">{order.order_number}</span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="text-sm text-gray-900">{order.customer_name}</span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="text-sm text-gray-500 capitalize">{order.garment_type}</span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${statusColors[order.status]}`}>
                          {order.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {format(new Date(order.due_date), 'MMM dd, yyyy')}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        ₦{formatter.format(order.total_amount?.toLocaleString() || 'N/A')}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <button
                          onClick={() => { loadOrder(order.id); setShowViewModal(true); }}
                          className="text-primary-600 hover:text-primary-900 mr-3"
                        >
                          <EyeIcon className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => { setEditingOrder(order); setShowModal(true); }}
                          className="text-primary-600 hover:text-primary-900 mr-3"
                        >
                          <Pencil className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(order.id)}
                          className="text-red-600 hover:text-red-900"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {orders.length === 0 && (
                <div className="text-center py-12 text-gray-500">
                  No orders found
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Order Modal */}
      {/* {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4 overflow-y-auto">
          <div className="bg-white rounded-xl shadow-xl max-w-2xl w-full my-8">
            <div className="flex items-center justify-between p-6 border-b border-gray-200">
              <h3 className="text-xl font-bold text-gray-900">
                {editingOrder ? 'Edit Order' : 'New Order'}
              </h3>
              <button onClick={() => setShowModal(false)} className="text-gray-400 hover:text-gray-600">
                <X className="h-6 w-6" />
              </button>
            </div>
            <form onSubmit={handleSubmit} className="p-6 space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Customer *</label>
                  <select
                    value={formData.customer}
                    onChange={(e) => setFormData({...formData, customer: e.target.value})}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                    required
                  >
                    <option value="">Select Customer</option>
                    {customers.map(customer => (
                      <option key={customer.id} value={customer.id}>
                        {customer.first_name} {customer.last_name}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Garment Type *</label>
                  <select
                    value={formData.garment_type}
                    onChange={(e) => setFormData({...formData, garment_type: e.target.value})}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                    required
                  >
                    <option value="shirt">Shirt</option>
                    <option value="babbar riga">Babbar Riga(Agbada)</option>
                    <option value="jallabiyya">Jallabiyya</option>
                    <option value="kaftan">Kaftan</option>
                    <option value="trouser">Trouser</option>
                    <option value="suit">Suit</option>
                    <option value="dress">Dress</option>
                    <option value="blouse">Blouse</option>
                    <option value="skirt">Skirt</option>
                    <option value="coat">Coat</option>
                    <option value="traditional">Traditional Wear</option>
                    <option value="other">Other</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Status *</label>
                  <select
                    value={formData.status}
                    onChange={(e) => setFormData({...formData, status: e.target.value})}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                    required
                  >
                    <option value="pending">Pending</option>
                    <option value="measuring">Measuring</option>
                    <option value="cutting">Cutting</option>
                    <option value="stitching">Stitching</option>
                    <option value="fitting">Fitting</option>
                    <option value="completed">Completed</option>
                    <option value="delivered">Delivered</option>
                    <option value="cancelled">Cancelled</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Due Date *</label>
                  <input
                    type="date"
                    value={formData.due_date}
                    onChange={(e) => setFormData({...formData, due_date: e.target.value})}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Measurement</label>
                  <select
                    value={formData.measurement}
                    onChange={(e) => setFormData({...formData, measurement: e.target.value})}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  >
                    <option value="">Select Measurement</option>
                    {measurements.filter(m => m.customer == formData.customer).map(measurement => (
                      <option key={measurement.id} value={measurement.id}>
                        {format(new Date(measurement.measurement_date), 'MMM dd, yyyy')}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Fabric</label>
                  <select
                    value={formData.fabric}
                    onChange={(e) => setFormData({...formData, fabric: e.target.value})}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  >
                    <option value="">Select Fabric</option>
                    {fabrics.map(fabric => (
                      <option key={fabric.id} value={fabric.id}>
                        {fabric.name} - {fabric.color}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Fabric Quantity Used (m)</label>
                <input
                  type="number"
                  step="0.01"
                  value={formData.fabric_quantity_used}
                  onChange={(e) => setFormData({...formData, fabric_quantity_used: e.target.value})}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Description</label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({...formData, description: e.target.value})}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  rows={2}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Special Instructions</label>
                <textarea
                  value={formData.special_instructions}
                  onChange={(e) => setFormData({...formData, special_instructions: e.target.value})}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  rows={2}
                />
              </div>

              <div className="border-t pt-4">
                <h4 className="font-semibold text-gray-900 mb-4">Financials</h4>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm text-gray-600 mb-1">Total Amount (₦)</label>
                    <input
                      type="number"
                      step="1"
                      value={formData.total_amount}
                      onChange={(e) => setFormData({...formData, total_amount: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                    />
                  </div>
                  <div>
                    <label className="block text-sm text-gray-600 mb-1">Amount Paid (₦)</label>
                    <input
                      type="number"
                      step="1"
                      value={formData.amount_paid}
                      onChange={(e) => setFormData({...formData, amount_paid: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                    />
                  </div>
                </div>
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
                  {editingOrder ? 'Update' : 'Create'}
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
                <h3 className="text-xl font-bold text-gray-900">
                  {editingOrder ? 'Edit Order' : 'New Order'}
                </h3>
              </div>
              <form onSubmit={handleSubmit} className="p-6 space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Customer *</label>
                    <select
                      value={formData.customer}
                      onChange={(e) => setFormData({...formData, customer: e.target.value})}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                      required
                    >
                      <option value="">Select Customer</option>
                      {customers.map(customer => (
                        <option key={customer.id} value={customer.id}>
                          {customer.first_name} {customer.last_name}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Garment Type *</label>
                    <select
                      value={formData.garment_type}
                      onChange={(e) => setFormData({...formData, garment_type: e.target.value})}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                      required
                    >
                      <option value="shirt">Shirt</option>
                      <option value="babbar riga">Babbar Riga(Agbada)</option>
                      <option value="jallabiyya">Jallabiyya</option>
                      <option value="kaftan">Kaftan</option>
                      <option value="trouser">Trouser</option>
                      <option value="suit">Suit</option>
                      <option value="dress">Dress</option>
                      <option value="blouse">Blouse</option>
                      <option value="skirt">Skirt</option>
                      <option value="coat">Coat</option>
                      <option value="traditional">Traditional Wear</option>
                      <option value="other">Other</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Status *</label>
                    <select
                      value={formData.status}
                      onChange={(e) => setFormData({...formData, status: e.target.value})}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                      required
                    >
                      <option value="pending">Pending</option>
                      <option value="measuring">Measuring</option>
                      <option value="cutting">Cutting</option>
                      <option value="stitching">Stitching</option>
                      <option value="fitting">Fitting</option>
                      <option value="completed">Completed</option>
                      <option value="delivered">Delivered</option>
                      <option value="cancelled">Cancelled</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Due Date *</label>
                    <input
                      type="date"
                      value={formData.due_date}
                      onChange={(e) => setFormData({...formData, due_date: e.target.value})}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                      required
                    />
                  </div>
                  {/* <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Measurement</label>
                    <select
                      value={formData.measurement}
                      onChange={(e) => setFormData({...formData, measurement: e.target.value})}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                    >
                      <option value="">Select Measurement</option>
                      {measurements.filter(m => m.customer == formData.customer).map(measurement => (
                        <option key={measurement.id} value={measurement.id}>
                          {format(new Date(measurement.measurement_date), 'MMM dd, yyyy')}
                        </option>
                      ))}
                    </select>
                  </div> */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Fabric</label>
                    <select
                      value={formData.fabric}
                      onChange={(e) => setFormData({...formData, fabric: e.target.value})}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                    >
                      <option value="">Select Fabric</option>
                      {fabrics.map(fabric => (
                        <option key={fabric.id} value={fabric.id}>
                          {fabric.name} - {fabric.color} - ₦{formatter.format(fabric.price_per_unit)} per yd - {fabric.quantity} yd
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Fabric Quantity Used (yd)</label>
                    <input
                      type="number"
                      step="0.01"
                      value={formData.fabric_quantity_used}
                      onChange={(e) => setFormData({...formData, fabric_quantity_used: e.target.value})}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                    />
                  </div>
                </div>

                {/* <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Description</label>
                  <textarea
                    value={formData.description}
                    onChange={(e) => setFormData({...formData, description: e.target.value})}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                    rows={2}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Special Instructions</label>
                  <textarea
                    value={formData.special_instructions}
                    onChange={(e) => setFormData({...formData, special_instructions: e.target.value})}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                    rows={2}
                  />
                </div> */}

                <div className="border-t pt-4">
                  <h4 className="font-semibold text-gray-900 mb-4">Financials</h4>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm text-gray-600 mb-1">Total Amount (₦)</label>
                      <input
                        type="number"
                        step="1"
                        value={formData.total_amount}
                        onChange={(e) => setFormData({...formData, total_amount: e.target.value})}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                      />
                    </div>
                    <div>
                      <label className="block text-sm text-gray-600 mb-1">Amount Paid (₦)</label>
                      <input
                        type="number"
                        step="1"
                        value={formData.amount_paid}
                        onChange={(e) => setFormData({...formData, amount_paid: e.target.value})}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                      />
                    </div>
                    <div>
                    <label className="block text-sm text-gray-600 mb-1">Material Cost (₦)</label>
                    <input
                      type="number"
                      step="0.01"
                      value={financialsData.material_cost}
                      onChange={(e) => setFinancialsData({...financialsData, material_cost: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                    />
                  </div>
                  <div>
                    <label className="block text-sm text-gray-600 mb-1">Labor Cost (₦)</label>
                    <input
                      type="number"
                      step="0.01"
                      value={financialsData.labor_cost}
                      onChange={(e) => setFinancialsData({...financialsData, labor_cost: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                    />
                  </div>
                  <div>
                    <label className="block text-sm text-gray-600 mb-1">Quoted Price (₦)</label>
                    <input
                      type="number"
                      step="0.01"
                      value={financialsData.quoted_price}
                      onChange={(e) => setFinancialsData({...financialsData, quoted_price: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                    />
                  </div>
                  <div>
                    <label className="block text-sm text-gray-600 mb-1">Final Price (₦)</label>
                    <input
                      type="number"
                      step="0.01"
                      value={financialsData.final_price}
                      onChange={(e) => setFinancialsData({...financialsData, final_price: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                    />
                  </div>
                  </div>
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
                    {editingOrder ? 'Update' : 'Create'}
                  </button>
                </div>
              </form>
            </DialogPanel>
          </div>
        </div>
      </Dialog>
      <Dialog open={showViewModal} onClose={() => setShowViewModal(false)} transition className="relative z-50 bg-black/30 p-4 transition duration-300 ease-out data-closed:opacity-0">
        <div className="fixed inset-0 w-screen overflow-y-auto p-4">
          <div className="flex min-h-full items-center justify-center">
            <DialogPanel className="max-w-lg space-y-4 shadow-2xl bg-white p-12">
              <div className="px-4 sm:px-0">
                <h3 className="text-base/7 font-semibold text-gray-900">Order # {orderView?.order_number}</h3>
                {/* <p className="mt-1 max-w-2xl text-sm/6 text-gray-600">Personal details</p> */}
              </div>
              <div className="mt-6">
                <dl className="">
                  <div className="px-2 py-2 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-0">
                    <dt className="text-sm/6 font-medium text-gray-950">Customer</dt>
                    <dd className="text-sm/6 text-gray-800 sm:col-span-2 sm:mt-0">{orderView?.customer_name}</dd>
                  </div>
                  <div className="px-2 py-2 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-0">
                    <dt className="text-sm/6 font-medium text-gray-950">Garment type</dt>
                    <dd className="mt-1 text-sm/6 text-gray-800 sm:col-span-2 sm:mt-0 uppercase">{orderView?.garment_type}</dd>
                  </div>
                  <div className="px-2 py-2 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-0">
                    <dt className="text-sm/6 font-medium text-gray-950">Status</dt>
                    <dd className="mt-1 text-sm/6 text-gray-800 sm:col-span-2 sm:mt-0 uppercase">{orderView?.status}</dd>
                  </div>
                  <div className="px-2 py-2 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-0">
                    <dt className="text-sm/6 font-medium text-gray-950">Order date</dt>
                    <dd className="mt-1 text-sm/6 text-gray-800 sm:col-span-2 sm:mt-0 uppercase">{orderView?.order_date}</dd>
                  </div>
                  <div className="px-2 py-2 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-0">
                    <dt className="text-sm/6 font-medium text-gray-950">Due date</dt>
                    <dd className="mt-1 text-sm/6 text-gray-800 sm:col-span-2 sm:mt-0 uppercase">{orderView?.due_date}</dd>
                  </div>
                  <div className="px-2 py-2 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-0">
                    <dt className="text-sm/6 font-medium text-gray-950">Total amount</dt>
                    <dd className="mt-1 text-sm/6 text-gray-800 sm:col-span-2 sm:mt-0 uppercase"> ₦{formatter.format(orderView?.total_amount ?? 0)}</dd>
                  </div>
                  <div className="px-2 py-2 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-0">
                    <dt className="text-sm/6 font-medium text-gray-950">Amount paid</dt>
                    <dd className="mt-1 text-sm/6 text-gray-800 sm:col-span-2 sm:mt-0 uppercase"> ₦{formatter.format(orderView?.amount_paid ?? 0)}</dd>
                  </div>
                  <div className="px-2 py-2 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-0">
                    <dt className="text-sm/6 font-medium text-gray-950">Fabric</dt>
                    <dd className="mt-1 text-sm/6 text-gray-800 sm:col-span-2 sm:mt-0 uppercase">{orderView?.fabric}</dd>
                  </div>
                </dl>
              </div>
              <div className="flex gap-4">
                <button onClick={() => setShowViewModal(false)} className='w-full bg-amber-200 text-gray-600 py-3 px-4 rounded-lg font-medium transition'>Close</button>
                {/* <button onClick={() => setShowViewModal(false)}>Deactivate</button> */}
              </div>
            </DialogPanel>
          </div>
        </div>
      </Dialog>
    </Layout>
  );
}