import React, { useState, useEffect } from 'react';
import api from '../../api/axiosInstance';
import { useToast } from '../../context/ToastContext';
import {
  Briefcase,
  Plus,
  Edit2,
  Trash2,
  Search,
  Building2,
  MapPin,
  Calendar,
  X,
  ToggleLeft,
  ToggleRight,
} from 'lucide-react';

const JobManagementPage = () => {
  const [jobs, setJobs] = useState([]);
  const [companies, setCompanies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [formData, setFormData] = useState({
    companyId: '',
    title: '',
    description: '',
    requiredSkills: '',
    minCgpa: '',
    packageLpa: '',
    location: '',
    deadline: '',
    status: 'OPEN',
  });
  const [saving, setSaving] = useState(false);
  const { addToast } = useToast();

  useEffect(() => {
    fetchJobs();
    fetchCompanies();
  }, []);

  const fetchJobs = async () => {
    setLoading(true);
    try {
      const res = await api.get('/admin/jobs', { params: { query: query.trim(), size: 25 } });
      setJobs(res.data.data.content || []);
    } catch (err) {
      addToast('Failed to load jobs', 'error');
    } finally {
      setLoading(false);
    }
  };

  const fetchCompanies = async () => {
    try {
      const res = await api.get('/admin/companies/all');
      setCompanies(res.data.data || []);
    } catch (err) {
      console.error(err);
    }
  };

  const handleOpenModal = (job = null) => {
    if (job) {
      setEditingId(job.id);
      setFormData({
        companyId: job.companyId,
        title: job.title,
        description: job.description || '',
        requiredSkills: job.requiredSkills || '',
        minCgpa: job.minCgpa !== null ? job.minCgpa : '',
        packageLpa: job.packageLpa !== null ? job.packageLpa : '',
        location: job.location || '',
        deadline: job.deadline ? job.deadline.substring(0, 16) : '',
        status: job.status,
      });
    } else {
      setEditingId(null);
      setFormData({
        companyId: companies.length > 0 ? companies[0].id : '',
        title: '',
        description: '',
        requiredSkills: '',
        minCgpa: '',
        packageLpa: '',
        location: '',
        deadline: '',
        status: 'OPEN',
      });
    }
    setModalOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.companyId) {
      addToast('Please select a company', 'error');
      return;
    }

    setSaving(true);
    try {
      const payload = {
        companyId: Number(formData.companyId),
        title: formData.title,
        description: formData.description,
        requiredSkills: formData.requiredSkills,
        minCgpa: formData.minCgpa ? parseFloat(formData.minCgpa) : null,
        packageLpa: formData.packageLpa ? parseFloat(formData.packageLpa) : null,
        location: formData.location,
        deadline: formData.deadline ? formData.deadline + ':00' : null,
        status: formData.status,
      };

      if (editingId) {
        await api.put(`/admin/jobs/${editingId}`, payload);
        addToast('Job drive updated successfully', 'success');
      } else {
        await api.post('/admin/jobs', payload);
        addToast('Job drive created successfully', 'success');
      }
      setModalOpen(false);
      fetchJobs();
    } catch (err) {
      addToast(err.response?.data?.message || 'Error saving job drive', 'error');
    } finally {
      setSaving(false);
    }
  };

  const handleToggleStatus = async (job) => {
    const nextStatus = job.status === 'OPEN' ? 'CLOSED' : 'OPEN';
    try {
      await api.patch(`/admin/jobs/${job.id}/status?status=${nextStatus}`);
      addToast(`Job status changed to ${nextStatus}`, 'success');
      setJobs((prev) =>
        prev.map((j) => (j.id === job.id ? { ...j, status: nextStatus } : j))
      );
    } catch (err) {
      addToast('Error changing job status', 'error');
    }
  };

  const handleDelete = async (id, title) => {
    if (!window.confirm(`Delete drive "${title}" and associated applications?`)) return;
    try {
      await api.delete(`/admin/jobs/${id}`);
      addToast('Job deleted', 'success');
      setJobs((prev) => prev.filter((j) => j.id !== id));
    } catch (err) {
      addToast('Failed to delete job', 'error');
    }
  };

  return (
    <div className="space-y-6">
      <div className="border-b border-slate-200 pb-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Job Openings & Placement Drives</h1>
          <p className="text-sm text-slate-500">
            Publish recruitment roles, specify cut-offs & required skills, and monitor candidate pools
          </p>
        </div>
        <button
          onClick={() => handleOpenModal()}
          className="flex items-center gap-2 px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded-lg text-xs shadow-sm transition-colors cursor-pointer"
        >
          <Plus className="w-4 h-4" /> Post New Job Drive
        </button>
      </div>

      {/* Jobs Grid */}
      {loading ? (
        <div className="py-16 text-center text-slate-400 text-sm">Loading job drives...</div>
      ) : jobs.length === 0 ? (
        <div className="bg-white p-12 text-center rounded-xl border border-slate-200">
          <Briefcase className="w-12 h-12 text-slate-300 mx-auto mb-2" />
          <h3 className="text-base font-semibold text-slate-700">No job drives found</h3>
          <p className="text-xs text-slate-500 mt-1">Click above to configure your first placement drive.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {jobs.map((job) => (
            <div
              key={job.id}
              className="bg-white rounded-xl border border-slate-200/90 shadow-sm p-5 flex flex-col justify-between"
            >
              <div>
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <h3 className="font-bold text-slate-900 text-base">{job.title}</h3>
                    <div className="flex items-center gap-1.5 text-xs text-slate-500 mt-0.5">
                      <Building2 className="w-3.5 h-3.5 text-indigo-600" />
                      <span>{job.companyName}</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => handleOpenModal(job)}
                      className="p-1.5 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded"
                    >
                      <Edit2 className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleDelete(job.id, job.title)}
                      className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                <div className="mt-3 flex items-center justify-between text-xs">
                  <span className="font-bold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded">
                    {job.packageLpa} LPA
                  </span>
                  <span
                    className={`font-bold px-2 py-0.5 rounded text-[10px] uppercase border ${
                      job.status === 'OPEN'
                        ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                        : 'bg-slate-100 text-slate-600 border-slate-200'
                    }`}
                  >
                    {job.status}
                  </span>
                </div>

                <div className="mt-3 text-xs text-slate-600 space-y-1">
                  {job.minCgpa && <div>🎯 Min CGPA Required: <span className="font-semibold">{job.minCgpa}</span></div>}
                  {job.location && <div className="flex items-center gap-1">📍 {job.location}</div>}
                  {job.deadline && (
                    <div className="text-[11px] text-slate-500">
                      ⏱ Deadline: {new Date(job.deadline).toLocaleDateString()}
                    </div>
                  )}
                </div>

                {job.requiredSkills && (
                  <div className="mt-3">
                    <p className="text-[10px] uppercase font-bold text-slate-400">Skills</p>
                    <p className="text-xs text-slate-700 font-medium truncate mt-0.5">{job.requiredSkills}</p>
                  </div>
                )}
              </div>

              <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between">
                <span className="text-xs text-slate-500 font-medium">
                  {job.totalApplications} applied
                </span>
                <button
                  onClick={() => handleToggleStatus(job)}
                  className="text-xs font-semibold text-indigo-600 hover:text-indigo-700 flex items-center gap-1"
                >
                  {job.status === 'OPEN' ? 'Close Drive' : 'Reopen Drive'}
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full shadow-2xl border border-slate-200 overflow-hidden">
            <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
              <h3 className="font-bold text-slate-900 text-base">
                {editingId ? 'Edit Job Opening' : 'Post New Job Opening'}
              </h3>
              <button onClick={() => setModalOpen(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider">
                  Select Company Partner *
                </label>
                <select
                  required
                  value={formData.companyId}
                  onChange={(e) => setFormData({ ...formData, companyId: e.target.value })}
                  className="mt-1 block w-full px-3 py-2 border border-slate-300 rounded-lg text-sm text-slate-900 bg-white focus:ring-2 focus:ring-indigo-600"
                >
                  {companies.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name} ({c.location || 'Remote'})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider">
                  Job Role Title *
                </label>
                <input
                  type="text"
                  required
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  placeholder="e.g. Software Development Engineer 1"
                  className="mt-1 block w-full px-3 py-2 border border-slate-300 rounded-lg text-sm text-slate-900 focus:ring-2 focus:ring-indigo-600"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider">
                    Package (LPA)
                  </label>
                  <input
                    type="number"
                    step="0.1"
                    value={formData.packageLpa}
                    onChange={(e) => setFormData({ ...formData, packageLpa: e.target.value })}
                    placeholder="18.5"
                    className="mt-1 block w-full px-3 py-2 border border-slate-300 rounded-lg text-sm text-slate-900 focus:ring-2 focus:ring-indigo-600"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider">
                    Min CGPA Criteria
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    max="10"
                    value={formData.minCgpa}
                    onChange={(e) => setFormData({ ...formData, minCgpa: e.target.value })}
                    placeholder="7.50"
                    className="mt-1 block w-full px-3 py-2 border border-slate-300 rounded-lg text-sm text-slate-900 focus:ring-2 focus:ring-indigo-600"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider">
                    Location
                  </label>
                  <input
                    type="text"
                    value={formData.location}
                    onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                    placeholder="Bangalore / Hybrid"
                    className="mt-1 block w-full px-3 py-2 border border-slate-300 rounded-lg text-sm text-slate-900 focus:ring-2 focus:ring-indigo-600"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider">
                    Application Deadline
                  </label>
                  <input
                    type="datetime-local"
                    value={formData.deadline}
                    onChange={(e) => setFormData({ ...formData, deadline: e.target.value })}
                    className="mt-1 block w-full px-3 py-2 border border-slate-300 rounded-lg text-sm text-slate-900 focus:ring-2 focus:ring-indigo-600"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider">
                  Required Skills (Comma separated)
                </label>
                <input
                  type="text"
                  value={formData.requiredSkills}
                  onChange={(e) => setFormData({ ...formData, requiredSkills: e.target.value })}
                  placeholder="Java, React, SQL, Spring Boot"
                  className="mt-1 block w-full px-3 py-2 border border-slate-300 rounded-lg text-sm text-slate-900 focus:ring-2 focus:ring-indigo-600"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider">
                  Job Description
                </label>
                <textarea
                  rows={3}
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Describe responsibilities and interview rounds..."
                  className="mt-1 block w-full px-3 py-2 border border-slate-300 rounded-lg text-sm text-slate-900 focus:ring-2 focus:ring-indigo-600"
                />
              </div>

              <div className="pt-3 border-t border-slate-100 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  className="px-4 py-2 border border-slate-300 text-slate-700 rounded-lg text-xs font-semibold hover:bg-slate-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="px-5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-xs font-semibold disabled:opacity-50"
                >
                  {saving ? 'Saving...' : 'Save Job Drive'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default JobManagementPage;
