import React, { useState, useEffect } from 'react';
import api from '../../api/axiosInstance';
import { useToast } from '../../context/ToastContext';
import { Sparkles, Plus, Trash2, Tag } from 'lucide-react';

const SkillsPage = () => {
  const [skills, setSkills] = useState([]);
  const [loading, setLoading] = useState(true);
  const [skillName, setSkillName] = useState('');
  const [proficiency, setProficiency] = useState('INTERMEDIATE');
  const [adding, setAdding] = useState(false);
  const { addToast } = useToast();

  useEffect(() => {
    fetchSkills();
  }, []);

  const fetchSkills = async () => {
    try {
      const res = await api.get('/student/skills');
      setSkills(res.data.data || []);
    } catch (err) {
      addToast('Failed to fetch skills', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleAddSkill = async (e) => {
    e.preventDefault();
    if (!skillName.trim()) return;

    setAdding(true);
    try {
      const res = await api.post('/student/skills', {
        skillName: skillName.trim(),
        proficiency,
      });
      addToast(`Skill "${res.data.data.skillName}" added!`, 'success');
      setSkillName('');
      fetchSkills();
    } catch (err) {
      addToast(err.response?.data?.message || 'Error adding skill', 'error');
    } finally {
      setAdding(false);
    }
  };

  const handleRemoveSkill = async (skillId, name) => {
    try {
      await api.delete(`/student/skills/${skillId}`);
      addToast(`Removed ${name}`, 'success');
      setSkills((prev) => prev.filter((s) => s.skillId !== skillId));
    } catch (err) {
      addToast('Error removing skill', 'error');
    }
  };

  const getProficiencyBadge = (level) => {
    switch (level) {
      case 'ADVANCED':
        return 'bg-emerald-100 text-emerald-800 border-emerald-200';
      case 'INTERMEDIATE':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      default:
        return 'bg-slate-100 text-slate-800 border-slate-200';
    }
  };

  return (
    <div className="max-w-4xl space-y-6">
      <div className="border-b border-slate-200 pb-4">
        <h1 className="text-2xl font-bold text-slate-900">Skills & Tech Stack</h1>
        <p className="text-sm text-slate-500">
          Tag languages, tools, and frameworks with your proficiency to match recruiter job requirements
        </p>
      </div>

      {/* Add Skill Form */}
      <div className="bg-white rounded-xl border border-slate-200/80 shadow-sm p-6">
        <h2 className="text-sm font-bold text-slate-800 uppercase tracking-wider mb-4 flex items-center gap-2">
          <Plus className="w-4 h-4 text-indigo-600" />
          Add Skill to Profile
        </h2>

        <form onSubmit={handleAddSkill} className="flex flex-col sm:flex-row gap-3">
          <div className="flex-1">
            <input
              type="text"
              required
              placeholder="e.g. Java, React, Docker, Spring Boot"
              value={skillName}
              onChange={(e) => setSkillName(e.target.value)}
              className="w-full px-3 py-2.5 border border-slate-300 rounded-lg text-sm text-slate-900 focus:ring-2 focus:ring-indigo-600 focus:border-indigo-600"
            />
          </div>

          <div className="sm:w-48">
            <select
              value={proficiency}
              onChange={(e) => setProficiency(e.target.value)}
              className="w-full px-3 py-2.5 border border-slate-300 rounded-lg text-sm text-slate-900 bg-white focus:ring-2 focus:ring-indigo-600 focus:border-indigo-600"
            >
              <option value="BEGINNER">BEGINNER</option>
              <option value="INTERMEDIATE">INTERMEDIATE</option>
              <option value="ADVANCED">ADVANCED</option>
            </select>
          </div>

          <button
            type="submit"
            disabled={adding}
            className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded-lg text-sm transition-colors shadow-sm disabled:opacity-50 cursor-pointer flex items-center justify-center gap-1.5"
          >
            <Plus className="w-4 h-4" />
            <span>{adding ? 'Adding...' : 'Add Skill'}</span>
          </button>
        </form>
      </div>

      {/* Skills List */}
      <div className="bg-white rounded-xl border border-slate-200/80 shadow-sm p-6">
        <h2 className="text-sm font-bold text-slate-800 uppercase tracking-wider mb-4 flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-indigo-600" />
          Configured Skills ({skills.length})
        </h2>

        {loading ? (
          <div className="py-8 text-center text-slate-400 text-sm">Loading skills...</div>
        ) : skills.length === 0 ? (
          <div className="py-10 text-center">
            <Tag className="w-10 h-10 text-slate-300 mx-auto mb-2" />
            <p className="text-sm text-slate-500">No skills added yet.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
            {skills.map((item) => (
              <div
                key={item.skillId}
                className="flex items-center justify-between p-3 rounded-lg border border-slate-200 bg-slate-50/50 hover:bg-slate-50 transition-colors"
              >
                <div>
                  <h4 className="text-sm font-semibold text-slate-900">{item.skillName}</h4>
                  <span
                    className={`inline-block mt-1 text-[10px] font-bold uppercase px-2 py-0.5 rounded border ${getProficiencyBadge(
                      item.proficiency
                    )}`}
                  >
                    {item.proficiency}
                  </span>
                </div>
                <button
                  onClick={() => handleRemoveSkill(item.skillId, item.skillName)}
                  title="Remove skill"
                  className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-md transition-colors"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default SkillsPage;
