import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import { Zap, Mail, Lock, ArrowRight } from 'lucide-react';
import { authApi } from '../services/api';
import { useAuth } from '../store/AuthContext';
import { Input, Button } from '../components/ui';

export default function LoginPage() {
  const [form, setForm] = useState({ email: '', password: '' });
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await authApi.login(form);
      login(res.data);
      navigate('/');
      toast.success(`Welcome back, ${res.data.user.name}!`);
    } catch (err) {
      toast.error(err.response?.data?.detail || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-ink-900 flex items-center justify-center p-4 relative overflow-hidden">
      {/* Background decoration */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[300px] bg-volt-400/4 blur-3xl rounded-full pointer-events-none" />
      <div className="absolute bottom-0 right-0 w-[400px] h-[400px] bg-blue-500/4 blur-3xl rounded-full pointer-events-none" />

      <div className="w-full max-w-md animate-fade-up">
        {/* Logo */}
        <div className="flex items-center justify-center gap-3 mb-10">
          <div className="w-10 h-10 rounded-xl bg-volt-400 flex items-center justify-center volt-glow">
            <Zap size={20} className="text-ink-900" fill="currentColor" />
          </div>
          <span className="text-2xl font-bold tracking-tight">
            Task<span className="text-volt-400">Flow</span>
          </span>
        </div>

        <div className="glass rounded-2xl p-8 border border-ink-600">
          <h1 className="text-2xl font-bold text-white mb-1">Welcome back</h1>
          <p className="text-ink-300 text-sm mb-8">Sign in to your workspace</p>

          <form onSubmit={handleSubmit} className="space-y-4">
            <Input
              label="Email"
              type="email"
              placeholder="you@example.com"
              value={form.email}
              onChange={e => setForm({ ...form, email: e.target.value })}
              required
            />
            <Input
              label="Password"
              type="password"
              placeholder="••••••••"
              value={form.password}
              onChange={e => setForm({ ...form, password: e.target.value })}
              required
            />

            <Button type="submit" loading={loading} className="w-full mt-2 py-3">
              Sign In <ArrowRight size={16} />
            </Button>
          </form>

          <p className="mt-6 text-center text-sm text-ink-300">
            No account?{' '}
            <Link to="/signup" className="text-volt-400 hover:text-volt-500 font-medium transition-colors">
              Create one
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
