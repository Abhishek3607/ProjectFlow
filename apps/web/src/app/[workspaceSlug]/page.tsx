"use client";

import { useParams } from "next/navigation";
import Link from "next/link";
import {
  CheckCircle2,
  FolderKanban,
  Layers,
  LayoutDashboard,
  Plus,
  Settings,
  Zap,
} from "lucide-react";

export default function WorkspaceDashboardPage() {
  const params = useParams();
  const workspaceSlug = params.workspaceSlug as string;

  return (
    <div className="min-h-screen flex bg-[#0e0e10] text-[#ededed]">
      {/* Left Sidebar */}
      <aside className="w-64 border-r border-zinc-800/80 bg-[#121214] flex flex-col justify-between p-4">
        <div className="space-y-6">
          {/* Workspace Header */}
          <div className="flex items-center gap-2.5 px-2 py-1.5 rounded-lg bg-zinc-900/80 border border-zinc-800">
            <div className="h-6 w-6 rounded bg-white text-black flex items-center justify-center font-bold text-xs uppercase">
              {workspaceSlug?.charAt(0) || "W"}
            </div>
            <div className="truncate">
              <p className="text-sm font-medium text-white truncate">{workspaceSlug}</p>
              <p className="text-[11px] text-zinc-500">Free Plan · Owner</p>
            </div>
          </div>

          {/* Primary Navigation */}
          <nav className="space-y-1">
            <Link
              href={`/${workspaceSlug}`}
              className="flex items-center gap-2.5 px-2.5 py-2 rounded-lg bg-zinc-800/80 text-white text-sm font-medium"
            >
              <LayoutDashboard className="h-4 w-4 text-zinc-300" />
              Overview
            </Link>
            <button
              type="button"
              className="w-full flex items-center gap-2.5 px-2.5 py-2 rounded-lg text-zinc-400 hover:text-white hover:bg-zinc-900 text-sm transition"
            >
              <Layers className="h-4 w-4" />
              My Issues
            </button>
            <button
              type="button"
              className="w-full flex items-center gap-2.5 px-2.5 py-2 rounded-lg text-zinc-400 hover:text-white hover:bg-zinc-900 text-sm transition"
            >
              <FolderKanban className="h-4 w-4" />
              Projects
            </button>
            <button
              type="button"
              className="w-full flex items-center gap-2.5 px-2.5 py-2 rounded-lg text-zinc-400 hover:text-white hover:bg-zinc-900 text-sm transition"
            >
              <Zap className="h-4 w-4" />
              Active Cycles
            </button>
          </nav>
        </div>

        {/* Bottom Settings */}
        <div className="pt-4 border-t border-zinc-800/80">
          <button
            type="button"
            className="w-full flex items-center gap-2.5 px-2.5 py-2 rounded-lg text-zinc-400 hover:text-white hover:bg-zinc-900 text-sm transition"
          >
            <Settings className="h-4 w-4" />
            Workspace Settings
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col">
        {/* Top Bar */}
        <header className="h-14 border-b border-zinc-800/80 px-6 flex items-center justify-between">
          <div className="flex items-center gap-2 text-sm text-zinc-400">
            <span>Workspace</span>
            <span>/</span>
            <span className="text-white font-medium">{workspaceSlug}</span>
          </div>

          <button
            type="button"
            className="inline-flex items-center gap-1.5 bg-white text-black text-xs font-medium px-3 py-1.5 rounded-lg hover:bg-zinc-200 transition"
          >
            <Plus className="h-3.5 w-3.5" />
            New Issue
          </button>
        </header>

        {/* Dashboard Body */}
        <div className="p-8 max-w-5xl space-y-6">
          <div className="p-5 rounded-xl bg-[#161618] border border-zinc-800/80 flex items-start gap-3.5">
            <CheckCircle2 className="h-5 w-5 text-emerald-400 shrink-0 mt-0.5" />
            <div className="space-y-1">
              <h2 className="text-sm font-medium text-white">
                Workspace provisioned in Neon PostgreSQL
              </h2>
              <p className="text-xs text-zinc-400 leading-relaxed">
                Your account, workspace (<code className="text-zinc-300">{workspaceSlug}</code>),
                and 5 default workflow states (Backlog, Todo, In Progress, Done, Canceled) are
                saved and active.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-5 rounded-xl bg-[#161618] border border-zinc-800/80 space-y-1">
              <p className="text-xs text-zinc-500">Active Projects</p>
              <p className="text-2xl font-semibold text-white">0</p>
            </div>
            <div className="p-5 rounded-xl bg-[#161618] border border-zinc-800/80 space-y-1">
              <p className="text-xs text-zinc-500">Open Issues</p>
              <p className="text-2xl font-semibold text-white">0</p>
            </div>
            <div className="p-5 rounded-xl bg-[#161618] border border-zinc-800/80 space-y-1">
              <p className="text-xs text-zinc-500">Workflow Columns</p>
              <p className="text-2xl font-semibold text-white">5</p>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}