import { Zap } from 'lucide-react';

export default function LoadingSpinner({ fullscreen = false }) {
  if (fullscreen) {
    return (
      <div className="fixed inset-0 bg-ink-900 flex items-center justify-center z-50">
        <div className="flex flex-col items-center gap-4">
          <div className="relative">
            <div className="w-14 h-14 rounded-2xl bg-volt-400/10 border border-volt-400/20 flex items-center justify-center">
              <Zap size={24} className="text-volt-400" fill="currentColor" />
            </div>
            <div className="absolute inset-0 rounded-2xl border-2 border-volt-400/40 animate-ping" />
          </div>
          <p className="text-ink-300 text-sm font-medium">Loading TaskFlow...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex items-center justify-center py-16">
      <div className="w-8 h-8 border-2 border-ink-600 border-t-volt-400 rounded-full animate-spin" />
    </div>
  );
}
