// 'use client';
// import React, { useEffect, useState } from 'react';
// import Link from 'next/link';
// import { usePathname } from 'next/navigation';
// import { useAuth } from '@/context/AuthContext';
// import { 
//   LayoutDashboard, Users, Ruler, Package, ShoppingBag, 
//   CreditCard, Menu, X, LogOut, User, Crown 
// } from 'lucide-react';
// // import { dashboardAPI } from '@/lib/api';

// const navigation_free = [
//   { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
//   { name: 'Customers', href: '/customers', icon: Users },
//   { name: 'Measurements', href: '/measurements', icon: Ruler },
//   { name: 'Users', href: '/users', icon: Users },

//   // { name: 'Fabrics', href: '/fabrics', icon: Package },
//   // { name: 'Orders', href: '/orders', icon: ShoppingBag },
//   // { name: 'Payments', href: '/payments', icon: CreditCard },
//   { name: 'Subscription', href: '/subscription', icon: Crown },
// ];

// const navigation_basic = [
//   { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
//   { name: 'Customers', href: '/customers', icon: Users },
//   { name: 'Measurements', href: '/measurements', icon: Ruler },
//   { name: 'Fabrics', href: '/fabrics', icon: Package },
//   { name: 'Orders', href: '/orders', icon: ShoppingBag },
//   { name: 'Payments', href: '/payments', icon: CreditCard },
//   { name: 'Users', href: '/users', icon: Users },
//   { name: 'Subscription', href: '/subscription', icon: Crown },
// ];

// export default function Layout({ children }: { children: React.ReactNode }) {
//   const [sidebarOpen, setSidebarOpen] = useState(false);
//   // const [stats, setStats] = useState<any>(null);
//   const pathname = usePathname();
//   const { user, logout, subscription } = useAuth();

//   // useEffect(() => {
//   //     loadStats();
//   //   }, []);

//   // const loadStats = async () => {
//   //     try {
//   //       const response = await dashboardAPI.getStats();
//   //       setStats(response.data);
//   //       console.log(response.data);
        
//   //     } catch (error) {
//   //       console.error('Failed to load stats:', error);
//   //     }
//   //   };

//   return (
//     <div className="min-h-screen bg-gray-50">
//       {/* Mobile sidebar */}
//       {sidebarOpen && (
//         <div className="fixed inset-0 z-40 lg:hidden">
//           <div className="fixed inset-0 bg-gray-600 bg-opacity-75" onClick={() => setSidebarOpen(false)} />
//           <div className="fixed inset-y-0 left-0 flex w-64 flex-col bg-white shadow-xl">
//             <div className="flex h-16 items-center justify-between px-6 bg-gradient-to-r from-primary-600 to-primary-700">
//               <h1 className="text-xl font-bold text-white">Tailor Shop</h1>
//               <button onClick={() => setSidebarOpen(false)} className="text-white">
//                 <X className="h-6 w-6" />
//               </button>
//             </div>
//             {subscription?.plan === 'free' ? (
//                 <nav className="flex-1 space-y-1 px-3 py-4">
//                   {navigation_free.map((item) => {
//                     const isActive = pathname === item.href;
//                     return (
//                       <Link
//                         key={item.name}
//                         href={item.href}
//                         className={`flex items-center px-4 py-3 text-sm font-medium rounded-lg transition-colors ${
//                           isActive
//                             ? 'bg-primary-50 text-primary-700'
//                             : 'text-gray-700 hover:bg-gray-100'
//                         }`}
//                       >
//                         <item.icon className="mr-3 h-5 w-5" />
//                         {item.name}
//                       </Link>
//                     );
//                   })}
//                 </nav>
//               ) : (
//                 <nav className="flex-1 space-y-1 px-3 py-4">
//                   {navigation_basic.map((item) => {
//                     const isActive = pathname === item.href;
//                     return (
//                       <Link
//                         key={item.name}
//                         href={item.href}
//                         className={`flex items-center px-4 py-3 text-sm font-medium rounded-lg transition-colors ${
//                           isActive
//                             ? 'bg-primary-50 text-primary-700'
//                             : 'text-gray-700 hover:bg-gray-100'
//                         }`}
//                       >
//                         <item.icon className="mr-3 h-5 w-5" />
//                         {item.name}
//                       </Link>
//                     );
//                   })}
//                 </nav>
//               )}
//           </div>
//         </div>
//       )}

//       {/* Desktop sidebar */}
//       <div className="hidden lg:fixed lg:inset-y-0 lg:flex lg:w-64 lg:flex-col">
//         <div className="flex flex-col flex-grow bg-white border-r border-gray-200">
//           <div className="flex h-16 items-center px-6 bg-gradient-to-r from-primary-600 to-primary-700">
//             <h1 className="text-xl font-bold text-white">Tailor Shop</h1>
//           </div>
//           {subscription?.plan === 'free' ? (
//                 <nav className="flex-1 space-y-1 px-3 py-4">
//                   {navigation_free.map((item) => {
//                     const isActive = pathname === item.href;
//                     return (
//                       <Link
//                         key={item.name}
//                         href={item.href}
//                         className={`flex items-center px-4 py-3 text-sm font-medium rounded-lg transition-colors ${
//                           isActive
//                             ? 'bg-primary-50 text-primary-700'
//                             : 'text-gray-700 hover:bg-gray-100'
//                         }`}
//                       >
//                         <item.icon className="mr-3 h-5 w-5" />
//                         {item.name}
//                       </Link>
//                     );
//                   })}
//                 </nav>
//               ) : (
//                 <nav className="flex-1 space-y-1 px-3 py-4">
//                   {navigation_basic.map((item) => {
//                     const isActive = pathname === item.href;
//                     return (
//                       <Link
//                         key={item.name}
//                         href={item.href}
//                         className={`flex items-center px-4 py-3 text-sm font-medium rounded-lg transition-colors ${
//                           isActive
//                             ? 'bg-primary-50 text-primary-700'
//                             : 'text-gray-700 hover:bg-gray-100'
//                         }`}
//                       >
//                         <item.icon className="mr-3 h-5 w-5" />
//                         {item.name}
//                       </Link>
//                     );
//                   })}
//                 </nav>
//               )}
//         </div>
//       </div>

//       {/* Main content */}
//       <div className="lg:pl-64">
//         <div className="sticky top-0 z-10 flex h-16 bg-white border-b border-gray-200">
//           <button
//             className="px-4 text-gray-500 lg:hidden"
//             onClick={() => setSidebarOpen(true)}
//           >
//             <Menu className="h-6 w-6" />
//           </button>
//           <div className="flex flex-1 justify-end items-center px-4 sm:px-6 lg:px-8">
//             <div className="flex items-center gap-4">
//               <Link href="/profile" className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-700 hover:text-gray-900 rounded-lg hover:bg-gray-100 transition-colors">
//                 <User className="h-5 w-5 text-gray-500" />
//                 <span>
//                   {user?.first_name} {user?.last_name}
//                 </span>
//               </Link>
//               <button
//                 onClick={logout}
//                 className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-700 hover:text-gray-900 rounded-lg hover:bg-gray-100 transition-colors"
//               >
//                 <LogOut className="h-4 w-4" />
//                 Logout
//               </button>
//             </div>
//           </div>
//         </div>
//         <main className="py-8">
//           <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
//             {children}
//           </div>
//         </main>
//       </div>
//     </div>
//   );
// }
'use client';
import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { 
  LayoutDashboard, Users, Ruler, Package, ShoppingBag, 
  CreditCard, Menu, X, LogOut, User, Crown, Shield 
} from 'lucide-react';

export default function Layout({ children }: { children: React.ReactNode }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const pathname = usePathname();
  const { user, logout, hasPermission, profile } = useAuth();

  const navigation = [
    { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard, permission: null },
    { name: 'Customers', href: '/customers', icon: Users, permission: 'can_manage_customers' },
    { name: 'Measurements', href: '/measurements', icon: Ruler, permission: 'can_manage_measurements' },
    { name: 'Fabrics', href: '/fabrics', icon: Package, permission: 'can_manage_fabrics' },
    { name: 'Orders', href: '/orders', icon: ShoppingBag, permission: 'can_manage_orders' },
    { name: 'Payments', href: '/payments', icon: CreditCard, permission: 'can_manage_payments' },
    { name: 'Users & Roles', href: '/users', icon: Shield, permission: 'can_manage_users' },
    { name: 'Subscription', href: '/subscription', icon: Crown, permission: null },
  ];

  const visibleNavigation = navigation.filter(item => 
    !item.permission || hasPermission(item.permission)
  );

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Mobile sidebar */}
      {sidebarOpen && (
        <div className="fixed inset-0 z-40 lg:hidden">
          <div className="fixed inset-0 bg-gray-600 bg-opacity-75" onClick={() => setSidebarOpen(false)} />
          <div className="fixed inset-y-0 left-0 flex w-64 flex-col bg-white shadow-xl">
            <div className="flex h-16 items-center justify-between px-6 bg-gradient-to-r from-primary-600 to-primary-700">
              <h1 className="text-xl font-bold text-amber-200">Tailor Shop</h1>
              <button onClick={() => setSidebarOpen(false)} className="text-white">
                <X className="h-6 w-6" />
              </button>
            </div>
            <nav className="flex-1 space-y-1 px-3 py-4">
              {visibleNavigation.map((item) => {
                const isActive = pathname === item.href;
                return (
                  <Link
                    key={item.name}
                    href={item.href}
                    className={`flex items-center px-4 py-3 text-sm font-medium rounded-lg transition-colors ${
                      isActive
                        ? 'bg-primary-50 text-primary-700'
                        : 'text-gray-700 hover:bg-gray-100'
                    }`}
                  >
                    <item.icon className="mr-3 h-5 w-5" />
                    {item.name}
                  </Link>
                );
              })}
            </nav>
          </div>
        </div>
      )}

      {/* Desktop sidebar */}
      <div className="hidden lg:fixed lg:inset-y-0 lg:flex lg:w-64 lg:flex-col">
        <div className="flex flex-col flex-grow bg-white border-r border-gray-200">
          <div className="flex h-16 items-center px-6 bg-gradient-to-r from-primary-600 to-primary-700">
            <h1 className="text-xl font-bold text-amber-200">Tailor Shop</h1>
          </div>
          <nav className="flex-1 space-y-1 px-3 py-4">
            {visibleNavigation.map((item) => {
              const isActive = pathname === item.href;
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  className={`flex items-center px-4 py-3 text-sm font-medium rounded-lg transition-colors ${
                    isActive
                      ? 'bg-primary-50 text-primary-700'
                      : 'text-gray-700 hover:bg-gray-100'
                  }`}
                >
                  <item.icon className="mr-3 h-5 w-5" />
                  {item.name}
                </Link>
              );
            })}
          </nav>
          
          {/* Role Badge in Sidebar */}
          {profile && (
            <div className="p-4 border-t border-gray-200">
              <div className="bg-primary-50 rounded-lg p-3">
                <div className="flex items-center gap-2">
                  <Shield className="h-4 w-4 text-primary-600" />
                  <span className="text-xs font-semibold text-primary-900">
                    {profile.role_display}
                  </span>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Main content */}
      <div className="lg:pl-64">
        <div className="sticky top-0 z-10 flex h-16 bg-white border-b border-gray-200">
          <button
            className="px-4 text-gray-500 lg:hidden"
            onClick={() => setSidebarOpen(true)}
          >
            <Menu className="h-6 w-6" />
          </button>
          <div className="flex flex-1 justify-end items-center px-4 sm:px-6 lg:px-8">
            <div className="flex items-center gap-4">
              <Link href="/profile" className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-700 hover:text-gray-900 rounded-lg hover:bg-gray-100 transition-colors">
                <User className="h-5 w-5 text-gray-500" />
                <span>
                  {user?.first_name} {user?.last_name}
                </span>
                {profile && (
                  <span className="ml-2 px-2 py-1 text-xs font-semibold text-primary-700 bg-primary-50 rounded">
                    {profile.role_display}
                  </span>
                )}
              </Link>
              <button
                onClick={logout}
                className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-700 hover:text-gray-900 rounded-lg hover:bg-gray-100 transition-colors"
              >
                <LogOut className="h-4 w-4" />
                Logout
              </button>
            </div>
          </div>
        </div>
        <main className="py-8">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}