import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

export const RegisterPage = () => {
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    confirmPassword: ''
  });
  const [loading, setLoading] = useState(false);
  const { register, error, clearError } = useAuth();
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
    if (error) clearError();
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (formData.password !== formData.confirmPassword) {
      return;
    }
    
    setLoading(true);

    try {
      await register(formData.username, formData.email, formData.password);
      navigate('/dashboard');
    } catch (error) {
      console.error('Registration failed:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-navy-900 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div>
          <div className="flex justify-center">
            <div className="w-12 h-12 bg-teal rounded-lg flex items-center justify-center">
              <span className="text-navy-900 font-bold text-xl">Q</span>
            </div>
          </div>
          <h2 className="section-heading text-white">
            Create your Questly account
          </h2>
          <p className="mt-2 text-center text-sm text-secondary">
            Or{' '}
            <Link to="/login" className="font-medium text-teal hover:text-teal-dark">
              sign in to your existing account
            </Link>
          </p>
        </div>
        
        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          {error && (
            <div className="bg-navy-800 border border-coral border-opacity-30 text-coral px-4 py-3 rounded-lg">
              {error}
            </div>
          )}
          
          <div className="space-y-4">
            <div>
              <label htmlFor="username" className="block text-sm font-medium text-white font-body">
                Username
              </label>
              <input
                id="username"
                name="username"
                type="text"
                required
                className="input-field mt-1"
                placeholder="Choose a username"
                value={formData.username}
                onChange={handleChange}
                minLength={3}
                maxLength={30}
              />
            </div>
            
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-white font-body">
                Email address
              </label>
              <input
                id="email"
                name="email"
                type="email"
                autoComplete="email"
                required
                className="input-field mt-1"
                placeholder="Enter your email"
                value={formData.email}
                onChange={handleChange}
              />
            </div>
            
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-white font-body">
                Password
              </label>
              <input
                id="password"
                name="password"
                type="password"
                autoComplete="new-password"
                required
                className="input-field mt-1"
                placeholder="Create a password"
                value={formData.password}
                onChange={handleChange}
                minLength={6}
              />
            </div>
            
            <div>
              <label htmlFor="confirmPassword" className="block text-sm font-medium text-white font-body">
                Confirm Password
              </label>
              <input
                id="confirmPassword"
                name="confirmPassword"
                type="password"
                autoComplete="new-password"
                required
                className="input-field mt-1"
                placeholder="Confirm your password"
                value={formData.confirmPassword}
                onChange={handleChange}
                minLength={6}
              />
              {formData.confirmPassword && formData.password !== formData.confirmPassword && (
                <p className="mt-1 text-sm text-coral">Passwords do not match</p>
              )}
            </div>
          </div>

          <div>
            <button
              type="submit"
              disabled={loading || formData.password !== formData.confirmPassword}
              className="group relative w-full btn-primary"
            >
              {loading ? (
                <div className="flex justify-center">
                  <div className="loading-spinner h-5 w-5"></div>
                </div>
              ) : (
                'Create Account'
              )}
            </button>
          </div>

          <div className="text-center">
            <p className="text-sm text-secondary">
              Want to try it out first?{' '}
              <Link to="/" className="font-medium text-teal hover:text-teal-dark">
                Continue as a guest
              </Link>
            </p>
          </div>
        </form>
      </div>
    </div>
  );
};
