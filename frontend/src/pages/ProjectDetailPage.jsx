import { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import { projectsApi, tasksApi } from '../services/api';
import { useAuth } from '../store/AuthContext';
import { Plus, Users, ListChecks, Trash2, UserMinus, Crown, ChevronDown, Calendar, X } from 'lucide-react';
import { Modal, Input, Textarea, Select, Button, PriorityBadge, StatusBadge, Avatar } from '../components/ui';
import LoadingSpinner from '../components/ui/LoadingSpinner';
import { format, isPast } from 'date-fns';

const STATUSES = ['todo', 'in_progress', 'done'];
const STATUS_LABELS = { todo: 'To Do', in_progress: 'In Progress', done: 'Done' };

export default function ProjectDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();

  const [project, setProject] = useState(null);
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('tasks');

  // Task modal state
  const [showTaskModal, setShowTaskModal] = useState(false);
  const [editingTask, setEditingTask] = useState(null);
  const [taskForm, setTaskForm] = useState({ title: '', description: '', priority: 'medium', status: 'todo', due_date: '', assignee_id: '' });
  const [savingTask, setSavingTask] = useState(false);

  // Member modal state
  const [showMemberModal, setShowMemberModal] = useState(false);
  const [memberEmail, setMemberEmail] = useState('');
  const [addingMember, setAddingMember] = useState(false);

  const isAdmin = project?.members?.some(m => m.user.id === user?.id && m.role === 'admin');

  const loadAll = useCallback(async () => {
    try {
      const [projRes, taskRes] = await Promise.all([
        projectsApi.get(id),
        tasksApi.list(id),
      ]);
      setProject(projRes.data);
      setTasks(taskRes.data);
    } catch {
      toast.error('Failed to load project');
      navigate('/projects');
    } finally {
      setLoading(false);
    }
  }, [id, navigate]);

  useEffect(() => { loadAll(); }, [loadAll]);

  const openCreateTask = () => {
    setEditingTask(null);
    setTaskForm({ title: '', description: '', priority: 'medium', status: 'todo', due_date: '', assignee_id: '' });
    setShowTaskModal(true);
  };

  const openEditTask = (task) => {
    setEditingTask(task);
    setTaskForm({
      title: task.title,
      description: task.description || '',
      priority: task.priority,
      status: task.status,
      due_date: task.due_date ? task.due_date.slice(0, 16) : '',
      assignee_id: task.assignee?.id || '',
    });
    setShowTaskModal(true);
  };

  const handleSaveTask = async (e) => {
    e.preventDefault();
    setSavingTask(true);
    const payload = {
      ...taskForm,
      due_date: taskForm.due_date ? new Date(taskForm.due_date).toISOString() : null,
      assignee_id: taskForm.assignee_id ? parseInt(taskForm.assignee_id) : null,
    };
    try {
      if (editingTask) {
        const res = await tasksApi.update(editingTask.id, payload);
        setTasks(t => t.map(tk => tk.id === editingTask.id ? res.data : tk));
        toast.success('Task updated');
      } else {
        const res = await tasksApi.create(id, payload);
        setTasks(t => [res.data, ...t]);
        toast.success('Task created');
      }
      setShowTaskModal(false);
    } catch (err) {
      toast.error(err.response?.data?.detail || 'Failed to save task');
    } finally {
      setSavingTask(false);
    }
  };

  const handleDeleteTask = async (taskId) => {
    if (!window.confirm('Delete this task?')) return;
    try {
      await tasksApi.delete(taskId);
      setTasks(t => t.filter(tk => tk.id !== taskId));
      toast.success('Task deleted');
    } catch {
      toast.error('Failed to delete task');
    }
  };

  const handleStatusChange = async (task, newStatus) => {
    try {
      const res = await tasksApi.update(task.id, { status: newStatus });
      setTasks(t => t.map(tk => tk.id === task.id ? res.data : tk));
    } catch {
      toast.error('Failed to update status');
    }
  };

  const handleAddMember = async (e) => {
    e.preventDefault();
    setAddingMember(true);
    try {
      await projectsApi.addMember(id, { email: memberEmail, role: 'member' });
      toast.success('Member added');
      setMemberEmail('');
      setShowMemberModal(false);
      loadAll();
    } catch (err) {
      toast.error(err.response?.data?.detail || 'Failed to add member');
    } finally {
      setAddingMember(false);
    }
  };

  const handleRemoveMember = async (userId) => {
    if (!window.confirm('Remove this member?')) return;
    try {
      await projectsApi.removeMember(id, userId);
      toast.success('Member removed');
      loadAll();
    } catch (err) {
      toast.error(err.response?.data?.detail || 'Failed to remove member');
    }
  };

  if (loading) return <LoadingSpinner />;

  const tasksByStatus = STATUSES.reduce((acc, s) => {
    acc[s] = tasks.filter(t => t.status === s);
    return acc;
  }, {});

  const STATUS_COLUMN_COLORS = {
    todo: 'border-ink-500',
    in_progress: 'border-blue-500/30',
    done: 'border-volt-400/30',
  };

  return (
    <div className="p-8 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex items-start justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold text-white">{project.name}</h1>
          {project.description && <p className="text-ink-300 mt-1 max-w-xl">{project.description}</p>}
        </div>
        {isAdmin && (
          <div className="flex gap-2">
            <Button variant="ghost" onClick={() => setShowMemberModal(true)}>
              <Users size={15} /> Add Member
            </Button>
            <Button onClick={openCreateTask}>
              <Plus size={15} /> Add Task
            </Button>
          </div>
        )}
      </div>

      {/* Tabs */}
      <div className="flex gap-1 mb-6 bg-ink-800 rounded-xl p-1 w-fit border border-ink-700">
        {[['tasks', 'Tasks', ListChecks], ['members', 'Members', Users]].map(([tab, label, Icon]) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${
              activeTab === tab ? 'bg-ink-600 text-white shadow' : 'text-ink-400 hover:text-white'
            }`}
          >
            <Icon size={15} /> {label}
          </button>
        ))}
      </div>

      {/* Tasks tab - Kanban */}
      {activeTab === 'tasks' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
          {STATUSES.map(status => (
            <div key={status} className={`glass rounded-2xl border ${STATUS_COLUMN_COLORS[status]} overflow-hidden`}>
              <div className="flex items-center justify-between px-4 py-3 border-b border-ink-700">
                <div className="flex items-center gap-2">
                  <StatusBadge status={status} />
                  <span className="text-sm text-ink-400 font-mono">{tasksByStatus[status].length}</span>
                </div>
                {isAdmin && status === 'todo' && (
                  <button onClick={openCreateTask} className="p-1 rounded-lg hover:bg-ink-600 text-ink-400 hover:text-volt-400 transition-all">
                    <Plus size={15} />
                  </button>
                )}
              </div>

              <div className="p-3 space-y-3 min-h-[200px]">
                {tasksByStatus[status].map(task => {
                  const isOverdue = task.due_date && isPast(new Date(task.due_date)) && task.status !== 'done';
                  const canEdit = isAdmin || task.assignee?.id === user?.id;
                  return (
                    <div
                      key={task.id}
                      onClick={() => canEdit && openEditTask(task)}
                      className={`bg-ink-800 rounded-xl p-4 border border-ink-700 group transition-all ${canEdit ? 'cursor-pointer hover:border-ink-500 hover:-translate-y-0.5' : ''}`}
                    >
                      <div className="flex items-start justify-between gap-2 mb-2">
                        <p className="text-sm font-semibold text-white leading-snug flex-1">{task.title}</p>
                        {isAdmin && (
                          <button
                            onClick={e => { e.stopPropagation(); handleDeleteTask(task.id); }}
                            className="opacity-0 group-hover:opacity-100 p-1 rounded hover:bg-red-400/15 text-ink-500 hover:text-red-400 transition-all shrink-0"
                          >
                            <Trash2 size={13} />
                          </button>
                        )}
                      </div>

                      {task.description && (
                        <p className="text-xs text-ink-400 mb-3 line-clamp-2">{task.description}</p>
                      )}

                      <div className="flex flex-wrap gap-1.5 mb-3">
                        <PriorityBadge priority={task.priority} />
                      </div>

                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          {task.assignee && <Avatar name={task.assignee.name} size="sm" />}
                          <span className="text-xs text-ink-400">{task.assignee?.name || 'Unassigned'}</span>
                        </div>
                        {task.due_date && (
                          <span className={`text-xs flex items-center gap-1 ${isOverdue ? 'text-red-400' : 'text-ink-400'}`}>
                            <Calendar size={11} />
                            {format(new Date(task.due_date), 'MMM d')}
                          </span>
                        )}
                      </div>

                      {/* Quick status change for member */}
                      {!isAdmin && task.assignee?.id === user?.id && (
                        <div className="mt-3 pt-3 border-t border-ink-700">
                          <select
                            value={task.status}
                            onChange={e => { e.stopPropagation(); handleStatusChange(task, e.target.value); }}
                            onClick={e => e.stopPropagation()}
                            className="w-full bg-ink-700 border border-ink-600 rounded-lg px-2 py-1 text-xs text-white focus:outline-none"
                          >
                            {STATUSES.map(s => <option key={s} value={s}>{STATUS_LABELS[s]}</option>)}
                          </select>
                        </div>
                      )}
                    </div>
                  );
                })}
                {tasksByStatus[status].length === 0 && (
                  <div className="text-center py-8 text-ink-600 text-xs">No tasks</div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Members tab */}
      {activeTab === 'members' && (
        <div className="glass rounded-2xl border border-ink-600 overflow-hidden">
          <div className="divide-y divide-ink-800">
            {project.members?.map(member => (
              <div key={member.id} className="flex items-center gap-4 px-6 py-4 hover:bg-ink-700/20 transition-colors">
                <Avatar name={member.user.name} />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-white">{member.user.name}</p>
                  <p className="text-xs text-ink-400">{member.user.email}</p>
                </div>
                <div className="flex items-center gap-3">
                  <span className={`px-2 py-0.5 rounded-md text-xs font-semibold flex items-center gap-1 ${
                    member.role === 'admin' ? 'bg-volt-400/12 text-volt-400 border border-volt-400/25' : 'bg-ink-600 text-ink-300'
                  }`}>
                    {member.role === 'admin' && <Crown size={11} />}
                    {member.role}
                  </span>
                  {isAdmin && member.user.id !== user?.id && (
                    <button
                      onClick={() => handleRemoveMember(member.user.id)}
                      className="p-1.5 rounded-lg hover:bg-red-400/15 text-ink-400 hover:text-red-400 transition-all"
                    >
                      <UserMinus size={15} />
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Task Modal */}
      <Modal open={showTaskModal} onClose={() => setShowTaskModal(false)} title={editingTask ? 'Edit Task' : 'Create Task'}>
        <form onSubmit={handleSaveTask} className="space-y-4">
          <Input
            label="Title"
            placeholder="Task title"
            value={taskForm.title}
            onChange={e => setTaskForm({ ...taskForm, title: e.target.value })}
            required
          />
          <Textarea
            label="Description"
            placeholder="Task details..."
            rows={3}
            value={taskForm.description}
            onChange={e => setTaskForm({ ...taskForm, description: e.target.value })}
          />
          <div className="grid grid-cols-2 gap-3">
            <Select
              label="Priority"
              value={taskForm.priority}
              onChange={e => setTaskForm({ ...taskForm, priority: e.target.value })}
            >
              <option value="low">Low</option>
              <option value="medium">Medium</option>
              <option value="high">High</option>
              <option value="urgent">Urgent</option>
            </Select>
            <Select
              label="Status"
              value={taskForm.status}
              onChange={e => setTaskForm({ ...taskForm, status: e.target.value })}
              disabled={!isAdmin && editingTask && editingTask.assignee?.id !== user?.id}
            >
              {STATUSES.map(s => <option key={s} value={s}>{STATUS_LABELS[s]}</option>)}
            </Select>
          </div>
          {isAdmin && (
            <Select
              label="Assign To"
              value={taskForm.assignee_id}
              onChange={e => setTaskForm({ ...taskForm, assignee_id: e.target.value })}
            >
              <option value="">Unassigned</option>
              {project.members?.map(m => (
                <option key={m.user.id} value={m.user.id}>{m.user.name}</option>
              ))}
            </Select>
          )}
          <Input
            label="Due Date"
            type="datetime-local"
            value={taskForm.due_date}
            onChange={e => setTaskForm({ ...taskForm, due_date: e.target.value })}
          />
          <div className="flex gap-3 pt-2">
            <Button type="button" variant="ghost" onClick={() => setShowTaskModal(false)} className="flex-1">Cancel</Button>
            <Button type="submit" loading={savingTask} className="flex-1">{editingTask ? 'Save Changes' : 'Create Task'}</Button>
          </div>
        </form>
      </Modal>

      {/* Add Member Modal */}
      <Modal open={showMemberModal} onClose={() => setShowMemberModal(false)} title="Add Member">
        <form onSubmit={handleAddMember} className="space-y-4">
          <Input
            label="Member's Email"
            type="email"
            placeholder="colleague@example.com"
            value={memberEmail}
            onChange={e => setMemberEmail(e.target.value)}
            required
          />
          <p className="text-xs text-ink-400">The user must already have a TaskFlow account.</p>
          <div className="flex gap-3 pt-2">
            <Button type="button" variant="ghost" onClick={() => setShowMemberModal(false)} className="flex-1">Cancel</Button>
            <Button type="submit" loading={addingMember} className="flex-1">Add Member</Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
