import { Response } from 'express';
import {
  CreateProjectSchema,
  CreateIssueSchema,
  UpdateIssueStatusSchema,
  UpdateIssueSchema,
  CreateCommentSchema,
} from '@projectflow/contracts';
import { prisma } from '../../lib/prisma';
import { AuthRequest } from '../../middleware/auth.middleware';

// GET /api/v1/workspaces/:workspaceSlug/overview
export async function getWorkspaceOverview(req: AuthRequest, res: Response) {
  const workspaceId = req.workspace!.id;

  const [workspace, projects, workflowStates, issues] = await Promise.all([
    prisma.workspace.findUnique({ where: { id: workspaceId } }),
    prisma.project.findMany({
      where: { workspaceId },
      orderBy: { createdAt: 'asc' },
    }),
    prisma.workflowState.findMany({
      where: { workspaceId },
      orderBy: { position: 'asc' },
    }),
    prisma.issue.findMany({
      where: { workspaceId },
      include: {
        status: true,
        project: { select: { id: true, name: true, identifier: true } },
      },
      orderBy: { createdAt: 'desc' },
    }),
  ]);

  return res.json({
    success: true,
    data: {
      workspace,
      projects,
      workflowStates,
      issues,
    },
  });
}

// POST /api/v1/workspaces/:workspaceSlug/projects
export async function createProjectHandler(req: AuthRequest, res: Response) {
  const parsed = CreateProjectSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({
      success: false,
      error: {
        code: 'VALIDATION_ERROR',
        message: 'Invalid project details',
        details: parsed.error.flatten().fieldErrors,
      },
    });
  }

  const workspaceId = req.workspace!.id;
  const { name, identifier, description } = parsed.data;

  const existing = await prisma.project.findFirst({
    where: { workspaceId, identifier },
  });

  if (existing) {
    return res.status(409).json({
      success: false,
      error: { code: 'KEY_EXISTS', message: `Project key "${identifier}" already exists` },
    });
  }

  const project = await prisma.project.create({
    data: {
      workspaceId,
      name,
      identifier,
      description,
      status: 'ACTIVE',
    },
  });

  return res.status(201).json({ success: true, data: { project } });
}

// POST /api/v1/workspaces/:workspaceSlug/issues
export async function createIssueHandler(req: AuthRequest, res: Response) {
  const parsed = CreateIssueSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({
      success: false,
      error: {
        code: 'VALIDATION_ERROR',
        message: 'Invalid issue data',
        details: parsed.error.flatten().fieldErrors,
      },
    });
  }

  const workspaceId = req.workspace!.id;
  const authorId = req.workspace!.memberId;
  const { projectId, title, description, priority, statusId } = parsed.data;

  const project = await prisma.project.findFirst({
    where: { id: projectId, workspaceId },
  });

  if (!project) {
    return res.status(404).json({
      success: false,
      error: { code: 'NOT_FOUND', message: 'Project not found in this workspace' },
    });
  }

  // Default to "Todo" or first workflow state if statusId not passed
  let targetStatusId = statusId;
  if (!targetStatusId) {
    const defaultState = await prisma.workflowState.findFirst({
      where: { workspaceId },
      orderBy: { position: 'asc' },
    });
    if (!defaultState) {
      return res.status(500).json({
        success: false,
        error: { code: 'NO_STATES', message: 'Workspace has no workflow states' },
      });
    }
    targetStatusId = defaultState.id;
  }

  const issueCount = await prisma.issue.count({ where: { projectId } });
  const identifier = `${project.identifier}-${issueCount + 1}`;

  const issue = await prisma.issue.create({
    data: {
      workspaceId,
      projectId,
      identifier,
      title,
      description,
      priority,
      statusId: targetStatusId,
      authorId,
    },
    include: {
      status: true,
      project: { select: { id: true, name: true, identifier: true } },
    },
  });

  return res.status(201).json({ success: true, data: { issue } });
}

// PATCH /api/v1/workspaces/:workspaceSlug/issues/:issueId/status
export async function updateIssueStatusHandler(req: AuthRequest, res: Response) {
  const parsed = UpdateIssueStatusSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({
      success: false,
      error: { code: 'VALIDATION_ERROR', message: 'Invalid status ID' },
    });
  }

  const workspaceId = req.workspace!.id;
  const { issueId } = req.params;

  const existing = await prisma.issue.findFirst({
    where: { id: issueId, workspaceId },
  });

  if (!existing) {
    return res.status(404).json({
      success: false,
      error: { code: 'NOT_FOUND', message: 'Issue not found' },
    });
  }

  const updated = await prisma.issue.update({
    where: { id: issueId },
    data: { statusId: parsed.data.statusId },
    include: {
      status: true,
      project: { select: { id: true, name: true, identifier: true } },
    },
  });

  return res.json({ success: true, data: { issue: updated } });
}

// GET /api/v1/workspaces/:workspaceSlug/issues/:issueId
export async function getIssueDetailHandler(req: AuthRequest, res: Response) {
  const workspaceId = req.workspace!.id;
  const { issueId } = req.params;

  const issue = await prisma.issue.findFirst({
    where: { id: issueId, workspaceId },
    include: {
      status: true,
      project: { select: { id: true, name: true, identifier: true } },
      author: { include: { user: { select: { id: true, name: true, email: true } } } },
      comments: {
        include: {
          author: { include: { user: { select: { id: true, name: true, email: true } } } },
        },
        orderBy: { createdAt: 'asc' },
      },
    },
  });

  if (!issue) {
    return res.status(404).json({
      success: false,
      error: { code: 'NOT_FOUND', message: 'Issue not found' },
    });
  }

  return res.json({ success: true, data: { issue } });
}

// PATCH /api/v1/workspaces/:workspaceSlug/issues/:issueId
export async function updateIssueHandler(req: AuthRequest, res: Response) {
  const parsed = UpdateIssueSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({
      success: false,
      error: {
        code: 'VALIDATION_ERROR',
        message: 'Invalid issue update payload',
        details: parsed.error.flatten().fieldErrors,
      },
    });
  }

  const workspaceId = req.workspace!.id;
  const { issueId } = req.params;

  const existing = await prisma.issue.findFirst({
    where: { id: issueId, workspaceId },
  });

  if (!existing) {
    return res.status(404).json({
      success: false,
      error: { code: 'NOT_FOUND', message: 'Issue not found' },
    });
  }

  const updated = await prisma.issue.update({
    where: { id: issueId },
    data: parsed.data,
    include: {
      status: true,
      project: { select: { id: true, name: true, identifier: true } },
    },
  });

  return res.json({ success: true, data: { issue: updated } });
}

// DELETE /api/v1/workspaces/:workspaceSlug/issues/:issueId
export async function deleteIssueHandler(req: AuthRequest, res: Response) {
  const workspaceId = req.workspace!.id;
  const { issueId } = req.params;

  const existing = await prisma.issue.findFirst({
    where: { id: issueId, workspaceId },
  });

  if (!existing) {
    return res.status(404).json({
      success: false,
      error: { code: 'NOT_FOUND', message: 'Issue not found' },
    });
  }

  await prisma.issue.delete({ where: { id: issueId } });

  return res.json({ success: true, data: { deletedId: issueId } });
}

// POST /api/v1/workspaces/:workspaceSlug/issues/:issueId/comments
export async function addCommentHandler(req: AuthRequest, res: Response) {
  const parsed = CreateCommentSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({
      success: false,
      error: { code: 'VALIDATION_ERROR', message: 'Comment cannot be empty' },
    });
  }

  const workspaceId = req.workspace!.id;
  const authorId = req.workspace!.memberId;
  const { issueId } = req.params;

  const issue = await prisma.issue.findFirst({
    where: { id: issueId, workspaceId },
  });

  if (!issue) {
    return res.status(404).json({
      success: false,
      error: { code: 'NOT_FOUND', message: 'Issue not found' },
    });
  }

  const comment = await prisma.comment.create({
    data: {
      workspaceId,
      issueId,
      authorId,
      content: parsed.data.content,
    },
    include: {
      author: { include: { user: { select: { id: true, name: true, email: true } } } },
    },
  });

  return res.status(201).json({ success: true, data: { comment } });
}