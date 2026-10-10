import React, { useState, useEffect } from 'react';
import api from '../../api/axiosInstance';
import { useToast } from '../../context/ToastContext';
import {
  Users,
  Search,
  CheckCircle,
  XCircle,
  ChevronLeft,
  ChevronRight,
  Shield,
  FileText,
  Star,
} from 'lucide-react';

const StudentManagementPage = () => {
  const [students, setStudents] = useState([]);
  const [pageData, setPageData] = useState({ pageNo: 0, totalPages: 1, totalElements: 0 });
  const [query, setQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const { addToast } = useToast();

  useEffect(() => {
    fetchStudents(0);
  }, []);

  const fetchStudents = async (page = 0) => {
    setLoading(true);
    try {
      const params = { page, size: 10 };
      if (query.trim()) params.query = query.trim();
      const res = await api.get('/admin/students', { params });
      const data = res.data.data;
      setStudents(data.content || []);
      setPageData({
        pageNo: data.pageNo,
        totalPages: data.totalPages,
        totalElements: data.totalElements,
      });
    } catch (err) {
      addToast('Failed to load students', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleToggleStatus = async (studentId, currentActive) => {
    try {
      await api.patch(`/admin/students/${studentId}/status?active=${!currentActive}`);
      addToast(`Student account ${!currentActive ? 'activated' : 'deactivated'}`, 'success');
      setStudents((prev) =>
        prev.map((s) => (s.id === studentId ? { ...s, active: !currentActive } : s))
      );
    } catch (err) {
      addToast('Error updating student status', 'error');
    }
  };

  return (
    <div className="space-y-6">
      <div className="border-b border-slate-200 pb-4">
        <h1 className="text-2xl font-bold text-slate-900">Student Directory & Profiles</h1>
        <p className="text-sm text-slate-500">
          Manage enrolled students, evaluate cumulative CGPAs, verify resumes, and toggle active status
        </p>
      </div>

      {/* Search Header */}
      <div className="flex gap-3">
        <div className="flex-1 relative">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
            <Search className="w-4 h-4" />
          </div>
          <input
            type="text"
            placeholder="Search by student name, email, or department..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && fetchStudents(0)}
            className="w-full pl-9 pr-3 py-2 border border-slate-300 rounded-lg text-sm text-slate-900 focus:ring-2 focus:ring-indigo-600 focus:border-indigo-600"
          />
        </div>
        <button
          onClick={() => fetchStudents(0)}
          className="px-5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded-lg text-sm transition-colors cursor-pointer"
        >
          Search
        </button>
      </div>

      {/* Students Table */}
      <div className="bg-white rounded-xl border border-slate-200/90 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50/80 border-b border-slate-200 text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                <th className="py-3 px-4">Student</th>
                <th className="py-3 px-4">Department & Batch</th>
                <th className="py-3 px-4">CGPA</th>
                <th className="py-3 px-4">Skills</th>
                <th className="py-3 px-4">Placement</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-sm">
              {loading ? (
                <tr>
                  <td colSpan={7} className="text-center py-10 text-slate-400">
                    Loading student directory...
                  </td>
                </tr>
              ) : students.length === 0 ? (
                <tr>
                  <td colSpan={7} className="text-center py-10 text-slate-400">
                    No students found.
                  </td>
                </tr>
              ) : (
                students.map((student) => (
                  <tr key={student.id} className="hover:bg-slate-50/60 transition-colors">
                    <td className="py-3.5 px-4">
                      <div className="font-semibold text-slate-900">{student.name}</div>
                      <div className="text-xs text-slate-500">{student.email}</div>
                      {student.resumeUrl && (
                        <a
                          href={student.resumeUrl}
                          target="_blank"
                          rel="noreferrer"
                          className="inline-flex items-center gap-1 text-[11px] text-indigo-600 hover:underline mt-1"
                        >
                          <FileText className="w-3 h-3" /> View Resume
                        </a>
                      )}
                    </td>

                    <td className="py-3.5 px-4">
                      <div className="text-slate-800 text-xs font-medium">{student.department || 'N/A'}</div>
                      <div className="text-[11px] text-slate-500">Graduating: {student.graduationYear || '2026'}</div>
                    </td>

                    <td className="py-3.5 px-4">
                      <span className="font-bold text-slate-900">
                        {student.cgpa !== null ? student.cgpa : '—'}
                      </span>
                    </td>

                    <td className="py-3.5 px-4">
                      <div className="flex flex-wrap gap-1 max-w-[200px]">
                        {student.skills && student.skills.length > 0 ? (
                          student.skills.slice(0, 3).map((s) => (
                            <span
                              key={s.skillId}
                              className="text-[10px] bg-slate-100 text-slate-700 px-1.5 py-0.5 rounded font-medium"
                            >
                              {s.skillName}
                            </span>
                          ))
                        ) : (
                          <span className="text-xs text-slate-400">None</span>
                        )}
                        {student.skills && student.skills.length > 3 && (
                          <span className="text-[10px] text-slate-400 font-medium">
                            +{student.skills.length - 3}
                          </span>
                        )}
                      </div>
                    </td>

                    <td className="py-3.5 px-4">
                      {student.placed ? (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-bold bg-emerald-100 text-emerald-800">
                          Placed
                        </span>
                      ) : (
                        <span className="text-xs text-slate-400">Seeking</span>
                      )}
                    </td>

                    <td className="py-3.5 px-4">
                      <span
                        className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-bold ${
                          student.active
                            ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                            : 'bg-rose-50 text-rose-700 border border-rose-200'
                        }`}
                      >
                        {student.active ? 'Active' : 'Deactivated'}
                      </span>
                    </td>

                    <td className="py-3.5 px-4 text-right">
                      <button
                        onClick={() => handleToggleStatus(student.id, student.active)}
                        className={`text-xs font-semibold px-2.5 py-1 rounded transition-colors ${
                          student.active
                            ? 'text-rose-600 hover:bg-rose-50'
                            : 'text-emerald-600 hover:bg-emerald-50'
                        }`}
                      >
                        {student.active ? 'Deactivate' : 'Activate'}
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {pageData.totalPages > 1 && (
          <div className="p-4 border-t border-slate-100 flex items-center justify-between">
            <p className="text-xs text-slate-500">
              Showing {students.length} of {pageData.totalElements} students
            </p>
            <div className="flex gap-2">
              <button
                onClick={() => fetchStudents(pageData.pageNo - 1)}
                disabled={pageData.pageNo === 0}
                className="p-1.5 border border-slate-200 rounded hover:bg-slate-50 disabled:opacity-40"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <button
                onClick={() => fetchStudents(pageData.pageNo + 1)}
                disabled={pageData.pageNo >= pageData.totalPages - 1}
                className="p-1.5 border border-slate-200 rounded hover:bg-slate-50 disabled:opacity-40"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default StudentManagementPage;
