import React, { useState, useEffect } from 'react';
import api from '../../api/axiosInstance';
import { useToast } from '../../context/ToastContext';
import {
  Building2,
  Plus,
  Edit2,
  Trash2,
  Globe,
  MapPin,
  Briefcase,
  X,
  Search,
} from 'lucide-react';

const CompanyManagementPage = () => {
  const [companies, setCompanies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    industry: '',
    location: '',
    website: '',
    description: '',
  });
  const [saving, setSaving] = useState(false);
  const { addToast } = useToast();

  useEffect(() => {
    fetchCompanies();
  }, []);

  const fetchCompanies = async () => {
    setLoading(true);
    try {
      const res = await api.get('/admin/companies', { params: { query: query.trim(), size: 20 } });
      setCompanies(res.data.data.content || []);
    } catch (err) {
      addToast('Failed to load companies', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleOpenModal = (company = null) => {
    if (company) {
      setEditingId(company.id);
      setFormData({
        name: company.name,
        industry: company.industry || '',
        location: company.location || '',
        website: company.website || '',
        description: company.description || '',
      });
    } else {
      setEditingId(null);
      setFormData({
        name: '',
        industry: '',
        location: '',
        website: '',
        description: '',
      });
    }
    setModalOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      if (editingId) {
        await api.put(`/admin/companies/${editingId}`, formData);
        addToast('Company updated successfully', 'success');
      } else {
        await api.post('/admin/companies', formData);
        addToast('Company added successfully', 'success');
      }
      setModalOpen(false);
      fetchCompanies();
    } catch (err) {
      addToast(err.response?.data?.message || 'Error saving company', 'error');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id, name) => {
    if (!window.confirm(`Are you sure you want to remove "${name}" and all its job drives?`)) return;
    try {
      await api.delete(`/admin/companies/${id}`);
      addToast('Company deleted', 'success');
      setCompanies((prev) => prev.filter((c) => c.id !== id));
    } catch (err) {
      addToast('Failed to delete company', 'error');
    }
  };

  return (
    <div className="space-y-6">
      <div className="border-b border-slate-200 pb-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Corporate Partners & Companies</h1>
          <p className="text-sm text-slate-500">
            Maintain campus recruiter profiles, industry sectors, and links
          </p>
        </div>
        <button
          onClick={() => handleOpenModal()}
          className="flex items-center gap-2 px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded-lg text-xs shadow-sm transition-colors cursor-pointer"
        >
          <Plus className="w-4 h-4" /> Add Company Partner
        </button>
      </div>

      {/* Grid */}
      {loading ? (
        <div className="py-16 text-center text-slate-400 text-sm">Loading corporate partners...</div>
      ) : companies.length === 0 ? (
        <div className="bg-white p-12 text-center rounded-xl border border-slate-200">
          <Building2 className="w-12 h-12 text-slate-300 mx-auto mb-2" />
          <h3 className="text-base font-semibold text-slate-700">No companies found</h3>
          <p className="text-xs text-slate-500 mt-1">Add your first campus recruiting partner.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {companies.map((c) => (
            <div
              key={c.id}
              className="bg-white rounded-xl border border-slate-200/90 shadow-sm p-5 flex flex-col justify-between"
            >
              <div>
                <div className="flex items-start justify-between gap-2">
                  <h3 className="font-bold text-slate-900 text-base">{c.name}</h3>
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => handleOpenModal(c)}
                      className="p-1.5 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded"
                    >
                      <Edit2 className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleDelete(c.id, c.name)}
                      className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                <div className="mt-2 space-y-1 text-xs text-slate-600">
                  {c.industry && (
                    <div className="font-medium text-indigo-700 bg-indigo-50 inline-block px-2 py-0.5 rounded">
                      {c.industry}
                    </div>
                  )}
                  {c.location && (
                    <div className="flex items-center gap-1.5 text-slate-500 pt-1">
                      <MapPin className="w-3.5 h-3.5" />
                      <span>{c.location}</span>
                    </div>
                  )}
                  {c.website && (
                    <div className="flex items-center gap-1.5 pt-0.5">
                      <Globe className="w-3.5 h-3.5 text-slate-400" />
                      <a
                        href={c.website}
                        target="_blank"
                        rel="noreferrer"
                        className="text-indigo-600 hover:underline truncate"
                      >
                        {c.website}
                      </a>
                    </div>
                  )}
                </div>

                {c.description && (
                  <p className="mt-3 text-xs text-slate-600 line-clamp-3 leading-relaxed">
                    {c.description}
                  </p>
                )}
              </div>

              <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
                <span className="flex items-center gap-1 font-medium">
                  <Briefcase className="w-3.5 h-3.5 text-slate-400" />
                  {c.totalJobs} drives posted
                </span>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full shadow-2xl border border-slate-200 overflow-hidden animate-scale-up">
            <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
              <h3 className="font-bold text-slate-900 text-base">
                {editingId ? 'Edit Company Partner' : 'Add New Company Partner'}
              </h3>
              <button onClick={() => setModalOpen(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider">
                  Company Name *
                </label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="e.g. Google India"
                  className="mt-1 block w-full px-3 py-2 border border-slate-300 rounded-lg text-sm text-slate-900 focus:ring-2 focus:ring-indigo-600"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider">
                    Industry Sector
                  </label>
                  <input
                    type="text"
                    value={formData.industry}
                    onChange={(e) => setFormData({ ...formData, industry: e.target.value })}
                    placeholder="e.g. Cloud & AI"
                    className="mt-1 block w-full px-3 py-2 border border-slate-300 rounded-lg text-sm text-slate-900 focus:ring-2 focus:ring-indigo-600"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider">
                    Location / Office
                  </label>
                  <input
                    type="text"
                    value={formData.location}
                    onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                    placeholder="Bangalore, India"
                    className="mt-1 block w-full px-3 py-2 border border-slate-300 rounded-lg text-sm text-slate-900 focus:ring-2 focus:ring-indigo-600"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider">
                  Official Website
                </label>
                <input
                  type="url"
                  value={formData.website}
                  onChange={(e) => setFormData({ ...formData, website: e.target.value })}
                  placeholder="https://careers.company.com"
                  className="mt-1 block w-full px-3 py-2 border border-slate-300 rounded-lg text-sm text-slate-900 focus:ring-2 focus:ring-indigo-600"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider">
                  Overview / Description
                </label>
                <textarea
                  rows={3}
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Company background and campus recruitment domains..."
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
                  {saving ? 'Saving...' : 'Save Company'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default CompanyManagementPage;
