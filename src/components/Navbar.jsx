import React from 'react';
import { Video, Cpu, Activity, Zap, Clock, CheckCircle2 } from 'lucide-react';

export function Navbar({
  fps = 0,
  workerStatus = 'idle',
  workerLatencyMs = 0,
  motionState = { state: 'IDLE', pauseProgress: 0 }
}) {
  const getStatusBadge = () => {
    switch (workerStatus) {
      case 'ready':
        return {
          label: 'WebGL Holistic Ready',
          dotClass: 'bg-emerald-400 animate-pulse',
          badgeClass: 'border-emerald-500/30 bg-emerald-500/10 text-emerald-300'
        };
      case 'compiling':
      case 'loading':
        return {
          label: 'Compiling Shaders...',
          dotClass: 'bg-amber-400 animate-ping',
          badgeClass: 'border-amber-500/30 bg-amber-500/10 text-amber-300'
        };
      case 'error':
        return {
          label: 'Worker Error',
          dotClass: 'bg-rose-500',
          badgeClass: 'border-rose-500/30 bg-rose-500/10 text-rose-300'
        };
      default:
        return {
          label: 'Vision Engine Idle',
          dotClass: 'bg-slate-400',
          badgeClass: 'border-slate-700 bg-slate-800 text-slate-300'
        };
    }
  };

  const getMotionBadge = () => {
    switch (motionState.state) {
      case 'SIGNING_ACTIVE':
        return {
          icon: Zap,
          label: 'Signing Active',
          badgeClass: 'border-emerald-500/40 bg-emerald-500/20 text-emerald-300 shadow-sm shadow-emerald-500/20 animate-pulse',
          dotClass: 'bg-emerald-400'
        };
      case 'PAUSE_COUNTDOWN':
        const pct = Math.round((motionState.pauseProgress || 0) * 100);
        return {
          icon: Clock,
          label: `Pause (${pct}%)`,
          badgeClass: 'border-amber-500/40 bg-amber-500/20 text-amber-300',
          dotClass: 'bg-amber-400 animate-pulse'
        };
      case 'IDLE_COMMIT':
        return {
          icon: CheckCircle2,
          label: 'Sentence Ready',
          badgeClass: 'border-sky-500/40 bg-sky-500/20 text-sky-300 ring-1 ring-sky-400/50',
          dotClass: 'bg-sky-400'
        };
      default:
        return {
          icon: Activity,
          label: 'Idle Ready',
          badgeClass: 'border-slate-700/80 bg-slate-800/80 text-slate-400',
          dotClass: 'bg-slate-500'
        };
    }
  };

  const status = getStatusBadge();
  const motion = getMotionBadge();
  const MotionIcon = motion.icon;

  return (
    <header className="border-b border-slate-700/60 bg-slate-800/80 backdrop-blur-md sticky top-0 z-50 px-4 lg:px-8 py-3 transition-colors">
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        {/* Brand */}
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-emerald-500 to-sky-400 flex items-center justify-center shadow-lg shadow-emerald-500/20">
            <Video className="w-5 h-5 text-slate-950 font-bold" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="font-bold text-lg text-slate-100 tracking-tight">SignBridge ISL</h1>
              <span className="text-xs px-2 py-0.5 rounded-full bg-slate-700/80 text-sky-300 border border-slate-600 font-mono">
                Phase 2: Mathematical Core
              </span>
            </div>
            <p className="text-xs text-slate-400">Edge AI Indian Sign Language to Text Bridge</p>
          </div>
        </div>

        {/* Telemetry & Status Badges */}
        <div className="flex items-center gap-2.5">
          {/* Motion State Energy Pill */}
          <div className={`flex items-center gap-2 px-3 py-1.5 rounded-lg border text-xs font-medium transition-all ${motion.badgeClass}`}>
            <span className={`w-2 h-2 rounded-full ${motion.dotClass}`} />
            <MotionIcon className="w-3.5 h-3.5" />
            <span className="font-mono">{motion.label}</span>
          </div>

          {/* Worker Status Badge */}
          <div className={`hidden md:flex items-center gap-2 px-3 py-1.5 rounded-lg border text-xs font-medium ${status.badgeClass}`}>
            <span className={`w-2 h-2 rounded-full ${status.dotClass}`} />
            <Cpu className="w-3.5 h-3.5" />
            <span>{status.label}</span>
          </div>

          {/* FPS & Latency Meter */}
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg border border-slate-700 bg-slate-900/60 text-xs font-mono">
            <Activity className="w-3.5 h-3.5 text-emerald-400" />
            <span className="text-slate-300 font-semibold">{fps} FPS</span>
            {workerLatencyMs > 0 && (
              <>
                <span className="text-slate-600">|</span>
                <span className="text-sky-300">{workerLatencyMs}ms</span>
              </>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}

export default Navbar;
