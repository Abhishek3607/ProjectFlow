import { Request, Response, NextFunction } from 'express';
import { verifyToken } from '../lib/auth';
import { prisma } from '../lib/prisma';

export interface AuthRequest extends Request {
  user?: {
    id: string;
    email: string;
  };
  workspace?: {
    id: string;
    slug: string;
    memberId: string;
    role: string;
  };
}

export function requireAuth(req: AuthRequest, res: Response, next: NextFunction) {
  const token =
    req.cookies?.token ||
    (req.headers.authorization?.startsWith('Bearer ')
      ? req.headers.authorization.split(' ')[1]
      : null);

  if (!token) {
    return res.status(401).json({
      success: false,
      error: { code: 'UNAUTHORIZED', message: 'Authentication required' },
    });
  }

  try {
    const decoded = verifyToken(token);
    req.user = { id: decoded.userId, email: decoded.email };
    next();
  } catch {
    return res.status(401).json({
      success: false,
      error: { code: 'INVALID_TOKEN', message: 'Session expired or invalid' },
    });
  }
}

export async function requireWorkspaceAccess(
  req: AuthRequest,
  res: Response,
  next: NextFunction
) {
  const { workspaceSlug } = req.params;
  if (!req.user || !workspaceSlug) {
    return res.status(400).json({
      success: false,
      error: { code: 'BAD_REQUEST', message: 'Workspace slug is required' },
    });
  }

  const membership = await prisma.workspaceMember.findFirst({
    where: {
      userId: req.user.id,
      workspace: { slug: workspaceSlug },
    },
    include: { workspace: true },
  });

  if (!membership) {
    return res.status(403).json({
      success: false,
      error: { code: 'FORBIDDEN', message: 'You do not have access to this workspace' },
    });
  }

  req.workspace = {
    id: membership.workspace.id,
    slug: membership.workspace.slug,
    memberId: membership.id,
    role: membership.role,
  };

  next();
}