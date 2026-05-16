'use client';
import { useEffect, useState } from 'react';
import { measurementAPI, customerAPI } from '@/lib/api';
import Layout from '@/components/Layout';
import { useRouter } from 'next/navigation'
import { useAuth } from '@/context/AuthContext';
import { Plus, Ruler, X, Trash2, Pencil, Search, EyeIcon } from 'lucide-react';
import { format } from 'date-fns';
import { Button, Dialog, DialogPanel, DialogTitle, Description } from '@headlessui/react'

interface Measurement {
  customer: number;
  neck: number;
  chest: number;
  waist: number;
  shirt: number
  shoulder: number;
  sleeve_length: number;
  arm_hole: number;
  wrist: number;
  hips: number;
  back_length: number;
  front_length: number;
  inseam: number;
  outseam: number;
  knee: number;
  thigh: number;
  lap: number;
  ankle: number;
  agbada_length: number;
  agbada_width: number;
  note: string;

}

export default function MeasurementsPage() {
  const [measurements, setMeasurements] = useState<any[]>([]);
  const [measurement, setMeasurement] = useState<Measurement | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [customers, setCustomers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [showViewModal, setShowViewModal] = useState(false);
  const [editingMeasurement, setEditingMeasurement] = useState<any>(null);
  const [formData, setFormData] = useState({
    customer: '',
    gender: 'M',
    neck: '',
    chest: '',
    waist: '',
    hips: '',
    shoulder: '',
    sleeve_length: '',
    arm_hole: '',
    wrist: '',
    inseam: '',
    outseam: '',
    thigh: '',
    knee: '',
    ankle: '',
    back_length: '',
    front_length: '',
    lap: '',
    agbada_length: '',
    agbada_width: '',
    notes: '',
  });
  const { token, hasPermission } = useAuth();
  const router = useRouter();

  useEffect(() => {
   if (!hasPermission('can_manage_measurements')) {
      router.push('/dashboard');
      return;
    }
    loadData();
  }, [token]);

  useEffect(() => {
    if (editingMeasurement) {
      setFormData({
        customer: editingMeasurement.customer,
        gender: editingMeasurement.gender,
        neck: editingMeasurement.neck || '',
        chest: editingMeasurement.chest || '',
        waist: editingMeasurement.waist || '',
        hips: editingMeasurement.hips || '',
        shoulder: editingMeasurement.shoulder || '',
        sleeve_length: editingMeasurement.sleeve_length || '',
        arm_hole: editingMeasurement.arm_hole || '',
        wrist: editingMeasurement.wrist || '',
        inseam: editingMeasurement.inseam || '',
        outseam: editingMeasurement.outseam || '',
        thigh: editingMeasurement.thigh || '',
        knee: editingMeasurement.knee || '',
        ankle: editingMeasurement.ankle || '',
        back_length: editingMeasurement.back_length || '',
        front_length: editingMeasurement.front_length || '',
        notes: editingMeasurement.notes || '',
        lap: editingMeasurement.lap || '',
        agbada_length: editingMeasurement.agbada_length || '',
        agbada_width: editingMeasurement.agbada_width || '',
      });
    } else {
      setFormData({
        customer: '',
        gender: 'M',
        neck: '', chest: '', waist: '', hips: '', shoulder: '', sleeve_length: '',
        arm_hole: '', wrist: '', inseam: '', outseam: '', thigh: '', knee: '',
        ankle: '', back_length: '', front_length: '', notes: '', lap: '', agbada_length: '',
        agbada_width: '',
      });
    }
  }, [editingMeasurement]);

  const loadData = async () => {
    try {
      const [measurementsRes, customersRes] = await Promise.all([
        measurementAPI.getAll(),
        customerAPI.getAll()
      ]);
      setMeasurements(measurementsRes.data);
      setCustomers(customersRes.data);
    } catch (error) {
      console.error('Failed to load data:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadMeasurement = async (id: number) => {
    try {
      const measurement = await  measurementAPI.getOne(id);
      setMeasurement(measurement.data)
      console.log(measurement);
      
    } catch (error) {
      console.error('Failed to load data:', error);
    } finally {
      setLoading(false);
    }
  };

  const getCustomerName = (customerId: number) => {
    const customer = customers.find(c => c.id === customerId);
    return customer ? `${customer.first_name} ${customer.last_name}` : 'Unknown';
  };

  const getCustomerPhone = (customerId: number) => {
    const customer = customers.find(c => c.id === customerId);
    return customer ? `${customer.phone}` : 'Unknown';
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const data = {
        ...formData,
        neck: formData.neck || null,
        chest: formData.chest || null,
        waist: formData.waist || null,
        hips: formData.hips || null,
        shoulder: formData.shoulder || null,
        sleeve_length: formData.sleeve_length || null,
      };

      if (editingMeasurement) {
        await measurementAPI.update(editingMeasurement.id, data);
      } else {
        await measurementAPI.create(data);
      }
      loadData();
      setShowModal(false);
      setEditingMeasurement(null);
    } catch (error) {
      console.error('Failed to save measurement:', error);
      alert('Failed to save measurement');
    }
  };

  const handleDelete = async (id: number) => {
    if (confirm('Are you sure you want to delete this measurement?')) {
      try {
        await measurementAPI.delete(id);
        loadData();
      } catch (error) {
        console.error('Failed to delete measurement:', error);
      }
    }
  };

  const filteredMeasurements = measurements.filter(measurement =>
    `${measurement.customer}`
      .toLowerCase()
      .includes(searchTerm.toLowerCase())
  );

  return (
    <Layout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Measurements</h1>
            <p className="mt-1 text-sm text-gray-500">Customer measurement records</p>
          </div>
          <button 
            onClick={() => { setEditingMeasurement(null); setShowModal(true); }}
            className="flex items-center gap-2 bg-amber-200 text-gray-600 px-4 py-2 rounded-lg hover:bg-primary-700 transition font-medium"
          >
            <Plus className="h-5 w-5" />
            Add Measurement
          </button>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200">
          <div className="p-4 border-b border-gray-200">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
              <input
                type="text"
                placeholder="Search measurements..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              />
            </div>
          </div>
        </div>

        {loading ? (
          <div className="flex items-center justify-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {filteredMeasurements.map((measurement: any) => (
              <div
                key={measurement.id}
                className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow"
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 bg-primary-100 rounded-lg flex items-center justify-center">
                      <Ruler className="h-6 w-6 text-primary-600" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900">
                        {getCustomerName(measurement.customer)} <span className="text-sm text-gray-500">{getCustomerPhone(measurement.customer)}</span>
                      </h3>
                      <p className="text-sm text-gray-500">
                        {format(new Date(measurement.measurement_date), 'MMM dd, yyyy')}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className={`px-3 py-1 text-xs font-semibold rounded-full ${
                      measurement.gender === 'M' 
                        ? 'bg-blue-100 text-blue-800' 
                        : 'bg-pink-100 text-pink-800'
                    }`}>
                      {measurement.gender === 'M' ? 'Male' : 'Female'}
                    </span>
                    <button
                      onClick={() => { loadMeasurement(measurement.id); setShowViewModal(true); }}
                      className="text-primary-600 hover:text-primary-900"
                    >
                      <EyeIcon className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => { setEditingMeasurement(measurement); setShowModal(true); }}
                      className="text-primary-600 hover:text-primary-900"
                    >
                      <Pencil className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => handleDelete(measurement.id)}
                      className="text-red-600 hover:text-red-900"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  {measurement.neck && (
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Neck:</span>
                      <span className="font-medium">{measurement.neck}"</span>
                    </div>
                  )}
                  {measurement.chest && (
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Chest:</span>
                      <span className="font-medium">{measurement.chest}"</span>
                    </div>
                  )}
                  {measurement.waist && (
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Waist:</span>
                      <span className="font-medium">{measurement.waist}"</span>
                    </div>
                  )}
                  {measurement.hips && (
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Hips:</span>
                      <span className="font-medium">{measurement.hips}"</span>
                    </div>
                  )}
                  {measurement.shoulder && (
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Shoulder:</span>
                      <span className="font-medium">{measurement.shoulder}"</span>
                    </div>
                  )}
                  {measurement.sleeve_length && (
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Sleeve:</span>
                      <span className="font-medium">{measurement.sleeve_length}"</span>
                    </div>
                  )}
                </div>

                {measurement.notes && (
                  <div className="mt-4 pt-4 border-t border-gray-200">
                    <p className="text-sm text-gray-600">{measurement.notes}</p>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}

        {measurements.length === 0 && !loading && (
          <div className="text-center py-12 text-gray-500">
            No measurements found
          </div>
        )}
      </div>

      {/* Measurement Modal */}
      {/* {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4 overflow-y-auto">
          <div className="bg-white rounded-xl shadow-xl max-w-3xl w-full my-8">
            <div className="flex items-center justify-between p-6 border-b border-gray-200">
              <h3 className="text-xl font-bold text-gray-900">
                {editingMeasurement ? 'Edit Measurement' : 'Add Measurement'}
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
                  <label className="block text-sm font-medium text-gray-700 mb-2">Gender *</label>
                  <select
                    value={formData.gender}
                    onChange={(e) => setFormData({...formData, gender: e.target.value})}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                    required
                  >
                    <option value="M">Male</option>
                    <option value="F">Female</option>
                  </select>
                </div>
              </div>

              <div className="border-t pt-4">
                <h4 className="font-semibold text-gray-900 mb-4">Upper Body</h4>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm text-gray-600 mb-1">Neck (inches)</label>
                    <input
                      type="number"
                      step="0.01"
                      value={formData.neck}
                      onChange={(e) => setFormData({...formData, neck: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                    />
                  </div>
                  <div>
                    <label className="block text-sm text-gray-600 mb-1">Chest (inches)</label>
                    <input
                      type="number"
                      step="0.01"
                      value={formData.chest}
                      onChange={(e) => setFormData({...formData, chest: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                    />
                  </div>
                  <div>
                    <label className="block text-sm text-gray-600 mb-1">Waist (inches)</label>
                    <input
                      type="number"
                      step="0.01"
                      value={formData.waist}
                      onChange={(e) => setFormData({...formData, waist: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                    />
                  </div>
                  <div>
                    <label className="block text-sm text-gray-600 mb-1">Hips (inches)</label>
                    <input
                      type="number"
                      step="0.01"
                      value={formData.hips}
                      onChange={(e) => setFormData({...formData, hips: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                    />
                  </div>
                  <div>
                    <label className="block text-sm text-gray-600 mb-1">Shoulder (inches)</label>
                    <input
                      type="number"
                      step="0.01"
                      value={formData.shoulder}
                      onChange={(e) => setFormData({...formData, shoulder: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                    />
                  </div>
                  <div>
                    <label className="block text-sm text-gray-600 mb-1">Sleeve (inches)</label>
                    <input
                      type="number"
                      step="0.01"
                      value={formData.sleeve_length}
                      onChange={(e) => setFormData({...formData, sleeve_length: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                    />
                  </div>
                  <div>
                    <label className="block text-sm text-gray-600 mb-1">Wrist (inches)</label>
                    <input
                      type="number"
                      step="0.01"
                      value={formData.wrist}
                      onChange={(e) => setFormData({...formData, wrist: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                    />
                  </div>
                  <div>
                    <label className="block text-sm text-gray-600 mb-1">Thigh (inches)</label>
                    <input
                      type="number"
                      step="0.01"
                      value={formData.thigh}
                      onChange={(e) => setFormData({...formData, thigh: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                    />
                  </div>
                  <div>
                    <label className="block text-sm text-gray-600 mb-1">Ankle (inches)</label>
                    <input
                      type="number"
                      step="0.01"
                      value={formData.ankle}
                      onChange={(e) => setFormData({...formData, ankle: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                    />
                  </div>
                  <div>
                    <label className="block text-sm text-gray-600 mb-1">Inseam (inches)</label>
                    <input
                      type="number"
                      step="0.01"
                      value={formData.inseam}
                      onChange={(e) => setFormData({...formData, inseam: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                    />
                  </div>
                  <div>
                    <label className="block text-sm text-gray-600 mb-1">Outseam (inches)</label>
                    <input
                      type="number"
                      step="0.01"
                      value={formData.outseam}
                      onChange={(e) => setFormData({...formData, outseam: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                    />
                  </div>
                  <div>
                    <label className="block text-sm text-gray-600 mb-1">Back length (inches)</label>
                    <input
                      type="number"
                      step="0.01"
                      value={formData.back_length}
                      onChange={(e) => setFormData({...formData, back_length: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                    />
                  </div>
                  <div>
                    <label className="block text-sm text-gray-600 mb-1">Front length (inches)</label>
                    <input
                      type="number"
                      step="0.01"
                      value={formData.front_length}
                      onChange={(e) => setFormData({...formData, front_length: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                    />
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Notes</label>
                <textarea
                  value={formData.notes}
                  onChange={(e) => setFormData({...formData, notes: e.target.value})}
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
                  {editingMeasurement ? 'Update' : 'Create'}
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
                {editingMeasurement ? 'Edit Measurement' : 'Add Measurement'}
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
                  <label className="block text-sm font-medium text-gray-700 mb-2">Gender *</label>
                  <select
                    value={formData.gender}
                    onChange={(e) => setFormData({...formData, gender: e.target.value})}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                    required
                  >
                    <option value="M">Male</option>
                    <option value="F">Female</option>
                  </select>
                </div>
              </div>

              <div className="border-t pt-4">
                {/* <h4 className="font-semibold text-gray-900 mb-4">Upper Body</h4> */}
                <div className="grid grid-cols-2 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm text-gray-600 mb-1">Shoulder (in)</label>
                    <input
                      type="number"
                      step="0.01"
                      value={formData.shoulder}
                      onChange={(e) => setFormData({...formData, shoulder: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                    />
                  </div>
                  <div>
                    <label className="block text-sm text-gray-600 mb-1">Neck (in)</label>
                    <input
                      type="number"
                      step="0.01"
                      value={formData.neck}
                      onChange={(e) => setFormData({...formData, neck: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                    />
                  </div>
                  <div>
                    <label className="block text-sm text-gray-600 mb-1">Shirt length (in)</label>
                    <input
                      type="number"
                      step="0.01"
                      value={formData.hips}
                      onChange={(e) => setFormData({...formData, hips: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                    />
                  </div>
                  <div>
                    <label className="block text-sm text-gray-600 mb-1">Chest (in)</label>
                    <input
                      type="number"
                      step="0.01"
                      value={formData.chest}
                      onChange={(e) => setFormData({...formData, chest: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                    />
                  </div>
                   <div>
                    <label className="block text-sm text-gray-600 mb-1">Tommy (in)</label>
                    <input
                      type="number"
                      step="0.01"
                      value={formData.back_length}
                      onChange={(e) => setFormData({...formData, back_length: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                    />
                  </div>
                  <div>
                    <label className="block text-sm text-gray-600 mb-1">Balance (in)</label>
                    <input
                      type="number"
                      step="0.01"
                      value={formData.front_length}
                      onChange={(e) => setFormData({...formData, front_length: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                    />
                  </div>
                  <div>
                    <label className="block text-sm text-gray-600 mb-1">Long sleeve (in)</label>
                    <input
                      type="number"
                      step="0.01"
                      value={formData.wrist}
                      onChange={(e) => setFormData({...formData, wrist: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                    />
                  </div>
                  <div>
                    <label className="block text-sm text-gray-600 mb-1">Short sleeve (in)</label>
                    <input
                      type="number"
                      step="0.01"
                      value={formData.sleeve_length}
                      onChange={(e) => setFormData({...formData, sleeve_length: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                    />
                  </div>
                  <div>
                  <label className="block text-sm text-gray-600 mb-1">Bicep (in)</label>
                  <input
                    type="number"
                    step="0.01"
                    value={formData.thigh}
                    onChange={(e) => setFormData({...formData, thigh: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  />
                  </div>
                  <div>
                  <label className="block text-sm text-gray-600 mb-1">Round sleeve (in)</label>
                  <input
                    type="number"
                    step="0.01"
                    value={formData.knee}
                    onChange={(e) => setFormData({...formData, knee: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  />
                  </div>
                  <div>
                    <label className="block text-sm text-gray-600 mb-1">Cuffs (in)</label>
                    <input
                      type="number"
                      step="0.01"
                      value={formData.arm_hole}
                      onChange={(e) => setFormData({...formData, arm_hole: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                    />
                  </div>
                  <div>
                    <label className="block text-sm text-gray-600 mb-1">Trouser lenght (inches)</label>
                    <input
                      type="number"
                      step="0.01"
                      value={formData.inseam}
                      onChange={(e) => setFormData({...formData, inseam: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                    />
                  </div>
                  <div>
                    <label className="block text-sm text-gray-600 mb-1">Trouser waist (in)</label>
                    <input
                      type="number"
                      step="0.01"
                      value={formData.waist}
                      onChange={(e) => setFormData({...formData, waist: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                    />
                  </div>
                  <div>
                    <label className="block text-sm text-gray-600 mb-1">Sithip (in)</label>
                    <input
                      type="number"
                      step="0.01"
                      value={formData.outseam}
                      onChange={(e) => setFormData({...formData, outseam: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                    />
                  </div>
                  <div>
                    <label className="block text-sm text-gray-600 mb-1">Lap (in)</label>
                    <input
                      type="number"
                      step="0.01"
                      value={formData.lap}
                      onChange={(e) => setFormData({...formData, lap: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                    />
                  </div>
                  <div>
                    <label className="block text-sm text-gray-600 mb-1">Ankle (in)</label>
                    <input
                      type="number"
                      step="0.01"
                      value={formData.ankle}
                      onChange={(e) => setFormData({...formData, ankle: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                    />
                  </div>
                </div>
                {/* <h4 className="font-semibold text-gray-900 mb-4 mt-4">Lower Body</h4> */}
                <h4 className="font-semibold text-gray-900 mb-4 mt-4">Agbada</h4>
                <div className="grid grid-cols-2 md:grid-cols-2 gap-4">
                  <div>
                  <label className="block text-sm text-gray-600 mb-1">Agbada lenght (in)</label>
                  <input
                    type="number"
                    step="0.01"
                    value={formData.agbada_length}
                    onChange={(e) => setFormData({...formData, agbada_length: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  />
                  </div>
                  <div>
                    <label className="block text-sm text-gray-600 mb-1">Agbada width (in)</label>
                    <input
                      type="number"
                      step="0.01"
                      value={formData.agbada_width}
                      onChange={(e) => setFormData({...formData, agbada_width: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                    />
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Notes</label>
                <textarea
                  value={formData.notes}
                  onChange={(e) => setFormData({...formData, notes: e.target.value})}
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
                  {editingMeasurement ? 'Update' : 'Create'}
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
                <h3 className="text-base/7 font-semibold text-gray-900">Measurement Information</h3>
                {/* <p className="mt-1 max-w-2xl text-sm/6 text-gray-600">Personal details</p> */}
              </div>
              <div className="mt-6">
                <dl className="">
                  <div className="px-2 py-2 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-0">
                    <dt className="text-sm/6 font-medium text-gray-950">Full name</dt>
                    <dd className="text-sm/6 text-gray-800 sm:col-span-2 sm:mt-0">{getCustomerName(measurement?.customer ?? 0)}</dd>
                  </div>
                  <div className="px-2 py-2 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-0">
                    <dt className="text-sm/6 font-medium text-gray-950">Phone number</dt>
                    <dd className="mt-1 text-sm/6 text-gray-800 sm:col-span-2 sm:mt-0">{getCustomerPhone(measurement?.customer ?? 0)}</dd>
                  </div>
                </dl>
                <div className="px-4 sm:px-0">
                <h4 className="text-gray-900 mt-3 mb-2">* Upper body measurements (in inches)</h4>
                  {/* <p className="mt-1 max-w-2xl text-sm/6 text-gray-600">Personal details</p> */}
                </div>
                <dl className="">
                  <div className="px-2 py-2 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-0">
                    <dt className="text-sm/6 font-medium text-gray-950">Shoulder</dt>
                    <dd className="mt-1 text-sm/6 text-gray-800 sm:col-span-2 sm:mt-0">{measurement?.shoulder}</dd>
                  </div>
                  <div className="px-2 py-2 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-0">
                    <dt className="text-sm/6 font-medium text-gray-950">Neck</dt>
                    <dd className="mt-1 text-sm/6 text-gray-800 sm:col-span-2 sm:mt-0">{measurement?.neck}</dd>
                  </div>
                  <div className="px-2 py-2 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-0">
                    <dt className="text-sm/6 font-medium text-gray-950">Shirt length</dt>
                    <dd className="mt-1 text-sm/6 text-gray-800 sm:col-span-2 sm:mt-0">{measurement?.hips}</dd>
                  </div>
                  <div className="px-2 py-2 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-0">
                    <dt className="text-sm/6 font-medium text-gray-950">Chest</dt>
                    <dd className="mt-1 text-sm/6 text-gray-800 sm:col-span-2 sm:mt-0">{measurement?.chest}</dd>
                  </div>
                  <div className="px-2 py-2 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-0">
                    <dt className="text-sm/6 font-medium text-gray-950">Tommy</dt>
                    <dd className="mt-1 text-sm/6 text-gray-800 sm:col-span-2 sm:mt-0">{measurement?.back_length}</dd>
                  </div>
                  <div className="px-2 py-2 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-0">
                    <dt className="text-sm/6 font-medium text-gray-950">Balance</dt>
                    <dd className="mt-1 text-sm/6 text-gray-800 sm:col-span-2 sm:mt-0">{measurement?.front_length}</dd>
                  </div>
                  <div className="px-2 py-2 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-0">
                    <dt className="text-sm/6 font-medium text-gray-950">Sleeve short</dt>
                    <dd className="mt-1 text-sm/6 text-gray-800 sm:col-span-2 sm:mt-0">{measurement?.sleeve_length}</dd>
                  </div>
                  <div className="px-2 py-2 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-0">
                    <dt className="text-sm/6 font-medium text-gray-950">Sleeve long</dt>
                    <dd className="mt-1 text-sm/6 text-gray-800 sm:col-span-2 sm:mt-0">{measurement?.arm_hole}</dd>
                  </div>
                  <div className="px-2 py-2 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-0">
                    <dt className="text-sm/6 font-medium text-gray-950">Biceps</dt>
                    <dd className="mt-1 text-sm/6 text-gray-800 sm:col-span-2 sm:mt-0">{measurement?.thigh}</dd>
                  </div>
                  <div className="px-2 py-2 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-0">
                    <dt className="text-sm/6 font-medium text-gray-950">Round sleeve</dt>
                    <dd className="mt-1 text-sm/6 text-gray-800 sm:col-span-2 sm:mt-0">{measurement?.knee}</dd>
                  </div>
                  <div className="px-2 py-2 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-0">
                    <dt className="text-sm/6 font-medium text-gray-950">Cuffs</dt>
                    <dd className="mt-1 text-sm/6 text-gray-800 sm:col-span-2 sm:mt-0">{measurement?.wrist}</dd>
                  </div>
                  
                </dl>
                {/* <div className="px-4 sm:px-0">
                <h4 className="text-gray-900 mt-3 mb-2">* Lower body measurements (in inches)</h4>
                  <p className="mt-1 max-w-2xl text-sm/6 text-gray-600">Personal details</p>
                </div> */}
                <dl className="">
                  <div className="px-2 py-2 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-0">
                    <dt className="text-sm/6 font-medium text-gray-950">Trouser lenght</dt>
                    <dd className="mt-1 text-sm/6 text-gray-800 sm:col-span-2 sm:mt-0">{measurement?.inseam}</dd>
                  </div>
                  <div className="px-2 py-2 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-0">
                    <dt className="text-sm/6 font-medium text-gray-950">Trouser waist</dt>
                    <dd className="mt-1 text-sm/6 text-gray-800 sm:col-span-2 sm:mt-0">{measurement?.waist}</dd>
                  </div>
                  <div className="px-2 py-2 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-0">
                    <dt className="text-sm/6 font-medium text-gray-950">Sithip</dt>
                    <dd className="mt-1 text-sm/6 text-gray-800 sm:col-span-2 sm:mt-0">{measurement?.outseam}</dd>
                  </div>
                  <div className="px-2 py-2 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-0">
                    <dt className="text-sm/6 font-medium text-gray-950">Lap</dt>
                    <dd className="mt-1 text-sm/6 text-gray-800 sm:col-span-2 sm:mt-0">{measurement?.lap}</dd>
                  </div>
                  <div className="px-2 py-2 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-0">
                    <dt className="text-sm/6 font-medium text-gray-950">Ankle</dt>
                    <dd className="mt-1 text-sm/6 text-gray-800 sm:col-span-2 sm:mt-0">{measurement?.ankle}</dd>
                  </div>
                </dl>
                <div className="px-4 sm:px-0">
                <h4 className="text-gray-900 mt-3 mb-2">* Agbada measurements (in inches)</h4>
                  {/* <p className="mt-1 max-w-2xl text-sm/6 text-gray-600">Personal details</p> */}
                </div>
                <dl className="">
                  <div className="px-2 py-2 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-0">
                    <dt className="text-sm/6 font-medium text-gray-950">Agbada length</dt>
                    <dd className="mt-1 text-sm/6 text-gray-800 sm:col-span-2 sm:mt-0">{measurement?.agbada_length}</dd>
                  </div>
                  <div className="px-2 py-2 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-0">
                    <dt className="text-sm/6 font-medium text-gray-950">Agbada width</dt>
                    <dd className="mt-1 text-sm/6 text-gray-800 sm:col-span-2 sm:mt-0">{measurement?.agbada_width}</dd>
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