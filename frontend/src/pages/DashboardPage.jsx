import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { dashboardApi } from '../services/api';
import { PieChart, Pie, Cell, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip } from 'recharts';
import { CheckCircle2, Clock, AlertTriangle, FolderOpen, Users, TrendingUp, ArrowRight } from 'lucide-react';
import { StatusBadge, PriorityBadge, Avatar } from '../components/ui';
import LoadingSpinner from '../components/ui/LoadingSpinner';
import { format, isPast } from 'date-fns';

const STATUS_COLORS = { todo: '#9898c8', in_progress: '#57aaff', done: '#c8ff57' };

export default function DashboardPage() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    dashboardApi.get()
      .then(res => setStats(res.data))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <LoadingSpinner />;

  const statusData = stats ? [
    { name: 'To Do', value: stats.tasks_by_status.todo, color: STATUS_COLORS.todo },
    { name: 'In Progress', value: stats.tasks_by_status.in_progress, color: STATUS_COLORS.in_progress },
    { name: 'Done', value: stats.tasks_by_status.done, color: STATUS_COLORS.done },
  ] : [];

  const userBarData = stats?.tasks_per_user?.map(u => ({
    name: u.user.name.split(' ')[0],
    tasks: u.count,
  })) || [];

  const summaryCards = [
    { label: 'Total Tasks', value: stats?.total_tasks || 0, icon: TrendingUp, color: 'text-volt-400', bg: 'bg-volt-400/10 border-volt-400/15' },
    { label: 'In Progress', value: stats?.tasks_by_status?.in_progress || 0, icon: Clock, color: 'text-blue-400', bg: 'bg-blue-400/10 border-blue-400/15' },
    { label: 'Overdue', value: stats?.overdue_tasks || 0, icon: AlertTriangle, color: 'text-red-400', bg: 'bg-red-400/10 border-red-400/15' },
    { label: 'Projects', value: stats?.total_projects || 0, icon: FolderOpen, color: 'text-purple-400', bg: 'bg-purple-400/10 border-purple-400/15' },
  ];

  return (
    <div className="p-8 max-w-7xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-white">Dashboard</h1>
        <p className="text-ink-300 mt-1">Here's what's happening across your projects</p>
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {summaryCards.map(({ label, value, icon: Icon, color, bg }) => (
          <div key={label} className={`glass rounded-2xl p-5 border ${bg} glass-hover transition-all`}>
            <div className="flex items-center justify-between mb-3">
              <span className="text-ink-300 text-sm font-medium">{label}</span>
              <div className={`w-8 h-8 rounded-lg ${bg} flex items-center justify-center`}>
                <Icon size={16} className={color} />
              </div>
            </div>
            <p className={`text-3xl font-bold ${color}`}>{value}</p>
          </div>
        ))}
      </div>

      {/* Charts row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        {/* Donut chart */}
        <div className="glass rounded-2xl p-6 border border-ink-600">
          <h2 className="text-base font-semibold text-white mb-5">Tasks by Status</h2>
          {stats?.total_tasks > 0 ? (
            <div className="flex items-center gap-6">
              <ResponsiveContainer width="50%" height={180}>
                <PieChart>
                  <Pie data={statusData} cx="50%" cy="50%" innerRadius={50} outerRadius={80} paddingAngle={3} dataKey="value">
                    {statusData.map((entry, i) => (
                      <Cell key={i} fill={entry.color} />
                    ))}
                  </Pie>
                </PieChart>
              </ResponsiveContainer>
              <div className="space-y-3">
                {statusData.map(({ name, value, color }) => (
                  <div key={name} className="flex items-center gap-3">
                    <div className="w-3 h-3 rounded-full" style={{ background: color }} />
                    <span className="text-sm text-ink-200">{name}</span>
                    <span className="text-sm font-bold text-white ml-auto pl-4">{value}</span>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className="flex items-center justify-center h-44 text-ink-400 text-sm">No tasks yet</div>
          )}
        </div>

        {/* Bar chart */}
        <div className="glass rounded-2xl p-6 border border-ink-600">
          <h2 className="text-base font-semibold text-white mb-5">Tasks per Member</h2>
          {userBarData.length > 0 ? (
            <ResponsiveContainer width="100%" height={180}>
              <BarChart data={userBarData} barSize={28}>
                <XAxis dataKey="name" tick={{ fill: '#9898c8', fontSize: 12 }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fill: '#9898c8', fontSize: 12 }} axisLine={false} tickLine={false} width={30} />
                <Tooltip
                  contentStyle={{ background: '#1e1e3f', border: '1px solid rgba(200,255,87,0.15)', borderRadius: 8, color: '#e8e8f0' }}
                  cursor={{ fill: 'rgba(200,255,87,0.04)' }}
                />
                <Bar dataKey="tasks" fill="#c8ff57" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div className="flex items-center justify-center h-44 text-ink-400 text-sm">No assigned tasks</div>
          )}
        </div>
      </div>

      {/* Recent tasks */}
      <div className="glass rounded-2xl border border-ink-600 overflow-hidden">
        <div className="flex items-center justify-between px-6 py-4 border-b border-ink-700">
          <h2 className="text-base font-semibold text-white">Recent Tasks</h2>
          <Link to="/projects" className="text-sm text-volt-400 hover:text-volt-500 flex items-center gap-1 transition-colors">
            View all <ArrowRight size={14} />
          </Link>
        </div>
        {stats?.recent_tasks?.length > 0 ? (
          <div className="divide-y divide-ink-800">
            {stats.recent_tasks.map(task => (
              <div key={task.id} className="flex items-center gap-4 px-6 py-4 hover:bg-ink-700/30 transition-colors">
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-white truncate">{task.title}</p>
                  <p className="text-xs text-ink-400 mt-0.5">
                    {task.due_date && (
                      <span className={isPast(new Date(task.due_date)) && task.status !== 'done' ? 'text-red-400' : ''}>
                        Due {format(new Date(task.due_date), 'MMM d')} ·{' '}
                      </span>
                    )}
                    {task.assignee ? `Assigned to ${task.assignee.name}` : 'Unassigned'}
                  </p>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <PriorityBadge priority={task.priority} />
                  <StatusBadge status={task.status} />
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="py-16 text-center text-ink-400 text-sm">No tasks yet. Create a project and add tasks!</div>
        )}
      </div>
    </div>
  );
}
