import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import { projectsApi } from '../services/api';
import { Plus, FolderKanban, Users, CheckSquare, ArrowRight, Trash2 } from 'lucide-react';
import { Modal, Input, Textarea, Button } from '../components/ui';
import LoadingSpinner from '../components/ui/LoadingSpinner';
import { format } from 'date-fns';
import { useAuth } from '../store/AuthContext';

export default function ProjectsPage() {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showCreate, setShowCreate] = useState(false);
  const [form, setForm] = useState({ name: '', description: '' });
  const [creating, setCreating] = useState(false);
  const { user } = useAuth();
  const navigate = useNavigate();

  const loadProjects = () => {
    projectsApi.list()
      .then(res => setProjects(res.data))
      .catch(() => toast.error('Failed to load projects'))
      .finally(() => setLoading(false));
  };

  useEffect(() => { loadProjects(); }, []);

  const handleCreate = async (e) => {
    e.preventDefault();
    setCreating(true);
    try {
      const res = await projectsApi.create(form);
      setProjects(p => [res.data, ...p]);
      setShowCreate(false);
      setForm({ name: '', description: '' });
      toast.success('Project created!');
      navigate(`/projects/${res.data.id}`);
    } catch (err) {
      toast.error(err.response?.data?.detail || 'Failed to create project');
    } finally {
      setCreating(false);
    }
  };

  const handleDelete = async (e, id) => {
    e.preventDefault();
    e.stopPropagation();
    if (!window.confirm('Delete this project? This cannot be undone.')) return;
    try {
      await projectsApi.delete(id);
      setProjects(p => p.filter(proj => proj.id !== id));
      toast.success('Project deleted');
    } catch {
      toast.error('Failed to delete project');
    }
  };

  if (loading) return <LoadingSpinner />;

  return (
    <div className="p-8 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-white">Projects</h1>
          <p className="text-ink-300 mt-1">{projects.length} project{projects.length !== 1 ? 's' : ''}</p>
        </div>
        <Button onClick={() => setShowCreate(true)} className="gap-2">
          <Plus size={16} /> New Project
        </Button>
      </div>

      {/* Grid */}
      {projects.length === 0 ? (
        <div className="text-center py-24">
          <FolderKanban size={48} className="text-ink-600 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-white mb-2">No projects yet</h3>
          <p className="text-ink-400 text-sm mb-6">Create your first project to start managing tasks</p>
          <Button onClick={() => setShowCreate(true)}><Plus size={16} /> Create Project</Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {projects.map((project, i) => {
            const isAdmin = project.members?.some(m => m.user.id === user?.id && m.role === 'admin');
            return (
              <Link
                key={project.id}
                to={`/projects/${project.id}`}
                className="glass glass-hover rounded-2xl p-6 border border-ink-600 group transition-all duration-200 hover:-translate-y-0.5 animate-fade-up block"
                style={{ animationDelay: `${i * 60}ms`, animationFillMode: 'both', opacity: 0 }}
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-volt-400/20 to-blue-400/20 border border-volt-400/15 flex items-center justify-center">
                    <FolderKanban size={18} className="text-volt-400" />
                  </div>
                  <div className="flex items-center gap-1">
                    {isAdmin && (
                      <button
                        onClick={(e) => handleDelete(e, project.id)}
                        className="opacity-0 group-hover:opacity-100 p-1.5 rounded-lg hover:bg-red-400/15 text-ink-400 hover:text-red-400 transition-all"
                      >
                        <Trash2 size={14} />
                      </button>
                    )}
                    <span className={`px-2 py-0.5 rounded-md text-xs font-semibold ${isAdmin ? 'bg-volt-400/12 text-volt-400 border border-volt-400/25' : 'bg-ink-600 text-ink-300'}`}>
                      {isAdmin ? 'Admin' : 'Member'}
                    </span>
                  </div>
                </div>

                <h3 className="text-base font-bold text-white mb-1 group-hover:text-volt-400 transition-colors">{project.name}</h3>
                {project.description && (
                  <p className="text-sm text-ink-300 mb-4 line-clamp-2">{project.description}</p>
                )}

                <div className="flex items-center gap-4 text-xs text-ink-400 mt-4 pt-4 border-t border-ink-700">
                  <span className="flex items-center gap-1.5"><Users size={13} />{project.members?.length || 0} members</span>
                  <span className="flex items-center gap-1.5"><CheckSquare size={13} />{project.task_count || 0} tasks</span>
                  <ArrowRight size={14} className="ml-auto opacity-0 group-hover:opacity-100 text-volt-400 transition-opacity" />
                </div>
              </Link>
            );
          })}
        </div>
      )}

      {/* Create Modal */}
      <Modal open={showCreate} onClose={() => setShowCreate(false)} title="Create Project">
        <form onSubmit={handleCreate} className="space-y-4">
          <Input
            label="Project Name"
            placeholder="e.g. Website Redesign"
            value={form.name}
            onChange={e => setForm({ ...form, name: e.target.value })}
            required
          />
          <Textarea
            label="Description (optional)"
            placeholder="What's this project about?"
            rows={3}
            value={form.description}
            onChange={e => setForm({ ...form, description: e.target.value })}
          />
          <div className="flex gap-3 pt-2">
            <Button type="button" variant="ghost" onClick={() => setShowCreate(false)} className="flex-1">Cancel</Button>
            <Button type="submit" loading={creating} className="flex-1">Create Project</Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
