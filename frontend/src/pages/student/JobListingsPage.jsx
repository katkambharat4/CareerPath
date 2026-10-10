import React, { useState, useEffect } from 'react';
import api from '../../api/axiosInstance';
import { useToast } from '../../context/ToastContext';
import {
  Briefcase,
  Search,
  Building2,
  MapPin,
  Calendar,
  CheckCircle,
  AlertTriangle,
  Send,
  DollarSign,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';

const JobListingsPage = () => {
  const [jobs, setJobs] = useState([]);
  const [pageData, setPageData] = useState({ pageNo: 0, totalPages: 1, totalElements: 0 });
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState('');
  const [location, setLocation] = useState('');
  const [minPackage, setMinPackage] = useState('');
  const [applyingJobId, setApplyingJobId] = useState(null);
  const { addToast } = useToast();

  useEffect(() => {
    fetchJobs(0);
  }, []);

  const fetchJobs = async (page = 0) => {
    setLoading(true);
    try {
      const params = {
        page,
        size: 9,
      };
      if (query.trim()) params.query = query.trim();
      if (location.trim()) params.location = location.trim();
      if (minPackage) params.minPackage = minPackage;

      const res = await api.get('/student/jobs', { params });
      const data = res.data.data;
      setJobs(data.content || []);
      setPageData({
        pageNo: data.pageNo,
        totalPages: data.totalPages,
        totalElements: data.totalElements,
      });
    } catch (err) {
      addToast('Failed to load jobs', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e) => {
    e.preventDefault();
    fetchJobs(0);
  };

  const handleApply = async (job) => {
    if (!job.eligible) {
      addToast(`Cannot apply: ${job.eligibilityReason}`, 'error');
      return;
    }

    setApplyingJobId(job.id);
    try {
      await api.post(`/student/jobs/${job.id}/apply`);
      addToast(`Successfully applied to ${job.title} at ${job.companyName}!`, 'success');
      // Update local card state
      setJobs((prev) =>
        prev.map((j) => (j.id === job.id ? { ...j, alreadyApplied: true } : j))
      );
    } catch (err) {
      addToast(err.response?.data?.message || 'Error submitting application', 'error');
    } finally {
      setApplyingJobId(null);
    }
  };

  return (
    <div className="space-y-6">
      <div className="border-b border-slate-200 pb-4">
        <h1 className="text-2xl font-bold text-slate-900">Campus Job Openings</h1>
        <p className="text-sm text-slate-500">
          Explore recruitment drives, verify your CGPA eligibility criteria, and submit applications
        </p>
      </div>

      {/* Filter & Search Bar */}
      <form onSubmit={handleSearch} className="bg-white p-4 rounded-xl border border-slate-200/80 shadow-sm flex flex-col sm:flex-row gap-3">
        <div className="flex-1 relative">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
            <Search className="w-4 h-4" />
          </div>
          <input
            type="text"
            placeholder="Search by role, company, or required skills..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="w-full pl-9 pr-3 py-2 border border-slate-300 rounded-lg text-sm text-slate-900 focus:ring-2 focus:ring-indigo-600 focus:border-indigo-600"
          />
        </div>

        <div className="sm:w-44 relative">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
            <MapPin className="w-4 h-4" />
          </div>
          <input
            type="text"
            placeholder="Location..."
            value={location}
            onChange={(e) => setLocation(e.target.value)}
            className="w-full pl-9 pr-3 py-2 border border-slate-300 rounded-lg text-sm text-slate-900 focus:ring-2 focus:ring-indigo-600 focus:border-indigo-600"
          />
        </div>

        <div className="sm:w-36">
          <input
            type="number"
            step="0.5"
            placeholder="Min LPA..."
            value={minPackage}
            onChange={(e) => setMinPackage(e.target.value)}
            className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm text-slate-900 focus:ring-2 focus:ring-indigo-600 focus:border-indigo-600"
          />
        </div>

        <button
          type="submit"
          className="px-5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded-lg text-sm transition-colors cursor-pointer"
        >
          Search
        </button>
      </form>

      {/* Job Card Grid */}
      {loading ? (
        <div className="py-16 text-center text-slate-500 text-sm">Searching drives...</div>
      ) : jobs.length === 0 ? (
        <div className="bg-white p-12 text-center rounded-xl border border-slate-200">
          <Briefcase className="w-12 h-12 text-slate-300 mx-auto mb-2" />
          <h3 className="text-base font-semibold text-slate-700">No active job drives found</h3>
          <p className="text-xs text-slate-500 mt-1">Try clearing some search filters.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {jobs.map((job) => (
            <div
              key={job.id}
              className="bg-white rounded-xl border border-slate-200/90 shadow-sm hover:shadow-md transition-shadow flex flex-col p-5"
            >
              {/* Header */}
              <div className="flex items-start justify-between gap-2 mb-3">
                <div>
                  <h3 className="font-bold text-slate-900 text-base leading-snug">{job.title}</h3>
                  <div className="flex items-center gap-1.5 text-xs text-slate-500 mt-1 font-medium">
                    <Building2 className="w-3.5 h-3.5 text-indigo-600" />
                    <span>{job.companyName}</span>
                  </div>
                </div>
                <span className="text-xs font-bold px-2.5 py-1 rounded-md bg-emerald-50 text-emerald-700 border border-emerald-200 shrink-0">
                  {job.packageLpa} LPA
                </span>
              </div>

              {/* Tags */}
              <div className="flex flex-wrap items-center gap-2 text-xs text-slate-600 mb-3">
                <span className="inline-flex items-center gap-1 bg-slate-100 px-2.5 py-1 rounded-md font-medium">
                  <MapPin className="w-3 h-3 text-slate-400" />
                  {job.location || 'Pan India'}
                </span>
                {job.minCgpa && (
                  <span className="inline-flex items-center gap-1 bg-slate-100 px-2.5 py-1 rounded-md font-medium">
                    Min CGPA: {job.minCgpa}
                  </span>
                )}
              </div>

              {/* Description */}
              <p className="text-xs text-slate-600 line-clamp-3 mb-4 leading-relaxed flex-1">
                {job.description}
              </p>

              {/* Skills */}
              {job.requiredSkills && (
                <div className="mb-4">
                  <p className="text-[11px] uppercase font-bold text-slate-400 tracking-wider mb-1.5">
                    Required Skills
                  </p>
                  <div className="flex flex-wrap gap-1.5">
                    {job.requiredSkills.split(',').map((skill, idx) => (
                      <span
                        key={idx}
                        className="text-[11px] bg-indigo-50 text-indigo-700 px-2 py-0.5 rounded font-medium"
                      >
                        {skill.trim()}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Eligibility Check Feedback */}
              <div className="pt-3 border-t border-slate-100 mb-3">
                {job.eligible ? (
                  <div className="flex items-center gap-1.5 text-xs text-emerald-600 font-medium">
                    <CheckCircle className="w-4 h-4" />
                    <span>You meet eligibility criteria</span>
                  </div>
                ) : (
                  <div className="flex items-center gap-1.5 text-xs text-rose-600 font-medium">
                    <AlertTriangle className="w-4 h-4 shrink-0" />
                    <span>{job.eligibilityReason}</span>
                  </div>
                )}
              </div>

              {/* Action Button */}
              {job.alreadyApplied ? (
                <button
                  disabled
                  className="w-full py-2 px-3 rounded-lg bg-slate-100 text-slate-500 font-semibold text-xs flex items-center justify-center gap-1.5 cursor-not-allowed"
                >
                  <CheckCircle className="w-4 h-4 text-emerald-500" />
                  Applied Already
                </button>
              ) : (
                <button
                  onClick={() => handleApply(job)}
                  disabled={!job.eligible || applyingJobId === job.id}
                  className={`w-full py-2.5 px-3 rounded-lg font-semibold text-xs transition-colors flex items-center justify-center gap-1.5 ${
                    job.eligible
                      ? 'bg-indigo-600 hover:bg-indigo-700 text-white shadow-sm cursor-pointer'
                      : 'bg-slate-200 text-slate-400 cursor-not-allowed'
                  }`}
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>{applyingJobId === job.id ? 'Applying...' : 'Apply for Opening'}</span>
                </button>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Pagination */}
      {pageData.totalPages > 1 && (
        <div className="flex items-center justify-center gap-2 pt-4">
          <button
            onClick={() => fetchJobs(pageData.pageNo - 1)}
            disabled={pageData.pageNo === 0}
            className="p-2 border border-slate-200 rounded-lg hover:bg-slate-50 disabled:opacity-40"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          <span className="text-xs text-slate-600 font-medium px-2">
            Page {pageData.pageNo + 1} of {pageData.totalPages}
          </span>
          <button
            onClick={() => fetchJobs(pageData.pageNo + 1)}
            disabled={pageData.pageNo >= pageData.totalPages - 1}
            className="p-2 border border-slate-200 rounded-lg hover:bg-slate-50 disabled:opacity-40"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      )}
    </div>
  );
};

export default JobListingsPage;
