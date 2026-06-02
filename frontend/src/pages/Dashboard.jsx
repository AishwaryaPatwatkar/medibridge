import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import reportService from '../services/reportService';
import authService from '../services/authService';
import ReportCard from '../components/ReportCard';
import Loader from '../components/Loader';
import { UploadCloud, Search, RefreshCw, BarChart2, CheckCircle, FileText, ClipboardList } from 'lucide-react';
import { toast } from 'react-toastify';

const Dashboard = () => {
  const { user } = useAuth();
  const [reports, setReports] = useState([]);
  const [stats, setStats] = useState({ total_reports: 0, total_analyzed: 0 });
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [triggerSearch, setTriggerSearch] = useState(0);

  const fetchData = async () => {
    setLoading(true);
    try {
      // Fetch both reports list and profile stats in parallel
      const [reportsData, profileData] = await Promise.all([
        reportService.getReports(searchQuery),
        authService.getProfile()
      ]);
      setReports(reportsData);
      setStats({
        total_reports: profileData.total_reports,
        total_analyzed: profileData.total_analyzed
      });
    } catch (err) {
      console.error(err);
      toast.error('Failed to fetch dashboard data. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const fetchFilteredReports = async (query) => {
    try {
      const reportsData = await reportService.getReports(query);
      setReports(reportsData);
    } catch (err) {
      console.error(err);
    }
  };

  // Real-time search experience with 300ms debounce
  useEffect(() => {
    const delayDebounceFn = setTimeout(() => {
      if (!loading) {
        fetchFilteredReports(searchQuery);
      }
    }, 300);

    return () => clearTimeout(delayDebounceFn);
  }, [searchQuery]);

  // Initial fetch on mount or manual sync trigger
  useEffect(() => {
    fetchData();
  }, [triggerSearch]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    fetchFilteredReports(searchQuery);
  };

  const handleClearSearch = () => {
    setSearchQuery('');
  };

  const handleDeleteReport = async (reportId) => {
    try {
      await reportService.deleteReport(reportId);
      toast.success('Report successfully deleted.');
      
      // Update local state lists immediately
      setReports(prev => prev.filter(r => r.id !== reportId));
      setStats(prev => ({
        total_reports: Math.max(0, prev.total_reports - 1),
        // If the report was analyzed, decrement analyzed count
        total_analyzed: reports.find(r => r.id === reportId)?.has_analysis 
          ? Math.max(0, prev.total_analyzed - 1) 
          : prev.total_analyzed
      }));
    } catch (err) {
      console.error(err);
      toast.error('Failed to delete the report. Please try again.');
      throw err;
    }
  };

  // Compute pending analysis counter
  const pendingAnalysis = Math.max(0, stats.total_reports - stats.total_analyzed);

  return (
    <div className="space-y-8 animate-fadeIn">
      
      {/* Header Panel */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between space-y-4 md:space-y-0">
        <div>
          <h1 className="text-3xl font-extrabold text-medical-950 tracking-tight">
            Medical Dashboard
          </h1>
          <p className="text-medical-500 text-sm mt-1">
            Welcome back, <span className="font-semibold text-medical-800">{user?.name}</span>. Manage and review your medical files.
          </p>
        </div>
        <div>
          <Link
            to="/upload"
            className="inline-flex items-center space-x-2 bg-gradient-to-r from-medical-700 to-primary-600 hover:from-medical-800 hover:to-primary-700 text-white px-5 py-3 rounded-2xl font-bold shadow-md hover:shadow-lg transition-all duration-200 text-sm"
          >
            <UploadCloud className="w-5 h-5" />
            <span>Upload New Report</span>
          </Link>
        </div>
      </div>

      {/* Stats Cards Row */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
        <div className="bg-white rounded-2xl border border-medical-200/60 p-6 flex items-center space-x-4 shadow-premium">
          <div className="w-12 h-12 rounded-xl bg-medical-50 text-medical-600 border border-medical-100 flex items-center justify-center">
            <FileText className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs font-semibold text-medical-400 uppercase tracking-wider">Total Reports</p>
            <h3 className="text-2xl font-extrabold text-medical-950 mt-0.5">{stats.total_reports}</h3>
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-medical-200/60 p-6 flex items-center space-x-4 shadow-premium">
          <div className="w-12 h-12 rounded-xl bg-emerald-50 text-emerald-600 border border-emerald-100 flex items-center justify-center">
            <CheckCircle className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs font-semibold text-medical-400 uppercase tracking-wider">AI Analyzed</p>
            <h3 className="text-2xl font-extrabold text-medical-950 mt-0.5">{stats.total_analyzed}</h3>
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-medical-200/60 p-6 flex items-center space-x-4 shadow-premium">
          <div className="w-12 h-12 rounded-xl bg-amber-50 text-amber-600 border border-amber-100 flex items-center justify-center">
            <ClipboardList className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs font-semibold text-medical-400 uppercase tracking-wider">Pending Analysis</p>
            <h3 className="text-2xl font-extrabold text-medical-950 mt-0.5">{pendingAnalysis}</h3>
          </div>
        </div>
      </div>

      {/* Query Filters Panel */}
      <div className="bg-white rounded-2xl border border-medical-200/60 p-4 shadow-premium flex flex-col md:flex-row md:items-center justify-between gap-4">
        <form onSubmit={handleSearchSubmit} className="relative flex-grow max-w-lg">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-medical-400">
            <Search className="w-4 h-4" />
          </div>
          <input
            type="text"
            placeholder="Search by filename or content..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="block w-full pl-9 pr-24 py-2.5 rounded-xl border border-medical-200 bg-medical-50/20 text-medical-950 focus:border-primary-500 focus:ring focus:ring-primary-100 transition-all outline-none text-sm placeholder:text-medical-400"
          />
          <div className="absolute right-1 top-1 flex space-x-1">
            {searchQuery && (
              <button
                type="button"
                onClick={handleClearSearch}
                className="px-2 py-1.5 rounded-lg text-xs font-semibold text-medical-500 hover:bg-medical-100"
              >
                Clear
              </button>
            )}
            <button
              type="submit"
              className="bg-medical-700 hover:bg-medical-800 text-white px-3 py-1.5 rounded-lg text-xs font-bold transition-all shadow-sm"
            >
              Search
            </button>
          </div>
        </form>
        
        <div className="flex items-center justify-end">
          <button
            onClick={() => setTriggerSearch(prev => prev + 1)}
            disabled={loading}
            className="inline-flex items-center space-x-1.5 border border-medical-200 hover:bg-medical-50 text-medical-700 px-4 py-2.5 rounded-xl text-sm font-semibold transition-all shadow-sm bg-white"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            <span>Sync</span>
          </button>
        </div>
      </div>

      {/* Reports Grid Catalog */}
      {loading ? (
        <div className="h-64 flex items-center justify-center">
          <Loader size="md" text="Loading your medical dashboard..." />
        </div>
      ) : reports.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {reports.map((report) => (
            <ReportCard
              key={report.id}
              report={report}
              onDelete={handleDeleteReport}
            />
          ))}
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-dashed border-medical-300 py-16 px-4 text-center max-w-xl mx-auto shadow-premium">
          <div className="w-16 h-16 rounded-2xl bg-medical-50 text-primary-500 border border-medical-100/50 flex items-center justify-center mx-auto mb-4">
            <UploadCloud className="w-8 h-8" />
          </div>
          <h3 className="font-bold text-lg text-medical-950 font-sans">
            No medical reports found
          </h3>
          <p className="text-sm text-medical-500 max-w-sm mx-auto mt-2">
            {searchQuery 
              ? `We couldn't find any reports matching "${searchQuery}". Try editing your keyword search.` 
              : "Let's upload your first lab result or medical PDF to simplify terms and highlight concerns."
            }
          </p>
          <div className="mt-6">
            {searchQuery ? (
              <button
                onClick={handleClearSearch}
                className="bg-medical-100 hover:bg-medical-200 text-medical-800 px-4 py-2 rounded-xl text-sm font-bold transition-all"
              >
                Clear Search Filter
              </button>
            ) : (
              <Link
                to="/upload"
                className="bg-gradient-to-r from-medical-700 to-primary-600 hover:from-medical-800 hover:to-primary-700 text-white px-5 py-2.5 rounded-xl font-bold shadow-md transition-all text-sm"
              >
                Upload Report
              </Link>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default Dashboard;
