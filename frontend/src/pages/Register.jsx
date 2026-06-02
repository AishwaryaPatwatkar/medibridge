import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { Activity, User, Mail, Lock, AlertCircle } from 'lucide-react';
import { toast } from 'react-toastify';

const Register = () => {
  const { register } = useAuth();
  const navigate = useNavigate();

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!name || !email || !password || !confirmPassword) {
      setError('Please fill in all fields.');
      return;
    }

    if (password.length < 6) {
      setError('Password must be at least 6 characters long.');
      return;
    }

    if (password !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }

    setLoading(true);
    setError('');

    try {
      await register(name, email, password);
      toast.success('Registration successful! You can now log in.');
      navigate('/login');
    } catch (err) {
      console.error(err);
      const detail = err.response?.data?.detail || 'Registration failed. The email may already be registered.';
      setError(detail);
      toast.error(detail);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex bg-medical-50">
      
      {/* Visual Column */}
      <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-tr from-medical-800 via-medical-700 to-primary-600 relative overflow-hidden items-center justify-center p-12 text-white">
        <div className="absolute top-[-20%] left-[-10%] w-96 h-96 bg-white/10 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[500px] h-[500px] bg-primary-500/20 rounded-full blur-3xl" />

        <div className="max-w-md z-10 text-center lg:text-left">
          <div className="w-12 h-12 rounded-2xl bg-white/15 flex items-center justify-center text-white mb-6 border border-white/20">
            <Activity className="w-7 h-7" />
          </div>
          <h1 className="text-4xl font-extrabold font-sans tracking-tight mb-4 leading-tight">
            Empowering Patients with Clarity
          </h1>
          <p className="text-medical-100 text-base leading-relaxed mb-8">
            MediBridge AI bridges the gap between doctors and patients by decoding complex medical files into secure, readable language.
          </p>

          <div className="space-y-4">
            {[
              "Highly secure JWT session protection",
              "Structured summaries in layman terms",
              "Abnormal ranges visual identification",
              "Full history search & deletion filters"
            ].map((feature, i) => (
              <div key={i} className="flex items-center space-x-3 text-sm font-medium">
                <div className="w-5 h-5 rounded-full bg-primary-400/20 flex items-center justify-center text-primary-300">
                  ✓
                </div>
                <span>{feature}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Form Column */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-6 sm:p-12 bg-white">
        <div className="w-full max-w-md">
          {/* Logo (Mobile display) */}
          <div className="flex items-center space-x-2 mb-8 justify-center lg:justify-start">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-medical-600 to-primary-500 flex items-center justify-center text-white shadow-md">
              <Activity className="w-5 h-5" />
            </div>
            <span className="font-bold text-xl tracking-tight text-medical-900 font-sans">
              MediBridge<span className="text-primary-600">AI</span>
            </span>
          </div>

          <h2 className="text-3xl font-bold text-medical-950 font-sans tracking-tight mb-2 text-center lg:text-left">
            Create your account
          </h2>
          <p className="text-medical-500 text-sm mb-6 text-center lg:text-left">
            Get started for free today. No credit card required.
          </p>

          {error && (
            <div className="mb-6 p-4 rounded-xl bg-red-50 border border-red-200 text-red-700 flex items-start space-x-2 text-sm">
              <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label htmlFor="name" className="block text-sm font-semibold text-medical-800 mb-1.5">
                Full Name
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-medical-400">
                  <User className="w-5 h-5" />
                </div>
                <input
                  id="name"
                  type="text"
                  required
                  placeholder="John Doe"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="block w-full pl-11 pr-4 py-3 rounded-xl border border-medical-200 focus:border-primary-500 focus:ring focus:ring-primary-100 bg-medical-50/30 text-medical-950 transition-all duration-200 outline-none placeholder:text-medical-400 text-sm"
                />
              </div>
            </div>

            <div>
              <label htmlFor="email" className="block text-sm font-semibold text-medical-800 mb-1.5">
                Email Address
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-medical-400">
                  <Mail className="w-5 h-5" />
                </div>
                <input
                  id="email"
                  type="email"
                  required
                  placeholder="name@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="block w-full pl-11 pr-4 py-3 rounded-xl border border-medical-200 focus:border-primary-500 focus:ring focus:ring-primary-100 bg-medical-50/30 text-medical-950 transition-all duration-200 outline-none placeholder:text-medical-400 text-sm"
                />
              </div>
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-semibold text-medical-800 mb-1.5">
                Password
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-medical-400">
                  <Lock className="w-5 h-5" />
                </div>
                <input
                  id="password"
                  type="password"
                  required
                  placeholder="Min. 6 characters"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="block w-full pl-11 pr-4 py-3 rounded-xl border border-medical-200 focus:border-primary-500 focus:ring focus:ring-primary-100 bg-medical-50/30 text-medical-950 transition-all duration-200 outline-none placeholder:text-medical-400 text-sm"
                />
              </div>
            </div>

            <div>
              <label htmlFor="confirmPassword" className="block text-sm font-semibold text-medical-800 mb-1.5">
                Confirm Password
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-medical-400">
                  <Lock className="w-5 h-5" />
                </div>
                <input
                  id="confirmPassword"
                  type="password"
                  required
                  placeholder="Repeat your password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="block w-full pl-11 pr-4 py-3 rounded-xl border border-medical-200 focus:border-primary-500 focus:ring focus:ring-primary-100 bg-medical-50/30 text-medical-950 transition-all duration-200 outline-none placeholder:text-medical-400 text-sm"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-medical-700 hover:bg-medical-800 text-white font-bold py-3 px-4 rounded-xl shadow-md transition-all duration-200 disabled:opacity-50 text-sm tracking-wide mt-3"
            >
              {loading ? 'Creating Account...' : 'Sign Up'}
            </button>
          </form>

          <p className="mt-6 text-center text-sm text-medical-600 font-medium">
            Already have an account?{' '}
            <Link to="/login" className="text-primary-600 hover:text-primary-700 font-bold transition-colors">
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Register;
