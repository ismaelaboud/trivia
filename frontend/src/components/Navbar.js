import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

export const Navbar = () => {
  const { isAuthenticated, user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/');
    setMobileMenuOpen(false);
  };

  const isAuthPage = location.pathname === '/login' || location.pathname === '/register';

  const closeMobileMenu = () => {
    setMobileMenuOpen(false);
  };

  return (
    <>
      <nav className="bg-navy-800 border-b border-teal border-opacity-20 fixed top-0 left-0 right-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-14 md:h-16">
            {/* Logo */}
            <Link to="/" className="flex items-center space-x-2" onClick={closeMobileMenu}>
              <img 
                src="/logo.png" 
                alt="Questly" 
                className="w-8 h-8 rounded-lg"
              />
              <span className="text-base md:text-xl font-bold text-white font-heading">Questly</span>
            </Link>

            {/* Desktop Navigation Links */}
            <div className="hidden md:flex items-center space-x-8">
              <Link to="/" className="nav-link">
                Home
              </Link>
              <Link to="/search" className="nav-link">
                Discover
              </Link>
              {isAuthenticated && (
                <Link to="/dashboard" className="nav-link">
                  Dashboard
                </Link>
              )}
            </div>

            {/* Desktop User Actions */}
            <div className="hidden md:flex items-center space-x-4">
              {isAuthenticated ? (
                <>
                  <div className="flex items-center space-x-3">
                    <div className="text-right">
                      <p className="text-sm font-medium text-white">{user.username}</p>
                      <p className="text-xs text-secondary">{user.totalScore} points</p>
                    </div>
                    <div className="w-8 h-8 bg-navy-700 rounded-full flex items-center justify-center">
                      <span className="text-secondary text-sm font-medium">
                        {user.username.charAt(0).toUpperCase()}
                      </span>
                    </div>
                  </div>
                  <button
                    onClick={handleLogout}
                    className="btn-outline text-sm"
                  >
                    Logout
                  </button>
                </>
              ) : (
                !isAuthPage && (
                  <>
                    <Link to="/login" className="btn-outline text-sm">
                      Login
                    </Link>
                    <Link to="/register" className="btn-primary text-sm">
                      Sign Up
                    </Link>
                  </>
                )
              )}
            </div>

            {/* Mobile menu button */}
            <div className="md:hidden flex items-center space-x-3">
              {isAuthenticated && (
                <div className="w-8 h-8 bg-teal rounded-full flex items-center justify-center">
                  <span className="text-navy-900 text-sm font-medium font-heading">
                    {user.username.charAt(0).toUpperCase()}
                  </span>
                </div>
              )}
              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="text-white p-1"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  {mobileMenuOpen ? (
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  ) : (
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                  )}
                </svg>
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Mobile menu overlay */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 z-40 md:hidden">
          {/* Backdrop */}
          <div 
            className="fixed inset-0 bg-black bg-opacity-50"
            onClick={closeMobileMenu}
          />
          
          {/* Mobile menu drawer */}
          <div className="fixed top-14 left-0 right-0 bg-navy-800 border-b border-teal border-opacity-15">
            <div className="px-5 py-4">
              {isAuthenticated && (
                <>
                  {/* User info row */}
                  <div className="flex items-center space-x-3 pb-4 border-b border-teal border-opacity-15">
                    <div className="w-8 h-8 bg-teal rounded-full flex items-center justify-center">
                      <span className="text-navy-900 text-sm font-medium font-heading">
                        {user.username.charAt(0).toUpperCase()}
                      </span>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-white">{user.username}</p>
                      <p className="text-xs text-yellow font-heading">{user.totalScore} points</p>
                    </div>
                  </div>
                </>
              )}

              {/* Navigation links */}
              <div className="py-2">
                <Link
                  to="/"
                  className="block px-5 py-4 text-base text-gray-300 hover:text-teal transition-colors duration-200 font-sans"
                  onClick={closeMobileMenu}
                >
                  Home
                </Link>
                <Link
                  to="/search"
                  className="block px-5 py-4 text-base text-gray-300 hover:text-teal transition-colors duration-200 font-sans"
                  onClick={closeMobileMenu}
                >
                  Discover
                </Link>
                {isAuthenticated && (
                  <Link
                    to="/dashboard"
                    className="block px-5 py-4 text-base text-gray-300 hover:text-teal transition-colors duration-200 font-sans"
                    onClick={closeMobileMenu}
                  >
                    Dashboard
                  </Link>
                )}
              </div>

              {isAuthenticated ? (
                <div className="pt-2 border-t border-teal border-opacity-15">
                  <button
                    onClick={handleLogout}
                    className="w-full px-5 py-4 text-base text-teal border border-teal rounded-lg transition-colors duration-200 font-sans hover:bg-teal hover:text-navy-900"
                  >
                    Logout
                  </button>
                </div>
              ) : (
                !isAuthPage && (
                  <div className="pt-2 border-t border-teal border-opacity-15 space-y-2">
                    <Link
                      to="/login"
                      className="block w-full px-5 py-4 text-base text-center text-teal border border-teal rounded-lg transition-colors duration-200 font-sans hover:bg-teal hover:text-navy-900"
                      onClick={closeMobileMenu}
                    >
                      Login
                    </Link>
                    <Link
                      to="/register"
                      className="block w-full px-5 py-4 text-base text-center text-navy-900 bg-teal rounded-lg transition-colors duration-200 font-sans hover:bg-teal-dark"
                      onClick={closeMobileMenu}
                    >
                      Sign Up
                    </Link>
                  </div>
                )
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
};
