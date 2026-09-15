import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import useAuthStore from '../../store/useAuthStore';
import useUIStore from '../../store/useUIStore';
import { getNavItems } from '../../utils/roleHelpers';

const Sidebar = () => {
  const location = useLocation();
  const { role, user, logout } = useAuthStore();
  const { isSidebarOpen, setSidebarOpen } = useUIStore();
  const navItems = getNavItems(role);

  const closeSidebar = () => setSidebarOpen(false);

  return (
    <>
      {/* Mobile overlay */}
      <AnimatePresence>
        {isSidebarOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black bg-opacity-50 z-30 lg:hidden"
            onClick={closeSidebar}
          />
        )}
      </AnimatePresence>

      {/* Desktop sidebar */}
      <aside className="hidden lg:flex flex-col fixed left-0 top-16 bottom-0 w-64 bg-white border-r border-gray-100 z-30 overflow-y-auto">
        <SidebarContent
          navItems={navItems}
          location={location}
          user={user}
          role={role}
          onLogout={logout}
        />
      </aside>

      {/* Mobile sidebar */}
      <AnimatePresence>
        {isSidebarOpen && (
          <motion.aside
            initial={{ x: -280 }}
            animate={{ x: 0 }}
            exit={{ x: -280 }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className="fixed left-0 top-0 bottom-0 w-72 bg-white z-40 lg:hidden shadow-2xl overflow-y-auto"
          >
            <div className="flex items-center justify-between p-4 border-b border-gray-100">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 bg-primary-900 rounded-lg flex items-center justify-center text-white font-bold">
                  H
                </div>
                <span className="font-bold text-primary-900 text-lg">HEROY</span>
              </div>
              <button
                onClick={closeSidebar}
                className="w-8 h-8 flex items-center justify-center rounded-lg text-gray-400 hover:bg-gray-100"
              >
                ✕
              </button>
            </div>
            <SidebarContent
              navItems={navItems}
              location={location}
              user={user}
              role={role}
              onLogout={logout}
              onNavClick={closeSidebar}
            />
          </motion.aside>
        )}
      </AnimatePresence>
    </>
  );
};

const SidebarContent = ({ navItems, location, user, role, onLogout, onNavClick }) => (
  <div className="flex flex-col h-full py-4">
    {user && (
      <div className="px-4 pb-4 border-b border-gray-100 mb-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-primary-900 flex items-center justify-center text-white font-bold">
            {user?.name?.charAt(0)?.toUpperCase()}
          </div>
          <div className="flex-1 min-w-0">
            <p className="font-semibold text-gray-800 text-sm truncate">{user.name}</p>
            <p className="text-xs text-gray-400 capitalize">{role}</p>
          </div>
        </div>
      </div>
    )}

    <nav className="flex-1 px-3">
      <div className="flex flex-col gap-1">
        {navItems.map((item) => {
          const isActive = location.pathname === item.path ||
            location.pathname.startsWith(item.path + '/');
          return (
            <Link
              key={item.path}
              to={item.path}
              onClick={onNavClick}
              className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all duration-200 ${
                isActive
                  ? 'bg-primary-900 text-white shadow-sm'
                  : 'text-gray-600 hover:bg-gray-50 hover:text-primary-900'
              }`}
            >
              <span className="text-lg">{item.icon}</span>
              <span>{item.label}</span>
            </Link>
          );
        })}
      </div>
    </nav>

    <div className="px-3 pt-4 border-t border-gray-100 mt-4">
      <button
        onClick={onLogout}
        className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium text-red-600 hover:bg-red-50 transition-all duration-200"
      >
        <span className="text-lg">🚪</span>
        <span>Logout</span>
      </button>
    </div>
  </div>
);

export default Sidebar;