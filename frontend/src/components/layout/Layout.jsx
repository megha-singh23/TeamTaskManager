import { Outlet, NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../../store/AuthContext';
import {
  LayoutDashboard, FolderKanban, LogOut, Zap, User, ChevronRight
} from 'lucide-react';

export default function Layout() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const navItems = [
    { to: '/', icon: LayoutDashboard, label: 'Dashboard', end: true },
    { to: '/projects', icon: FolderKanban, label: 'Projects' },
  ];

  return (
    <div className="flex h-screen overflow-hidden bg-ink-900">
      {/* Sidebar */}
      <aside className="w-64 flex flex-col border-r border-ink-700 bg-ink-800 relative">
        {/* Decorative gradient */}
        <div className="absolute top-0 left-0 right-0 h-40 bg-gradient-to-b from-volt-600/5 to-transparent pointer-events-none" />

        {/* Logo */}
        <div className="flex items-center gap-3 px-6 py-6">
          <div className="w-8 h-8 rounded-lg bg-volt-400 flex items-center justify-center volt-glow">
            <Zap size={16} className="text-ink-900" fill="currentColor" />
          </div>
          <span className="text-lg font-bold tracking-tight">
            Task<span className="text-volt-400">Flow</span>
          </span>
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-3 py-2 space-y-1">
          {navItems.map(({ to, icon: Icon, label, end }) => (
            <NavLink
              key={to}
              to={to}
              end={end}
              className={({ isActive }) =>
                `flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all duration-200 group
                ${isActive
                  ? 'bg-volt-400/10 text-volt-400 border border-volt-400/20'
                  : 'text-ink-200 hover:bg-ink-700 hover:text-white border border-transparent'
                }`
              }
            >
              {({ isActive }) => (
                <>
                  <Icon size={18} className={isActive ? 'text-volt-400' : 'text-ink-300 group-hover:text-white'} />
                  {label}
                  {isActive && <ChevronRight size={14} className="ml-auto text-volt-400/60" />}
                </>
              )}
            </NavLink>
          ))}
        </nav>

        {/* User section */}
        <div className="p-4 border-t border-ink-700">
          <div className="flex items-center gap-3 p-3 rounded-xl glass mb-2">
            <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-volt-400/20 to-blue-400/20 flex items-center justify-center border border-volt-400/15">
              <span className="text-sm font-bold text-volt-400">
                {user?.name?.[0]?.toUpperCase()}
              </span>
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-white truncate">{user?.name}</p>
              <p className="text-xs text-ink-300 truncate">{user?.email}</p>
            </div>
          </div>
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm text-ink-300 hover:text-red-400 hover:bg-red-400/8 transition-all duration-200 border border-transparent hover:border-red-400/15"
          >
            <LogOut size={16} />
            Sign Out
          </button>
        </div>
      </aside>

      {/* Main content */}
      <main className="flex-1 overflow-y-auto">
        <Outlet />
      </main>
    </div>
  );
}
