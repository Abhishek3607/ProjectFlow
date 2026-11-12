import Link from 'next/link';
import { ArrowRight, Layers, ShieldCheck, Zap } from 'lucide-react';

export default function Home() {
  return (
    <div className="min-h-screen bg-[#0e0e10] text-[#ededed] flex flex-col justify-between selection:bg-neutral-800 selection:text-white">
      {/* Top Navbar */}
      <header className="h-14 border-b border-[#222225] px-6 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-5 h-5 rounded bg-white flex items-center justify-center text-black font-bold text-xs">
            P
          </div>
          <span className="font-semibold text-sm tracking-tight text-[#ededed]">ProjectFlow</span>
        </div>
        <div className="flex items-center gap-4 text-xs font-medium">
          <Link href="/login" className="text-neutral-400 hover:text-white transition-colors">
            Sign In
          </Link>
          <Link
            href="/register"
            className="bg-[#ededed] text-black px-3 py-1.5 rounded-md hover:bg-white transition-colors font-semibold"
          >
            Get Started
          </Link>
        </div>
      </header>

      {/* Hero Section */}
      <main className="flex-1 flex flex-col items-center justify-center px-6 text-center max-w-4xl mx-auto my-16">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-[#26262a] bg-[#161619] text-xs text-neutral-400 mb-8">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
          <span>v1.0 Milestone 0 Active</span>
        </div>

        <h1 className="text-4xl md:text-6xl font-semibold tracking-tight text-white mb-6">
          The central nervous system for engineering teams.
        </h1>
        <p className="text-neutral-400 text-base md:text-lg max-w-2xl font-normal leading-relaxed mb-8">
          Manage issues, cycles, and releases with a keyboard-first, Linear-inspired workspace built for speed and clarity.
        </p>

        <div className="flex items-center gap-3">
          <Link
            href="/register"
            className="inline-flex items-center gap-2 bg-white text-black px-4 py-2 rounded-md font-medium text-sm hover:bg-neutral-200 transition-colors"
          >
            Launch Workspace <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        {/* Feature Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-20 text-left w-full">
          <div className="p-5 rounded-lg border border-[#222225] bg-[#141416]/60">
            <Layers className="w-5 h-5 text-neutral-400 mb-3" />
            <h3 className="text-sm font-semibold text-white mb-1">Issue Tracking</h3>
            <p className="text-xs text-neutral-400 leading-relaxed">
              Fast, drag-and-drop Kanban and list views with multi-tenant workspace isolation.
            </p>
          </div>
          <div className="p-5 rounded-lg border border-[#222225] bg-[#141416]/60">
            <Zap className="w-5 h-5 text-neutral-400 mb-3" />
            <h3 className="text-sm font-semibold text-white mb-1">Cycles & Sprints</h3>
            <p className="text-xs text-neutral-400 leading-relaxed">
              Plan sprint milestones, carry over uncompleted work, and monitor velocity.
            </p>
          </div>
          <div className="p-5 rounded-lg border border-[#222225] bg-[#141416]/60">
            <ShieldCheck className="w-5 h-5 text-neutral-400 mb-3" />
            <h3 className="text-sm font-semibold text-white mb-1">Role-Based Access</h3>
            <p className="text-xs text-neutral-400 leading-relaxed">
              Granular permissions strictly enforced server-side from Owner to Viewer.
            </p>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="h-12 border-t border-[#222225] px-6 flex items-center justify-between text-xs text-neutral-500">
        <span>ProjectFlow Engineering Workspace</span>
        <span>Strict Zero-Cost Infrastructure</span>
      </footer>
    </div>
  );
}