import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { Activity, LayoutDashboard, UploadCloud, User, LogOut, Menu, X } from 'lucide-react';

const Navbar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [isOpen, setIsOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const isActive = (path) => location.pathname === path;

  const navLinks = [
    { name: 'Dashboard', path: '/dashboard', icon: LayoutDashboard },
    { name: 'Upload Report', path: '/upload', icon: UploadCloud },
    { name: 'Profile', path: '/profile', icon: User },
  ];

  if (!user) return null;

  return (
    <nav className="sticky top-0 z-50 bg-white border-b border-medical-100 shadow-sm backdrop-blur-md bg-white/95">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          {/* Logo Section */}
          <div className="flex items-center">
            <Link to="/dashboard" className="flex items-center space-x-2 flex-shrink-0">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-medical-600 to-primary-500 flex items-center justify-center text-white shadow-md">
                <Activity className="w-6 h-6 animate-pulse" />
              </div>
              <span className="font-bold text-xl tracking-tight text-medical-900 font-sans">
                MediBridge<span className="text-primary-600">AI</span>
              </span>
            </Link>
          </div>

          {/* Desktop Nav Items */}
          <div className="hidden md:flex items-center space-x-4">
            {navLinks.map((link) => {
              const Icon = link.icon;
              const active = isActive(link.path);
              return (
                <Link
                  key={link.path}
                  to={link.path}
                  className={`flex items-center space-x-2 px-4 py-2 rounded-xl text-sm font-medium transition-all duration-200 ${
                    active
                      ? 'bg-medical-100 text-medical-800 shadow-sm border border-medical-200/50'
                      : 'text-medical-600 hover:bg-medical-50 hover:text-medical-950'
                  }`}
                >
                  <Icon className={`w-4 h-4 ${active ? 'text-primary-600' : ''}`} />
                  <span>{link.name}</span>
                </Link>
              );
            })}

            <div className="h-6 w-px bg-medical-200 mx-2" />

            <div className="flex items-center space-x-3">
              <span className="text-sm font-semibold text-medical-700 bg-medical-50 border border-medical-200/40 px-3 py-1.5 rounded-full">
                Hi, {user.name.split(' ')[0]}
              </span>
              <button
                onClick={handleLogout}
                className="flex items-center space-x-1.5 px-3 py-2 rounded-xl text-sm font-medium text-red-600 hover:bg-red-50 transition-all duration-200 border border-transparent hover:border-red-100"
              >
                <LogOut className="w-4 h-4" />
                <span>Logout</span>
              </button>
            </div>
          </div>

          {/* Mobile menu button */}
          <div className="flex items-center md:hidden">
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="inline-flex items-center justify-center p-2 rounded-lg text-medical-500 hover:text-medical-900 hover:bg-medical-100 focus:outline-none"
            >
              {isOpen ? <X className="h-6 h-6" /> : <Menu className="h-6 w-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu Panel */}
      {isOpen && (
        <div className="md:hidden border-t border-medical-100 bg-white">
          <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3">
            {navLinks.map((link) => {
              const Icon = link.icon;
              const active = isActive(link.path);
              return (
                <Link
                  key={link.path}
                  to={link.path}
                  onClick={() => setIsOpen(false)}
                  className={`flex items-center space-x-3 px-4 py-3 rounded-xl text-base font-medium transition-colors ${
                    active
                      ? 'bg-medical-100 text-medical-800'
                      : 'text-medical-600 hover:bg-medical-50 hover:text-medical-950'
                  }`}
                >
                  <Icon className="w-5 h-5" />
                  <span>{link.name}</span>
                </Link>
              );
            })}
            
            <div className="border-t border-medical-100 my-2 pt-2 px-4 flex items-center justify-between">
              <span className="text-sm font-semibold text-medical-700">
                Logged in as: {user.name}
              </span>
            </div>

            <button
              onClick={() => {
                setIsOpen(false);
                handleLogout();
              }}
              className="w-full flex items-center space-x-3 px-4 py-3 rounded-xl text-base font-medium text-red-600 hover:bg-red-50 transition-colors"
            >
              <LogOut className="w-5 h-5" />
              <span>Logout</span>
            </button>
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;
