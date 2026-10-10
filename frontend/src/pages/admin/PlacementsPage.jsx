import React, { useState, useEffect } from 'react';
import api from '../../api/axiosInstance';
import { useToast } from '../../context/ToastContext';
import {
  Award,
  Plus,
  Search,
  Building2,
  Calendar,
  X,
  TrendingUp,
  UserCheck,
} from 'lucide-react';

const PlacementsPage = () => {
  const [placements, setPlacements] = useState([]);
  const [students, setStudents] = useState([]);
  const [companies, setCompanies] = useState([]);
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [formData, setFormData] = useState({
    studentId: '',
    companyId: '',
    jobId: '',
    packageLpa: '',
    joiningDate: '',
    placedDate: new Date().toISOString().substring(0, 10),
  });
  const [saving, setSaving] = useState(false);
  const { addToast } = useToast();

  useEffect(() => {
    fetchPlacements();
    fetchMetadata();
  }, []);

  const fetchPlacements = async () => {
    setLoading(true);
    try {
      const res = await api.get('/admin/placements', { params: { size: 50 } });
      setPlacements(res.data.data.content || []);
    } catch (err) {
      addToast('Failed to load placement records', 'error');
    } finally {
      setLoading(false);
    }
  };

  const fetchMetadata = async () => {
    try {
      const [stuRes, compRes, jobRes] = await Promise.all([
        api.get('/admin/students', { params: { size: 100 } }),
        api.get('/admin/companies/all'),
        api.get('/admin/jobs/open'),
      ]);
      setStudents(stuRes.data.data.content || []);
      setCompanies(compRes.data.data || []);
      setJobs(jobRes.data.data || []);
    } catch (err) {
      console.error(err);
    }
  };

  const handleOpenModal = () => {
    setFormData({
      studentId: students.length > 0 ? students[0].id : '',
      companyId: companies.length > 0 ? companies[0].id : '',
      jobId: jobs.length > 0 ? jobs[0].id : '',
      packageLpa: '',
      joiningDate: '',
      placedDate: new Date().toISOString().substring(0, 10),
    });
    setModalOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const payload = {
        studentId: Number(formData.studentId),
        companyId: Number(formData.companyId),
        jobId: Number(formData.jobId),
        packageLpa: parseFloat(formData.packageLpa),
        joiningDate: formData.joiningDate || null,
        placedDate: formData.placedDate,
      };

      await api.post('/admin/placements', payload);
      addToast('Final student placement recorded successfully!', 'success');
      setModalOpen(false);
      fetchPlacements();
    } catch (err) {
      addToast(err.response?.data?.message || 'Error recording placement', 'error');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="border-b border-slate-200 pb-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Placement Registry & Final Offers</h1>
          <p className="text-sm text-slate-500">
            Official repository of final accepted offers (strictly 1 final placement per candidate)
          </p>
        </div>
        <button
          onClick={handleOpenModal}
          className="flex items-center gap-2 px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded-lg text-xs shadow-sm transition-colors cursor-pointer"
        >
          <Plus className="w-4 h-4" /> Record Final Placement
        </button>
      </div>

      {/* Placements Table */}
      <div className="bg-white rounded-xl border border-slate-200/90 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50/80 border-b border-slate-200 text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                <th className="py-3 px-4">Placed Candidate</th>
                <th className="py-3 px-4">Recruiting Company</th>
                <th className="py-3 px-4">Role / Title</th>
                <th className="py-3 px-4">Salary Package</th>
                <th className="py-3 px-4">Offer Date</th>
                <th className="py-3 px-4">Expected Joining</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-sm">
              {loading ? (
                <tr>
                  <td colSpan={6} className="text-center py-12 text-slate-400">
                    Loading placements...
                  </td>
                </tr>
              ) : placements.length === 0 ? (
                <tr>
                  <td colSpan={6} className="text-center py-12 text-slate-400">
                    No placement records found yet.
                  </td>
                </tr>
              ) : (
                placements.map((p) => (
                  <tr key={p.id} className="hover:bg-slate-50/60 transition-colors">
                    <td className="py-3.5 px-4">
                      <div className="font-semibold text-slate-900">{p.studentName}</div>
                      <div className="text-xs text-slate-500">{p.studentEmail} • {p.department}</div>
                    </td>

                    <td className="py-3.5 px-4">
                      <div className="flex items-center gap-1.5 font-semibold text-slate-800">
                        <Building2 className="w-3.5 h-3.5 text-indigo-600" />
                        <span>{p.companyName}</span>
                      </div>
                    </td>

                    <td className="py-3.5 px-4">
                      <span className="text-slate-700 font-medium text-xs">{p.jobTitle}</span>
                    </td>

                    <td className="py-3.5 px-4">
                      <span className="font-bold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-md text-xs border border-emerald-200">
                        {p.packageLpa} LPA
                      </span>
                    </td>

                    <td className="py-3.5 px-4 text-xs text-slate-600">
                      {new Date(p.placedDate).toLocaleDateString([], { dateStyle: 'medium' })}
                    </td>

                    <td className="py-3.5 px-4 text-xs text-slate-600">
                      {p.joiningDate ? new Date(p.joiningDate).toLocaleDateString([], { dateStyle: 'medium' }) : 'To Be Confirmed'}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Record Placement Modal */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full shadow-2xl border border-slate-200 overflow-hidden">
            <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
              <div>
                <h3 className="font-bold text-slate-900 text-base">Record Student Placement</h3>
                <p className="text-xs text-slate-500">Enforces rule: 1 final offer per candidate</p>
              </div>
              <button onClick={() => setModalOpen(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider">
                  Select Student *
                </label>
                <select
                  required
                  value={formData.studentId}
                  onChange={(e) => setFormData({ ...formData, studentId: e.target.value })}
                  className="mt-1 block w-full px-3 py-2 border border-slate-300 rounded-lg text-sm text-slate-900 bg-white focus:ring-2 focus:ring-indigo-600"
                >
                  {students.map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.name} ({s.department} • CGPA: {s.cgpa || 'N/A'})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider">
                  Recruiting Company *
                </label>
                <select
                  required
                  value={formData.companyId}
                  onChange={(e) => setFormData({ ...formData, companyId: e.target.value })}
                  className="mt-1 block w-full px-3 py-2 border border-slate-300 rounded-lg text-sm text-slate-900 bg-white focus:ring-2 focus:ring-indigo-600"
                >
                  {companies.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider">
                  Job Position *
                </label>
                <select
                  required
                  value={formData.jobId}
                  onChange={(e) => setFormData({ ...formData, jobId: e.target.value })}
                  className="mt-1 block w-full px-3 py-2 border border-slate-300 rounded-lg text-sm text-slate-900 bg-white focus:ring-2 focus:ring-indigo-600"
                >
                  {jobs.map((j) => (
                    <option key={j.id} value={j.id}>
                      {j.title} ({j.companyName} • {j.packageLpa} LPA)
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider">
                  Accepted Package (LPA) *
                </label>
                <input
                  type="number"
                  step="0.01"
                  required
                  value={formData.packageLpa}
                  onChange={(e) => setFormData({ ...formData, packageLpa: e.target.value })}
                  placeholder="24.5"
                  className="mt-1 block w-full px-3 py-2 border border-slate-300 rounded-lg text-sm text-slate-900 focus:ring-2 focus:ring-indigo-600"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider">
                    Offer Extended Date *
                  </label>
                  <input
                    type="date"
                    required
                    value={formData.placedDate}
                    onChange={(e) => setFormData({ ...formData, placedDate: e.target.value })}
                    className="mt-1 block w-full px-3 py-2 border border-slate-300 rounded-lg text-sm text-slate-900 focus:ring-2 focus:ring-indigo-600"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider">
                    Expected Joining Date
                  </label>
                  <input
                    type="date"
                    value={formData.joiningDate}
                    onChange={(e) => setFormData({ ...formData, joiningDate: e.target.value })}
                    className="mt-1 block w-full px-3 py-2 border border-slate-300 rounded-lg text-sm text-slate-900 focus:ring-2 focus:ring-indigo-600"
                  />
                </div>
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
                  {saving ? 'Recording...' : 'Log Placement'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default PlacementsPage;
