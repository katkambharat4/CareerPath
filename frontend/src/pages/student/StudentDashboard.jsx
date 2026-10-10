import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../../api/axiosInstance';
import { useAuth } from '../../context/AuthContext';
import {
  Briefcase,
  Calendar,
  CheckCircle2,
  Clock,
  Sparkles,
  Award,
  ArrowRight,
  TrendingUp,
  Building,
} from 'lucide-react';

const StudentDashboard = () => {
  const { user } = useAuth();
  const [profile, setProfile] = useState(null);
  const [applications, setApplications] = useState([]);
  const [interviews, setInterviews] = useState([]);
  const [placement, setPlacement] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    setLoading(true);
    try {
      const [profileRes, appRes, intRes, placeRes] = await Promise.allSettled([
        api.get('/student/profile'),
        api.get('/student/applications'),
        api.get('/student/interviews'),
        api.get('/student/placement'),
      ]);

      if (profileRes.status === 'fulfilled') setProfile(profileRes.value.data.data);
      if (appRes.status === 'fulfilled') setApplications(appRes.value.data.data || []);
      if (intRes.status === 'fulfilled') setInterviews(intRes.value.data.data || []);
      if (placeRes.status === 'fulfilled') setPlacement(placeRes.value.data.data);
    } catch (err) {
      console.error('Error fetching student dashboard', err);
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

  const selectedCount = applications.filter((a) => a.status === 'SELECTED').length;
  const shortlistedCount = applications.filter((a) => a.status === 'SHORTLISTED').length;

  return (
    <div className="space-y-6">
      {/* Welcome Banner */}
      <div className="bg-gradient-to-r from-indigo-700 via-indigo-600 to-blue-600 rounded-2xl p-6 text-white shadow-lg shadow-indigo-500/10">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <span className="inline-block px-3 py-1 bg-white/20 rounded-full text-xs font-semibold backdrop-blur-sm mb-2">
              Student Career Portal
            </span>
            <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight">
              Hello, {profile?.name || user?.email}! 👋
            </h1>
            <p className="text-indigo-100 text-sm mt-1">
              Department of {profile?.department || 'Engineering'} | Batch of {profile?.graduationYear || '2026'}
            </p>
          </div>

          {placement ? (
            <div className="bg-white/10 backdrop-blur-md rounded-xl p-4 border border-white/20 flex items-center gap-3">
              <div className="w-12 h-12 rounded-lg bg-emerald-500 flex items-center justify-center text-white shrink-0">
                <Award className="w-7 h-7" />
              </div>
              <div>
                <p className="text-xs uppercase font-bold tracking-wider text-emerald-200">Placed At</p>
                <h3 className="font-bold text-white text-lg leading-tight">{placement.companyName}</h3>
                <p className="text-xs text-indigo-100">{placement.packageLpa} LPA • {placement.jobTitle}</p>
              </div>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <Link
                to="/student/jobs"
                className="px-4 py-2.5 bg-white text-indigo-700 font-semibold rounded-lg text-sm hover:bg-indigo-50 transition-colors shadow-sm flex items-center gap-2"
              >
                <Briefcase className="w-4 h-4" />
                Browse Job Openings
              </Link>
            </div>
          )}
        </div>
      </div>

      {/* Summary Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-xl border border-slate-200/80 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center shrink-0">
            <Briefcase className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Jobs Applied</p>
            <h3 className="text-2xl font-bold text-slate-800">{applications.length}</h3>
          </div>
        </div>

        <div className="bg-white p-5 rounded-xl border border-slate-200/80 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center shrink-0">
            <Clock className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Shortlisted</p>
            <h3 className="text-2xl font-bold text-slate-800">{shortlistedCount}</h3>
          </div>
        </div>

        <div className="bg-white p-5 rounded-xl border border-slate-200/80 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
            <Calendar className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Interviews</p>
            <h3 className="text-2xl font-bold text-slate-800">{interviews.length}</h3>
          </div>
        </div>

        <div className="bg-white p-5 rounded-xl border border-slate-200/80 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
            <TrendingUp className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">CGPA on File</p>
            <h3 className="text-2xl font-bold text-slate-800">{profile?.cgpa ? `${profile.cgpa} / 10` : 'N/A'}</h3>
          </div>
        </div>
      </div>

      {/* Grid: Upcoming Interviews & Recent Applications */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Upcoming Interviews */}
        <div className="bg-white rounded-xl border border-slate-200/80 shadow-sm p-6">
          <div className="flex items-center justify-between pb-4 border-b border-slate-100">
            <div className="flex items-center gap-2">
              <Calendar className="w-5 h-5 text-indigo-600" />
              <h2 className="text-base font-bold text-slate-900">Upcoming Interviews</h2>
            </div>
            <Link to="/student/applications" className="text-xs font-semibold text-indigo-600 hover:text-indigo-700 flex items-center gap-1">
              View All <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="mt-4 divide-y divide-slate-100">
            {interviews.length === 0 ? (
              <p className="text-xs text-slate-500 py-6 text-center">No interview rounds scheduled yet.</p>
            ) : (
              interviews.slice(0, 3).map((item) => (
                <div key={item.id} className="py-3 flex items-start justify-between">
                  <div>
                    <h4 className="text-sm font-semibold text-slate-900">{item.roundName}</h4>
                    <p className="text-xs text-slate-500 mt-0.5">
                      📅 {new Date(item.interviewDate).toLocaleString([], { dateStyle: 'medium', timeStyle: 'short' })}
                    </p>
                    {item.locationOrLink && (
                      <a
                        href={item.locationOrLink}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-block text-xs text-indigo-600 hover:underline mt-1 font-medium"
                      >
                        🔗 Link / Venue: {item.locationOrLink}
                      </a>
                    )}
                  </div>
                  <span className="text-[11px] font-semibold uppercase px-2.5 py-1 rounded-full bg-blue-100 text-blue-700">
                    {item.mode}
                  </span>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Skills & Profile Summary */}
        <div className="bg-white rounded-xl border border-slate-200/80 shadow-sm p-6">
          <div className="flex items-center justify-between pb-4 border-b border-slate-100">
            <div className="flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-indigo-600" />
              <h2 className="text-base font-bold text-slate-900">My Skills & Tagged Expertise</h2>
            </div>
            <Link to="/student/skills" className="text-xs font-semibold text-indigo-600 hover:text-indigo-700 flex items-center gap-1">
              Manage Skills <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="mt-4">
            {profile?.skills && profile.skills.length > 0 ? (
              <div className="flex flex-wrap gap-2">
                {profile.skills.map((s) => (
                  <span
                    key={s.skillId}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-slate-100 text-slate-800 border border-slate-200"
                  >
                    <span>{s.skillName}</span>
                    <span className="text-[10px] uppercase font-bold text-indigo-600 bg-indigo-50 px-1.5 py-0.5 rounded">
                      {s.proficiency}
                    </span>
                  </span>
                ))}
              </div>
            ) : (
              <p className="text-xs text-slate-500 py-6 text-center">
                No skills added yet. Add your programming skills to qualify for jobs!
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default StudentDashboard;
