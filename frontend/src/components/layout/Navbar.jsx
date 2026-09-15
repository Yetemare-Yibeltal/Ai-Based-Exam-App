import React, { useState, useEffect, useRef } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import useAuthStore from '../../store/useAuthStore';
import useUIStore from '../../store/useUIStore';
import useNotificationStore from '../../store/useNotificationStore';
import { getNavItems, getRoleIcon } from '../../utils/roleHelpers';
import { HOME_BY_ROLE } from '../../constants/routes';

const Navbar = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, role, isAuthenticated, logout } = useAuthStore();
  const { toggleSidebar, isSidebarOpen, theme, toggleTheme } = useUIStore();
  const { unreadCount, fetchUnreadCount } = useNotificationStore();
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const userMenuRef = useRef(null);

  useEffect(() => {
    if (isAuthenticated) fetchUnreadCount();
  }, [isAuthenticated, fetchUnreadCount]);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (userMenuRef.current && !userMenuRef.current.contains(e.target)) {
        setShowUserMenu(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  const homeRoute = role ? HOME_BY_ROLE[role] : '/';

  return (
    <nav className="fixed top-0 left-0 right-0 z-40 bg-white border-b border-gray-100 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Left side */}
          <div className="flex items-center gap-3">
            {isAuthenticated && (
              <button
                onClick={toggleSidebar}
                className="w-9 h-9 flex items-center justify-center rounded-lg text-gray-500 hover:bg-gray-100 transition-colors lg:hidden"
              >
                <span className="text-xl">{isSidebarOpen ? '✕' : '☰'}</span>
              </button>
            )}
            <Link to={homeRoute} className="flex items-center gap-2">
              <div className="w-9 h-9 bg-primary-900 rounded-xl flex items-center justify-center text-white font-bold text-lg">
                H
              </div>
              <span className="font-bold text-primary-900 text-xl hidden sm:block">HEROY</span>
            </Link>
          </div>

          {/* Center navigation for desktop */}
          {isAuthenticated && (
            <div className="hidden lg:flex items-center gap-1">
              {getNavItems(role).slice(0, 5).map((item) => (
                <Link
                  key={item.path}
                  to={item.path}
                  className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                    location.pathname === item.path
                      ? 'bg-primary-900 text-white'
                      : 'text-gray-600 hover:bg-gray-100 hover:text-primary-900'
                  }`}
                >
                  <span>{item.icon}</span>
                  <span>{item.label}</span>
                </Link>
              ))}
            </div>
          )}

          {/* Right side */}
          <div className="flex items-center gap-2">
            <button
              onClick={toggleTheme}
              className="w-9 h-9 flex items-center justify-center rounded-lg text-gray-500 hover:bg-gray-100 transition-colors"
            >
              {theme === 'dark' ? '☀️' : '🌙'}
            </button>

            {isAuthenticated ? (
              <>
                {/* Notifications */}
                <Link
                  to={role === 'admin' ? '/admin/notifications' : '#'}
                  className="relative w-9 h-9 flex items-center justify-center rounded-lg text-gray-500 hover:bg-gray-100 transition-colors"
                >
                  <span className="text-xl">🔔</span>
                  {unreadCount > 0 && (
                    <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-xs font-bold rounded-full flex items-center justify-center">
                      {unreadCount > 9 ? '9+' : unreadCount}
                    </span>
                  )}
                </Link>

                {/* User menu */}
                <div className="relative" ref={userMenuRef}>
                  <button
                    onClick={() => setShowUserMenu(!showUserMenu)}
                    className="flex items-center gap-2 px-2 py-1.5 rounded-xl hover:bg-gray-100 transition-colors"
                  >
                    {user?.avatar ? (
                      <img
                        src={user.avatar}
                        alt={user.name}
                        className="w-8 h-8 rounded-full object-cover border-2 border-primary-900"
                      />
                    ) : (
                      <div className="w-8 h-8 rounded-full bg-primary-900 flex items-center justify-center text-white font-bold text-sm">
                        {user?.name?.charAt(0)?.toUpperCase() || '?'}
                      </div>
                    )}
                    <div className="hidden md:flex flex-col items-start">
                      <span className="text-xs font-semibold text-gray-800 leading-tight">
                        {user?.name?.split(' ')[0]}
                      </span>
                      <span className="text-xs text-gray-400 leading-tight capitalize">{role}</span>
                    </div>
                    <span className="text-gray-400 text-xs">▾</span>
                  </button>

                  <AnimatePresence>
                    {showUserMenu && (
                      <motion.div
                        initial={{ opacity: 0, y: 8, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 8, scale: 0.95 }}
                        transition={{ duration: 0.15 }}
                        className="absolute right-0 mt-2 w-56 bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden z-50"
                      >
                        <div className="p-4 border-b border-gray-100 bg-gray-50">
                          <p className="font-semibold text-gray-800 text-sm">{user?.name}</p>
                          <p className="text-xs text-gray-500 truncate">{user?.email}</p>
                          <span className="inline-flex items-center gap-1 mt-1 text-xs font-medium text-primary-900 bg-primary-50 px-2 py-0.5 rounded-full">
                            {getRoleIcon(role)} {role}
                          </span>
                        </div>

                        <div className="py-2">
                          {role === 'student' && (
                            <Link
                              to="/student/profile"
                              onClick={() => setShowUserMenu(false)}
                              className="flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                            >
                              <span>👤</span> My Profile
                            </Link>
                          )}
                          {role === 'teacher' && (
                            <Link
                              to="/teacher/profile"
                              onClick={() => setShowUserMenu(false)}
                              className="flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                            >
                              <span>👤</span> My Profile
                            </Link>
                          )}
                          {role === 'admin' && (
                            <Link
                              to="/admin/settings"
                              onClick={() => setShowUserMenu(false)}
                              className="flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                            >
                              <span>⚙️</span> Settings
                            </Link>
                          )}
                        </div>

                        <div className="py-2 border-t border-gray-100">
                          <button
                            onClick={() => { handleLogout(); setShowUserMenu(false); }}
                            className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-red-600 hover:bg-red-50 transition-colors"
                          >
                            <span>🚪</span> Logout
                          </button>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </>
            ) : (
              <div className="flex items-center gap-2">
                <Link
                  to="/login"
                  className="px-4 py-2 text-sm font-semibold text-primary-900 hover:bg-primary-50 rounded-lg transition-colors"
                >
                  Login
                </Link>
                <Link
                  to="/register"
                  className="px-4 py-2 text-sm font-semibold bg-primary-900 text-white rounded-lg hover:bg-primary-800 transition-colors"
                >
                  Register
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;