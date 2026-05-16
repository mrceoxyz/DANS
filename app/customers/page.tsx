'use client';
import { useEffect, useState } from 'react';
import { customerAPI } from '@/lib/api';
import Layout from '@/components/Layout';
import { Plus, Search, Mail, Phone, MapPin, Pencil, Trash2, X, EyeIcon } from 'lucide-react';
import { Button, Dialog, DialogPanel, DialogTitle, Description } from '@headlessui/react'
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';

interface Customer {
        first_name: string;
        last_name: string;
        phone: string;
        email: string;
        // measurements: [];
        address: string;

    }

export default function CustomersPage() {
  const [customers, setCustomers] = useState<any[]>([]);
  const [customer, setCustomer] = useState<Customer | null>(null);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [showViewModal, setShowViewModal] = useState(false);
  const [editingCustomer, setEditingCustomer] = useState<any>(null);
  const [formData, setFormData] = useState({
    first_name: '',
    last_name: '',
    email: '',
    phone: '',
    address: '',
  });
  const { hasPermission } = useAuth();
  const router = useRouter();

  // interface customer {
  //     first_name: string;
  //     last_name: string;
  //     phone: string;
  //     email: string;
  //     measurements: [];
  //     address: string;
  //     // other properties of an order
  //   }

  useEffect(() => {
    if (!hasPermission('can_manage_customers')) {
      router.push('/dashboard');
      return;
    }
    loadCustomers();
  }, []);

  useEffect(() => {
    if (editingCustomer) {
      setFormData({
        first_name: editingCustomer.first_name,
        last_name: editingCustomer.last_name,
        email: editingCustomer.email,
        phone: editingCustomer.phone,
        address: editingCustomer.address || '',
      });
    } else {
      setFormData({
        first_name: '',
        last_name: '',
        email: '',
        phone: '',
        address: '',
      });
    }
  }, [editingCustomer]);

  const loadCustomers = async () => {
    try {
      const response = await customerAPI.getAll();
      setCustomers(response.data);
    } catch (error) {
      console.error('Failed to load customers:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadCustomer = async (id: number) => {
    try {
      const response = await customerAPI.getOne(id);
      setCustomer(response.data);
      console.log(customer);
      
    } catch (error) {
      console.error('Failed to load customer:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingCustomer) {
        await customerAPI.update(editingCustomer.id, formData);
      } else {
        await customerAPI.create(formData);
      }
      loadCustomers();
      setShowModal(false);
      setEditingCustomer(null);
    } catch (error) {
      console.error('Failed to save customer:', error);
      alert('Failed to save customer');
    }
  };

  const handleDelete = async (id: number) => {
    if (confirm('Are you sure you want to delete this customer?')) {
      try {
        await customerAPI.delete(id);
        loadCustomers();
      } catch (error) {
        console.error('Failed to delete customer:', error);
      }
    }
  };

  const filteredCustomers = customers.filter(customer =>
    `${customer.first_name} ${customer.last_name} ${customer.email} ${customer.phone}`
      .toLowerCase()
      .includes(searchTerm.toLowerCase())
  );

  return (
    <Layout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Customers</h1>
            <p className="mt-1 text-sm text-gray-500">Manage your customer database</p>
          </div>
          <button
            onClick={() => { setEditingCustomer(null); setShowModal(true); }}
            className="flex items-center gap-2 bg-amber-200 text-gray-600 px-4 py-2 rounded-lg hover:bg-primary-700 transition font-medium"
          >
            <Plus className="h-5 w-5" />
            Add Customer
          </button>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200">
          <div className="p-4 border-b border-gray-200">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
              <input
                type="text"
                placeholder="Search customers..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              />
            </div>
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
                      Customer
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Contact
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Address
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {filteredCustomers.map((customer) => (
                    <tr key={customer.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="h-10 w-10 flex-shrink-0">
                            <div className="h-10 w-10 rounded-full bg-primary-100 flex items-center justify-center">
                              <span className="text-primary-700 font-semibold">
                                {customer.first_name[0]}{customer.last_name[0]}
                              </span>
                            </div>
                          </div>
                          <div className="ml-4">
                            <div className="text-sm font-medium text-gray-900">
                              {customer.first_name} {customer.last_name}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="space-y-1">
                          <div className="flex items-center text-sm text-gray-900">
                            <Mail className="h-4 w-4 mr-2 text-gray-400" />
                            {customer.email}
                          </div>
                          <div className="flex items-center text-sm text-gray-500">
                            <Phone className="h-4 w-4 mr-2 text-gray-400" />
                            {customer.phone}
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center text-sm text-gray-500">
                          <MapPin className="h-4 w-4 mr-2 text-gray-400" />
                          {customer.address || 'N/A'}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <button
                          onClick={() => { loadCustomer(customer.id); setShowViewModal(true); }}
                          className="text-primary-600 hover:text-primary-900 mr-3"
                        >
                          <EyeIcon className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => { setEditingCustomer(customer); setShowModal(true); }}
                          className="text-primary-600 hover:text-primary-900 mr-3"
                        >
                          <Pencil className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(customer.id)}
                          className="text-red-600 hover:text-red-900"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {filteredCustomers.length === 0 && (
                <div className="text-center py-12 text-gray-500">
                  No customers found
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Customer Modal */}
      {/* {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl max-w-md w-full">
            <div className="flex items-center justify-between p-6 border-b border-gray-200">
              <h3 className="text-xl font-bold text-gray-900">
                {editingCustomer ? 'Edit Customer' : 'Add Customer'}
              </h3>
              <button onClick={() => setShowModal(false)} className="text-gray-400 hover:text-gray-600">
                <X className="h-6 w-6" />
              </button>
            </div>
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">First Name</label>
                <input
                  type="text"
                  value={formData.first_name}
                  onChange={(e) => setFormData({...formData, first_name: e.target.value})}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Last Name</label>
                <input
                  type="text"
                  value={formData.last_name}
                  onChange={(e) => setFormData({...formData, last_name: e.target.value})}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({...formData, email: e.target.value})}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Phone</label>
                <input
                  type="tel"
                  value={formData.phone}
                  onChange={(e) => setFormData({...formData, phone: e.target.value})}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Address</label>
                <textarea
                  value={formData.address}
                  onChange={(e) => setFormData({...formData, address: e.target.value})}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  rows={3}
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
                  {editingCustomer ? 'Update' : 'Create'}
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
                <h3 className="text-base/7 font-semibold text-gray-900">
                  {editingCustomer ? 'Edit Customer' : 'Add Customer'}                
                </h3>
                {/* <p className="mt-1 max-w-2xl text-sm/6 text-gray-600">Personal details</p> */}
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">First Name</label>
                    <input
                      type="text"
                      value={formData.first_name}
                      onChange={(e) => setFormData({...formData, first_name: e.target.value})}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Last Name</label>
                    <input
                      type="text"
                      value={formData.last_name}
                      onChange={(e) => setFormData({...formData, last_name: e.target.value})}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
                    <input
                      type="email"
                      value={formData.email}
                      onChange={(e) => setFormData({...formData, email: e.target.value})}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Phone</label>
                    <input
                      type="tel"
                      value={formData.phone}
                      onChange={(e) => setFormData({...formData, phone: e.target.value})}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Address</label>
                    <textarea
                      value={formData.address}
                      onChange={(e) => setFormData({...formData, address: e.target.value})}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                      rows={3}
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
                      {editingCustomer ? 'Update' : 'Create'}
                    </button>
                  </div>
                </form>
              </div>
            </DialogPanel>
          </div>
        </div>
      </Dialog>
      <Dialog open={showViewModal} onClose={() => setShowViewModal(false)} transition className="relative z-50 bg-black/30 p-4 transition duration-300 ease-out data-closed:opacity-0">
        <div className="fixed inset-0 w-screen overflow-y-auto p-4">
          <div className="flex min-h-full items-center justify-center">
            <DialogPanel className="max-w-lg space-y-4 shadow-2xl bg-white p-12">
              <div className="px-4 sm:px-0">
                <h3 className="text-base/7 font-semibold text-gray-900">Customer Information</h3>
                <p className="mt-1 max-w-2xl text-sm/6 text-gray-600">Personal details</p>
              </div>
              <div className="mt-3">
                <dl>
                  <div className="px-4 py-6 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-0">
                    <dt className="text-sm/6 font-medium text-gray-950">Full name</dt>
                    <dd className="mt-1 text-sm/6 text-gray-800 sm:col-span-2 sm:mt-0">{customer?.first_name} {customer?.last_name}</dd>
                  </div>
                  <div className="px-4 py-6 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-0">
                    <dt className="text-sm/6 font-medium text-gray-950">Phone number</dt>
                    <dd className="mt-1 text-sm/6 text-gray-800 sm:col-span-2 sm:mt-0">{customer?.phone}</dd>
                  </div>
                  <div className="px-4 py-6 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-0">
                    <dt className="text-sm/6 font-medium text-gray-950">Email address</dt>
                    <dd className="mt-1 text-sm/6 text-gray-800 sm:col-span-2 sm:mt-0">{customer?.email}</dd>
                  </div>
                  < div className="px-4 py-6 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-0">
                    <dt className="text-sm/6 font-medium text-gray-950">Address</dt>
                    <dd className="mt-1 text-sm/6 text-gray-800 sm:col-span-2 sm:mt-0">
                      {customer?.address}
                    </dd>
                  </div>
                  {/* < div className="px-4 py-6 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-0">
                    <dt className="text-sm/6 font-medium text-gray-950">Measurements</dt>
                    <dd className="mt-1 text-sm/6 text-gray-800 sm:col-span-2 sm:mt-0">
                      {customer.measurements.map(measurement => (
                        <dd className="mt-1 text-sm/6 text-gray-800 sm:col-span-2 sm:mt-0">
                          <p><b className='text-amber-300'>Ankle:</b> {measurement.ankle} inches</p>
                          <p><b className='text-amber-300'>Arm hole:</b> {measurement.arm_hole} inches</p>
                          <p><b className='text-amber-300'>Chest:</b> {measurement.chest} inches</p>
                          <p><b className='text-amber-300'>Hips:</b> {measurement.hips} inches</p>
                          <p><b className='text-amber-300'>Neck:</b> {measurement.neck} inches</p>
                          <p><b className='text-amber-300'>Shoulder:</b> {measurement.shoulder} inches</p>
                        </dd>
                    ))}
                    </dd>
                  </div> */}
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