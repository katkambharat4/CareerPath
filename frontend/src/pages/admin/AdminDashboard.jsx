import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../../api/axiosInstance';
import {
  Users,
  Building2,
  Briefcase,
  Award,
  TrendingUp,
  Clock,
  CheckCircle,
  XCircle,
  ArrowRight,
  DollarSign,
} from 'lucide-react';

const AdminDashboard = () => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      const res = await api.get('/admin/dashboard/stats');
      setStats(res.data.data);
    } catch (err) {
      console.error('Failed to load dashboard metrics', err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="w-8 h-8 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  const statusMap = stats?.applicationsByStatus || {};
  const totalApps = stats?.totalApplications || 1;

  const appliedCount = statusMap['APPLIED'] || 0;
  const shortlistedCount = statusMap['SHORTLISTED'] || 0;
  const selectedCount = statusMap['SELECTED'] || 0;
  const rejectedCount = statusMap['REJECTED'] || 0;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="border-b border-slate-200 pb-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">
            Placement Cell Operations & Analytics
          </h1>
          <p className="text-sm text-slate-500">
            Real-time campus recruitment drives, student enrollment, and hiring progress
          </p>
        </div>
        <div className="flex gap-2">
          <Link
            to="/admin/jobs"
            className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-xs font-semibold shadow-sm transition-colors flex items-center gap-1.5"
          >
            <Briefcase className="w-4 h-4" /> Post New Job
          </Link>
          <Link
            to="/admin/companies"
            className="px-4 py-2 bg-slate-800 hover:bg-slate-900 text-white rounded-lg text-xs font-semibold shadow-sm transition-colors flex items-center gap-1.5"
          >
            <Building2 className="w-4 h-4" /> Add Company
          </Link>
        </div>
      </div>

      {/* KPI Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-xl border border-slate-200/80 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center shrink-0">
            <Users className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Registered Students</p>
            <h3 className="text-2xl font-bold text-slate-900">{stats?.totalStudents || 0}</h3>
            <p className="text-[11px] text-emerald-600 font-medium mt-0.5">{stats?.activeStudents || 0} active</p>
          </div>
        </div>

        <div className="bg-white p-5 rounded-xl border border-slate-200/80 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center shrink-0">
            <Building2 className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Corporate Partners</p>
            <h3 className="text-2xl font-bold text-slate-900">{stats?.totalCompanies || 0}</h3>
            <p className="text-[11px] text-purple-600 font-medium mt-0.5">{stats?.openJobs || 0} active drives</p>
          </div>
        </div>

        <div className="bg-white p-5 rounded-xl border border-slate-200/80 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
            <Award className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Placed Students</p>
            <h3 className="text-2xl font-bold text-slate-900">{stats?.totalPlacements || 0}</h3>
            <p className="text-[11px] text-emerald-600 font-semibold mt-0.5">
              {stats?.placementRatePercentage}% placement rate
            </p>
          </div>
        </div>

        <div className="bg-white p-5 rounded-xl border border-slate-200/80 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center shrink-0">
            <TrendingUp className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Highest Package</p>
            <h3 className="text-2xl font-bold text-slate-900">{stats?.highestPackageLpa || 0} LPA</h3>
            <p className="text-[11px] text-slate-500 font-medium mt-0.5">Avg: {stats?.averagePackageLpa || 0} LPA</p>
          </div>
        </div>
      </div>

      {/* Visual Analytics / Breakdown */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Application Status Funnel */}
        <div className="bg-white rounded-xl border border-slate-200/80 shadow-sm p-6">
          <div className="flex items-center justify-between pb-4 border-b border-slate-100 mb-5">
            <h2 className="text-base font-bold text-slate-900">Application Status Distribution</h2>
            <Link to="/admin/applications" className="text-xs font-semibold text-indigo-600 hover:text-indigo-700 flex items-center gap-1">
              Review Applications <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="space-y-4">
            {/* Applied */}
            <div>
              <div className="flex justify-between text-xs font-semibold mb-1">
                <span className="text-slate-600 flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-slate-400" />
                  APPLIED (Under Review)
                </span>
                <span className="text-slate-900">{appliedCount}</span>
              </div>
              <div className="w-full bg-slate-100 rounded-full h-2.5 overflow-hidden">
                <div
                  className="bg-slate-400 h-2.5 rounded-full transition-all duration-500"
                  style={{ width: `${Math.round((appliedCount / totalApps) * 100)}%` }}
                />
              </div>
            </div>

            {/* Shortlisted */}
            <div>
              <div className="flex justify-between text-xs font-semibold mb-1">
                <span className="text-blue-700 flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-blue-500" />
                  SHORTLISTED (In Interviews)
                </span>
                <span className="text-slate-900">{shortlistedCount}</span>
              </div>
              <div className="w-full bg-slate-100 rounded-full h-2.5 overflow-hidden">
                <div
                  className="bg-blue-500 h-2.5 rounded-full transition-all duration-500"
                  style={{ width: `${Math.round((shortlistedCount / totalApps) * 100)}%` }}
                />
              </div>
            </div>

            {/* Selected */}
            <div>
              <div className="flex justify-between text-xs font-semibold mb-1">
                <span className="text-emerald-700 flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
                  SELECTED (Offers Extended)
                </span>
                <span className="text-slate-900">{selectedCount}</span>
              </div>
              <div className="w-full bg-slate-100 rounded-full h-2.5 overflow-hidden">
                <div
                  className="bg-emerald-500 h-2.5 rounded-full transition-all duration-500"
                  style={{ width: `${Math.round((selectedCount / totalApps) * 100)}%` }}
                />
              </div>
            </div>

            {/* Rejected */}
            <div>
              <div className="flex justify-between text-xs font-semibold mb-1">
                <span className="text-rose-700 flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-rose-500" />
                  REJECTED
                </span>
                <span className="text-slate-900">{rejectedCount}</span>
              </div>
              <div className="w-full bg-slate-100 rounded-full h-2.5 overflow-hidden">
                <div
                  className="bg-rose-500 h-2.5 rounded-full transition-all duration-500"
                  style={{ width: `${Math.round((rejectedCount / totalApps) * 100)}%` }}
                />
              </div>
            </div>
          </div>
        </div>

        {/* Quick Management Shortcuts */}
        <div className="bg-white rounded-xl border border-slate-200/80 shadow-sm p-6">
          <h2 className="text-base font-bold text-slate-900 pb-4 border-b border-slate-100 mb-4">
            Management Workflows
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <Link
              to="/admin/students"
              className="p-4 rounded-xl border border-slate-200 hover:border-indigo-400 hover:bg-indigo-50/30 transition-all flex flex-col justify-between"
            >
              <div>
                <Users className="w-5 h-5 text-indigo-600 mb-2" />
                <h4 className="font-semibold text-slate-900 text-sm">Student Directory</h4>
                <p className="text-xs text-slate-500 mt-1">
                  View academic records, CGPAs, and activate/deactivate candidates.
                </p>
              </div>
              <span className="text-xs font-semibold text-indigo-600 mt-3 inline-flex items-center gap-1">
                Manage Students →
              </span>
            </Link>

            <Link
              to="/admin/companies"
              className="p-4 rounded-xl border border-slate-200 hover:border-purple-400 hover:bg-purple-50/30 transition-all flex flex-col justify-between"
            >
              <div>
                <Building2 className="w-5 h-5 text-purple-600 mb-2" />
                <h4 className="font-semibold text-slate-900 text-sm">Company Partners</h4>
                <p className="text-xs text-slate-500 mt-1">
                  Maintain recruiter contacts, websites, and hiring directories.
                </p>
              </div>
              <span className="text-xs font-semibold text-purple-600 mt-3 inline-flex items-center gap-1">
                Manage Companies →
              </span>
            </Link>

            <Link
              to="/admin/jobs"
              className="p-4 rounded-xl border border-slate-200 hover:border-blue-400 hover:bg-blue-50/30 transition-all flex flex-col justify-between"
            >
              <div>
                <Briefcase className="w-5 h-5 text-blue-600 mb-2" />
                <h4 className="font-semibold text-slate-900 text-sm">Recruitment Drives</h4>
                <p className="text-xs text-slate-500 mt-1">
                  Configure CGPA cut-offs, required skills, and deadlines.
                </p>
              </div>
              <span className="text-xs font-semibold text-blue-600 mt-3 inline-flex items-center gap-1">
                Manage Jobs →
              </span>
            </Link>

            <Link
              to="/admin/placements"
              className="p-4 rounded-xl border border-slate-200 hover:border-emerald-400 hover:bg-emerald-50/30 transition-all flex flex-col justify-between"
            >
              <div>
                <Award className="w-5 h-5 text-emerald-600 mb-2" />
                <h4 className="font-semibold text-slate-900 text-sm">Placements Registry</h4>
                <p className="text-xs text-slate-500 mt-1">
                  Log final accepted offers (one final placement per student rule).
                </p>
              </div>
              <span className="text-xs font-semibold text-emerald-600 mt-3 inline-flex items-center gap-1">
                Record Placements →
              </span>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
