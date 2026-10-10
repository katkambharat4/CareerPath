import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import {
  GraduationCap,
  LayoutDashboard,
  User,
  Sparkles,
  Briefcase,
  Calendar,
  Building2,
  Users,
  Award,
  LogOut,
  ChevronRight,
} from 'lucide-react';

const Sidebar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const studentLinks = [
    { name: 'Dashboard', path: '/student/dashboard', icon: LayoutDashboard },
    { name: 'My Profile', path: '/student/profile', icon: User },
    { name: 'Skills & Proficiencies', path: '/student/skills', icon: Sparkles },
    { name: 'Job Openings', path: '/student/jobs', icon: Briefcase },
    { name: 'Applications & Timeline', path: '/student/applications', icon: Calendar },
  ];

  const adminLinks = [
    { name: 'Analytics & Overview', path: '/admin/dashboard', icon: LayoutDashboard },
    { name: 'Student Directory', path: '/admin/students', icon: Users },
    { name: 'Company Partners', path: '/admin/companies', icon: Building2 },
    { name: 'Job Openings & Drives', path: '/admin/jobs', icon: Briefcase },
    { name: 'Application Reviews', path: '/admin/applications', icon: Calendar },
    { name: 'Placements Registry', path: '/admin/placements', icon: Award },
  ];

  const links = user?.role === 'ADMIN' ? adminLinks : studentLinks;

  return (
    <aside className="w-64 bg-slate-900 text-slate-200 flex flex-col shrink-0 min-h-screen border-r border-slate-800">
      {/* Brand Header */}
      <div className="p-5 border-b border-slate-800 flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-indigo-600 flex items-center justify-center text-white shadow-md shadow-indigo-500/20">
          <GraduationCap className="w-6 h-6" />
        </div>
        <div>
          <h1 className="font-bold text-lg text-white tracking-tight leading-none">CareerPath</h1>
          <p className="text-xs text-slate-400 mt-1">Placement & Career Hub</p>
        </div>
      </div>

      {/* Role Pill */}
      <div className="px-5 py-3 border-b border-slate-800/60 bg-slate-900/50">
        <div className="text-xs uppercase font-semibold text-slate-400 tracking-wider">Signed in as</div>
        <div className="flex items-center justify-between mt-1">
          <span className="text-sm font-medium text-white truncate max-w-[140px]">
            {user?.name || user?.email}
          </span>
          <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
            user?.role === 'ADMIN' ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30' : 'bg-indigo-500/20 text-indigo-300 border border-indigo-500/30'
          }`}>
            {user?.role}
          </span>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-3 space-y-1 overflow-y-auto">
        {links.map((link) => {
          const Icon = link.icon;
          return (
            <NavLink
              key={link.path}
              to={link.path}
              className={({ isActive }) =>
                `flex items-center gap-3 px-3.5 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                  isActive
                    ? 'bg-indigo-600 text-white shadow-sm'
                    : 'text-slate-400 hover:text-slate-100 hover:bg-slate-800/60'
                }`
              }
            >
              <Icon className="w-4 h-4 shrink-0" />
              <span>{link.name}</span>
            </NavLink>
          );
        })}
      </nav>

      {/* Logout Footer */}
      <div className="p-4 border-t border-slate-800">
        <button
          onClick={handleLogout}
          className="w-full flex items-center gap-3 px-3 py-2 text-sm font-medium text-rose-400 hover:text-rose-300 hover:bg-rose-500/10 rounded-lg transition-colors"
        >
          <LogOut className="w-4 h-4 shrink-0" />
          <span>Sign Out</span>
        </button>
      </div>
    </aside>
  );
};

export default Sidebar;
