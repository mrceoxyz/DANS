'use client';
import { useEffect, useState } from 'react';
import { profileAPI, roleAPI, userAPI } from '@/lib/api';
import { useAuth } from '@/context/AuthContext';
import Layout from '@/components/Layout';
import { Shield, Check, X, Edit2, UserCog, DeleteIcon } from 'lucide-react';
import { useRouter } from 'next/navigation';

export default function UsersPage() {
  const [profiles, setProfiles] = useState<any[]>([]);
  const [roles, setRoles] = useState<any[]>([]);
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [selectedProfile, setSelectedProfile] = useState<any>(null);
  const [selectedRole, setSelectedRole] = useState('');
  const [updating, setUpdating] = useState(false);
  const { hasPermission } = useAuth();
  const router = useRouter();


  useEffect(() => {
    if (!hasPermission('can_manage_users')) {
      router.push('/dashboard');
      return;
    }
    // console.log(hasPermission('can_manage_users'));
    
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [profilesRes, rolesRes, userRes] = await Promise.all([
        profileAPI.getAll(),
        roleAPI.getAll(),
        userAPI.getUsers(),
      ]);
      setProfiles(profilesRes.data);
      setRoles(rolesRes.data);
      setUsers(userRes.data)
      console.log(userRes.data);
      
    } catch (error) {
      console.error('Failed to load data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAssignRole = async () => {
    if (!selectedProfile || !selectedRole) return;
    
    setUpdating(true);
    try {
      await profileAPI.assignRole(selectedProfile.id, parseInt(selectedRole));
      await loadData();
      setShowModal(false);
      setSelectedProfile(null);
      setSelectedRole('');
    } catch (error) {
      console.error('Failed to assign role:', error);
      alert('Failed to assign role');
    } finally {
      setUpdating(false);
    }
  };

  const getUsername = (userId: number) => {
    const user = users.find(u => u.id === userId);
    return user ? `${user.first_name} ${user.last_name}` : 'Unknown';
  };

  const openAssignModal = (profile: any) => {
    setSelectedProfile(profile);
    setSelectedRole(profile.role?.toString() || '');
    setShowModal(true);
  };

  const handleDelete = async (id: number) => {
      if (confirm('Are you sure you want to delete this user?')) {
        try {
          await userAPI.deleteUser(id);
          loadData();
        } catch (error) {
          console.error('Failed to delete user:', error);
        }
      }
    };
  const roleColors: any = {
    Owner: 'bg-purple-100 text-purple-800 border-purple-200',
    Manager: 'bg-blue-100 text-blue-800 border-blue-200',
    Tailor: 'bg-green-100 text-green-800 border-green-200',
    Assistant: 'bg-yellow-100 text-yellow-800 border-yellow-200',
    Viewer: 'bg-gray-100 text-gray-800 border-gray-200',
  };

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
          <h1 className="text-3xl font-bold text-gray-900">Users & Roles</h1>
          <p className="mt-1 text-sm text-gray-500">Manage user roles and permissions</p>
        </div>

        {/* Roles Overview */}
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
          {roles.map((role) => (
            <div
              key={role.id}
              className={`border-2 rounded-xl p-4 ${roleColors[role.display_name] || 'bg-gray-100'}`}
            >
              <div className="flex items-center gap-2 mb-2">
                <Shield className="h-5 w-5" />
                <h3 className="font-semibold">{role.display_name}</h3>
              </div>
              <p className="text-xs opacity-80">{role.description}</p>
              <div className="mt-3">
                <span className="text-2xl font-bold">
                  {profiles.filter(p => p.role_display === role.display_name).length}
                </span>
                <span className="text-xs ml-1">users</span>
              </div>
            </div>
          ))}
        </div>

        {/* Users List */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    User
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Role
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Permissions
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {profiles.map((profile) => (
                  <tr key={profile.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4">
                      <div className="flex items-center">
                        <div className="h-10 w-10 flex-shrink-0">
                          <div className="h-10 w-10 rounded-full bg-primary-100 flex items-center justify-center">
                            <UserCog className="h-5 w-5 text-primary-700" />
                          </div>
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-medium text-gray-900">
                            {getUsername(profile.user)}
                          </div>
                          <div className="text-sm text-gray-500">
                            {profile.user_details?.username}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full border-2 ${
                        roleColors[profile.role_display] || 'bg-gray-100 text-gray-800'
                      }`}>
                        {profile.role_display || 'No Role'}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex flex-wrap gap-1">
                        {profile.can_manage_users && (
                          <span className="px-2 py-1 text-xs bg-purple-50 text-purple-700 rounded">
                            Users
                          </span>
                        )}
                        {profile.can_manage_customers && (
                          <span className="px-2 py-1 text-xs bg-blue-50 text-blue-700 rounded">
                            Customers
                          </span>
                        )}
                        {profile.can_manage_orders && (
                          <span className="px-2 py-1 text-xs bg-green-50 text-green-700 rounded">
                            Orders
                          </span>
                        )}
                        {profile.can_manage_payments && (
                          <span className="px-2 py-1 text-xs bg-yellow-50 text-yellow-700 rounded">
                            Payments
                          </span>
                        )}
                        {profile.can_manage_fabrics && (
                          <span className="px-2 py-1 text-xs bg-pink-50 text-pink-700 rounded">
                            Fabrics
                          </span>
                        )}
                        {profile.can_view_reports && (
                          <span className="px-2 py-1 text-xs bg-indigo-50 text-indigo-700 rounded">
                            Reports
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <button
                        onClick={() => openAssignModal(profile)}
                        className="inline-flex items-center gap-1 text-primary-600 hover:text-primary-900 font-medium text-sm"
                      >
                        <Edit2 className="h-4 w-4 text-blue-600" />
                      </button>
                      <button
                        onClick={() => handleDelete(profile.id)}
                        className="inline-flex items-center gap-1 text-primary-600 hover:text-primary-900 font-medium text-sm"
                      >
                        <DeleteIcon className="h-4 w-4 text-red-600" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {profiles.length === 0 && (
              <div className="text-center py-12 text-gray-500">
                No users found
              </div>
            )}
          </div>
        </div>

        {/* Permission Matrix */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h2 className="text-xl font-bold text-gray-900 mb-6">Role Permission Matrix</h2>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="text-left py-3 px-4 font-semibold text-gray-700">Permission</th>
                  {roles.map(role => (
                    <th key={role.id} className="text-center py-3 px-4 font-semibold text-gray-700">
                      {role.display_name}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {[
                  { label: 'Manage Users', key: 'can_manage_users' },
                  { label: 'Manage Customers', key: 'can_manage_customers' },
                  { label: 'Manage Orders', key: 'can_manage_orders' },
                  { label: 'Manage Payments', key: 'can_manage_payments' },
                  { label: 'Manage Fabrics', key: 'can_manage_fabrics' },
                  { label: 'Manage Measurements', key: 'can_manage_measurements' },
                  { label: 'View Reports', key: 'can_view_reports' },
                  { label: 'Manage Settings', key: 'can_manage_settings' },
                ].map((permission) => (
                  <tr key={permission.key}>
                    <td className="py-3 px-4 font-medium text-gray-900">{permission.label}</td>
                    {roles.map(role => {
                      const hasPermission = profiles.some(p => 
                        p.role_display === role.display_name && (p as any)[permission.key]
                      );
                      return (
                        <td key={role.id} className="py-3 px-4 text-center">
                          {hasPermission ? (
                            <Check className="h-5 w-5 text-green-600 mx-auto" />
                          ) : (
                            <X className="h-5 w-5 text-gray-300 mx-auto" />
                          )}
                        </td>
                      );
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Assign Role Modal */}
      {showModal && selectedProfile && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl max-w-md w-full">
            <div className="flex items-center justify-between p-6 border-b border-gray-200">
              <h3 className="text-xl font-bold text-gray-900">Assign Role</h3>
              <button onClick={() => setShowModal(false)} className="text-gray-400 hover:text-gray-600">
                <X className="h-6 w-6" />
              </button>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  User
                </label>
                <div className="px-4 py-3 bg-gray-50 rounded-lg">
                  <p className="font-medium text-gray-900">
                    {selectedProfile.user_details?.first_name} {selectedProfile.user_details?.last_name}
                  </p>
                  <p className="text-sm text-gray-500">{selectedProfile.user_details?.username}</p>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Current Role
                </label>
                <span className={`px-3 py-2 inline-flex text-sm font-semibold rounded-lg border-2 ${
                  roleColors[selectedProfile.role_display] || 'bg-gray-100 text-gray-800'
                }`}>
                  {selectedProfile.role_display || 'No Role'}
                </span>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  New Role *
                </label>
                <select
                  value={selectedRole}
                  onChange={(e) => setSelectedRole(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  required
                >
                  <option value="">Select Role</option>
                  {roles.map(role => (
                    <option key={role.id} value={role.id}>
                      {role.display_name} - {role.description}
                    </option>
                  ))}
                </select>
              </div>

              {selectedRole && (
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <h4 className="text-sm font-semibold text-blue-900 mb-2">
                    Permissions for selected role:
                  </h4>
                  <ul className="text-sm text-blue-800 space-y-1">
                    {(() => {
                      const role = roles.find(r => r.id.toString() === selectedRole);
                      const sampleProfile = profiles.find(p => p.role_display === role?.display_name);
                      if (!sampleProfile) return null;
                      
                      const permissions = [];
                      if (sampleProfile.can_manage_users) permissions.push('Manage Users');
                      if (sampleProfile.can_manage_customers) permissions.push('Manage Customers');
                      if (sampleProfile.can_manage_orders) permissions.push('Manage Orders');
                      if (sampleProfile.can_manage_payments) permissions.push('Manage Payments');
                      if (sampleProfile.can_manage_fabrics) permissions.push('Manage Fabrics');
                      if (sampleProfile.can_manage_measurements) permissions.push('Manage Measurements');
                      if (sampleProfile.can_view_reports) permissions.push('View Reports');
                      if (sampleProfile.can_manage_settings) permissions.push('Manage Settings');
                      
                      return permissions.map((perm, idx) => (
                        <li key={idx} className="flex items-center gap-2">
                          <Check className="h-4 w-4 text-green-600" />
                          {perm}
                        </li>
                      ));
                    })()}
                  </ul>
                </div>
              )}

              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 font-medium"
                >
                  Cancel
                </button>
                <button
                  onClick={handleAssignRole}
                  disabled={!selectedRole || updating}
                  className="flex-1 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 font-medium disabled:opacity-50"
                >
                  {updating ? 'Assigning...' : 'Assign Role'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </Layout>
  );
}