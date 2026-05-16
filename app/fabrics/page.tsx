'use client';
import { useEffect, useState } from 'react';
import { fabricAPI } from '@/lib/api';
import Layout from '@/components/Layout';
import { redirect, useRouter } from 'next/navigation'
import { useAuth } from '@/context/AuthContext';
import { Plus, Search, AlertTriangle, Package, X, Pencil, Trash2 } from 'lucide-react';
import { Button, Dialog, DialogPanel, DialogTitle, Description } from '@headlessui/react'

export default function FabricsPage() {
  const [fabrics, setFabrics] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editingFabric, setEditingFabric] = useState<any>(null);
  const [formData, setFormData] = useState({
    name: '',
    fabric_type: 'cotton',
    color: '',
    quantity: '',
    price_per_unit: '',
    supplier: '',
    description: '',
  });

  const formatter = new Intl.NumberFormat('en-US');
  const { token, hasPermission } = useAuth();
  const router = useRouter();
  // const router = useRouter()

  useEffect(() => {
    if (!hasPermission('can_manage_fabrics')) {
      router.push('/dashboard');
      return;
    }
    loadFabrics();
  }, [token]);

  useEffect(() => {
    if (editingFabric) {
      setFormData({
        name: editingFabric.name,
        fabric_type: editingFabric.fabric_type,
        color: editingFabric.color,
        quantity: editingFabric.quantity,
        price_per_unit: editingFabric.price_per_unit,
        supplier: editingFabric.supplier || '',
        description: editingFabric.description || '',
      });
    } else {
      setFormData({
        name: '',
        fabric_type: 'cotton',
        color: '',
        quantity: '',
        price_per_unit: '',
        supplier: '',
        description: '',
      });
    }
  }, [editingFabric]);

  const loadFabrics = async () => {
    try {
      const response = await fabricAPI.getAll();
      setFabrics(response.data);
    } catch (error) {
      console.error('Failed to load fabrics:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingFabric) {
        await fabricAPI.update(editingFabric.id, formData);
      } else {
        await fabricAPI.create(formData);
      }
      loadFabrics();
      setShowModal(false);
      setEditingFabric(null);
    } catch (error) {
      console.error('Failed to save fabric:', error);
      alert('Failed to save fabric');
    }
  };

  const handleDelete = async (id: number) => {
    if (confirm('Are you sure you want to delete this fabric?')) {
      try {
        await fabricAPI.delete(id);
        loadFabrics();
      } catch (error) {
        console.error('Failed to delete fabric:', error);
      }
    }
  };

  const filteredFabrics = fabrics.filter(fabric =>
    `${fabric.name} ${fabric.color} ${fabric.fabric_type}`
      .toLowerCase()
      .includes(searchTerm.toLowerCase())
  );

  return (
    <Layout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Fabrics Inventory</h1>
            <p className="mt-1 text-sm text-gray-500">Manage your fabric stock</p>
          </div>
          <button 
            onClick={() => { setEditingFabric(null); setShowModal(true); }}
            className="flex items-center gap-2 bg-amber-200 text-gray-600 px-4 py-2 rounded-lg hover:bg-primary-700 transition font-medium"
          >
            <Plus className="h-5 w-5" />
            Add Fabric
          </button>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200">
          <div className="p-4 border-b border-gray-200">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
              <input
                type="text"
                placeholder="Search fabrics..."
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
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 p-6">
              {filteredFabrics.map((fabric) => (
                <div
                  key={fabric.id}
                  className="bg-white border border-gray-200 rounded-xl p-6 hover:shadow-lg transition-shadow"
                >
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 bg-primary-100 rounded-lg flex items-center justify-center">
                        <Package className="h-6 w-6 text-primary-600" />
                      </div>
                      <div>
                        <h3 className="font-semibold text-gray-900">{fabric.name}</h3>
                        <p className="text-sm text-gray-500 capitalize">{fabric.fabric_type}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      {fabric.quantity <= 5 && (
                        <AlertTriangle className="h-5 w-5 text-red-500" />
                      )}
                      <button
                        onClick={() => { setEditingFabric(fabric); setShowModal(true); }}
                        className="text-primary-600 hover:text-primary-900"
                      >
                        <Pencil className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => handleDelete(fabric.id)}
                        className="text-red-600 hover:text-red-900"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Color:</span>
                      <span className="font-medium text-gray-900">{fabric.color}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Quantity:</span>
                      <span className={`font-medium ${fabric.quantity <= 5 ? 'text-red-600' : 'text-gray-900'}`}>
                        {fabric.quantity}yards
                      </span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Price/Unit:</span>
                      <span className="font-medium text-gray-900">₦{formatter.format(fabric.price_per_unit)}</span>
                    </div>
                    {fabric.supplier && (
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-600">Supplier:</span>
                        <span className="font-medium text-gray-900">{fabric.supplier}</span>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
          {filteredFabrics.length === 0 && !loading && (
            <div className="text-center py-12 text-gray-500">
              No fabrics found
            </div>
          )}
        </div>
      </div>

      {/* Fabric Modal */}
      {/* {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl max-w-md w-full">
            <div className="flex items-center justify-between p-6 border-b border-gray-200">
              <h3 className="text-xl font-bold text-gray-900">
                {editingFabric ? 'Edit Fabric' : 'Add Fabric'}
              </h3>
              <button onClick={() => setShowModal(false)} className="text-gray-400 hover:text-gray-600">
                <X className="h-6 w-6" />
              </button>
            </div>
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Fabric Name *</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({...formData, name: e.target.value})}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Fabric Type *</label>
                <select
                  value={formData.fabric_type}
                  onChange={(e) => setFormData({...formData, fabric_type: e.target.value})}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  required
                >
                  <option value="cotton">Cotton</option>
                  <option value="silk">Silk</option>
                  <option value="wool">Wool</option>
                  <option value="linen">Linen</option>
                  <option value="polyester">Polyester</option>
                  <option value="chiffon">Chiffon</option>
                  <option value="velvet">Velvet</option>
                  <option value="denim">Denim</option>
                  <option value="other">Other</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Color *</label>
                <input
                  type="text"
                  value={formData.color}
                  onChange={(e) => setFormData({...formData, color: e.target.value})}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  required
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Quantity (m) *</label>
                  <input
                    type="number"
                    step="0.01"
                    value={formData.quantity}
                    onChange={(e) => setFormData({...formData, quantity: e.target.value})}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Price/Unit (₦) *</label>
                  <input
                    type="number"
                    step="0.01"
                    value={formData.price_per_unit}
                    onChange={(e) => setFormData({...formData, price_per_unit: e.target.value})}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                    required
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Supplier</label>
                <input
                  type="text"
                  value={formData.supplier}
                  onChange={(e) => setFormData({...formData, supplier: e.target.value})}
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
                  {editingFabric ? 'Update' : 'Create'}
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
                  {editingFabric ? 'Edit Fabric' : 'Add Fabric'}                
                </h3>
                {/* <p className="mt-1 max-w-2xl text-sm/6 text-gray-600">Personal details</p> */}
              </div>
              <div className="mt-6">
                <form onSubmit={handleSubmit} className="p-6 space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Fabric Name *</label>
                    <input
                      type="text"
                      value={formData.name}
                      onChange={(e) => setFormData({...formData, name: e.target.value})}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Fabric Type *</label>
                    <select
                      value={formData.fabric_type}
                      onChange={(e) => setFormData({...formData, fabric_type: e.target.value})}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                      required
                    >
                      <option value="cotton">Cotton</option>
                      <option value="silk">Silk</option>
                      <option value="wool">Wool</option>
                      <option value="linen">Linen</option>
                      <option value="polyester">Polyester</option>
                      <option value="chiffon">Chiffon</option>
                      <option value="velvet">Velvet</option>
                      <option value="denim">Denim</option>
                      <option value="other">Other</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Color *</label>
                    <input
                      type="text"
                      value={formData.color}
                      onChange={(e) => setFormData({...formData, color: e.target.value})}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                      required
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Quantity (yd) *</label>
                      <input
                        type="number"
                        step="0.01"
                        value={formData.quantity}
                        onChange={(e) => setFormData({...formData, quantity: e.target.value})}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Price/Unit (₦) *</label>
                      <input
                        type="number"
                        step="0.01"
                        value={formData.price_per_unit}
                        onChange={(e) => setFormData({...formData, price_per_unit: e.target.value})}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                        required
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Supplier</label>
                    <input
                      type="text"
                      value={formData.supplier}
                      onChange={(e) => setFormData({...formData, supplier: e.target.value})}
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
                      {editingFabric ? 'Update' : 'Create'}
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