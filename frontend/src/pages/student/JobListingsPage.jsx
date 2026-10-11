import React, { useState, useEffect, useMemo } from 'react';
import { Link } from 'react-router-dom';
import api from '../../api/axiosInstance';
import { useToast } from '../../context/ToastContext';
import {
  Briefcase,
  Search,
  Building2,
  MapPin,
  CheckCircle,
  AlertTriangle,
  Send,
  DollarSign,
  Sparkles,
  Check,
  RotateCcw,
  GraduationCap,
} from 'lucide-react';

const JobListingsPage = () => {
  const [allJobs, setAllJobs] = useState([]);
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [applyingJobId, setApplyingJobId] = useState(null);

  // Filter & Search states
  const [searchQuery, setSearchQuery] = useState('');
  const [locationFilter, setLocationFilter] = useState('');
  const [minPackageFilter, setMinPackageFilter] = useState('');
  const [eligibleOnly, setEligibleOnly] = useState(false);
  const [activeTab, setActiveTab] = useState('ALL'); // 'ALL' | 'ELIGIBLE' | 'APPLIED'

  const { addToast } = useToast();

  const loadData = React.useCallback(async () => {
    setLoading(true);
    try {
      const [jobsRes, profileRes] = await Promise.allSettled([
        api.get('/student/jobs', { params: { size: 100 } }),
        api.get('/student/profile'),
      ]);

      if (jobsRes.status === 'fulfilled') {
        const data = jobsRes.value.data.data;
        setAllJobs(data.content || []);
      } else {
        addToast('Failed to load jobs from server', 'error');
      }

      if (profileRes.status === 'fulfilled') {
        setProfile(profileRes.value.data.data);
      }
    } catch {
      addToast('Error loading job drives', 'error');
    } finally {
      setLoading(false);
    }
  }, [addToast]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  // Helper to evaluate eligibility based on student's real CGPA, skills, deadline, and status
  const evaluateEligibility = (job, studentProfile) => {
    let eligible = true;
    let reason = 'You meet all eligibility criteria';
    const reasons = [];

    const studentCgpa = studentProfile?.cgpa != null ? Number(studentProfile.cgpa) : null;
    const studentSkills = (studentProfile?.skills || []).map((s) =>
      s.skillName.trim().toLowerCase()
    );

    // 1. Check CGPA eligibility criteria
    if (job.minCgpa != null) {
      const minCgpaNum = Number(job.minCgpa);
      if (studentCgpa == null || isNaN(studentCgpa)) {
        eligible = false;
        reasons.push(`CGPA not updated in profile (Min required: ${minCgpaNum.toFixed(2)})`);
      } else if (studentCgpa < minCgpaNum) {
        eligible = false;
        reasons.push(
          `CGPA ${studentCgpa.toFixed(2)} is below minimum requirement of ${minCgpaNum.toFixed(2)}`
        );
      }
    }

    // 2. Parse required skills and compare against student's acquired skills
    const reqSkillsList = job.requiredSkills
      ? job.requiredSkills
          .split(',')
          .map((s) => s.trim())
          .filter(Boolean)
      : [];

    const matchedSkills = [];
    const unmatchedSkills = [];

    reqSkillsList.forEach((skill) => {
      const skillLower = skill.toLowerCase();
      const isMatched = studentSkills.some(
        (st) => st === skillLower || skillLower.includes(st) || st.includes(skillLower)
      );
      if (isMatched) {
        matchedSkills.push(skill);
      } else {
        unmatchedSkills.push(skill);
      }
    });

    if (reqSkillsList.length > 0) {
      if (studentSkills.length === 0) {
        eligible = false;
        reasons.push('Add skills in profile to verify role qualification');
      } else if (matchedSkills.length === 0) {
        eligible = false;
        reasons.push(`Missing required skills (${reqSkillsList.join(', ')})`);
      }
    }

    // 3. Check Deadline
    if (job.deadline && new Date(job.deadline) < new Date()) {
      eligible = false;
      reasons.push('Application deadline has passed');
    }

    // 4. Check Status
    if (job.status && job.status !== 'OPEN') {
      eligible = false;
      reasons.push('Job opening is currently closed');
    }

    if (!eligible && reasons.length > 0) {
      reason = reasons[0];
    }

    return {
      eligible,
      reason,
      matchedSkills,
      unmatchedSkills,
      reqSkillsList,
      hasCgpaMatch:
        job.minCgpa == null || (studentCgpa != null && studentCgpa >= Number(job.minCgpa)),
      hasSkillMatch: reqSkillsList.length === 0 || matchedSkills.length > 0,
    };
  };

  // Enrich jobs with computed eligibility based on actual student data
  const enrichedJobs = useMemo(() => {
    return allJobs.map((job) => {
      const evalResult = evaluateEligibility(job, profile);
      return {
        ...job,
        computedEligible: evalResult.eligible,
        computedReason: evalResult.reason,
        matchedSkills: evalResult.matchedSkills,
        unmatchedSkills: evalResult.unmatchedSkills,
        reqSkillsList: evalResult.reqSkillsList,
        hasCgpaMatch: evalResult.hasCgpaMatch,
        hasSkillMatch: evalResult.hasSkillMatch,
      };
    });
  }, [allJobs, profile]);

  // Filter jobs by search keywords (role, company, skills, location), eligibility, and filters
  const filteredJobs = useMemo(() => {
    return enrichedJobs.filter((job) => {
      // Tab filter
      if (activeTab === 'ELIGIBLE' && !job.computedEligible) return false;
      if (activeTab === 'APPLIED' && !job.alreadyApplied) return false;

      // "Eligible for Me" toggle
      if (eligibleOnly && !job.computedEligible) return false;

      // Multi-attribute search: company, job role, required skills, location
      if (searchQuery.trim()) {
        const q = searchQuery.trim().toLowerCase();
        const matchesTitle = job.title?.toLowerCase().includes(q);
        const matchesCompany = job.companyName?.toLowerCase().includes(q);
        const matchesSkills = job.requiredSkills?.toLowerCase().includes(q);
        const matchesLocation =
          job.location?.toLowerCase().includes(q) ||
          job.companyLocation?.toLowerCase().includes(q);
        const matchesDesc = job.description?.toLowerCase().includes(q);

        if (!matchesTitle && !matchesCompany && !matchesSkills && !matchesLocation && !matchesDesc) {
          return false;
        }
      }

      // Location filter
      if (locationFilter.trim()) {
        const loc = locationFilter.trim().toLowerCase();
        const matchesLoc =
          job.location?.toLowerCase().includes(loc) ||
          job.companyLocation?.toLowerCase().includes(loc);
        if (!matchesLoc) return false;
      }

      // Min Package filter
      if (minPackageFilter) {
        const minLpa = parseFloat(minPackageFilter);
        if (!isNaN(minLpa) && Number(job.packageLpa) < minLpa) {
          return false;
        }
      }

      return true;
    });
  }, [enrichedJobs, activeTab, eligibleOnly, searchQuery, locationFilter, minPackageFilter]);

  const totalDrivesCount = enrichedJobs.length;
  const eligibleDrivesCount = enrichedJobs.filter((j) => j.computedEligible).length;
  const appliedDrivesCount = enrichedJobs.filter((j) => j.alreadyApplied).length;

  const hasActiveFilters =
    searchQuery.trim() !== '' ||
    locationFilter.trim() !== '' ||
    minPackageFilter !== '' ||
    eligibleOnly ||
    activeTab !== 'ALL';

  const handleClearFilters = () => {
    setSearchQuery('');
    setLocationFilter('');
    setMinPackageFilter('');
    setEligibleOnly(false);
    setActiveTab('ALL');
  };

  const handleApply = async (job) => {
    if (!job.computedEligible) {
      addToast(`Cannot apply: ${job.computedReason}`, 'error');
      return;
    }

    setApplyingJobId(job.id);
    try {
      await api.post(`/student/jobs/${job.id}/apply`);
      addToast(`Successfully applied to ${job.title} at ${job.companyName}!`, 'success');
      // Update local card state
      setAllJobs((prev) =>
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
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Campus Job Openings</h1>
          <p className="text-sm text-slate-500 mt-0.5">
            Explore active recruitment drives, check your CGPA and skill eligibility, and apply directly
          </p>
        </div>

        {/* Student Profile Quick Summary */}
        {profile && (
          <div className="flex items-center gap-2 bg-indigo-50/70 border border-indigo-100 rounded-xl px-3.5 py-2 self-start sm:self-auto">
            <GraduationCap className="w-5 h-5 text-indigo-600 shrink-0" />
            <div className="text-xs">
              <span className="font-semibold text-slate-800">{profile.name}</span>
              <div className="text-slate-500 flex items-center gap-2 mt-0.5">
                <span>
                  CGPA:{' '}
                  <strong className="text-indigo-700">
                    {profile.cgpa != null ? Number(profile.cgpa).toFixed(2) : 'Not set'}
                  </strong>
                </span>
                <span>•</span>
                <span>
                  Skills:{' '}
                  <strong className="text-indigo-700">{profile.skills?.length || 0}</strong>
                </span>
              </div>
            </div>
            <Link
              to="/student/profile"
              className="ml-2 text-[11px] font-semibold text-indigo-600 hover:underline"
            >
              Edit
            </Link>
          </div>
        )}
      </div>

      {/* Quick Filter Tabs & "Eligible for Me" Toggle */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-1.5 bg-slate-100/80 p-1 rounded-xl border border-slate-200/60">
          <button
            onClick={() => {
              setActiveTab('ALL');
              setEligibleOnly(false);
            }}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
              activeTab === 'ALL' && !eligibleOnly
                ? 'bg-white text-slate-900 shadow-sm'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            All Openings ({totalDrivesCount})
          </button>
          <button
            onClick={() => {
              setActiveTab('ELIGIBLE');
              setEligibleOnly(false);
            }}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all flex items-center gap-1.5 cursor-pointer ${
              activeTab === 'ELIGIBLE' || eligibleOnly
                ? 'bg-emerald-600 text-white shadow-sm'
                : 'text-emerald-700 hover:text-emerald-800'
            }`}
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>Eligible for Me ({eligibleDrivesCount})</span>
          </button>
          <button
            onClick={() => {
              setActiveTab('APPLIED');
              setEligibleOnly(false);
            }}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
              activeTab === 'APPLIED'
                ? 'bg-white text-slate-900 shadow-sm'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Applied ({appliedDrivesCount})
          </button>
        </div>

        {/* "Eligible for Me" Standalone Switch */}
        <label className="inline-flex items-center gap-2 cursor-pointer bg-white px-3.5 py-2 rounded-xl border border-slate-200/90 shadow-sm hover:border-slate-300 transition-colors">
          <input
            type="checkbox"
            checked={eligibleOnly || activeTab === 'ELIGIBLE'}
            onChange={(e) => {
              setEligibleOnly(e.target.checked);
              if (activeTab === 'ELIGIBLE' && !e.target.checked) {
                setActiveTab('ALL');
              }
            }}
            className="w-4 h-4 text-emerald-600 rounded border-slate-300 focus:ring-emerald-500 cursor-pointer"
          />
          <span className="text-xs font-semibold text-slate-700 flex items-center gap-1.5">
            <CheckCircle className="w-3.5 h-3.5 text-emerald-600" />
            <span>Only show jobs I qualify for</span>
          </span>
        </label>
      </div>

      {/* Filter & Search Bar */}
      <div className="bg-white p-4 rounded-xl border border-slate-200/80 shadow-sm flex flex-col md:flex-row gap-3">
        {/* Main Search Input */}
        <div className="flex-1 relative">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
            <Search className="w-4 h-4" />
          </div>
          <input
            type="text"
            placeholder="Search by company, job role, required skills, or location..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-3 py-2 border border-slate-300 rounded-lg text-sm text-slate-900 placeholder:text-slate-400 focus:ring-2 focus:ring-indigo-600 focus:border-indigo-600 transition-all"
          />
        </div>

        {/* Location Filter Input */}
        <div className="md:w-44 relative">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
            <MapPin className="w-4 h-4" />
          </div>
          <input
            type="text"
            placeholder="Filter location..."
            value={locationFilter}
            onChange={(e) => setLocationFilter(e.target.value)}
            className="w-full pl-9 pr-3 py-2 border border-slate-300 rounded-lg text-sm text-slate-900 placeholder:text-slate-400 focus:ring-2 focus:ring-indigo-600 focus:border-indigo-600 transition-all"
          />
        </div>

        {/* Min Package LPA */}
        <div className="md:w-36 relative">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
            <DollarSign className="w-4 h-4" />
          </div>
          <input
            type="number"
            step="0.5"
            placeholder="Min LPA..."
            value={minPackageFilter}
            onChange={(e) => setMinPackageFilter(e.target.value)}
            className="w-full pl-9 pr-3 py-2 border border-slate-300 rounded-lg text-sm text-slate-900 placeholder:text-slate-400 focus:ring-2 focus:ring-indigo-600 focus:border-indigo-600 transition-all"
          />
        </div>

        {/* Reset Filters Button */}
        {hasActiveFilters && (
          <button
            onClick={handleClearFilters}
            className="px-3.5 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold rounded-lg text-xs transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
            title="Clear all search keywords and filters"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Reset</span>
          </button>
        )}
      </div>

      {/* Active Filter Info Notice */}
      {hasActiveFilters && (
        <div className="flex items-center justify-between text-xs text-slate-500 px-1">
          <span>
            Showing <strong>{filteredJobs.length}</strong> of <strong>{totalDrivesCount}</strong>{' '}
            openings
          </span>
          <button
            onClick={handleClearFilters}
            className="text-indigo-600 hover:text-indigo-700 font-medium hover:underline cursor-pointer"
          >
            Clear all filters
          </button>
        </div>
      )}

      {/* Job Card Grid */}
      {loading ? (
        <div className="py-20 text-center">
          <div className="w-8 h-8 border-3 border-indigo-600 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
          <p className="text-slate-500 text-sm">Loading active job openings...</p>
        </div>
      ) : allJobs.length === 0 ? (
        /* Genuinely empty jobs in database */
        <div className="bg-white p-12 text-center rounded-xl border border-slate-200 shadow-sm">
          <Briefcase className="w-12 h-12 text-slate-300 mx-auto mb-2" />
          <h3 className="text-base font-semibold text-slate-700">No active job drives found</h3>
          <p className="text-xs text-slate-500 mt-1 max-w-md mx-auto">
            There are currently no active campus recruitment drives posted in the system. Check back
            later!
          </p>
        </div>
      ) : filteredJobs.length === 0 ? (
        /* Empty results due to search or filters */
        <div className="bg-white p-12 text-center rounded-xl border border-slate-200 shadow-sm">
          <Search className="w-12 h-12 text-slate-300 mx-auto mb-2" />
          <h3 className="text-base font-semibold text-slate-800">No matching job openings found</h3>
          <p className="text-xs text-slate-500 mt-1 max-w-md mx-auto">
            {searchQuery.trim()
              ? `We couldn't find any job drives matching "${searchQuery.trim()}".`
              : 'No job openings match the selected filters.'}
          </p>
          <div className="mt-4 flex items-center justify-center gap-2">
            <button
              onClick={handleClearFilters}
              className="px-4 py-2 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 font-semibold text-xs rounded-lg transition-colors cursor-pointer flex items-center gap-1.5"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Reset Filters & Show All {totalDrivesCount} Drives</span>
            </button>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredJobs.map((job) => (
            <div
              key={job.id}
              className={`bg-white rounded-xl border transition-all flex flex-col p-5 ${
                job.computedEligible
                  ? 'border-slate-200/90 shadow-sm hover:shadow-md'
                  : 'border-slate-200 bg-slate-50/40 opacity-90'
              }`}
            >
              {/* Header */}
              <div className="flex items-start justify-between gap-2 mb-3">
                <div>
                  <h3 className="font-bold text-slate-900 text-base leading-snug">{job.title}</h3>
                  <div className="flex items-center gap-1.5 text-xs text-slate-500 mt-1 font-medium">
                    <Building2 className="w-3.5 h-3.5 text-indigo-600 shrink-0" />
                    <span>{job.companyName}</span>
                  </div>
                </div>
                <span className="text-xs font-bold px-2.5 py-1 rounded-md bg-emerald-50 text-emerald-700 border border-emerald-200 shrink-0">
                  {job.packageLpa} LPA
                </span>
              </div>

              {/* Meta Tags */}
              <div className="flex flex-wrap items-center gap-2 text-xs text-slate-600 mb-3">
                <span className="inline-flex items-center gap-1 bg-slate-100 px-2.5 py-1 rounded-md font-medium">
                  <MapPin className="w-3 h-3 text-slate-400" />
                  {job.location || job.companyLocation || 'Pan India'}
                </span>

                {job.minCgpa && (
                  <span
                    className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-md font-medium ${
                      job.hasCgpaMatch
                        ? 'bg-slate-100 text-slate-700'
                        : 'bg-rose-50 text-rose-700 border border-rose-200'
                    }`}
                  >
                    <span>Min CGPA: {Number(job.minCgpa).toFixed(2)}</span>
                    {profile?.cgpa != null && (
                      <span className="text-[10px] font-bold">
                        {job.hasCgpaMatch ? '✓' : `(You: ${Number(profile.cgpa).toFixed(2)})`}
                      </span>
                    )}
                  </span>
                )}
              </div>

              {/* Description */}
              <p className="text-xs text-slate-600 line-clamp-3 mb-4 leading-relaxed flex-1">
                {job.description}
              </p>

              {/* Required Skills & Student Match Badges */}
              {job.reqSkillsList && job.reqSkillsList.length > 0 && (
                <div className="mb-4">
                  <div className="flex items-center justify-between mb-1.5">
                    <p className="text-[11px] uppercase font-bold text-slate-400 tracking-wider">
                      Required Skills
                    </p>
                    <span className="text-[10px] text-slate-500 font-medium">
                      {job.matchedSkills.length}/{job.reqSkillsList.length} matched
                    </span>
                  </div>

                  <div className="flex flex-wrap gap-1.5">
                    {job.reqSkillsList.map((skill, idx) => {
                      const isMatched = job.matchedSkills.includes(skill);
                      return (
                        <span
                          key={idx}
                          className={`text-[11px] px-2 py-0.5 rounded font-medium flex items-center gap-1 ${
                            isMatched
                              ? 'bg-emerald-50 text-emerald-800 border border-emerald-200 font-semibold'
                              : 'bg-slate-100 text-slate-600'
                          }`}
                        >
                          {isMatched && <Check className="w-3 h-3 text-emerald-600" />}
                          <span>{skill}</span>
                        </span>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Eligibility Check Feedback */}
              <div className="pt-3 border-t border-slate-100 mb-3">
                {job.computedEligible ? (
                  <div className="flex items-center gap-1.5 text-xs text-emerald-600 font-medium">
                    <CheckCircle className="w-4 h-4 shrink-0" />
                    <span>{job.computedReason}</span>
                  </div>
                ) : (
                  <div className="flex items-center gap-1.5 text-xs text-rose-600 font-medium">
                    <AlertTriangle className="w-4 h-4 shrink-0" />
                    <span>{job.computedReason}</span>
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
                  disabled={!job.computedEligible || applyingJobId === job.id}
                  className={`w-full py-2.5 px-3 rounded-lg font-semibold text-xs transition-colors flex items-center justify-center gap-1.5 ${
                    job.computedEligible
                      ? 'bg-indigo-600 hover:bg-indigo-700 text-white shadow-sm cursor-pointer'
                      : 'bg-slate-200 text-slate-400 cursor-not-allowed'
                  }`}
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>
                    {applyingJobId === job.id
                      ? 'Applying...'
                      : job.computedEligible
                      ? 'Apply for Opening'
                      : 'Not Eligible to Apply'}
                  </span>
                </button>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default JobListingsPage;
