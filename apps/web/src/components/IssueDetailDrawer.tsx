"use client";

import { useEffect, useState } from "react";
import { Loader2, MessageSquare, Send, Trash2, X } from "lucide-react";

interface WorkflowState {
  id: string;
  name: string;
}

interface CommentItem {
  id: string;
  content: string;
  createdAt: string;
  author: {
    user: {
      name: string;
      email: string;
    };
  };
}

interface IssueDetail {
  id: string;
  identifier: string;
  title: string;
  description?: string | null;
  priority: "URGENT" | "HIGH" | "MEDIUM" | "LOW";
  statusId: string;
  createdAt: string;
  project: { id: string; name: string; identifier: string };
  comments: CommentItem[];
}

interface IssueDetailDrawerProps {
  workspaceSlug: string;
  issueId: string | null;
  workflowStates: WorkflowState[];
  onClose: () => void;
  onIssueUpdated: (updated: {
    id: string;
    title: string;
    description?: string | null;
    priority: "URGENT" | "HIGH" | "MEDIUM" | "LOW";
    statusId: string;
  }) => void;
  onIssueDeleted: (deletedId: string) => void;
  showToast: (text: string, type?: "success" | "error") => void;
}

export function IssueDetailDrawer({
  workspaceSlug,
  issueId,
  workflowStates,
  onClose,
  onIssueUpdated,
  onIssueDeleted,
  showToast,
}: IssueDetailDrawerProps) {
  const [loading, setLoading] = useState(true);
  const [issue, setIssue] = useState<IssueDetail | null>(null);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [priority, setPriority] = useState<"URGENT" | "HIGH" | "MEDIUM" | "LOW">("MEDIUM");
  const [statusId, setStatusId] = useState("");
  const [saving, setSaving] = useState(false);

  const [commentText, setCommentText] = useState("");
  const [postingComment, setPostingComment] = useState(false);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    if (!issueId) return;
    setLoading(true);

    fetch(`http://localhost:4000/api/v1/workspaces/${workspaceSlug}/issues/${issueId}`, {
      credentials: "include",
      cache: "no-store",
    })
      .then((res) => res.json())
      .then((data) => {
        if (data.success) {
          const item: IssueDetail = data.data.issue;
          setIssue(item);
          setTitle(item.title);
          setDescription(item.description || "");
          setPriority(item.priority);
          setStatusId(item.statusId);
        } else {
          showToast(data.error?.message || "Could not open issue", "error");
          onClose();
        }
      })
      .catch(() => {
        showToast("Failed to load issue details", "error");
        onClose();
      })
      .finally(() => setLoading(false));
  }, [workspaceSlug, issueId, showToast, onClose]);

  if (!issueId) return null;

  const handleSaveChanges = async (
    overrides?: Partial<{
      title: string;
      description: string;
      priority: "URGENT" | "HIGH" | "MEDIUM" | "LOW";
      statusId: string;
    }>
  ) => {
    if (!issue) return;
    const nextTitle = overrides?.title ?? title;
    const nextDesc = overrides?.description ?? description;
    const nextPriority = overrides?.priority ?? priority;
    const nextStatusId = overrides?.statusId ?? statusId;

    if (!nextTitle.trim()) return;
    setSaving(true);

    try {
      const res = await fetch(
        `http://localhost:4000/api/v1/workspaces/${workspaceSlug}/issues/${issue.id}`,
        {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
          body: JSON.stringify({
            title: nextTitle,
            description: nextDesc || null,
            priority: nextPriority,
            statusId: nextStatusId,
          }),
        }
      );

      const data = await res.json();
      if (res.ok && data.success) {
        onIssueUpdated({
          id: issue.id,
          title: nextTitle,
          description: nextDesc || null,
          priority: nextPriority,
          statusId: nextStatusId,
        });
        showToast(`Saved ${issue.identifier}`);
      } else {
        showToast(data.error?.message || "Failed to save changes", "error");
      }
    } catch {
      showToast("Failed to save changes", "error");
    } finally {
      setSaving(false);
    }
  };

  const handlePostComment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!issue || !commentText.trim()) return;
    setPostingComment(true);

    try {
      const res = await fetch(
        `http://localhost:4000/api/v1/workspaces/${workspaceSlug}/issues/${issue.id}/comments`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
          body: JSON.stringify({ content: commentText }),
        }
      );

      const data = await res.json();
      if (res.ok && data.success) {
        setIssue((prev) =>
          prev ? { ...prev, comments: [...prev.comments, data.data.comment] } : prev
        );
        setCommentText("");
        showToast("Comment posted");
      } else {
        showToast(data.error?.message || "Failed to post comment", "error");
      }
    } catch {
      showToast("Failed to post comment", "error");
    } finally {
      setPostingComment(false);
    }
  };

  const handleDelete = async () => {
    if (!issue) return;
    setDeleting(true);

    try {
      const res = await fetch(
        `http://localhost:4000/api/v1/workspaces/${workspaceSlug}/issues/${issue.id}`,
        {
          method: "DELETE",
          credentials: "include",
        }
      );
      if (res.ok) {
        showToast(`Deleted ${issue.identifier}`);
        onIssueDeleted(issue.id);
        onClose();
      } else {
        showToast("Failed to delete issue", "error");
      }
    } catch {
      showToast("Failed to delete issue", "error");
    } finally {
      setDeleting(false);
    }
  };

  return (
    <div
      onClick={onClose}
      className="fixed inset-0 z-50 flex justify-end bg-black/60 backdrop-blur-xs"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-xl bg-[#141416] border-l border-zinc-800 h-full flex flex-col shadow-2xl"
      >
        {/* Drawer Header */}
        <div className="h-14 px-6 border-b border-zinc-800/80 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2 text-xs font-mono text-zinc-400">
            <span>{issue?.project.name}</span>
            <span>/</span>
            <span className="text-zinc-200 font-semibold">{issue?.identifier}</span>
            {saving && <span className="text-zinc-500 ml-2">Saving...</span>}
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleDelete}
              disabled={deleting || loading}
              className="p-1.5 rounded-lg text-zinc-400 hover:text-red-400 hover:bg-zinc-800/70 transition"
              title="Delete Issue"
            >
              <Trash2 className="h-4 w-4" />
            </button>
            <button
              type="button"
              onClick={onClose}
              className="p-1.5 rounded-lg text-zinc-400 hover:text-white hover:bg-zinc-800/70 transition"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        </div>

        {/* Drawer Body */}
        {loading || !issue ? (
          <div className="flex-1 flex items-center justify-center text-zinc-500">
            <Loader2 className="h-5 w-5 animate-spin" />
          </div>
        ) : (
          <div className="flex-1 overflow-y-auto p-6 space-y-6">
            {/* Editable Title */}
            <div className="space-y-2">
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                onBlur={() => handleSaveChanges()}
                className="w-full bg-transparent text-lg font-semibold text-white focus:outline-none border-b border-transparent focus:border-zinc-700 pb-1"
              />
            </div>

            {/* Status & Priority Selectors */}
            <div className="grid grid-cols-2 gap-3 p-3.5 rounded-xl bg-[#0e0e10] border border-zinc-800/80">
              <div className="space-y-1">
                <label className="text-[11px] uppercase tracking-wider text-zinc-500">
                  Status
                </label>
                <select
                  value={statusId}
                  onChange={(e) => {
                    setStatusId(e.target.value);
                    handleSaveChanges({ statusId: e.target.value });
                  }}
                  className="w-full bg-[#18181b] border border-zinc-800 rounded-lg px-2.5 py-1.5 text-xs text-white focus:outline-none"
                >
                  {workflowStates.map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="space-y-1">
                <label className="text-[11px] uppercase tracking-wider text-zinc-500">
                  Priority
                </label>
                <select
                  value={priority}
                  onChange={(e) => {
                    const val = e.target.value as "URGENT" | "HIGH" | "MEDIUM" | "LOW";
                    setPriority(val);
                    handleSaveChanges({ priority: val });
                  }}
                  className="w-full bg-[#18181b] border border-zinc-800 rounded-lg px-2.5 py-1.5 text-xs text-white focus:outline-none"
                >
                  <option value="URGENT">Urgent</option>
                  <option value="HIGH">High</option>
                  <option value="MEDIUM">Medium</option>
                  <option value="LOW">Low</option>
                </select>
              </div>
            </div>

            {/* Editable Description */}
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-zinc-400">Description</label>
              <textarea
                rows={4}
                placeholder="Add acceptance criteria, steps to reproduce, or technical notes..."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                onBlur={() => handleSaveChanges()}
                className="w-full px-3 py-2.5 rounded-xl bg-[#0e0e10] border border-zinc-800 text-sm text-zinc-200 placeholder-zinc-600 focus:outline-none focus:border-zinc-600 resize-none"
              />
            </div>

            {/* Comments Thread */}
            <div className="pt-4 border-t border-zinc-800/80 space-y-4">
              <div className="flex items-center gap-2 text-xs font-medium text-zinc-300">
                <MessageSquare className="h-3.5 w-3.5 text-zinc-400" />
                <span>Activity & Comments ({issue.comments.length})</span>
              </div>

              <div className="space-y-3">
                {issue.comments.length === 0 ? (
                  <p className="text-xs text-zinc-500">
                    No comments yet. Start the discussion below.
                  </p>
                ) : (
                  issue.comments.map((c) => (
                    <div
                      key={c.id}
                      className="p-3 rounded-xl bg-[#0e0e10] border border-zinc-800/80 space-y-1.5"
                    >
                      <div className="flex items-center justify-between text-[11px] text-zinc-500">
                        <span className="font-medium text-zinc-300">
                          {c.author.user.name}
                        </span>
                        <span>
                          {new Date(c.createdAt).toLocaleTimeString([], {
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                        </span>
                      </div>
                      <p className="text-xs text-zinc-200 leading-relaxed whitespace-pre-wrap">
                        {c.content}
                      </p>
                    </div>
                  ))
                )}
              </div>

              {/* New Comment Form */}
              <form onSubmit={handlePostComment} className="flex gap-2">
                <input
                  type="text"
                  placeholder="Write a comment..."
                  value={commentText}
                  onChange={(e) => setCommentText(e.target.value)}
                  className="flex-1 px-3 py-2 rounded-lg bg-[#0e0e10] border border-zinc-800 text-xs text-white placeholder-zinc-600 focus:outline-none focus:border-zinc-600"
                />
                <button
                  type="submit"
                  disabled={postingComment || !commentText.trim()}
                  className="inline-flex items-center gap-1.5 bg-white text-black text-xs font-medium px-3 py-2 rounded-lg hover:bg-zinc-200 disabled:opacity-40 transition"
                >
                  <Send className="h-3.5 w-3.5" />
                  Post
                </button>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}