import React, { useState, useEffect } from 'react';
import api from '../../api/axiosInstance';
import { useToast } from '../../context/ToastContext';
import {
  Calendar,
  Search,
  Filter,
  CheckCircle,
  XCircle,
  Clock,
  Award,
  Video,
  FileText,
  X,
  Plus,
} from 'lucide-react';

const ApplicationReviewPage = () => {
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('');
  const [query, setQuery] = useState('');
  const [interviewModalOpen, setInterviewModalOpen] = useState(false);
  const [selectedApp, setSelectedApp] = useState(null);
  const [interviewForm, setInterviewForm] = useState({
    interviewDate: '',
    mode: 'ONLINE',
    roundName: 'Technical Round 1',
    locationOrLink: 'https://meet.google.com/campus-interview',
    feedback: '',
  });
  const [scheduling, setScheduling] = useState(false);
  const { addToast } = useToast();

  useEffect(() => {
    fetchApplications();
  }, [statusFilter]);

  const fetchApplications = async () => {
    setLoading(true);
    try {
      const params = { size: 50 };
      if (statusFilter) params.status = statusFilter;
      if (query.trim()) params.query = query.trim();

      const res = await api.get('/admin/applications', { params });
      setApplications(res.data.data.content || []);
    } catch (err) {
      addToast('Failed to load applications', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateStatus = async (appId, newStatus) => {
    try {
      await api.patch(`/admin/applications/${appId}/status`, { status: newStatus });
      addToast(`Application status updated to ${newStatus}`, 'success');
      setApplications((prev) =>
        prev.map((a) => (a.id === appId ? { ...a, status: newStatus } : a))
      );
    } catch (err) {
      addToast(err.response?.data?.message || 'Error updating status', 'error');
    }
  };

  const handleOpenInterviewModal = (app) => {
    setSelectedApp(app);
    // default date 2 days in advance at 10 AM
    const nextDate = new Date();
    nextDate.setDate(nextDate.getDate() + 2);
    nextDate.setHours(10, 0, 0, 0);
    setInterviewForm({
      interviewDate: nextDate.toISOString().substring(0, 16),
      mode: 'ONLINE',
      roundName: 'Technical Round 1',
      locationOrLink: 'https://meet.google.com/campus-interview',
      feedback: 'Scheduled after resume screening.',
    });
    setInterviewModalOpen(true);
  };

  const handleScheduleInterview = async (e) => {
    e.preventDefault();
    if (!selectedApp) return;

    setScheduling(true);
    try {
      const payload = {
        interviewDate: interviewForm.interviewDate + ':00',
        mode: interviewForm.mode,
        roundName: interviewForm.roundName,
        locationOrLink: interviewForm.locationOrLink,
        feedback: interviewForm.feedback,
      };

      await api.post(`/admin/applications/${selectedApp.id}/interviews`, payload);
      addToast(`Interview round scheduled for ${selectedApp.studentName}!`, 'success');
      setInterviewModalOpen(false);
      fetchApplications();
    } catch (err) {
      addToast(err.response?.data?.message || 'Failed to schedule interview', 'error');
    } finally {
      setScheduling(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="border-b border-slate-200 pb-4">
        <h1 className="text-2xl font-bold text-slate-900">Application Reviews & Scheduling</h1>
        <p className="text-sm text-slate-500">
          Review candidate profiles, transition recruitment stages, and schedule interview rounds
        </p>
      </div>

      {/* Filter bar */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="flex-1 relative">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
            <Search className="w-4 h-4" />
          </div>
          <input
            type="text"
            placeholder="Search candidate name, job title, or company..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && fetchApplications()}
            className="w-full pl-9 pr-3 py-2 border border-slate-300 rounded-lg text-sm text-slate-900 focus:ring-2 focus:ring-indigo-600"
          />
        </div>

        <div className="sm:w-56">
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm text-slate-900 bg-white focus:ring-2 focus:ring-indigo-600"
          >
            <option value="">All Application Statuses</option>
            <option value="APPLIED">APPLIED (New)</option>
            <option value="SHORTLISTED">SHORTLISTED (In Rounds)</option>
            <option value="SELECTED">SELECTED (Offers)</option>
            <option value="REJECTED">REJECTED</option>
          </select>
        </div>

        <button
          onClick={fetchApplications}
          className="px-5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded-lg text-sm transition-colors"
        >
          Filter
        </button>
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl border border-slate-200/90 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50/80 border-b border-slate-200 text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                <th className="py-3 px-4">Applicant</th>
                <th className="py-3 px-4">Job Role & Company</th>
                <th className="py-3 px-4">CGPA</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4">Interviews</th>
                <th className="py-3 px-4 text-right">Action / Progression</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-sm">
              {loading ? (
                <tr>
                  <td colSpan={6} className="text-center py-12 text-slate-400">
                    Loading applications...
                  </td>
                </tr>
              ) : applications.length === 0 ? (
                <tr>
                  <td colSpan={6} className="text-center py-12 text-slate-400">
                    No applications matched the filter.
                  </td>
                </tr>
              ) : (
                applications.map((app) => (
                  <tr key={app.id} className="hover:bg-slate-50/60 transition-colors">
                    <td className="py-3.5 px-4">
                      <div className="font-semibold text-slate-900">{app.studentName}</div>
                      <div className="text-xs text-slate-500">{app.studentEmail}</div>
                      {app.resumeUrl && (
                        <a
                          href={app.resumeUrl}
                          target="_blank"
                          rel="noreferrer"
                          className="inline-flex items-center gap-1 text-[11px] text-indigo-600 hover:underline mt-0.5"
                        >
                          <FileText className="w-3 h-3" /> Resume
                        </a>
                      )}
                    </td>

                    <td className="py-3.5 px-4">
                      <div className="font-semibold text-slate-800 text-xs">{app.jobTitle}</div>
                      <div className="text-xs text-slate-500">{app.companyName} • {app.packageLpa} LPA</div>
                    </td>

                    <td className="py-3.5 px-4">
                      <span className="font-bold text-slate-900">{app.studentCgpa || '—'}</span>
                    </td>

                    <td className="py-3.5 px-4">
                      <span
                        className={`inline-block px-2.5 py-0.5 rounded text-[11px] font-bold uppercase border ${
                          app.status === 'SELECTED'
                            ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                            : app.status === 'SHORTLISTED'
                            ? 'bg-blue-50 text-blue-700 border-blue-200'
                            : app.status === 'REJECTED'
                            ? 'bg-rose-50 text-rose-700 border-rose-200'
                            : 'bg-slate-100 text-slate-700 border-slate-200'
                        }`}
                      >
                        {app.status}
                      </span>
                    </td>

                    <td className="py-3.5 px-4">
                      <div className="text-xs">
                        <span className="font-semibold text-slate-800">
                          {app.interviews ? app.interviews.length : 0} rounds
                        </span>
                        {app.interviews && app.interviews.length > 0 && (
                          <div className="text-[11px] text-indigo-600 font-medium">
                            Latest: {app.interviews[app.interviews.length - 1].roundName}
                          </div>
                        )}
                      </div>
                    </td>

                    <td className="py-3.5 px-4 text-right space-x-1">
                      <button
                        onClick={() => handleOpenInterviewModal(app)}
                        className="px-2.5 py-1 text-xs font-semibold bg-indigo-50 text-indigo-700 hover:bg-indigo-100 rounded transition-colors inline-flex items-center gap-1"
                      >
                        <Calendar className="w-3.5 h-3.5" /> Schedule
                      </button>

                      {app.status !== 'SELECTED' && (
                        <button
                          onClick={() => handleUpdateStatus(app.id, 'SELECTED')}
                          title="Select candidate"
                          className="px-2 py-1 text-xs font-semibold text-emerald-700 hover:bg-emerald-50 rounded"
                        >
                          Select
                        </button>
                      )}

                      {app.status !== 'REJECTED' && (
                        <button
                          onClick={() => handleUpdateStatus(app.id, 'REJECTED')}
                          title="Reject candidate"
                          className="px-2 py-1 text-xs font-semibold text-rose-700 hover:bg-rose-50 rounded"
                        >
                          Reject
                        </button>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Schedule Interview Modal */}
      {interviewModalOpen && selectedApp && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full shadow-2xl border border-slate-200 overflow-hidden">
            <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
              <div>
                <h3 className="font-bold text-slate-900 text-base">Schedule Interview Round</h3>
                <p className="text-xs text-slate-500">
                  Candidate: {selectedApp.studentName} ({selectedApp.jobTitle})
                </p>
              </div>
              <button onClick={() => setInterviewModalOpen(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleScheduleInterview} className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider">
                  Round Title *
                </label>
                <input
                  type="text"
                  required
                  value={interviewForm.roundName}
                  onChange={(e) => setInterviewForm({ ...interviewForm, roundName: e.target.value })}
                  placeholder="e.g. Technical Round 1, System Design, HR Discussion"
                  className="mt-1 block w-full px-3 py-2 border border-slate-300 rounded-lg text-sm text-slate-900 focus:ring-2 focus:ring-indigo-600"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider">
                    Date & Time *
                  </label>
                  <input
                    type="datetime-local"
                    required
                    value={interviewForm.interviewDate}
                    onChange={(e) => setInterviewForm({ ...interviewForm, interviewDate: e.target.value })}
                    className="mt-1 block w-full px-3 py-2 border border-slate-300 rounded-lg text-sm text-slate-900 focus:ring-2 focus:ring-indigo-600"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider">
                    Mode
                  </label>
                  <select
                    value={interviewForm.mode}
                    onChange={(e) => setInterviewForm({ ...interviewForm, mode: e.target.value })}
                    className="mt-1 block w-full px-3 py-2 border border-slate-300 rounded-lg text-sm text-slate-900 bg-white focus:ring-2 focus:ring-indigo-600"
                  >
                    <option value="ONLINE">ONLINE (Video Call)</option>
                    <option value="IN_PERSON">IN_PERSON (Campus)</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider">
                  Link / Venue Room
                </label>
                <input
                  type="text"
                  value={interviewForm.locationOrLink}
                  onChange={(e) => setInterviewForm({ ...interviewForm, locationOrLink: e.target.value })}
                  placeholder="https://meet.google.com/xyz or Seminar Hall B"
                  className="mt-1 block w-full px-3 py-2 border border-slate-300 rounded-lg text-sm text-slate-900 focus:ring-2 focus:ring-indigo-600"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider">
                  Coordinator Instructions / Notes
                </label>
                <textarea
                  rows={2}
                  value={interviewForm.feedback}
                  onChange={(e) => setInterviewForm({ ...interviewForm, feedback: e.target.value })}
                  placeholder="Instructions for candidate (e.g. keep government ID ready)..."
                  className="mt-1 block w-full px-3 py-2 border border-slate-300 rounded-lg text-sm text-slate-900 focus:ring-2 focus:ring-indigo-600"
                />
              </div>

              <div className="pt-3 border-t border-slate-100 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setInterviewModalOpen(false)}
                  className="px-4 py-2 border border-slate-300 text-slate-700 rounded-lg text-xs font-semibold hover:bg-slate-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={scheduling}
                  className="px-5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-xs font-semibold disabled:opacity-50"
                >
                  {scheduling ? 'Scheduling...' : 'Confirm Schedule'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default ApplicationReviewPage;
