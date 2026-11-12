"use client";

import { useEffect, useState, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import {
  FolderKanban,
  Layers,
  LayoutDashboard,
  Loader2,
  Plus,
  X,
  ArrowRight,
  ArrowLeft,
} from "lucide-react";

interface WorkflowState {
  id: string;
  name: string;
  category: string;
  position: number;
}

interface Project {
  id: string;
  name: string;
  identifier: string;
  description?: string | null;
}

interface Issue {
  id: string;
  identifier: string;
  title: string;
  description?: string | null;
  priority: "URGENT" | "HIGH" | "MEDIUM" | "LOW";
  statusId: string;
  project: {
    id: string;
    name: string;
    identifier: string;
  };
}

const PRIORITY_STYLES: Record<string, string> = {
  URGENT: "bg-red-500/15 text-red-400 border-red-500/30",
  HIGH: "bg-orange-500/15 text-orange-400 border-orange-500/30",
  MEDIUM: "bg-blue-500/15 text-blue-400 border-blue-500/30",
  LOW: "bg-zinc-500/15 text-zinc-400 border-zinc-500/30",
};

export default function WorkspaceDashboardPage() {
  const params = useParams();
  const router = useRouter();
  const workspaceSlug = params.workspaceSlug as string;

  const [loading, setLoading] = useState(true);
  const [workspaceName, setWorkspaceName] = useState("");
  const [projects, setProjects] = useState<Project[]>([]);
  const [workflowStates, setWorkflowStates] = useState<WorkflowState[]>([]);
  const [issues, setIssues] = useState<Issue[]>([]);
  const [selectedProjectId, setSelectedProjectId] = useState<string>("ALL");

  // Modal States
  const [showProjectModal, setShowProjectModal] = useState(false);
  const [showIssueModal, setShowIssueModal] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [modalError, setModalError] = useState<string | null>(null);

  // Project Form
  const [projectForm, setProjectForm] = useState({
    name: "",
    identifier: "",
    description: "",
  });

  // Issue Form
  const [issueForm, setIssueForm] = useState({
    projectId: "",
    title: "",
    description: "",
    priority: "MEDIUM" as "URGENT" | "HIGH" | "MEDIUM" | "LOW",
    statusId: "",
  });

  const fetchOverview = useCallback(async () => {
    try {
      const res = await fetch(
        `http://localhost:4000/api/v1/workspaces/${workspaceSlug}/overview`,
        { credentials: "include" }
      );

      if (res.status === 401) {
        router.push("/login");
        return;
      }

      const data = await res.json();
      if (data.success) {
        setWorkspaceName(data.data.workspace.name);
        setProjects(data.data.projects);
        setWorkflowStates(data.data.workflowStates);
        setIssues(data.data.issues);

        if (data.data.projects.length > 0 && !issueForm.projectId) {
          setIssueForm((prev) => ({ ...prev, projectId: data.data.projects[0].id }));
        }
        if (data.data.workflowStates.length > 0 && !issueForm.statusId) {
          const todoState =
            data.data.workflowStates.find((s: WorkflowState) => s.name === "Todo") ||
            data.data.workflowStates[0];
          setIssueForm((prev) => ({ ...prev, statusId: todoState.id }));
        }
      }
    } catch (err) {
      console.error("Failed to load workspace overview:", err);
    } finally {
      setLoading(false);
    }
  }, [workspaceSlug, router, issueForm.projectId, issueForm.statusId]);

  useEffect(() => {
    fetchOverview();
  }, [fetchOverview]);

  const handleCreateProject = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setModalError(null);

    try {
      const res = await fetch(
        `http://localhost:4000/api/v1/workspaces/${workspaceSlug}/projects`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
          body: JSON.stringify(projectForm),
        }
      );
      
      const data = await res.json();
      if (!res.ok || !data.success) {
        const fieldDetail = data.error?.details
          ? Object.values(data.error.details).flat()[0]
          : null;
        setModalError((fieldDetail as string) || data.error?.message || "Failed to create project");
        setSubmitting(false);
        return;
      }

      setProjects((prev) => [...prev, data.data.project]);
      setIssueForm((prev) => ({ ...prev, projectId: data.data.project.id }));
      setProjectForm({ name: "", identifier: "", description: "" });
      setShowProjectModal(false);
    } catch {
      setModalError("Network error while creating project");
    } finally {
      setSubmitting(false);
    }
  };

  const handleCreateIssue = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setModalError(null);

    try {
      const res = await fetch(
        `http://localhost:4000/api/v1/workspaces/${workspaceSlug}/issues`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
          body: JSON.stringify(issueForm),
        }
      );

      const data = await res.json();
      if (!res.ok || !data.success) {
        setModalError(data.error?.message || "Failed to create issue");
        setSubmitting(false);
        return;
      }

      setIssues((prev) => [data.data.issue, ...prev]);
      setIssueForm((prev) => ({ ...prev, title: "", description: "" }));
      setShowIssueModal(false);
    } catch {
      setModalError("Network error while creating issue");
    } finally {
      setSubmitting(false);
    }
  };

  const handleMoveIssue = async (issueId: string, targetStatusId: string) => {
    // Optimistic UI update
    setIssues((prev) =>
      prev.map((issue) =>
        issue.id === issueId ? { ...issue, statusId: targetStatusId } : issue
      )
    );

    try {
      await fetch(
        `http://localhost:4000/api/v1/workspaces/${workspaceSlug}/issues/${issueId}/status`,
        {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
          body: JSON.stringify({ statusId: targetStatusId }),
        }
      );
    } catch (err) {
      console.error("Failed to update status:", err);
      fetchOverview();
    }
  };

  const filteredIssues =
    selectedProjectId === "ALL"
      ? issues
      : issues.filter((i) => i.project.id === selectedProjectId);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#0e0e10] text-zinc-400">
        <Loader2 className="h-6 w-6 animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex bg-[#0e0e10] text-[#ededed]">
      {/* Left Sidebar */}
      <aside className="w-64 border-r border-zinc-800/80 bg-[#121214] flex flex-col justify-between p-4 shrink-0">
        <div className="space-y-6">
          {/* Workspace Header */}
          <div className="flex items-center gap-2.5 px-2 py-1.5 rounded-lg bg-zinc-900/80 border border-zinc-800">
            <div className="h-6 w-6 rounded bg-white text-black flex items-center justify-center font-bold text-xs uppercase">
              {(workspaceName || workspaceSlug)?.charAt(0)}
            </div>
            <div className="truncate">
              <p className="text-sm font-medium text-white truncate">
                {workspaceName || workspaceSlug}
              </p>
              <p className="text-[11px] text-zinc-500">Owner · Active</p>
            </div>
          </div>

          {/* Board Filters */}
          <div className="space-y-1">
            <p className="px-2.5 text-[11px] font-medium uppercase tracking-wider text-zinc-500">
              Views
            </p>
            <button
              type="button"
              onClick={() => setSelectedProjectId("ALL")}
              className={`w-full flex items-center gap-2.5 px-2.5 py-2 rounded-lg text-sm transition ${
                selectedProjectId === "ALL"
                  ? "bg-zinc-800/80 text-white font-medium"
                  : "text-zinc-400 hover:text-white hover:bg-zinc-900"
              }`}
            >
              <LayoutDashboard className="h-4 w-4" />
              All Issues ({issues.length})
            </button>
          </div>

          {/* Projects List */}
          <div className="space-y-1">
            <div className="flex items-center justify-between px-2.5">
              <p className="text-[11px] font-medium uppercase tracking-wider text-zinc-500">
                Projects
              </p>
              <button
                type="button"
                onClick={() => {
                  setModalError(null);
                  setShowProjectModal(true);
                }}
                className="text-zinc-400 hover:text-white p-0.5 rounded"
                title="Create Project"
              >
                <Plus className="h-3.5 w-3.5" />
              </button>
            </div>

            {projects.length === 0 ? (
              <button
                type="button"
                onClick={() => {
                  setModalError(null);
                  setShowProjectModal(true);
                }}
                className="w-full text-left px-2.5 py-2 text-xs text-zinc-500 hover:text-zinc-300 transition"
              >
                + Create your first project
              </button>
            ) : (
              projects.map((proj) => (
                <button
                  key={proj.id}
                  type="button"
                  onClick={() => setSelectedProjectId(proj.id)}
                  className={`w-full flex items-center justify-between px-2.5 py-2 rounded-lg text-sm transition ${
                    selectedProjectId === proj.id
                      ? "bg-zinc-800/80 text-white font-medium"
                      : "text-zinc-400 hover:text-white hover:bg-zinc-900"
                  }`}
                >
                  <span className="flex items-center gap-2 truncate">
                    <FolderKanban className="h-4 w-4 shrink-0" />
                    <span className="truncate">{proj.name}</span>
                  </span>
                  <span className="text-[11px] font-mono text-zinc-500">
                    {proj.identifier}
                  </span>
                </button>
              ))
            )}
          </div>
        </div>

        <div className="pt-4 border-t border-zinc-800/80 text-[11px] text-zinc-500 px-2">
          ProjectFlow v1.0 · Neon DB
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col overflow-hidden">
        {/* Top Header */}
        <header className="h-14 border-b border-zinc-800/80 px-6 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2 text-sm text-zinc-400">
            <Layers className="h-4 w-4 text-zinc-400" />
            <span className="text-white font-medium">
              {selectedProjectId === "ALL"
                ? "Kanban Board"
                : projects.find((p) => p.id === selectedProjectId)?.name}
            </span>
          </div>

          <div className="flex items-center gap-2.5">
            <button
              type="button"
              onClick={() => {
                setModalError(null);
                setShowProjectModal(true);
              }}
              className="inline-flex items-center gap-1.5 border border-zinc-800 bg-zinc-900 text-zinc-200 text-xs font-medium px-3 py-1.5 rounded-lg hover:bg-zinc-800 transition"
            >
              <Plus className="h-3.5 w-3.5" />
              New Project
            </button>

            <button
              type="button"
              onClick={() => {
                setModalError(null);
                if (projects.length === 0) {
                  setShowProjectModal(true);
                } else {
                  setShowIssueModal(true);
                }
              }}
              className="inline-flex items-center gap-1.5 bg-white text-black text-xs font-medium px-3 py-1.5 rounded-lg hover:bg-zinc-200 transition"
            >
              <Plus className="h-3.5 w-3.5" />
              New Issue
            </button>
          </div>
        </header>

        {/* Kanban Board Columns */}
        <div className="flex-1 overflow-x-auto p-6">
          {projects.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-center max-w-md mx-auto space-y-4">
              <div className="h-12 w-12 rounded-xl bg-zinc-900 border border-zinc-800 flex items-center justify-center">
                <FolderKanban className="h-6 w-6 text-zinc-400" />
              </div>
              <div className="space-y-1">
                <h2 className="text-base font-medium text-white">No projects yet</h2>
                <p className="text-xs text-zinc-400">
                  Create a project (like Engineering with key ENG) to start tracking issues
                  on your Kanban board.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setShowProjectModal(true)}
                className="inline-flex items-center gap-1.5 bg-white text-black text-xs font-medium px-4 py-2 rounded-lg hover:bg-zinc-200 transition"
              >
                <Plus className="h-3.5 w-3.5" />
                Create First Project
              </button>
            </div>
          ) : (
            <div className="flex gap-4 h-full min-w-max">
              {workflowStates.map((state, colIndex) => {
                const columnIssues = filteredIssues.filter(
                  (issue) => issue.statusId === state.id
                );
                const prevState = workflowStates[colIndex - 1];
                const nextState = workflowStates[colIndex + 1];

                return (
                  <div
                    key={state.id}
                    className="w-72 flex flex-col bg-[#121214] border border-zinc-800/80 rounded-xl p-3"
                  >
                    {/* Column Header */}
                    <div className="flex items-center justify-between px-1 pb-3">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-medium text-zinc-200">
                          {state.name}
                        </span>
                        <span className="text-[11px] text-zinc-500 bg-zinc-900 px-1.5 py-0.5 rounded">
                          {columnIssues.length}
                        </span>
                      </div>
                    </div>

                    {/* Issue Cards */}
                    <div className="flex-1 space-y-2.5 overflow-y-auto">
                      {columnIssues.map((issue) => (
                        <div
                          key={issue.id}
                          className="p-3.5 rounded-lg bg-[#18181b] border border-zinc-800/90 hover:border-zinc-700 transition space-y-2.5"
                        >
                          <div className="flex items-center justify-between">
                            <span className="text-[11px] font-mono text-zinc-500">
                              {issue.identifier}
                            </span>
                            <span
                              className={`text-[10px] font-medium px-1.5 py-0.5 rounded border ${
                                PRIORITY_STYLES[issue.priority]
                              }`}
                            >
                              {issue.priority}
                            </span>
                          </div>

                          <p className="text-sm font-medium text-zinc-100 leading-snug">
                            {issue.title}
                          </p>

                          {/* Move Controls */}
                          <div className="flex items-center justify-between pt-1 border-t border-zinc-800/60">
                            {prevState ? (
                              <button
                                type="button"
                                onClick={() => handleMoveIssue(issue.id, prevState.id)}
                                className="inline-flex items-center gap-1 text-[11px] text-zinc-500 hover:text-zinc-200 transition"
                                title={`Move to ${prevState.name}`}
                              >
                                <ArrowLeft className="h-3 w-3" />
                                {prevState.name}
                              </button>
                            ) : (
                              <span />
                            )}

                            {nextState ? (
                              <button
                                type="button"
                                onClick={() => handleMoveIssue(issue.id, nextState.id)}
                                className="inline-flex items-center gap-1 text-[11px] text-zinc-500 hover:text-zinc-200 transition"
                                title={`Move to ${nextState.name}`}
                              >
                                {nextState.name}
                                <ArrowRight className="h-3 w-3" />
                              </button>
                            ) : (
                              <span />
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </main>

      {/* Create Project Modal */}
      {showProjectModal && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="w-full max-w-md bg-[#161618] border border-zinc-800 rounded-xl p-6 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between">
              <h3 className="text-base font-semibold text-white">Create Project</h3>
              <button
                type="button"
                onClick={() => setShowProjectModal(false)}
                className="text-zinc-400 hover:text-white"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            {modalError && (
              <div className="p-2.5 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 text-xs">
                {modalError}
              </div>
            )}

            <form onSubmit={handleCreateProject} className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-xs font-medium text-zinc-300">Project Name</label>
                <input
                  type="text"
                  required
                  placeholder="Core Platform"
                  value={projectForm.name}
                  onChange={(e) =>
                    setProjectForm({ ...projectForm, name: e.target.value })
                  }
                  className="w-full px-3 py-2 rounded-lg bg-[#0e0e10] border border-zinc-800 text-sm text-white focus:outline-none focus:border-zinc-600"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-medium text-zinc-300">
                  Project Key (2–5 uppercase letters)
                </label>
                <input
                  type="text"
                  required
                  maxLength={5}
                  placeholder="ENG"
                  value={projectForm.identifier}
                  onChange={(e) =>
                    setProjectForm({
                      ...projectForm,
                      identifier: e.target.value.toUpperCase(),
                    })
                  }
                  className="w-full px-3 py-2 rounded-lg bg-[#0e0e10] border border-zinc-800 text-sm font-mono text-white uppercase focus:outline-none focus:border-zinc-600"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowProjectModal(false)}
                  className="px-3 py-1.5 rounded-lg text-xs text-zinc-400 hover:text-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="bg-white text-black text-xs font-medium px-4 py-1.5 rounded-lg hover:bg-zinc-200 disabled:opacity-50"
                >
                  {submitting ? "Creating..." : "Create Project"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Create Issue Modal */}
      {showIssueModal && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="w-full max-w-lg bg-[#161618] border border-zinc-800 rounded-xl p-6 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between">
              <h3 className="text-base font-semibold text-white">New Issue</h3>
              <button
                type="button"
                onClick={() => setShowIssueModal(false)}
                className="text-zinc-400 hover:text-white"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            {modalError && (
              <div className="p-2.5 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 text-xs">
                {modalError}
              </div>
            )}

            <form onSubmit={handleCreateIssue} className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-zinc-300">Project</label>
                  <select
                    value={issueForm.projectId}
                    onChange={(e) =>
                      setIssueForm({ ...issueForm, projectId: e.target.value })
                    }
                    className="w-full px-3 py-2 rounded-lg bg-[#0e0e10] border border-zinc-800 text-sm text-white focus:outline-none"
                  >
                    {projects.map((p) => (
                      <option key={p.id} value={p.id}>
                        {p.name} ({p.identifier})
                      </option>
                    ))}
                  </select>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-zinc-300">Priority</label>
                  <select
                    value={issueForm.priority}
                    onChange={(e) =>
                      setIssueForm({
                        ...issueForm,
                        priority: e.target.value as any,
                      })
                    }
                    className="w-full px-3 py-2 rounded-lg bg-[#0e0e10] border border-zinc-800 text-sm text-white focus:outline-none"
                  >
                    <option value="URGENT">Urgent</option>
                    <option value="HIGH">High</option>
                    <option value="MEDIUM">Medium</option>
                    <option value="LOW">Low</option>
                  </select>
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-medium text-zinc-300">Issue Title</label>
                <input
                  type="text"
                  required
                  placeholder="Implement JWT refresh token rotation"
                  value={issueForm.title}
                  onChange={(e) =>
                    setIssueForm({ ...issueForm, title: e.target.value })
                  }
                  className="w-full px-3 py-2 rounded-lg bg-[#0e0e10] border border-zinc-800 text-sm text-white focus:outline-none focus:border-zinc-600"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-medium text-zinc-300">Initial Status</label>
                <select
                  value={issueForm.statusId}
                  onChange={(e) =>
                    setIssueForm({ ...issueForm, statusId: e.target.value })
                  }
                  className="w-full px-3 py-2 rounded-lg bg-[#0e0e10] border border-zinc-800 text-sm text-white focus:outline-none"
                >
                  {workflowStates.map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowIssueModal(false)}
                  className="px-3 py-1.5 rounded-lg text-xs text-zinc-400 hover:text-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="bg-white text-black text-xs font-medium px-4 py-1.5 rounded-lg hover:bg-zinc-200 disabled:opacity-50"
                >
                  {submitting ? "Creating..." : "Create Issue"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}