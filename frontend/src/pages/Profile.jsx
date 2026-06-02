import React, { useEffect, useState } from 'react';
import authService from '../services/authService';
import Loader from '../components/Loader';
import { formatDate } from '../utils/formatters';
import { User, Mail, Calendar, BarChart2, ShieldAlert, Award, FileText, CheckCircle } from 'lucide-react';
import { toast } from 'react-toastify';

const Profile = () => {
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const data = await authService.getProfile();
        setProfile(data);
      } catch (err) {
        console.error(err);
        toast.error('Failed to load profile information.');
      } finally {
        setLoading(false);
      }
    };
    fetchProfile();
  }, []);

  if (loading) {
    return (
      <div className="h-96 flex items-center justify-center">
        <Loader size="lg" text="Retrieving profile insights..." />
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="max-w-xl mx-auto text-center py-12">
        <ShieldAlert className="w-16 h-16 text-red-500 mx-auto mb-4" />
        <h2 className="text-2xl font-bold text-medical-950 font-sans">Profile data unavailable</h2>
        <p className="text-sm text-medical-500 mt-2">Could not sync account metadata. Please verify server connection.</p>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto space-y-8 animate-fadeIn">
      <div>
        <h1 className="text-3xl font-extrabold text-medical-950 tracking-tight font-sans">
          My Profile
        </h1>
        <p className="text-medical-500 text-sm mt-1">
          Review your account information and processing records.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        
        {/* User Card */}
        <div className="bg-white rounded-3xl border border-medical-200/60 p-6 md:col-span-2 shadow-premium flex flex-col justify-between">
          <div className="space-y-6">
            <div className="flex items-center space-x-4 border-b border-medical-100 pb-5">
              <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-medical-600 to-primary-500 flex items-center justify-center text-white font-extrabold text-xl shadow">
                {profile.name ? profile.name.charAt(0).toUpperCase() : 'U'}
              </div>
              <div>
                <h3 className="text-xl font-extrabold text-medical-950 font-sans">{profile.name}</h3>
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-primary-50 text-primary-700 border border-primary-100/50 mt-1">
                  Active Account
                </span>
              </div>
            </div>

            <div className="space-y-4">
              <div className="flex items-center space-x-3 text-medical-700">
                <Mail className="w-5 h-5 text-medical-400" />
                <div>
                  <p className="text-[10px] uppercase font-bold text-medical-400">Email Address</p>
                  <p className="text-sm font-semibold">{profile.email}</p>
                </div>
              </div>

              <div className="flex items-center space-x-3 text-medical-700">
                <Calendar className="w-5 h-5 text-medical-400" />
                <div>
                  <p className="text-[10px] uppercase font-bold text-medical-400">Member Since</p>
                  <p className="text-sm font-semibold">{formatDate(profile.created_at)}</p>
                </div>
              </div>
            </div>
          </div>

          <div className="mt-8 pt-4 border-t border-medical-100 text-xs text-medical-400 flex items-center">
            <ShieldAlert className="w-4 h-4 mr-1.5 text-medical-300" />
            Your records are stored securely in PostgreSQL with hashed passwords.
          </div>
        </div>

        {/* Aggregate Stats Card */}
        <div className="bg-gradient-to-br from-medical-800 to-medical-950 text-white rounded-3xl p-6 md:col-span-1 shadow-premium flex flex-col justify-between relative overflow-hidden">
          {/* Subtle backgrounds */}
          <div className="absolute right-[-20%] bottom-[-20%] w-40 h-40 bg-primary-500/10 rounded-full blur-2xl" />
          
          <div className="space-y-6 z-10">
            <h3 className="font-extrabold text-sm uppercase tracking-wider text-medical-200 flex items-center">
              <Award className="w-5 h-5 mr-2 text-primary-400 animate-pulse" />
              Activity Record
            </h3>
            
            <div className="space-y-4">
              <div className="flex items-center justify-between border-b border-white/10 pb-3">
                <div className="flex items-center space-x-2">
                  <FileText className="w-4 h-4 text-medical-300" />
                  <span className="text-xs font-semibold">Uploaded Files</span>
                </div>
                <span className="text-lg font-black">{profile.total_reports}</span>
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <CheckCircle className="w-4 h-4 text-emerald-400" />
                  <span className="text-xs font-semibold">AI Explanations</span>
                </div>
                <span className="text-lg font-black text-primary-300">{profile.total_analyzed}</span>
              </div>
            </div>
          </div>

          <div className="mt-8 p-3 rounded-2xl bg-white/5 border border-white/10 text-[10px] text-medical-200 leading-relaxed z-10">
            Keep uploads clear for better character recognition. Scan documents vertically.
          </div>
        </div>

      </div>
    </div>
  );
};

export default Profile;
