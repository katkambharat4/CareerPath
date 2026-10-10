import React, { useState, useEffect } from 'react';
import api from '../../api/axiosInstance';
import { useToast } from '../../context/ToastContext';
import {
  Calendar,
  Building2,
  CheckCircle2,
  Clock,
  XCircle,
  ExternalLink,
  Video,
  Award,
} from 'lucide-react';

const ApplicationTimelinePage = () => {
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const { addToast } = useToast();

  useEffect(() => {
    fetchApplications();
  }, []);

  const fetchApplications = async () => {
    try {
      const res = await api.get('/student/applications');
      setApplications(res.data.data || []);
    } catch (err) {
      addToast('Failed to load application history', 'error');
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'SELECTED':
        return (
          <span className="inline-flex items-center gap-1 text-xs font-bold px-2.5 py-1 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-200">
            <Award className="w-3.5 h-3.5" /> Selected / Placed
          </span>
        );
      case 'SHORTLISTED':
        return (
          <span className="inline-flex items-center gap-1 text-xs font-bold px-2.5 py-1 rounded-full bg-blue-100 text-blue-800 border border-blue-200">
            <Clock className="w-3.5 h-3.5" /> Shortlisted for Rounds
          </span>
        );
      case 'REJECTED':
        return (
          <span className="inline-flex items-center gap-1 text-xs font-bold px-2.5 py-1 rounded-full bg-rose-100 text-rose-800 border border-rose-200">
            <XCircle className="w-3.5 h-3.5" /> Rejected
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1 text-xs font-bold px-2.5 py-1 rounded-full bg-slate-100 text-slate-800 border border-slate-200">
            <CheckCircle2 className="w-3.5 h-3.5" /> Under Review (Applied)
          </span>
        );
    }
  };

  if (loading) {
    return (
      <div className="py-20 text-center text-slate-500 text-sm">Loading applications...</div>
    );
  }

  return (
    <div className="max-w-4xl space-y-6">
      <div className="border-b border-slate-200 pb-4">
        <h1 className="text-2xl font-bold text-slate-900">Application Status & Timeline</h1>
        <p className="text-sm text-slate-500">
          Track interview rounds, screening results, and recruitment progression for each position
        </p>
      </div>

      {applications.length === 0 ? (
        <div className="bg-white p-12 text-center rounded-xl border border-slate-200 shadow-sm">
          <Clock className="w-12 h-12 text-slate-300 mx-auto mb-2" />
          <h3 className="text-base font-semibold text-slate-700">No applications yet</h3>
          <p className="text-xs text-slate-500 mt-1">Visit the Job Openings page to apply for campus drives.</p>
        </div>
      ) : (
        <div className="space-y-6">
          {applications.map((app) => (
            <div
              key={app.id}
              className="bg-white rounded-xl border border-slate-200/90 shadow-sm overflow-hidden"
            >
              {/* Application Header */}
              <div className="p-5 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-slate-50/50">
                <div>
                  <h3 className="text-base font-bold text-slate-900">{app.jobTitle}</h3>
                  <div className="flex items-center gap-2 text-xs text-slate-500 mt-1">
                    <Building2 className="w-3.5 h-3.5 text-indigo-600" />
                    <span className="font-medium text-slate-700">{app.companyName}</span>
                    <span>•</span>
                    <span>{app.packageLpa} LPA</span>
                    <span>•</span>
                    <span>
                      Applied on {new Date(app.appliedAt).toLocaleDateString([], { dateStyle: 'medium' })}
                    </span>
                  </div>
                </div>
                <div>{getStatusBadge(app.status)}</div>
              </div>

              {/* Timeline Body */}
              <div className="p-5">
                <h4 className="text-xs uppercase font-bold text-slate-400 tracking-wider mb-4">
                  Recruitment Round Timeline
                </h4>

                <div className="relative pl-6 space-y-6 before:absolute before:left-2 before:top-2 before:bottom-2 before:w-0.5 before:bg-slate-200">
                  {/* Step 1: Application submission */}
                  <div className="relative">
                    <div className="absolute -left-6 top-0 w-4 h-4 rounded-full bg-emerald-500 border-2 border-white ring-2 ring-emerald-100" />
                    <div>
                      <h5 className="text-sm font-semibold text-slate-900">Application Submitted</h5>
                      <p className="text-xs text-slate-500 mt-0.5">
                        Received by campus placement coordinator and sent for profile review.
                      </p>
                    </div>
                  </div>

                  {/* Interview Rounds */}
                  {app.interviews && app.interviews.length > 0 ? (
                    app.interviews.map((interview, idx) => (
                      <div key={interview.id} className="relative">
                        <div className="absolute -left-6 top-0 w-4 h-4 rounded-full bg-indigo-600 border-2 border-white ring-2 ring-indigo-100" />
                        <div className="bg-slate-50 p-3.5 rounded-lg border border-slate-200/80">
                          <div className="flex items-start justify-between gap-2">
                            <div>
                              <h5 className="text-sm font-bold text-indigo-950">{interview.roundName}</h5>
                              <p className="text-xs text-slate-600 mt-1 flex items-center gap-1.5 font-medium">
                                <Calendar className="w-3.5 h-3.5 text-indigo-600" />
                                {new Date(interview.interviewDate).toLocaleString([], {
                                  dateStyle: 'medium',
                                  timeStyle: 'short',
                                })}
                              </p>
                            </div>
                            <span className="text-[10px] uppercase font-bold px-2 py-0.5 rounded bg-indigo-100 text-indigo-700">
                              {interview.mode}
                            </span>
                          </div>

                          {interview.locationOrLink && (
                            <div className="mt-2.5 pt-2 border-t border-slate-200/60 flex items-center gap-1 text-xs text-indigo-600">
                              <Video className="w-3.5 h-3.5 shrink-0" />
                              <a
                                href={interview.locationOrLink}
                                target="_blank"
                                rel="noreferrer"
                                className="hover:underline font-medium break-all"
                              >
                                {interview.locationOrLink}
                              </a>
                            </div>
                          )}

                          {interview.feedback && (
                            <p className="mt-2 text-xs text-slate-500 bg-white p-2 rounded border border-slate-200 italic">
                              Coordinator Note: "{interview.feedback}"
                            </p>
                          )}
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="relative">
                      <div className="absolute -left-6 top-0 w-4 h-4 rounded-full bg-slate-300 border-2 border-white" />
                      <div>
                        <h5 className="text-sm font-semibold text-slate-500">Interview Scheduling</h5>
                        <p className="text-xs text-slate-400 mt-0.5">
                          Pending review from the recruitment panel.
                        </p>
                      </div>
                    </div>
                  )}

                  {/* Final Status */}
                  {app.status === 'SELECTED' && (
                    <div className="relative">
                      <div className="absolute -left-6 top-0 w-4 h-4 rounded-full bg-emerald-600 border-2 border-white ring-2 ring-emerald-200" />
                      <div className="bg-emerald-50 border border-emerald-200 p-3 rounded-lg">
                        <h5 className="text-sm font-bold text-emerald-900">Offer Extended & Selected! 🎉</h5>
                        <p className="text-xs text-emerald-700 mt-0.5">
                          Congratulations! Your placement record has been logged in CareerPath.
                        </p>
                      </div>
                    </div>
                  )}

                  {app.status === 'REJECTED' && (
                    <div className="relative">
                      <div className="absolute -left-6 top-0 w-4 h-4 rounded-full bg-rose-500 border-2 border-white" />
                      <div>
                        <h5 className="text-sm font-semibold text-rose-700">Application Concluded</h5>
                        <p className="text-xs text-slate-500 mt-0.5">
                          Candidate not shortlisted for subsequent rounds. Keep applying for new drives!
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default ApplicationTimelinePage;
